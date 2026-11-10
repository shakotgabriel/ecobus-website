"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { Route, BookingDetails } from "./booking-data";

interface BookingContextType {
  booking: BookingDetails;
  setRoute: (route: Route) => void;
  setDate: (date: Date) => void;
  setPassengers: (count: number) => void;
  setDepartureTime: (time: string) => void;
  setBusClass: (busClass: "regular" | "vip") => void;
  setSelectedSeats: (seats: string[]) => void;
  toggleSeat: (seatId: string) => void;
  setPassengerName: (name: string) => void;
  setPhoneNumber: (phone: string) => void;
  setPaymentMethod: (method: "mpesa" | "mtn") => void;
  resetBooking: () => void;
  isBookingModalOpen: boolean;
  setBookingModalOpen: (open: boolean) => void;
  openBookingModal: (skipToStep1?: boolean) => void;
  currentStep: number;
  setCurrentStep: (step: number) => void;
}

const initialBooking: BookingDetails = {
  route: null,
  date: null,
  passengers: 1,
  departureTime: "",
  busClass: "regular",
  selectedSeats: [],
  passengerName: "",
  phoneNumber: "",
  paymentMethod: "mpesa",
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingDetails>(initialBooking);
  const [isBookingModalOpen, setBookingModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const openBookingModal = useCallback((skipToStep1: boolean = false) => {
    if (skipToStep1) {
      setCurrentStep(1);
    } else {
      setCurrentStep(0);
    }
    setBookingModalOpen(true);
  }, []);

  const setRoute = useCallback((route: Route) => {
    setBooking((prev) => {
      if (
        prev.route &&
        route &&
        prev.route.id === route.id &&
        prev.route.regularPrice === route.regularPrice &&
        prev.route.vipPrice === route.vipPrice &&
        prev.route.currency === route.currency &&
        prev.route.from === route.from &&
        prev.route.to === route.to
      ) {
        return prev;
      }
      return { ...prev, route };
    });
  }, []);

  const setDate = useCallback((date: Date) => {
    setBooking((prev) => ({ ...prev, date }));
  }, []);

  const setPassengers = useCallback((count: number) => {
    setBooking((prev) => ({
      ...prev,
      passengers: Math.max(1, Math.min(10, count)),
      selectedSeats: prev.selectedSeats.slice(
        0,
        Math.max(1, Math.min(10, count)),
      ),
    }));
  }, []);

  const setDepartureTime = useCallback((time: string) => {
    setBooking((prev) => ({ ...prev, departureTime: time }));
  }, []);

  const setBusClass = useCallback((busClass: "regular" | "vip") => {
    setBooking((prev) => ({ ...prev, busClass, selectedSeats: [] }));
  }, []);

  const setSelectedSeats = useCallback((seats: string[]) => {
    setBooking((prev) => ({ ...prev, selectedSeats: seats }));
  }, []);

  const toggleSeat = useCallback((seatId: string) => {
    setBooking((prev) => {
      const isSelected = prev.selectedSeats.includes(seatId);
      if (isSelected) {
        return {
          ...prev,
          selectedSeats: prev.selectedSeats.filter((s) => s !== seatId),
        };
      }
      if (prev.selectedSeats.length < prev.passengers) {
        return { ...prev, selectedSeats: [...prev.selectedSeats, seatId] };
      }
      return prev;
    });
  }, []);

  const setPassengerName = useCallback((name: string) => {
    setBooking((prev) => ({ ...prev, passengerName: name }));
  }, []);

  const setPhoneNumber = useCallback((phone: string) => {
    setBooking((prev) => ({ ...prev, phoneNumber: phone }));
  }, []);

  const setPaymentMethod = useCallback((method: "mpesa" | "mtn") => {
    setBooking((prev) => ({ ...prev, paymentMethod: method }));
  }, []);

  const resetBooking = useCallback(() => {
    setBooking(initialBooking);
    setCurrentStep(0);
  }, []);

  const value = useMemo<BookingContextType>(
    () => ({
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
      resetBooking,
      isBookingModalOpen,
      setBookingModalOpen,
      openBookingModal,
      currentStep,
      setCurrentStep,
    }),
    [
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
      resetBooking,
      isBookingModalOpen,
      openBookingModal,
      currentStep,
    ],
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
