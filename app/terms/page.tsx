import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for booking and travelling with EcoBus.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Policies"
      title="Terms of service"
      intro="These terms apply when you book a ticket on this website, at an EcoBus office, or through an EcoBus agent."
    >
      <section>
        <h2>Your booking</h2>
        <ul>
          <li>A booking is confirmed only after payment succeeds and you receive a booking reference.</li>
          <li>Seats you select are held for a few minutes while you pay. If payment is not completed, they are released.</li>
          <li>Check the route, date, departure time and passenger names before paying.</li>
        </ul>
      </section>

      <section>
        <h2>Passenger names and ID</h2>
        <p>
          Each ticket is issued in a passenger&apos;s name. Bring an identity document that matches the name on the
          ticket. For cross-border trips you are responsible for carrying a valid passport and any visas or permits
          required.
        </p>
      </section>

      <section>
        <h2>Boarding</h2>
        <ul>
          <li>Show your ticket (printed, PDF or booking reference) at boarding.</li>
          <li>Arrive early. The bus departs at the scheduled time and will not wait for late passengers.</li>
          <li>A ticket is valid only for the trip, seat and passenger shown on it.</li>
        </ul>
      </section>

      <section>
        <h2>Cancellations and refunds</h2>
        <p>
          Tickets are non-refundable and cannot be moved to another trip. See our{" "}
          <Link href="/refund-policy" className="text-primary hover:underline">
            cancellation policy
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>Schedules</h2>
        <p>
          Departure times are planned but may change because of road, weather, border or security conditions. We will
          contact you on your booking phone number about significant changes.
        </p>
      </section>

      <section>
        <h2>Conduct</h2>
        <p>
          Crew may refuse travel to passengers who endanger safety or disturb other travellers. Illegal or dangerous
          items are not allowed on board or in luggage.
        </p>
      </section>
    </PolicyPage>
  );
}
