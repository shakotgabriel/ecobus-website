"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Ticket,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  AlertTriangle,
  MapPin,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { bookingsService, type BookingDetailsResponse } from "@/lib/services";
import { formatCurrency } from "@/lib/booking-data";
import { OPERATOR_TIMEZONE } from "@/lib/config";
import { downloadTicketPDF, type DownloadableTicket } from "@/lib/ticket-download";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pending Payment", className: "bg-warning/10 text-warning-foreground border-warning/20" },
  CONFIRMED: { label: "Confirmed", className: "bg-success/10 text-success border-success/20" },
  CANCELLED: { label: "Cancelled", className: "bg-destructive/10 text-destructive border-destructive/20" },
  RESCHEDULED: { label: "Rescheduled", className: "bg-info/10 text-info border-info/20" },
  COMPLETED: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
};

function formatDateTime(iso?: string) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: OPERATOR_TIMEZONE,
  });
}

export function ManageBookingClient() {
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingDetailsResponse | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [cancelResult, setCancelResult] = useState<{
    refund_percentage: number;
    refund_amount: string;
  } | null>(null);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim() || !phone.trim()) return;

    setLoading(true);
    setError(null);
    setBooking(null);
    setCancelResult(null);

    const { data, error: lookupError } = await bookingsService.getBookingByReference(
      reference.trim(),
      phone.trim()
    );

    if (lookupError || !data) {
      setError(lookupError || "Booking not found.");
    } else {
      setBooking(data);
    }
    setLoading(false);
  };

  const handleCancel = async () => {
    if (!booking) return;
    setIsCancelling(true);

    const { data, error: cancelError } = await bookingsService.cancelBooking(booking.id, {
      bookingReference: booking.booking_reference,
      paymentPhone: phone,
    });

    if (cancelError || !data) {
      toast.error(cancelError || "Failed to cancel booking.");
      setIsCancelling(false);
      return;
    }

    setBooking({ ...booking, status: "CANCELLED" });
    setCancelResult({
      refund_percentage: data.refund_percentage,
      refund_amount: data.refund_amount,
    });
    toast.success("Booking cancelled successfully.");
    setIsCancelling(false);
  };

  const handleDownload = async (ticket: DownloadableTicket) => {
    setDownloading(ticket.ticket_number);
    const { error: downloadError } = await downloadTicketPDF(ticket);
    if (downloadError) toast.error(downloadError);
    setDownloading(null);
  };

  const status = booking ? statusConfig[booking.status] : null;
  const canCancel =
    booking && !["CANCELLED", "RESCHEDULED", "COMPLETED"].includes(booking.status);
  const canDownload = booking?.status === "CONFIRMED";
  const departureLabel = formatDateTime(booking?.trip_details?.departure_time);
  const currency = booking?.trip_details?.currency || "SSP";

  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" className="pt-24 pb-16">
        <div className="mx-auto max-w-2xl px-5 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center"
          >
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Ticket className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 font-display text-3xl font-semibold text-foreground">
              Manage your booking
            </h1>
            <p className="text-muted-foreground">
              Look up your booking with your reference and the phone number used at
              checkout to view details, download tickets, or cancel.
            </p>
          </motion.div>

          <Card className="mb-8 rounded-2xl border-border/70">
            <CardHeader>
              <CardTitle className="text-lg">Find your booking</CardTitle>
              <CardDescription>
                Use the booking reference from your confirmation and the
                payment phone number.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLookup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reference">Booking reference</Label>
                  <Input
                    id="reference"
                    placeholder="Your booking reference"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    className="h-12 font-mono uppercase"
                    autoComplete="off"
                    required
                    maxLength={40}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Payment phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="e.g. 0921 000 000 or +256 700 000 000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12"
                    required
                    maxLength={20}
                  />
                </div>
                {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                <Button type="submit" className="h-12 w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Looking up…
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" /> Find booking
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {booking && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="font-mono tracking-wide">
                        {booking.booking_reference}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {booking.trip_details
                          ? `${booking.trip_details.origin} → ${booking.trip_details.destination}`
                          : booking.trip_display || "Trip details unavailable"}
                      </CardDescription>
                    </div>
                    {status && (
                      <Badge variant="outline" className={cn("rounded-full shrink-0", status.className)}>
                        {status.label}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {departureLabel && (
                    <div className="flex items-center gap-2 rounded-xl border bg-muted/40 px-3 py-2.5 text-sm">
                      <MapPin className="h-4 w-4 text-primary shrink-0" />
                      <span>
                        Departs <span className="font-medium text-foreground">{departureLabel}</span>{" "}
                        <span className="text-muted-foreground">(Juba time)</span>
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                        Booked by
                      </p>
                      <p className="font-medium">{booking.payer_name}</p>
                    </div>
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">
                        Total
                      </p>
                      <p className="font-medium">
                        {formatCurrency(Number(booking.total_price), currency)} · {booking.number_of_seats}{" "}
                        seat(s)
                      </p>
                    </div>
                  </div>

                  {booking.tickets && booking.tickets.length > 0 && (
                    <ul className="divide-y rounded-xl border" aria-label="Tickets">
                      {booking.tickets.map((ticket) => (
                        <li key={ticket.id} className="flex items-center justify-between gap-3 p-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{ticket.full_name}</p>
                              <p className="font-mono text-xs text-muted-foreground">
                                {ticket.ticket_number}
                                {ticket.seat_number ? ` · Seat ${ticket.seat_number}` : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {ticket.seat_class}
                            </Badge>
                            {canDownload && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDownload(ticket)}
                                disabled={downloading === ticket.ticket_number}
                                aria-label={`Download ticket ${ticket.ticket_number}`}
                              >
                                {downloading === ticket.ticket_number ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}

                  {cancelResult && (
                    <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/10 p-4">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                      <div className="text-sm">
                        <p className="font-semibold text-success">Booking cancelled</p>
                        <p className="text-muted-foreground">
                          {Number(cancelResult.refund_amount) > 0
                            ? `Refund: ${formatCurrency(Number(cancelResult.refund_amount), currency)}`
                            : "Your seats have been released. Tickets are non-refundable."}
                        </p>
                      </div>
                    </div>
                  )}

                  {booking.status === "CANCELLED" && !cancelResult && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <XCircle className="h-4 w-4" />
                      This booking has already been cancelled.
                    </div>
                  )}

                  {canCancel && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                        >
                          Cancel booking
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                            Cancel this booking?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Tickets are non-refundable. Cancelling releases your seats so someone else
                            can book them, but no money is returned. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Keep booking</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleCancel}
                            disabled={isCancelling}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {isCancelling ? "Cancelling..." : "Yes, cancel booking"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Booked on {formatDateTime(booking.created_at)}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
