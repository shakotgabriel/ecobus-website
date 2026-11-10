import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Facebook } from "lucide-react";
import { PUBLIC_IMAGES } from "@/lib/public-images";
import {
  COMPANY_EMAIL,
  COMPANY_OFFICES,
  COMPANY_PHONES,
  COMPANY_TAGLINE,
  telHref,
} from "@/lib/company";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/destinations", label: "Destinations" },
  { href: "/manage-booking", label: "Manage Booking" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M14.5 3c.4 2.4 1.8 4.1 4 4.6v2.5c-1.4 0-2.7-.4-4-1.2v6.6c0 3.2-2.5 5.5-5.6 5.5S3.2 18.7 3.2 15.5 5.7 10 8.8 10c.4 0 .8 0 1.2.1v2.7c-.4-.2-.8-.3-1.2-.3-1.7 0-3 1.4-3 3.1s1.3 3.1 3 3.1 3.1-1.4 3.1-3.1V3h2.6Z" />
    </svg>
  );
}

const socialLinks = [
  {
    icon: Facebook,
    href: "https://www.facebook.com/share/14SpM9VRLLr/?mibextid=wwXIfr",
    label: "Facebook",
  },
  {
    icon: TikTokIcon,
    href: "https://www.tiktok.com/@eco.bus.co.ltd",
    label: "TikTok",
  },
];

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="mx-auto max-w-[90rem] px-4 py-10 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div className="space-y-5">
            <Link href="/" className="inline-flex">
              <Image
                src={PUBLIC_IMAGES.logo}
                alt="EcoBus — Your Comfort Zone"
                width={478}
                height={182}
                className="h-12 w-auto rounded-md bg-white px-2 py-1 sm:h-16"
              />
            </Link>

            <p className="text-secondary-foreground/65 text-sm leading-relaxed max-w-xs">
              {COMPANY_TAGLINE}
            </p>
            <p className="text-sm font-medium text-[oklch(0.82_0.12_25)]">
              Travel in comfort and safety
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-white mb-5">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-secondary-foreground/65 hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-white mb-5">
              Our Offices
            </h3>
            <ul className="space-y-2.5">
              {COMPANY_OFFICES.map((office) => (
                <li
                  key={office.name}
                  className="text-sm text-secondary-foreground/65"
                >
                  {office.name} – {office.detail}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold tracking-wide text-white mb-5">
              Contact Us
            </h3>
            <ul className="space-y-4">
              {COMPANY_PHONES.map((office) => (
                <li key={office.city} className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">{office.city}</p>
                    {office.numbers.map((number) => (
                      <a
                        key={number}
                        href={telHref(number)}
                        className="block text-sm text-secondary-foreground/65 hover:text-primary transition-colors"
                      >
                        {number}
                      </a>
                    ))}
                  </div>
                </li>
              ))}
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <a
                  href={`mailto:${COMPANY_EMAIL}`}
                  className="text-sm text-secondary-foreground/65 hover:text-primary transition-colors"
                >
                  {COMPANY_EMAIL}
                </a>
              </li>
            </ul>
            <div className="flex items-center gap-2.5 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white/8 text-white/80 hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 sm:mt-14 sm:pt-8 md:flex-row md:gap-4">
          <p className="text-secondary-foreground/45 text-sm">
            © {new Date().getFullYear()} EcoBus. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-secondary-foreground/45">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <Link href="/refund-policy" className="hover:text-primary transition-colors">
              Cancellations
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
