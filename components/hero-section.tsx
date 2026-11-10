"use client";
import Image from "next/image";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QuickBookingCard } from "./quick-booking-card";
import { useBooking } from "@/lib/booking-context";
import { PUBLIC_IMAGES } from "@/lib/public-images";

export function HeroSection() {
  const { openBookingModal } = useBooking();

  return (
    <section className="relative flex min-h-0 items-center overflow-hidden pt-14 sm:min-h-[100svh] sm:pt-16">
      <div className="absolute inset-0 z-0">
        <Image
          src={PUBLIC_IMAGES.hero}
          alt="EcoBus coach on the road"
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover object-[60%_center]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(105deg,oklch(0.22_0.06_255_/_0.9)_0%,oklch(0.22_0.06_255_/_0.5)_52%,oklch(0.22_0.06_255_/_0.22)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,oklch(0.5_0.19_25_/_0.38),transparent_50%)]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="font-display text-[1.85rem] font-semibold tracking-tight text-white sm:text-6xl md:text-7xl">
              EcoBus
            </p>
            <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-[oklch(0.82_0.12_25)] sm:mt-3 sm:text-sm">
              Your Comfort Zone
            </p>

            <h1 className="mt-4 max-w-xl text-base font-medium leading-snug text-white/95 sm:mt-8 sm:text-3xl sm:leading-[1.25] md:text-[2.15rem]">
              Travel in comfort and safety from Juba
            </h1>

            <p className="mt-3 max-w-md text-xs leading-relaxed text-white/75 sm:mt-5 sm:text-base">
              Safe, reliable, and affordable coaches to Kampala, Bor, Nimule,
              and Nairobi.
            </p>

            <div className="mt-5 flex flex-wrap gap-2 sm:mt-9 sm:gap-3">
              <Button
                onClick={() => openBookingModal()}
                size="lg"
                className="h-9 px-4 text-xs font-semibold shadow-lg shadow-primary/25 sm:h-12 sm:px-7 sm:text-sm"
              >
                Book your ticket
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-9 border-white/25 bg-white/5 px-3 text-xs text-white hover:bg-white/10 hover:text-white sm:h-12 sm:px-6 sm:text-sm"
              >
                <Link href="/destinations">
                  View destinations
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center lg:justify-end"
          >
            <QuickBookingCard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
