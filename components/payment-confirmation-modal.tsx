/**
 * Payment Confirmation Modal
 * Handles payment confirmation after booking
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle, Clock, Loader } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { usePaymentConfirmation } from "@/hooks/use-payment-confirmation";
import { toast } from "sonner";
import { formatCurrency, PAYMENT_CURRENCY } from "@/lib/booking-data";
import { useExchangeRates } from "@/hooks/use-exchange-rates";
import { bookingsService, paymentsService } from "@/lib/services";

interface PaymentConfirmationModalProps {
  isOpen: boolean;
  bookingId: string;
  bookingReference: string;
  phoneNumber: string;
  amount: number;
  baseCurrency?: string;
  paymentMethod: "mpesa" | "mtn";
  onSuccess?: () => void;
  /** Payment did not go through; booking is still pending and can be retried or cancelled. */
  onFailed?: () => void;
  /** Booking was cancelled from this modal and seats released. */
  onCancelled?: () => void;
  onClose?: () => void;
}

type ProviderRef = { kind: "mpesa"; checkoutRequestId: string } | { kind: "mtn"; referenceId: string };

export function PaymentConfirmationModal({
  isOpen,
  bookingId,
  bookingReference,
  phoneNumber,
  amount,
  baseCurrency = "SSP",
  paymentMethod,
  onSuccess,
  onFailed,
  onCancelled,
  onClose,
}: PaymentConfirmationModalProps) {
  const { confirmationState, confirmMpesaPayment, confirmMomoPayment, resetState } =
    usePaymentConfirmation();
  const { convert: convertCurrency } = useExchangeRates();
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCancellingBooking, setIsCancellingBooking] = useState(false);
  const initiatedRef = useRef(false);
  const successHandledRef = useRef(false);
  const providerRef = useRef<ProviderRef | null>(null);

  const isBusy =
    confirmationState.status === "pending" || confirmationState.status === "confirming";

  const pollExisting = useCallback(async () => {
    const ref = providerRef.current;
    if (!ref) return;
    if (ref.kind === "mpesa") {
      await confirmMpesaPayment(ref.checkoutRequestId);
    } else {
      await confirmMomoPayment(ref.referenceId, bookingReference, phoneNumber);
    }
  }, [confirmMpesaPayment, confirmMomoPayment, bookingReference, phoneNumber]);

  const finishSuccess = useCallback(() => {
    if (successHandledRef.current) return;
    successHandledRef.current = true;
    onSuccess?.();
  }, [onSuccess]);

  const initiatePayment = useCallback(async () => {
    const phone = phoneNumber.replace(/^\+/, "");

    if (paymentMethod === "mpesa") {
      const { data, error } = await paymentsService.mpesaSTKPush(bookingId, phone, bookingReference, phoneNumber);
      if (data?.already_paid) {
        toast.success("This booking is already paid.");
        finishSuccess();
        return;
      }
      if (error || !data?.checkout_request_id) {
        toast.error(`M-Pesa error: ${error || "No checkout ID returned"}`);
        onFailed?.();
        return;
      }
      providerRef.current = { kind: "mpesa", checkoutRequestId: data.checkout_request_id };
      toast.info("STK Push sent! Check your phone for the M-Pesa PIN prompt.");
    } else {
      const { data, error } = await paymentsService.momoRequestToPay(bookingId, phone, bookingReference, phoneNumber);
      if (data?.already_paid) {
        toast.success("This booking is already paid.");
        finishSuccess();
        return;
      }
      if (error || !data?.reference_id) {
        toast.error(`MTN MoMo error: ${error || "No reference ID returned"}`);
        onFailed?.();
        return;
      }
      providerRef.current = { kind: "mtn", referenceId: data.reference_id };
      toast.info("MoMo request sent! Approve the payment on your phone.");
    }
    await pollExisting();
  }, [bookingId, bookingReference, phoneNumber, paymentMethod, onFailed, pollExisting, finishSuccess]);

  useEffect(() => {
    if (!isOpen) {
      initiatedRef.current = false;
      successHandledRef.current = false;
      providerRef.current = null;
      resetState();
      return;
    }
    if (!bookingId || !phoneNumber || initiatedRef.current) return;
    initiatedRef.current = true;
    initiatePayment();
  }, [isOpen, bookingId, phoneNumber, initiatePayment, resetState]);

  useEffect(() => {
    if (confirmationState.status === "success") {
      const timer = setTimeout(finishSuccess, 1500);
      return () => clearTimeout(timer);
    }
  }, [confirmationState.status, finishSuccess]);

  /**
   * Timeout: the provider may still complete, so only re-check status.
   * Failed: the provider rejected the request, so send exactly one new prompt.
   */
  const handleTryAgain = async () => {
    setIsRetrying(true);
    resetState();
    try {
      if (confirmationState.status === "timeout" && providerRef.current) {
        await pollExisting();
      } else {
        await initiatePayment();
      }
    } finally {
      setIsRetrying(false);
    }
  };

  const handleCancelAndClose = async () => {
    setIsCancellingBooking(true);
    try {
      const { data: latest } = await bookingsService.getBookingByReference(bookingReference, phoneNumber);
      if (latest?.status === "CONFIRMED") {
        toast.success("Your payment went through after all.");
        finishSuccess();
        return;
      }
      const { error } = await bookingsService.cancelBooking(bookingId, {
        bookingReference,
        paymentPhone: phoneNumber,
      });
      if (error) {
        toast.error(`Could not cancel: ${error}`);
        return;
      }
      toast.info("Booking cancelled. Seats released.");
      onCancelled?.();
    } finally {
      setIsCancellingBooking(false);
    }
  };

  const getPaymentMethodName = (method: string) => {
    return method === "mpesa" ? "M-Pesa" : "MTN MoMo";
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isBusy && !isCancellingBooking) onClose?.();
      }}
    >
      <DialogContent className="sm:max-w-[500px] p-0 gap-0" showCloseButton={false}>
        <div className="bg-secondary text-secondary-foreground p-6">
          <DialogTitle className="text-xl font-bold text-white">
            Confirming Payment
          </DialogTitle>
          <DialogDescription className="sr-only">
            Your payment is being confirmed
          </DialogDescription>
        </div>

        <div className="p-6 space-y-6" aria-live="polite">
          <div className="flex flex-col items-center justify-center py-8">
            {isBusy ? (
              <Loader className="w-12 h-12 text-primary animate-spin motion-reduce:animate-none" />
            ) : confirmationState.status === "success" ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
              >
                <CheckCircle className="w-16 h-16 text-success" />
              </motion.div>
            ) : (
              <AlertCircle className="w-16 h-16 text-destructive" />
            )}
          </div>

          <div className="text-center space-y-2">
            <h3 className="text-lg font-bold text-foreground">
              {isBusy
                ? "Processing Payment..."
                : confirmationState.status === "success"
                  ? "Payment Successful!"
                  : "Payment Confirmation"}
            </h3>
            <p className="text-muted-foreground">{confirmationState.message}</p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Booking Reference</span>
              <span className="font-mono font-semibold">{bookingReference}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <div className="text-right">
                <span className="font-semibold text-foreground block">
                  {formatCurrency(amount, baseCurrency)}
                </span>
                {(() => {
                  const payCurrency = PAYMENT_CURRENCY[paymentMethod];
                  if (payCurrency && payCurrency !== baseCurrency && amount > 0) {
                    return (
                      <span className="text-xs text-muted-foreground">
                        ≈ {formatCurrency(convertCurrency(amount, baseCurrency, payCurrency), payCurrency)}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Payment Method</span>
              <span className="font-semibold">{getPaymentMethodName(paymentMethod)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-border">
              <span className="text-muted-foreground">Status</span>
              <span
                className={`font-semibold capitalize ${
                  confirmationState.status === "success"
                    ? "text-success"
                    : confirmationState.status === "failed"
                      ? "text-destructive"
                      : "text-primary"
                }`}
              >
                {confirmationState.status}
              </span>
            </div>
          </div>

          {isBusy && (
            <div className="bg-info/10 border border-info/30 rounded-lg p-4 flex gap-3">
              <Clock className="w-5 h-5 text-info shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-semibold mb-1">Enter your PIN</p>
                <p className="text-muted-foreground">
                  Complete the payment on your phone. We&apos;ll automatically
                  confirm once the payment is processed (usually within 30 seconds).
                </p>
              </div>
            </div>
          )}

          {confirmationState.status === "failed" && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-semibold mb-1">Payment Failed</p>
                <p className="text-muted-foreground">
                  {confirmationState.message ||
                    "Your payment could not be processed. Please check your account and try again."}
                </p>
              </div>
            </div>
          )}

          {confirmationState.status === "timeout" && (
            <div className="bg-warning/10 border border-warning/30 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
              <div className="text-sm text-foreground">
                <p className="font-semibold mb-1">Still waiting for confirmation</p>
                <p className="text-muted-foreground">
                  Do not pay again: provider confirmations can arrive late. Use
                  &quot;Check again&quot; or look up reference {bookingReference} in Manage Booking shortly.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex gap-3">
          {confirmationState.status === "failed" ||
          confirmationState.status === "timeout" ? (
            <>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleCancelAndClose}
                disabled={isCancellingBooking || isRetrying}
              >
                {isCancellingBooking ? "Cancelling..." : "Cancel Booking"}
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleTryAgain}
                disabled={isRetrying || isCancellingBooking}
              >
                {isRetrying
                  ? "Please wait..."
                  : confirmationState.status === "timeout"
                    ? "Check again"
                    : "Send new prompt"}
              </Button>
            </>
          ) : confirmationState.status === "success" ? (
            <Button className="w-full bg-success hover:bg-success/90" onClick={finishSuccess}>
              Continue to Ticket
            </Button>
          ) : (
            <Button disabled className="w-full">
              Confirming...
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
