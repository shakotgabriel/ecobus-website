"use client";

import { useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  MapPin,
  ArrowRight,
  Clock,
  Users,
  Check,
  ChevronLeft,
  Smartphone,
  CreditCard,
  Printer,
  Download,
  Calendar,
  Bus,
  Minus,
  Plus,
  ChevronDown,
} from "lucide-react";
import { format, startOfToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useBooking } from "@/lib/booking-context";
import { bookingsService } from "@/lib/services";
import { tripsService } from "@/lib/services/trips";
import { paymentsService, type PublicPaymentMethods } from "@/lib/services/payments";
import { downloadTicketPDF, printTicket, type DownloadableTicket } from "@/lib/ticket-download";
import { PaymentConfirmationModal } from "@/components/payment-confirmation-modal";
import { useSeatMap } from "@/hooks/use-seat-map";
import { useTripsForRoute } from "@/hooks/use-trips-for-route";
import {
  formatCurrency,
  formatDate,
  getCurrencyForCountry,
  PAYMENT_CURRENCY,
} from "@/lib/booking-data";
import { busTypeLabel } from "@/lib/bus-types";
import { imageForRoute } from "@/lib/public-images";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { useAvailableRoutes } from "@/hooks/use-available-routes";
import { isValidPhoneNumber, toE164Phone } from "@/lib/phone-utils";
import { formatDepartureTime, getTimeIcon } from "@/lib/departure-time";
import { SeatMap } from "@/components/booking/seat-map";
import { SeatHoldTimer } from "@/components/booking/seat-hold-timer";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCities } from "@/hooks/use-cities";

