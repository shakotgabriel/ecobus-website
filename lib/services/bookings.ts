/**
 * Bookings API Service
 * Handles all booking-related API calls
 */

import { apiClient } from "@/lib/api-client";
import { toLookupPhone } from "@/lib/phone-utils";

export interface TicketPayload {
  seat: number;
  first_name: string;
  last_name: string;
  phone_number: string;
  id_number: string;
  nationality?: string;
  seat_class: "VIP" | "REGULAR";
}

export interface BookingPayload {
  trip: number;
  payer_name: string;
  payment_phone: string;
  email?: string;
  payment_method: "MPESA" | "MTN_MOMO" | "MOBILE_MONEY" | "CASH";
  session_key?: string;
  tickets: TicketPayload[];
}

export interface BookingResponse {
  id: string;
  booking_reference: string;
  trip: number;
  trip_display?: string;
  user?: string;
  payer_name: string;
  payment_phone: string;
  email: string;
  number_of_seats: number;
  total_price: number;
  status: string;
  created_at: string;
  expires_at?: string;
}

export interface BookingTicket {
  id: number;
  ticket_number: string;
  download_token?: string;
  booking: string;
  booking_reference: string;
  seat: number;
  seat_number?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone_number: string;
  id_number: string;
  nationality?: string;
  seat_class: "VIP" | "REGULAR";
  price: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface BookingTripDetails {
  trip_id?: number;
  route_id?: number;
  departure_time: string;
  origin: string;
  destination: string;
  currency: string;
}

export interface BookingDetailsResponse extends BookingResponse {
  tickets: BookingTicket[];
  trip_details?: BookingTripDetails;
}

export const bookingsService = {
  /**
   * Create a new booking
   */
  async createBooking(bookingData: BookingPayload) {
    try {
      const booking = await apiClient.post<BookingResponse>(
        "/bookings/",
        bookingData
      );
      return { data: booking, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to create booking",
      };
    }
  },

  /**
   * Get booking by reference number (use backend lookup endpoint which requires phone)
   */
  async getBookingByReference(reference: string, paymentPhone: string) {
    try {
      const booking = await apiClient.get<BookingDetailsResponse>("/bookings/lookup/", {
        params: {
          booking_reference: reference.trim().toUpperCase(),
          payment_phone: toLookupPhone(paymentPhone),
        },
      });
      return { data: booking || null, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to fetch booking",
      };
    }
  },

  /**
   * Cancel a booking via POST /bookings/{id}/cancel/
   */
  async cancelBooking(bookingId: string, credentials: { bookingReference: string; paymentPhone: string }, reason?: string) {
    try {
      const response = await apiClient.post<{
        detail: string;
        booking_reference: string;
        refund_percentage: number;
        refund_amount: string;
      }>(`/bookings/${bookingId}/cancel/`, {
        reason: reason || "",
        booking_reference: credentials.bookingReference.trim().toUpperCase(),
        payment_phone: toLookupPhone(credentials.paymentPhone),
      });
      return { data: response, error: null };
    } catch (error: any) {
      return {
        data: null,
        error: error.message || "Failed to cancel booking",
      };
    }
  },
};
