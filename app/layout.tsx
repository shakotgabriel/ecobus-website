import type { Metadata, Viewport } from "next";
import { Figtree, Outfit, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { BookingProvider } from "@/lib/booking-context";
import { Footer } from "@/components/footer";
import { LazyBookingModal } from "@/components/booking-modal-lazy";
import { MotionProvider } from "@/components/motion-provider";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { COMPANY_EMAIL, COMPANY_OFFICES, COMPANY_PHONES, SITE_URL } from "@/lib/company";

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-figtree",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const SITE_DESCRIPTION =
  "Safe, reliable, and affordable bus travel from Juba to Kampala, Bor, Nimule, and Nairobi. Book with EcoBus, Your Comfort Zone.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "EcoBus | Your Comfort Zone — Bus Travel from Juba",
    template: "%s | EcoBus",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "EcoBus",
    "Eco Bus South Sudan",
    "Juba to Kampala",
    "Juba to Bor",
    "Juba to Nimule",
    "Juba to Nairobi",
    "bus booking South Sudan",
  ],
  authors: [{ name: "EcoBus" }],
  alternates: { canonical: "/" },
  icons: {
    icon: "/logo-mark.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    siteName: "EcoBus",
    title: "EcoBus | Your Comfort Zone",
    description:
      "Travel in comfort and safety with EcoBus from Juba across South Sudan and East Africa.",
    type: "website",
    locale: "en_SS",
    url: "/",
    images: [{ url: "/hero-ecobus.jpg", width: 1533, height: 1026, alt: "EcoBus coach on the road" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EcoBus | Your Comfort Zone",
    description: SITE_DESCRIPTION,
    images: ["/hero-ecobus.jpg"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "EcoBus",
  url: SITE_URL,
  logo: `${SITE_URL}/logo-ecobus.png`,
  image: `${SITE_URL}/hero-ecobus.jpg`,
  description: SITE_DESCRIPTION,
  email: COMPANY_EMAIL,
  telephone: COMPANY_PHONES[0].numbers[0],
  address: {
    "@type": "PostalAddress",
    streetAddress: `${COMPANY_OFFICES[0].name}, ${COMPANY_OFFICES[0].detail}`,
    addressLocality: "Juba",
    addressCountry: "SS",
  },
  areaServed: ["South Sudan", "Uganda", "Kenya"],
  sameAs: [
    "https://www.facebook.com/share/14SpM9VRLLr/",
    "https://www.tiktok.com/@eco.bus.co.ltd",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#bb1a28",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${figtree.variable} ${outfit.variable} ${geistMono.variable} bg-background`}
    >
      <body className="font-sans antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd).replace(/</g, "\\u003c") }}
        />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <MotionProvider>
          <BookingProvider>
            <Navbar />
            {children}
            <Footer />
            <LazyBookingModal />
            <WhatsAppButton />
          </BookingProvider>
        </MotionProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