export function BookingModal() {
  const {
    booking,
    setRoute,
    setDate,
    setPassengers,
    setDepartureTime,
    setBusClass,
    setSelectedSeats,
    toggleSeat,
    setPassengerName,
    setPhoneNumber,
    setPaymentMethod,
    isBookingModalOpen,
    setBookingModalOpen,
    currentStep,
    setCurrentStep,
    resetBooking,
  } = useBooking();

  const { cities, cityObjects } = useCities();
  const { routes: apiRoutes } = useAvailableRoutes();
  const { convert: convertCurrency } = useExchangeRates();

  const [isProcessing, setIsProcessing] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingReference, setBookingReference] = useState("");
  const [serverTotal, setServerTotal] = useState<number | null>(null);
  const [enabledPayments, setEnabledPayments] = useState<PublicPaymentMethods>({
    mpesa: true,
    momo: true,
    cash: true,
  });
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [fromOpen, setFromOpen] = useState(false);
  const [toOpen, setToOpen] = useState(false);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [dateOpen, setDateOpen] = useState(false);
  const [tripId, setTripId] = useState<string | null>(null);
  const [seatSessionKey, setSeatSessionKey] = useState<string | null>(null);
  const [holdExpiresAt, setHoldExpiresAt] = useState<string | null>(null);
  const [extendingHold, setExtendingHold] = useState(false);
  const [passengerDetails, setPassengerDetails] = useState<
    Record<string, { name: string; idNumber: string }>
  >({});
  const [confirmedTickets, setConfirmedTickets] = useState<
    Array<{ ticket_number: string; download_token?: string; seat_number?: string; full_name?: string }>
  >([]);

  // Fetch actual trips from API based on selected route and date
  const { trips: apiTrips, loading: tripsLoading } = useTripsForRoute({
    origin: fromCity,
    destination: toCity,
    departureDate: booking.date
      ? format(booking.date, "yyyy-MM-dd")
      : undefined,
  });

  // Fetch seat map only after tripId is declared
  const { seatMap: apiSeatMap, loading: seatsLoading } = useSeatMap(tripId || undefined);
  const selectedTrip = apiTrips.find((trip) => String(trip.id) === String(tripId)) || null;

  useEffect(() => {
    if (!isBookingModalOpen) {
      setBookingComplete(false);
      setFromCity("");
      setToCity("");
      setBookingError(null);
      setTripId(null);
      setShowPaymentModal(false);
      setBookingId(null);
      setBookingReference("");
      setServerTotal(null);
      setSeatSessionKey(null);
      setHoldExpiresAt(null);
      setConfirmedTickets([]);
      setPassengerDetails({});
    }
  }, [isBookingModalOpen]);

  useEffect(() => {
    if (!isBookingModalOpen) return;
    paymentsService.getEnabledMethods().then(({ data }) => {
      setEnabledPayments(data);
      if (data.mpesa && booking.paymentMethod === "mpesa") return;
      if (data.momo && booking.paymentMethod === "mtn") return;
      if (data.mpesa) setPaymentMethod("mpesa");
      else if (data.momo) setPaymentMethod("mtn");
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBookingModalOpen]);

  // Pre-fill cities when modal opens with a route already selected
  useEffect(() => {
    if (isBookingModalOpen && booking.route) {
      // Only update local city state if values actually differ
      if (fromCity !== booking.route.from) setFromCity(booking.route.from);
      if (toCity !== booking.route.to) setToCity(booking.route.to);
    }
  }, [isBookingModalOpen, booking.route]);

  // Auto-select first trip and load prices when trips arrive
  useEffect(() => {
    if (apiTrips.length > 0 && !tripId) {
      const firstTrip =
        apiTrips.find((trip) => trip.departure_time === booking.departureTime) ?? apiTrips[0];
      setTripId(firstTrip.id);
      setDepartureTime(firstTrip.departure_time);
      setBusClass(firstTrip.bus_type?.includes("EXECUTIVE") ? "vip" : "regular");
      if (booking.route) {
        setRoute({
          ...booking.route,
          regularPrice: firstTrip.regular_price,
          vipPrice: firstTrip.vip_price ?? firstTrip.regular_price,
          currency: firstTrip.currency || booking.route.currency,
        });
      }
    }
  }, [apiTrips, tripId]);

  // Find matching route when from/to changes
  useEffect(() => {
    if (fromCity && toCity) {
      const matchedRoute = apiRoutes.find(
        (r) => r.from === fromCity && r.to === toCity && !r.isUpcoming,
      );
      if (matchedRoute) {
        if (!booking.route || booking.route.id !== matchedRoute.id) {
          setRoute(matchedRoute);
        }
      } else if (!booking.route || booking.route.from !== fromCity || booking.route.to !== toCity) {
        // Create a temporary route — resolve currency from origin city's country
        const originCity = cityObjects.find((c) => c.name === fromCity);
        const currency = originCity ? getCurrencyForCountry(originCity.country) : "SSP";
        setRoute({
          id: `${fromCity}-${toCity}`,
          from: fromCity,
          to: toCity,
          duration: "N/A",
          distance: "N/A",
          regularPrice: 0,
          vipPrice: 0,
          currency,
          image: imageForRoute(fromCity, toCity),
          departureTimes: [],
        });
      }
    }
  }, [fromCity, toCity, setRoute, apiRoutes]);

  const releaseSeatLocks = () => {
    if (tripId && seatSessionKey && !bookingId) {
      tripsService.unlockSeats(tripId, seatSessionKey).catch(() => undefined);
    }
    setSeatSessionKey(null);
    setHoldExpiresAt(null);
  };

  useEffect(() => {
    releaseSeatLocks();
    setTripId(null);
    setSelectedSeats([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromCity, toCity, booking.date]);

  const seatLabel = (seatId: string) =>
    apiSeatMap?.seats.find((seat) => String(seat.id) === seatId)?.seat_number ?? seatId;

  const selectedSeatLabels = booking.selectedSeats.map(seatLabel).join(", ");

  const handleDownloadTicket = async (ticket: DownloadableTicket) => {
    const { error } = await downloadTicketPDF(ticket);
    if (error) toast.error(error);
  };

  const handleDownloadAll = async () => {
    for (const t of confirmedTickets) {
      await handleDownloadTicket(t);
    }
  };

  const loadConfirmedTickets = async (reference: string, phone: string) => {
    const { data } = await bookingsService.getBookingByReference(reference, phone);
    if (data?.tickets?.length) {
      setConfirmedTickets(
        data.tickets.map((t) => ({
          ticket_number: t.ticket_number,
          download_token: t.download_token,
          seat_number: t.seat_number,
          full_name: t.full_name,
        })),
      );
    }
    if (data?.total_price != null) setServerTotal(Number(data.total_price));
  };

  const handleClose = () => {
    releaseSeatLocks();
    setBookingModalOpen(false);
    resetBooking();
    setBookingComplete(false);
    setFromCity("");
    setToCity("");
  };

  const selectTrip = (trip: (typeof apiTrips)[number]) => {
    if (String(trip.id) === String(tripId)) return;
    releaseSeatLocks();
    setTripId(trip.id);
    setDepartureTime(trip.departure_time);
    setSelectedSeats([]);
    setBusClass(trip.bus_type?.includes("EXECUTIVE") ? "vip" : "regular");
    if (booking.route) {
      setRoute({
        ...booking.route,
        regularPrice: trip.regular_price,
        vipPrice: trip.vip_price ?? trip.regular_price,
        currency: trip.currency || booking.route.currency,
      });
    }
  };

  const handleSeatToggle = async (seatId: string) => {
    const isSelected = booking.selectedSeats.includes(seatId);
    let nextSeats: string[];

    if (isSelected) {
      nextSeats = booking.selectedSeats.filter((s) => s !== seatId);
    } else {
      if (booking.selectedSeats.length >= booking.passengers) return;
      nextSeats = [...booking.selectedSeats, seatId];
    }

    if (!tripId) {
      toggleSeat(seatId);
      return;
    }

    if (nextSeats.length === 0) {
      setSelectedSeats([]);
      if (seatSessionKey) {
        await tripsService.unlockSeats(tripId, seatSessionKey);
        setSeatSessionKey(null);
        setHoldExpiresAt(null);
      }
      return;
    }

    const { data, error } = await tripsService.lockSeats(
      tripId,
      nextSeats.map((id) => parseInt(id, 10)),
      seatSessionKey ?? undefined,
    );

    if (error) {
      toast.error(error);
      return;
    }

    setSelectedSeats(nextSeats);
    if (data?.session_key) setSeatSessionKey(data.session_key);
    if (data?.expires_at) setHoldExpiresAt(data.expires_at);
  };

  const handleHoldExpired = useCallback(() => {
    if (bookingId) return;
    setSelectedSeats([]);
    setSeatSessionKey(null);
    setHoldExpiresAt(null);
    if (currentStep === 2) setCurrentStep(1);
    toast.error("Your seat hold expired. Please choose your seats again.");
  }, [bookingId, currentStep, setSelectedSeats, setCurrentStep]);

  const extendSeatHold = async () => {
    if (!tripId || booking.selectedSeats.length === 0) return;
    setExtendingHold(true);
    const { data, error } = await tripsService.lockSeats(
      tripId,
      booking.selectedSeats.map((id) => parseInt(id, 10)),
      seatSessionKey ?? undefined,
    );
    setExtendingHold(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (data?.session_key) setSeatSessionKey(data.session_key);
    if (data?.expires_at) setHoldExpiresAt(data.expires_at);
  };

  const updatePassenger = (seatId: string, field: "name" | "idNumber", value: string) => {
    setPassengerDetails((prev) => ({
      ...prev,
      [seatId]: { ...(prev[seatId] ?? { name: "", idNumber: "" }), [field]: value },
    }));
    if (field === "name" && seatId === booking.selectedSeats[0]) setPassengerName(value);
  };

  const passengerName = (seatId: string) => passengerDetails[seatId]?.name?.trim() || "";

  const fromCities =
    apiRoutes.length > 0 ? [...new Set(apiRoutes.map((route) => route.from))] : cities;
  const availableToDestinations = fromCity
    ? apiRoutes.length > 0
      ? [...new Set(apiRoutes.filter((route) => route.from === fromCity).map((route) => route.to))]
      : cities.filter((d) => d !== fromCity)
    : [];

  const canProceedStep0 = () => {
    return booking.route && booking.date && booking.passengers > 0;
  };

  const canProceedStep1 = () => {
    return (
      booking.departureTime &&
      booking.selectedSeats.length === booking.passengers
    );
  };

  const phoneRegionOptions = () => ({
    paymentMethod: booking.paymentMethod,
    currency: booking.route?.currency,
  });

  const hasOnlinePayment = enabledPayments.mpesa || enabledPayments.momo;

  const canProceedStep2 = () => {
    return (
      hasOnlinePayment &&
      booking.selectedSeats.every((seatId) => passengerName(seatId).length >= 2) &&
      isValidPhoneNumber(booking.phoneNumber, phoneRegionOptions())
    );
  };

  const calculateTotal = () => {
    if (!booking.route) return 0;
    const selected = (apiSeatMap?.seats || []).filter((seat) =>
      booking.selectedSeats.includes(String(seat.id)),
    );
    if (selected.length === 0) {
      const pricePerSeat =
        booking.busClass === "vip"
          ? booking.route.vipPrice
          : booking.route.regularPrice;
      return pricePerSeat * booking.selectedSeats.length;
    }
    return selected.reduce((sum, seat) => {
      const price =
        seat.seat_type === "VIP"
          ? booking.route!.vipPrice
          : booking.route!.regularPrice;
      return sum + price;
    }, 0);
  };

  const classLabelForSeats = () => {
    const selected = (apiSeatMap?.seats || []).filter((seat) =>
      booking.selectedSeats.includes(String(seat.id)),
    );
    if (selected.length === 0) {
      return booking.busClass === "vip" ? "VIP" : "Standard";
    }
    const vip = selected.some((seat) => seat.seat_type === "VIP");
    const regular = selected.some((seat) => seat.seat_type === "REGULAR");
    if (vip && regular) return "VIP + Standard";
    return vip ? "VIP" : "Standard";
  };

  const handleConfirmBooking = async () => {
    setBookingError(null);
    if (bookingId && bookingReference) {
      setShowPaymentModal(true);
      return;
    }
    setIsProcessing(true);

    if (!booking.route || !tripId) {
      setBookingError("Trip information missing. Please try again.");
      setIsProcessing(false);
      return;
    }

    try {
      const paymentMethodMap: Record<string, "MPESA" | "MTN_MOMO"> = {
        mpesa: "MPESA",
        mtn: "MTN_MOMO",
      };

      const splitName = (full: string) => {
        const parts = full.trim().split(/\s+/);
        return { first: parts[0] || "Guest", last: parts.slice(1).join(" ") || "-" };
      };
      const leadName = passengerName(booking.selectedSeats[0] ?? "") || "Guest";

      const phone = toE164Phone(booking.phoneNumber, phoneRegionOptions());
      if (!phone) {
        setBookingError("Enter a valid mobile money phone number.");
        setIsProcessing(false);
        return;
      }

      const tickets = booking.selectedSeats.map((seatId) => {
        const mapped = apiSeatMap?.seats.find((seat) => String(seat.id) === seatId);
        const { first, last } = splitName(passengerName(seatId) || leadName);
        return {
          seat: parseInt(seatId, 10),
          first_name: first,
          last_name: last,
          phone_number: phone,
          id_number: passengerDetails[seatId]?.idNumber?.trim() || "-",
          seat_class: (mapped?.seat_type === "VIP" ? "VIP" : "REGULAR") as "VIP" | "REGULAR",
        };
      });

      const bookingData = {
        trip: parseInt(tripId, 10),
        payer_name: leadName,
        payment_phone: phone,
        email: "",
        payment_method: paymentMethodMap[booking.paymentMethod] || "MPESA",
        ...(seatSessionKey ? { session_key: seatSessionKey } : {}),
        tickets,
      };

      const { data, error } = await bookingsService.createBooking(bookingData);

      if (error) {
        setBookingError(error);
        toast.error(`Booking failed: ${error}`);
        setIsProcessing(false);
      } else if (data) {
        setBookingId(data.id);
        setBookingReference(data.booking_reference);
        if (data.total_price != null) setServerTotal(Number(data.total_price));
        setIsProcessing(false);
        setShowPaymentModal(true);
      }
    } catch (err: any) {
      const errorMsg = err?.message || "An unexpected error occurred";
      setBookingError(errorMsg);
      toast.error(errorMsg);
      setIsProcessing(false);
    }
  };

  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelBooking = async () => {
    if (!bookingId) return;
    setIsCancelling(true);
    const paymentPhone = toE164Phone(booking.phoneNumber, phoneRegionOptions());
    const { data, error } = await bookingsService.cancelBooking(bookingId, {
      bookingReference,
      paymentPhone,
    });
    if (error) {
      toast.error(`Cancel failed: ${error}`);
    } else {
      toast.success("Booking cancelled. You can now select new seats.");
      resetAfterCancel();
    }
    setIsCancelling(false);
  };

  const resetAfterCancel = () => {
    setBookingError(null);
    setBookingId(null);
    setBookingReference("");
    setServerTotal(null);
    setSeatSessionKey(null);
    setHoldExpiresAt(null);
    setSelectedSeats([]);
    setCurrentStep(1);
  };

  const totalDue = serverTotal ?? calculateTotal();

  const getStepTitle = () => {
    if (bookingComplete) return "Booking Confirmed";
    if (currentStep === 0) return "Book Your Trip";
    if (currentStep === 1) return "Select Your Seats";
    return "Confirm & Pay";
  };

  return (
    <>
      <Dialog
        open={isBookingModalOpen}
        onOpenChange={(open) => {
          if (open) setBookingModalOpen(true);
          else if (!showPaymentModal) handleClose();
        }}
      >
        <DialogContent
          className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0"
          showCloseButton={false}
        >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-secondary p-3 text-secondary-foreground sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-sm font-bold text-white sm:text-xl">
                <Bus className="w-5 h-5" />
                {getStepTitle()}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Book your bus trip with EcoBus
              </DialogDescription>
              {booking.route && currentStep > 0 && (
                <div className="mt-1 flex items-center gap-1.5 text-xs text-secondary-foreground/80 sm:text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>{booking.route.from}</span>
                  <ArrowRight className="w-4 h-4" />
                  <span>{booking.route.to}</span>
                  {selectedTrip && (
                    <>
                      <span className="opacity-50">·</span>
                      <span>{selectedTrip.bus_type_display || busTypeLabel(selectedTrip.bus_type)}</span>
                    </>
                  )}
                </div>
              )}
              {currentStep === 0 && (
                <p className="mt-1 text-xs text-secondary-foreground/70 sm:text-sm">
                  Fill in your journey details below
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close booking"
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
          <div className="mt-3 flex items-center gap-2 sm:mt-4">
            {[0, 1, 2].map((step) => (
              <div key={step} className="flex items-center gap-2 flex-1">
                <div
                  className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                    currentStep >= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/20 text-white/50",
                  )}
                >
                  {step + 1}
                </div>
                {step < 2 && (
                  <div
                    className={cn(
                      "flex-1 h-1 rounded-full transition-all",
                      currentStep > step ? "bg-primary" : "bg-white/20",
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {bookingComplete ? (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-4 sm:p-6"
            >
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-success" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Booking Confirmed!
                </h3>
                <p className="text-muted-foreground mb-4">
                  Your ticket has been generated successfully.
                </p>
                <div className="bg-accent/50 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm text-muted-foreground mb-1">
                    Booking Reference
                  </p>
                  <p className="text-lg font-bold font-mono text-foreground">
                    {bookingReference}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Keep this reference and your phone number to manage your booking.
                  </p>
                </div>
              </div>

              {confirmedTickets.length > 0 ? (
                <ul className="mb-6 space-y-2" aria-label="Tickets">
                  {confirmedTickets.map((t) => (
                    <li
                      key={t.ticket_number}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-sm font-semibold truncate">{t.ticket_number}</p>
                        <p className="text-xs text-muted-foreground">
                          {t.seat_number ? `Seat ${t.seat_number}` : null}
                          {t.full_name ? ` · ${t.full_name}` : null}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`Download ticket ${t.ticket_number}`}
                          onClick={() => handleDownloadTicket(t)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`Print ticket ${t.ticket_number}`}
                          onClick={() => printTicket(t)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mb-6 text-center text-sm text-muted-foreground">Loading your tickets...</p>
              )}

              {/* Ticket Summary */}
              {booking.route && (
                <div className="bg-accent rounded-xl p-4 space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-semibold">
                      {booking.route.from} - {booking.route.to}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-semibold">
                      {booking.date ? formatDate(booking.date) : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-semibold">
                      {formatDepartureTime(booking.departureTime)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Coach</span>
                    <span className="font-semibold">
                      {selectedTrip?.bus_type_display || busTypeLabel(selectedTrip?.bus_type)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="font-semibold">
                      {selectedSeatLabels}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Class</span>
                    <span className="font-semibold capitalize">
                      {classLabelForSeats()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-border">
                    <span className="font-semibold">Total Paid</span>
                    <span className="text-xl font-bold text-primary">
                      {formatCurrency(totalDue, booking.route.currency)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={handleDownloadAll}
                  disabled={confirmedTickets.length === 0}
                >
                  <Download className="w-4 h-4" />
                  {confirmedTickets.length > 1 ? `Download all (${confirmedTickets.length})` : "Download"}
                </Button>
                <Button className="flex-1 gap-2 bg-primary hover:bg-primary/90" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </motion.div>
          ) : currentStep === 0 ? (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 sm:p-6 space-y-5"
            >
              {/* Journey Details Card */}
              <div className="border border-border rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">
                    Your Journey Details
                  </h3>
                </div>

                {/* From */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="booking-from" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      From
                    </label>
                    <Popover open={fromOpen} onOpenChange={setFromOpen}>
                      <PopoverTrigger asChild>
                        <button id="booking-from" className="w-full h-12 px-4 rounded-xl border border-border bg-background flex items-center justify-between hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span
                              className={
                                fromCity
                                  ? "text-foreground text-sm font-medium"
                                  : "text-muted-foreground"
                              }
                            >
                              {fromCity || "Select city"}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start">
                        <div className="py-2">
                          {fromCities.map((city) => (
                            <button
                              key={city}
                              onClick={() => {
                                setFromCity(city);
                                if (toCity === city) setToCity("");
                                setFromOpen(false);
                              }}
                              className={cn(
                                "w-full px-4 py-2.5 text-left hover:bg-accent transition-colors",
                                fromCity === city &&
                                  "bg-primary/10 text-primary font-medium",
                              )}
                            >
                              {city}
                            </button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* To */}
                  <div>
                    <label htmlFor="booking-to" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      To
                    </label>
                    <Popover open={toOpen} onOpenChange={setToOpen}>
                      <PopoverTrigger asChild>
                        <button id="booking-to"
                          className="w-full h-12 px-4 rounded-xl border border-border bg-background flex items-center justify-between hover:border-primary/50 transition-colors disabled:opacity-50"
                          disabled={!fromCity}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span
                              className={
                                toCity
                                  ? "text-foreground text-sm font-medium"
                                  : "text-muted-foreground"
                              }
                            >
                              {toCity || "Select city"}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[200px] p-0" align="start">
                        <div className="py-2">
                          {availableToDestinations.length > 0 ? (
                            availableToDestinations.map((city) => (
                              <button
                                key={city}
                                onClick={() => {
                                  setToCity(city);
                                  setToOpen(false);
                                }}
                                className={cn(
                                  "w-full px-4 py-2.5 text-left hover:bg-accent transition-colors",
                                  toCity === city &&
                                    "bg-primary/10 text-primary font-medium",
                                )}
                              >
                                {city}
                              </button>
                            ))
                          ) : (
                            <p className="px-4 py-2.5 text-sm text-muted-foreground">
                              No routes available
                            </p>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Date and Passengers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="booking-date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      Date
                    </label>
                    <Popover open={dateOpen} onOpenChange={setDateOpen}>
                      <PopoverTrigger asChild>
                        <button id="booking-date" className="w-full h-12 px-4 rounded-xl border border-border bg-background flex items-center justify-between hover:border-primary/50 transition-colors">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span
                              className={
                                booking.date
                                  ? "text-foreground text-sm font-medium"
                                  : "text-muted-foreground"
                              }
                            >
                              {booking.date
                                ? format(booking.date, "dd/MM/yyyy")
                                : "Select date"}
                            </span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={booking.date || undefined}
                          onSelect={(date) => {
                            if (date) {
                              setDate(date);
                              setDateOpen(false);
                            }
                          }}
                          disabled={(date) => date < startOfToday()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <span id="booking-passengers-label" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                      Passengers
                    </span>
                    <div
                      role="group"
                      aria-labelledby="booking-passengers-label"
                      className="h-12 px-2 rounded-xl border border-border bg-background flex items-center justify-between"
                    >
                      <button
                        type="button"
                        aria-label="Remove a passenger"
                        onClick={() => setPassengers(booking.passengers - 1)}
                        disabled={booking.passengers <= 1}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-lg" aria-live="polite">
                          {booking.passengers}
                        </span>
                      </div>
                      <button
                        type="button"
                        aria-label="Add a passenger"
                        onClick={() => setPassengers(booking.passengers + 1)}
                        disabled={booking.passengers >= 10}
                        className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Info */}
              {booking.route && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-primary/5 border border-primary/20 rounded-xl p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm md:text-base text-foreground">
                        {booking.route.from} to {booking.route.to}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {booking.route.duration} • {booking.route.distance}
                        {(booking.route.busTypes || booking.route.allowedBusTypes || []).length > 0
                          ? ` • ${(booking.route.busTypes || booking.route.allowedBusTypes || []).map(busTypeLabel).join(" · ")}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-primary/10">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Standard seat
                      </p>
                      <p className="font-bold text-secondary">
                        {formatCurrency(
                          booking.route.regularPrice,
                          booking.route.currency,
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        VIP seat
                      </p>
                      <p className="font-bold text-primary">
                        {formatCurrency(
                          booking.route.vipPrice,
                          booking.route.currency,
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : currentStep === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 sm:p-6 space-y-6"
            >
              {/* Departure Time */}
              {booking.route && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground uppercase text-sm tracking-wide">
                      Select Departure Time
                    </h3>
                  </div>
                  {tripsLoading ? (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      Loading available trips...
                    </div>
                  ) : apiTrips.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {apiTrips.map((trip) => {
                        const timeInfo = getTimeIcon(trip.departure_time);
                        const TimeIcon = timeInfo.icon;
                        return (
                          <button
                            key={trip.id}
                            type="button"
                            aria-pressed={tripId === trip.id}
                            onClick={() => selectTrip(trip)}
                            className={cn(
                              "p-3 rounded-xl border-2 transition-all text-left",
                              tripId === trip.id
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border hover:border-primary/50",
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <TimeIcon
                                className={cn(
                                  "w-5 h-5",
                                  timeInfo.color,
                                )}
                              />
                              <p className="font-semibold text-foreground text-sm">
                                {formatDepartureTime(trip.departure_time)}
                              </p>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">
                              {trip.bus_type_display || busTypeLabel(trip.bus_type)}
                              {trip.seat_layout ? ` · ${trip.seat_layout}` : ""}
                            </p>
                            <p className="text-[11px] text-success font-medium mt-1">
                              {trip.available_seats} seats left
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-4">
                      No trips available for selected date
                    </div>
                  )}
                </div>
              )}

              {/* Passengers Info */}
              <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                <Users className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Passengers:
                </span>
                <span className="font-semibold">{booking.passengers}</span>
                <span className="text-muted-foreground mx-2">|</span>
                <span className="text-sm text-muted-foreground">Date:</span>
                <span className="font-semibold">
                  {booking.date
                    ? format(booking.date, "dd/MM/yyyy")
                    : "Not selected"}
                </span>
              </div>

              {/* Coach from backend */}
              {booking.route && selectedTrip && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Bus className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground uppercase text-sm tracking-wide">
                      This departure
                    </h3>
                  </div>
                  <div className="rounded-xl border border-border p-4">
                    <h4 className="font-semibold text-foreground">
                      {selectedTrip.bus_type_display || busTypeLabel(selectedTrip.bus_type)}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedTrip.bus_name}
                      {selectedTrip.seat_layout ? ` · ${selectedTrip.seat_layout}` : ""}
                      {selectedTrip.bus_capacity ? ` · ${selectedTrip.bus_capacity} seats` : ""}
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-3 mt-3 border-t border-border">
                      <div>
                        <p className="text-xs text-muted-foreground">Standard seat</p>
                        <p className="font-bold text-secondary">
                          {formatCurrency(selectedTrip.regular_price, selectedTrip.currency || booking.route.currency)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">VIP seat</p>
                        <p className="font-bold text-primary">
                          {formatCurrency(selectedTrip.vip_price ?? selectedTrip.regular_price, selectedTrip.currency || booking.route.currency)}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-3">
                      Pick seats on this coach. VIP and standard prices come from the live seat map.
                    </p>
                  </div>
                </div>
              )}

              {/* Seat Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-foreground uppercase text-sm tracking-wide">
                      Select {booking.passengers} Seat
                      {booking.passengers > 1 ? "s" : ""}
                    </h3>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {booking.selectedSeats.length}/{booking.passengers} selected
                  </span>
                </div>
                {holdExpiresAt && !bookingId && booking.selectedSeats.length > 0 && (
                  <div className="mb-3">
                    <SeatHoldTimer
                      expiresAt={holdExpiresAt}
                      onExpire={handleHoldExpired}
                      onExtend={extendSeatHold}
                      extending={extendingHold}
                    />
                  </div>
                )}
                <SeatMap
                  selectedSeats={booking.selectedSeats}
                  onSeatToggle={handleSeatToggle}
                  apiSeatMap={apiSeatMap}
                  loading={seatsLoading}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-4 sm:p-6 space-y-6"
            >
              {holdExpiresAt && !bookingId && booking.selectedSeats.length > 0 && (
                <SeatHoldTimer
                  expiresAt={holdExpiresAt}
                  onExpire={handleHoldExpired}
                  onExtend={extendSeatHold}
                  extending={extendingHold}
                />
              )}
              {/* Summary Card */}
              {booking.route && (
                <div className="border border-border bg-muted/40 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-semibold">
                      {booking.route.from} - {booking.route.to}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Travel Date</span>
                    <span className="font-semibold">
                      {booking.date ? formatDate(booking.date) : "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-semibold">
                      {formatDepartureTime(booking.departureTime)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Coach</span>
                    <span className="font-semibold">
                      {selectedTrip?.bus_type_display || busTypeLabel(selectedTrip?.bus_type)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="font-semibold">
                      {selectedSeatLabels}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-border">
                    <span className="text-muted-foreground">
                      {classLabelForSeats()} seats (
                      {booking.selectedSeats.length}x)
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(totalDue, booking.route.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-start pt-2 border-t border-border">
                    <span className="font-bold text-foreground">
                      Total Price
                    </span>
                    <div className="text-right">
                      <span className="text-xl font-bold text-primary block">
                        {formatCurrency(totalDue, booking.route.currency)}
                      </span>
                      {(() => {
                        const payCurrency = PAYMENT_CURRENCY[booking.paymentMethod];
                        const baseCurrency = booking.route.currency;
                        if (payCurrency && baseCurrency !== payCurrency && totalDue > 0) {
                          const converted = convertCurrency(totalDue, baseCurrency, payCurrency);
                          return (
                            <span className="text-xs text-muted-foreground">
                              ≈ {formatCurrency(converted, payCurrency)} via {booking.paymentMethod === "mpesa" ? "M-Pesa" : "MTN MoMo"}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              )}

              {/* Passenger details */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Passenger details
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Names must match each traveller&apos;s ID — they are printed on the ticket and checked at boarding.
                  </p>
                </div>
                {booking.selectedSeats.map((seatId, index) => (
                  <fieldset key={seatId} className="rounded-xl border border-border p-3 sm:p-4 space-y-3">
                    <legend className="px-1 text-xs font-semibold text-foreground">
                      Passenger {index + 1} · Seat {seatLabel(seatId)}
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label htmlFor={`passenger-name-${seatId}`} className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          Full name <span className="text-destructive">*</span>
                        </label>
                        <Input
                          id={`passenger-name-${seatId}`}
                          autoComplete={index === 0 ? "name" : "off"}
                          placeholder="As on ID"
                          value={passengerDetails[seatId]?.name ?? ""}
                          onChange={(e) => updatePassenger(seatId, "name", e.target.value)}
                          className="h-11"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor={`passenger-id-${seatId}`} className="text-xs font-medium text-muted-foreground mb-1.5 block">
                          ID / passport no. (optional)
                        </label>
                        <Input
                          id={`passenger-id-${seatId}`}
                          autoComplete="off"
                          placeholder="Needed for border crossings"
                          value={passengerDetails[seatId]?.idNumber ?? ""}
                          onChange={(e) => updatePassenger(seatId, "idNumber", e.target.value)}
                          className="h-11"
                          maxLength={50}
                        />
                      </div>
                    </div>
                  </fieldset>
                ))}

                <div>
                  <label htmlFor="booking-phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 block">
                    Mobile money number <span className="text-destructive">*</span>
                  </label>
                  <Input
                    id="booking-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="0921 000 000 or +256 700 000 000"
                    value={booking.phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-foreground uppercase text-sm tracking-wide">
                    Payment Method
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: "mpesa" as const, label: "M-Pesa", enabled: enabledPayments.mpesa, color: "success", borderColor: "border-success", bgColor: "bg-success/5", hoverColor: "hover:border-success/50", dotColor: "bg-success", iconColor: "text-success" },
                    { id: "mtn" as const, label: "MTN MoMo", enabled: enabledPayments.momo, color: "yellow-500", borderColor: "border-yellow-500", bgColor: "bg-yellow-500/5", hoverColor: "hover:border-yellow-500/50", dotColor: "bg-yellow-500", iconColor: "text-yellow-500" },
                  ]).filter((method) => method.enabled).map((method) => {
                    const payCurrency = PAYMENT_CURRENCY[method.id];
                    const baseCurrency = booking.route?.currency || "SSP";
                    const total = totalDue;
                    const convertedTotal = convertCurrency(total, baseCurrency, payCurrency);
                    const isSelected = booking.paymentMethod === method.id;
                    const showConversion = baseCurrency !== payCurrency && total > 0;

                    return (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-left",
                          isSelected
                            ? `${method.borderColor} ${method.bgColor} shadow-sm`
                            : `border-border ${method.hoverColor}`,
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Smartphone className={cn("w-5 h-5", method.iconColor)} />
                          <span className="font-semibold text-sm">{method.label}</span>
                          {isSelected && (
                            <div className={cn("w-3 h-3 rounded-full ml-auto", method.dotColor)} />
                          )}
                        </div>
                        {showConversion && (
                          <p className={cn("text-xs mt-2 font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>
                            You pay: <span className="font-bold">{formatCurrency(convertedTotal, payCurrency)}</span>
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
                {!enabledPayments.mpesa && !enabledPayments.momo && (
                  <p className="mt-2 text-sm text-destructive">
                    Online payments are temporarily disabled. Please pay at an EcoBus desk.
                  </p>
                )}
              </div>

              <p className="text-xs text-muted-foreground">
                Tickets are non-refundable and can&apos;t be changed to another trip or seat. See the{" "}
                <a href="/refund-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  cancellation policy
                </a>
                .
              </p>

              {/* Error Message */}
              {bookingError && (
                <div className="space-y-3">
                  <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 flex items-start gap-3">
                    <div className="w-4 h-4 rounded-full bg-destructive mt-0.5 shrink-0" />
                    <p className="text-sm text-destructive">{bookingError}</p>
                  </div>
                  {bookingId && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCancelBooking}
                      disabled={isCancelling}
                      className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                    >
                      {isCancelling ? "Cancelling..." : "Cancel Booking & Choose New Seats"}
                    </Button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        {!bookingComplete && (
          <div className="p-4 sm:p-6 pt-0 flex items-center gap-4">
            {currentStep === 0 ? (
              <>
                <Button variant="ghost" onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => setCurrentStep(1)}
                  disabled={!canProceedStep0()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : currentStep === 1 ? (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(0)}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedStep1()}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 gap-2"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(1)}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  onClick={handleConfirmBooking}
                  disabled={!canProceedStep2() || isProcessing}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 gap-2"
                >
                  {isProcessing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      {bookingId ? "Retry Payment" : "Confirm Booking"}
                      <Check className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Payment Confirmation Modal */}
    {bookingId && bookingReference && (
      <PaymentConfirmationModal
        isOpen={showPaymentModal}
        bookingId={bookingId}
        bookingReference={bookingReference}
        phoneNumber={toE164Phone(booking.phoneNumber, phoneRegionOptions())}
        amount={totalDue}
        baseCurrency={booking.route?.currency || "SSP"}
        paymentMethod={booking.paymentMethod}
        onSuccess={() => {
          setShowPaymentModal(false);
          setBookingComplete(true);
          loadConfirmedTickets(
            bookingReference,
            toE164Phone(booking.phoneNumber, phoneRegionOptions()),
          );
          toast.success("Payment confirmed! Your booking is complete.");
        }}
        onFailed={() => {
          setShowPaymentModal(false);
          setBookingError("Payment could not be started. You can try again or cancel this booking.");
        }}
        onCancelled={() => {
          setShowPaymentModal(false);
          resetAfterCancel();
        }}
        onClose={() => {
          setShowPaymentModal(false);
        }}
      />
    )}
    </>
  );
}
