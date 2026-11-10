import type { Metadata } from "next";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PolicyPage } from "@/components/policy-page";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description:
    "How to book EcoBus tickets online, pay with M-Pesa or MTN MoMo, find your booking, and what to bring when you travel.",
  alternates: { canonical: "/faq" },
};

const FAQS: { q: string; a: string; link?: { href: string; label: string } }[] = [
  {
    q: "How do I book a ticket?",
    a: "Choose where you are travelling from and to, pick a date and departure, select your seats, enter each passenger's name and pay with mobile money. You will get a booking reference and can download your tickets straight away.",
  },
  {
    q: "How can I pay?",
    a: "Online bookings are paid with M-Pesa or MTN Mobile Money — a payment prompt is sent to your phone. You can also buy tickets with cash at any EcoBus office.",
  },
  {
    q: "The payment prompt didn't arrive, or I'm not sure it went through. What should I do?",
    a: "Don't pay twice. Use \"Check again\" in the payment window, or look up your booking on the Manage Booking page. If money left your account but the booking isn't confirmed, contact us with your booking reference and the mobile money transaction ID.",
    link: { href: "/manage-booking", label: "Go to Manage Booking" },
  },
  {
    q: "How long are my seats held while I pay?",
    a: "Selected seats are held for a few minutes, and a countdown shows the time left. If it runs low you can extend the hold once you're ready to pay.",
  },
  {
    q: "Can I get a refund or change my trip?",
    a: "No. Tickets are non-refundable, and bookings can't be moved to another date, time or seat. You can cancel to release your seats, but no money is returned.",
    link: { href: "/refund-policy", label: "Read the cancellation policy" },
  },
  {
    q: "Where do I find my ticket?",
    a: "Download it from the confirmation screen, or any time from Manage Booking using your booking reference and the phone number you paid with.",
    link: { href: "/manage-booking", label: "Find my booking" },
  },
  {
    q: "What do I need to board?",
    a: "Your ticket (printed, on your phone, or your booking reference) and an ID that matches the passenger name. For cross-border trips bring a valid passport and any visa or permit you need.",
  },
  {
    q: "Can I send a parcel?",
    a: "Yes. Parcels are accepted at EcoBus offices and travel on our scheduled buses. Visit an office or call us for rates.",
    link: { href: "/contact", label: "Contact an office" },
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

export default function FaqPage() {
  return (
    <PolicyPage
      eyebrow="Help"
      title="Frequently asked questions"
      intro="Quick answers about booking, paying and travelling with EcoBus."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <Accordion type="single" collapsible className="w-full">
        {FAQS.map(({ q, a, link }, index) => (
          <AccordionItem key={q} value={`faq-${index}`}>
            <AccordionTrigger className="text-left text-base font-semibold">{q}</AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              <p>{a}</p>
              {link && (
                <p className="mt-2">
                  <Link href={link.href} className="font-medium text-primary hover:underline">
                    {link.label} →
                  </Link>
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </PolicyPage>
  );
}
