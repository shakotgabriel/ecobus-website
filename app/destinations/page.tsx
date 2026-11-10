"use client";
import Image from "next/image";

import { motion } from "framer-motion";
import { DestinationsSection } from "@/components/destinations-section";
import { PUBLIC_IMAGES } from "@/lib/public-images";

export default function DestinationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" className="pt-16">
        <section className="relative flex min-h-[32vh] items-end overflow-hidden sm:min-h-[48vh]">
          <Image
            src={PUBLIC_IMAGES.bus3}
            alt="EcoBus destinations from Juba"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_40%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.22_0.06_255_/_0.3)_0%,oklch(0.22_0.06_255_/_0.86)_100%)]" />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 pt-20 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Explore our network
              </p>
              <h1 className="mt-2 max-w-2xl font-display text-2xl font-semibold text-white text-balance sm:mt-3 sm:text-3xl md:text-5xl">
                All destinations
              </h1>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/75 sm:mt-4 sm:text-base">
                Routes from Juba to Kampala, Bor, Nimule, and Nairobi.
              </p>
            </motion.div>
          </div>
        </section>

        <DestinationsSection showAll />
      </main>
    </div>
  );
}
