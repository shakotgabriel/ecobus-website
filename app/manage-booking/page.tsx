import type { Metadata } from "next";
import { ManageBookingClient } from "./manage-booking-client";

export const metadata: Metadata = {
  title: "Manage Booking",
  description:
    "Look up your EcoBus booking with your reference and phone number to view trip details, download tickets, or cancel.",
  alternates: { canonical: "/manage-booking" },
};

export default function ManageBookingPage() {
  return <ManageBookingClient />;
}
