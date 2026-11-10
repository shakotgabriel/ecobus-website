"use client";
import Image from "next/image";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/lib/booking-context";
import { PUBLIC_IMAGES } from "@/lib/public-images";

export function CTASection() {
  const { openBookingModal } = useBooking();

  return (
    <section className="bg-background py-8 sm:py-24">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl"
        >
          <Image
            src={PUBLIC_IMAGES.fleetC}
            alt="EcoBus coach ready for departure"
            fill
            sizes="100vw"
            className="object-cover object-[center_40%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.22_0.06_255_/_0.92)_0%,oklch(0.22_0.06_255_/_0.72)_55%,oklch(0.22_0.06_255_/_0.38)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_left,oklch(0.5_0.19_25_/_0.32),transparent_55%)]" />

          <div className="relative z-10 px-4 py-8 sm:px-14 sm:py-20">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary sm:text-xs">
              Ready when you are
            </p>
            <h2 className="mt-2 max-w-xl text-balance font-display text-xl font-semibold text-white sm:mt-3 sm:text-3xl md:text-4xl">
              Start your next journey
            </h2>
            <p className="mt-2 max-w-md text-xs leading-relaxed text-white/75 sm:mt-4 sm:text-base">
              Reserve your seat and travel with the comfort EcoBus is known for.
            </p>
            <Button
              onClick={() => openBookingModal()}
              size="lg"
              className="mt-5 h-9 px-4 text-xs font-semibold shadow-lg shadow-primary/20 sm:mt-8 sm:h-12 sm:px-7 sm:text-sm"
            >
              Book your trip
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
