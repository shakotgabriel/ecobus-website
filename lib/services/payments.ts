/**
 * Payments API Service
 * Handles payment processing and confirmation
 */

import { apiClient } from "@/lib/api-client";

export interface PaymentStatusResponse {
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "NOT_FOUND";
  transaction_reference?: string;
  message: string;
}

function idempotencyHeaders(): Record<string, string> {
  const key =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { "Idempotency-Key": key };
}

/** Returned instead of a new prompt when the booking has already been paid. */
export type AlreadyPaidResponse = {
  already_paid: true;
  booking_reference: string;
  booking_status: string;
};

export type PublicPaymentMethods = {
  mpesa: boolean;
  momo: boolean;
  cash: boolean;
};

export const paymentsService = {
  async getEnabledMethods() {
    try {
      const data = await apiClient.get<PublicPaymentMethods>("/accounts/payment-methods/");
      return { data, error: null as string | null };
    } catch (error: unknown) {
      return {
        data: { mpesa: true, momo: true, cash: true } as PublicPaymentMethods,
        error: error instanceof Error ? error.message : "Failed to load payment methods",
      };
    }
  },

  /**
   * Initiate M-Pesa STK Push
   */
  async mpesaSTKPush(bookingId: string, phoneNumber: string, bookingReference: string, paymentPhone: string) {
    try {
      const response = await apiClient.post<
        | {
            id: string;
            checkout_request_id: string;
            phone_number: string;
            mpesa_status: string;
            already_paid?: undefined;
          }
        | AlreadyPaidResponse
      >(
        "/payments/mpesa/stk-push/",
        {
          booking_id: bookingId,
          phone_number: phoneNumber,
          booking_reference: bookingReference,
          payment_phone: paymentPhone,
        },
        { headers: idempotencyHeaders() },
      );
      return { data: response, error: null };
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Failed to initiate M-Pesa payment",
      };
    }
  },

  /**
   * Check M-Pesa STK Push status
   */
  async mpesaCheckStatus(checkoutRequestId: string) {
    try {
      const response = await apiClient.get<{
        mpesa_status: string;
        payment_status: string;
        result_desc: string;
        mpesa_receipt_number: string;
      }>(`/payments/mpesa/status/${checkoutRequestId}/`);
      return { data: response, error: null };
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Failed to check M-Pesa status",
      };
    }
  },

  /**
   * Initiate MTN MoMo Request to Pay
   */
  async momoRequestToPay(bookingId: string, phoneNumber: string, bookingReference: string, paymentPhone: string) {
    try {
      const response = await apiClient.post<
        | {
            id: string;
            reference_id: string;
            payer_msisdn: string;
            momo_status: string;
            already_paid?: undefined;
          }
        | AlreadyPaidResponse
      >(
        "/payments/momo/request-to-pay/",
        {
          booking_id: bookingId,
          phone_number: phoneNumber,
          booking_reference: bookingReference,
          payment_phone: paymentPhone,
        },
        { headers: idempotencyHeaders() },
      );
      return { data: response, error: null };
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Failed to initiate MTN MoMo payment",
      };
    }
  },

  /**
   * Check MTN MoMo payment status
   */
  async momoCheckStatus(referenceId: string) {
    try {
      const response = await apiClient.get<{
        momo_status: string;
        payment_status: string;
        reason: string;
      }>(`/payments/momo/status/${referenceId}/`);
      return { data: response, error: null };
    } catch (error: unknown) {
      return {
        data: null,
        error: error instanceof Error ? error.message : "Failed to check MoMo status",
      };
    }
  },

  /**
   * Poll M-Pesa payment until complete or timeout
   */
  async pollMpesaStatus(
    checkoutRequestId: string,
    maxAttempts = 30,
    intervalMs = 2000
  ) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data, error } = await this.mpesaCheckStatus(checkoutRequestId);

      if (error && attempt === maxAttempts - 1) {
        return { data: null, error };
      }

      if (data) {
        const done =
          data.payment_status === "COMPLETED" ||
          data.mpesa_status === "COMPLETED" ||
          data.payment_status === "FAILED" ||
          data.mpesa_status === "FAILED";

        if (done) {
          const status =
            data.payment_status === "COMPLETED" || data.mpesa_status === "COMPLETED"
              ? "COMPLETED"
              : "FAILED";
          return {
            data: {
              status,
              message: data.result_desc || `Payment ${status.toLowerCase()}`,
            } as PaymentStatusResponse,
            error: null,
          };
        }
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    return {
      data: null,
      error: "Payment confirmation timeout. Please check your payment status.",
    };
  },

  /**
   * Poll MoMo payment until complete or timeout
   */
  async pollMomoStatus(
    referenceId: string,
    maxAttempts = 30,
    intervalMs = 2000
  ) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const { data, error } = await this.momoCheckStatus(referenceId);

      if (error && attempt === maxAttempts - 1) {
        return { data: null, error };
      }

      if (data) {
        const done =
          data.payment_status === "COMPLETED" ||
          data.momo_status === "SUCCESSFUL" ||
          data.payment_status === "FAILED" ||
          data.momo_status === "FAILED";

        if (done) {
          const status =
            data.payment_status === "COMPLETED" || data.momo_status === "SUCCESSFUL"
              ? "COMPLETED"
              : "FAILED";
          return {
            data: {
              status,
              message: data.reason || `Payment ${status.toLowerCase()}`,
            } as PaymentStatusResponse,
            error: null,
          };
        }
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    return {
      data: null,
      error: "Payment confirmation timeout. Please check your payment status.",
    };
  },

  /**
   * Poll booking status via public lookup (fallback for MoMo)
   */
  async pollBookingConfirmed(
    bookingReference: string,
    paymentPhone: string,
    maxAttempts = 30,
    intervalMs = 2000
  ) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const booking = await apiClient.get<{ status: string }>(
          "/bookings/lookup/",
          {
            params: {
              booking_reference: bookingReference,
              payment_phone: paymentPhone,
            },
          }
        );

        if (booking.status === "CONFIRMED") {
          return {
            data: {
              status: "COMPLETED" as const,
              message: "Payment confirmed successfully!",
            },
            error: null,
          };
        }
        if (booking.status === "CANCELLED") {
          return {
            data: {
              status: "FAILED" as const,
              message: "Booking was cancelled.",
            },
            error: null,
          };
        }
      } catch {
        // Continue polling
      }

      if (attempt < maxAttempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }

    return {
      data: null,
      error: "Payment confirmation timeout. Please check your payment status.",
    };
  },
};
