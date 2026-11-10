import type { Metadata } from "next";
import Link from "next/link";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: "EcoBus tickets are non-refundable. How cancellations and failed payments are handled.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <PolicyPage
      eyebrow="Policies"
      title="Cancellation policy"
      intro="Please read this before you pay. EcoBus tickets are non-refundable."
    >
      <section>
        <h2>No refunds</h2>
        <p>
          Once a booking is paid, the fare is not refunded — whether you cancel, miss the bus, or do not travel.
        </p>
      </section>

      <section>
        <h2>Cancelling a booking</h2>
        <p>
          You can cancel a booking on the{" "}
          <Link href="/manage-booking" className="text-primary hover:underline">
            Manage Booking
          </Link>{" "}
          page using your booking reference and the phone number you paid with. Cancelling releases your seats for
          other travellers. No money is returned.
        </p>
      </section>

      <section>
        <h2>No changes to date, time or seat</h2>
        <p>
          Bookings cannot be moved to another trip, and seats cannot be changed after payment. If your plans change,
          you will need to make a new booking.
        </p>
      </section>

      <section>
        <h2>Payment problems</h2>
        <ul>
          <li>
            If money left your M-Pesa or MTN MoMo account but you did not receive a booking confirmation, do not pay
            again. Look up your booking on the Manage Booking page first, then contact us with your booking reference
            and the mobile money transaction ID.
          </li>
          <li>
            Unpaid bookings expire automatically after a few minutes and their seats are released.
          </li>
        </ul>
      </section>

      <section>
        <h2>Trips changed by EcoBus</h2>
        <p>
          If EcoBus cancels or significantly changes a trip, our team will contact you on the phone number used for
          the booking.
        </p>
      </section>
    </PolicyPage>
  );
}
