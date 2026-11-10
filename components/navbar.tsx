"use client";
import Image from "next/image";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/lib/booking-context";
import { PUBLIC_IMAGES } from "@/lib/public-images";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Find a Bus" },
  { href: "/destinations", label: "Destinations" },
  { href: "/manage-booking", label: "Manage Booking" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { openBookingModal } = useBooking();
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-[background,box-shadow,border-color] duration-300",
        scrolled || mobileMenuOpen
          ? "bg-background/90 backdrop-blur-xl border-b border-border/80 shadow-[0_1px_0_oklch(0.2_0.03_250_/_0.04)]"
          : "bg-background/80 backdrop-blur-md border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-12 max-w-[90rem] items-center justify-between px-3 sm:h-[4.25rem] sm:px-6 lg:px-10">
        <Link href="/" className="flex items-center group">
          <Image
            src={PUBLIC_IMAGES.logo}
            alt="EcoBus — Your Comfort Zone"
            width={478}
            height={182}
            priority
            className="h-9 w-auto transition-transform duration-300 group-hover:scale-[1.03] sm:h-14"
          />
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-3 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
                <span
                  className={cn(
                    "absolute bottom-1 left-3 right-3 h-px bg-primary transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  )}
                />
              </Link>
            );
          })}
          <Button
            onClick={() => openBookingModal()}
            className="ml-3 h-10 px-5 text-sm font-semibold"
          >
            Book Now
          </Button>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted transition-colors"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </button>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-background overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1 sm:px-5 sm:py-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openBookingModal();
                }}
                className="w-full mt-3 h-11 font-semibold"
              >
                Book Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
