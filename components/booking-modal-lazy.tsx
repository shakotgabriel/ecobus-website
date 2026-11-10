"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useBooking } from "@/lib/booking-context";

const BookingModal = dynamic(
  () => import("@/components/booking-modal").then((m) => m.BookingModal),
  { ssr: false },
);

/** Loads the booking wizard bundle the first time a visitor opens it. */
export function LazyBookingModal() {
  const { isBookingModalOpen } = useBooking();
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    if (isBookingModalOpen) setRequested(true);
  }, [isBookingModalOpen]);

  return requested ? <BookingModal /> : null;
}
