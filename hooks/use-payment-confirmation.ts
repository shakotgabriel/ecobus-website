/**
 * usePaymentConfirmation Hook
 * Handles payment confirmation after STK push / MoMo request
 */

"use client";

import { useState, useCallback } from "react";
import { paymentsService, PaymentStatusResponse } from "@/lib/services";

export interface PaymentConfirmationState {
  status: "pending" | "confirming" | "success" | "failed" | "timeout";
  message: string;
  paymentData?: PaymentStatusResponse;
}

export function usePaymentConfirmation() {
  const [confirmationState, setConfirmationState] = useState<PaymentConfirmationState>({
    status: "pending",
    message: "Awaiting payment...",
  });

  const handlePollResult = useCallback((
    data: PaymentStatusResponse | null | undefined,
    error: string | null | undefined
  ) => {
    if (error) {
      setConfirmationState({
        status: "timeout",
        message: error,
      });
      return { success: false, error };
    }

    if (data?.status === "COMPLETED") {
      setConfirmationState({
        status: "success",
        message: "Payment confirmed successfully!",
        paymentData: data,
      });
      return { success: true, data };
    }

    if (data?.status === "FAILED") {
      setConfirmationState({
        status: "failed",
        message: data.message || "Payment failed. Please try again.",
        paymentData: data,
      });
      return { success: false, error: data.message };
    }

    setConfirmationState({
      status: "timeout",
      message: "Payment confirmation timed out. Please check your status.",
    });
    return { success: false, error: "Timeout" };
  }, []);

  const confirmMpesaPayment = useCallback(
    async (checkoutRequestId: string, maxAttempts?: number) => {
      setConfirmationState({
        status: "confirming",
        message: "Confirming your M-Pesa payment...",
      });

      const { data, error } = await paymentsService.pollMpesaStatus(
        checkoutRequestId,
        maxAttempts || 30,
        2000
      );

      return handlePollResult(data, error);
    },
    [handlePollResult]
  );

  const confirmMomoPayment = useCallback(
    async (
      referenceId: string,
      bookingReference: string,
      paymentPhone: string,
      maxAttempts?: number
    ) => {
      setConfirmationState({
        status: "confirming",
        message: "Confirming your MTN MoMo payment...",
      });

      const { data, error } = await paymentsService.pollMomoStatus(
        referenceId,
        maxAttempts || 30,
        2000
      );

      if (data?.status === "COMPLETED" || data?.status === "FAILED") {
        return handlePollResult(data, error);
      }

      // Fallback: poll booking lookup by reference + phone
      const fallback = await paymentsService.pollBookingConfirmed(
        bookingReference,
        paymentPhone,
        maxAttempts || 15,
        2000
      );
      return handlePollResult(fallback.data, fallback.error);
    },
    [handlePollResult]
  );

  const resetState = useCallback(() => {
    setConfirmationState({
      status: "pending",
      message: "Awaiting payment...",
    });
  }, []);

  return {
    confirmationState,
    confirmMpesaPayment,
    confirmMomoPayment,
    resetState,
  };
}
