import type { Metadata } from "next";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What personal information EcoBus collects when you book, and how it is used.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Policies"
      title="Privacy policy"
      intro="We collect only what we need to sell you a ticket, get you on the right bus, and answer your questions."
    >
      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Passenger names and, if you provide them, ID or passport numbers.</li>
          <li>The mobile number used for payment and booking updates.</li>
          <li>Trip, seat and payment details for each booking.</li>
          <li>Your name, email, phone and message when you use the contact form.</li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To issue tickets and prepare passenger manifests for each departure.</li>
          <li>To process payments through M-Pesa and MTN Mobile Money.</li>
          <li>To contact you about your booking or trip changes.</li>
          <li>To meet legal, safety and border-crossing requirements.</li>
        </ul>
      </section>

      <section>
        <h2>Who we share it with</h2>
        <p>
          Payment details are shared with the mobile money provider you choose so they can process your payment.
          Passenger lists may be shown to authorities when required by law, for example at border crossings. We do
          not sell your information.
        </p>
      </section>

      <section>
        <h2>Looking up your booking</h2>
        <p>
          Booking details can only be viewed online with both the booking reference and the phone number used to pay.
          Keep these private.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can ask us to correct your details, or ask what information we hold about you, using the contact details
          below.
        </p>
      </section>
    </PolicyPage>
  );
}
