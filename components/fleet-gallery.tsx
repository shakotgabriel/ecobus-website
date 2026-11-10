"use client";
import Image from "next/image";

import { motion } from "framer-motion";
import { FLEET_GALLERY } from "@/lib/public-images";

export function FleetGallery() {
  return (
    <section className="overflow-hidden bg-[linear-gradient(180deg,oklch(0.985_0.006_25)_0%,oklch(0.96_0.02_255)_100%)] py-10 sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-6 max-w-2xl sm:mb-12"
        >
          <p className="eyebrow">Our fleet</p>
          <h2 className="mt-2 text-balance font-display text-xl font-semibold text-foreground sm:mt-3 sm:text-3xl md:text-4xl">
            Coaches built for the journey
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
            Red, black, and silver coaches prepared for routes out of Juba
            across South Sudan and East Africa.
          </p>
        </motion.div>

        <div className="grid auto-rows-[160px] gap-2.5 sm:auto-rows-[240px] sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:auto-rows-[260px]">
          {FLEET_GALLERY.map((shot, index) => {
            const span =
              index === 0
                ? "sm:col-span-2 lg:col-span-2 lg:row-span-2"
                : index === 1
                  ? "lg:col-span-2"
                  : "";
            return (
              <motion.figure
                key={shot.caption}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07, duration: 0.5 }}
                className={`group relative overflow-hidden rounded-xl sm:rounded-2xl ${span}`}
              >
                <Image
                  src={shot.src}
                  alt={shot.alt}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  style={{ objectPosition: shot.position }}
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                  <p className="font-display text-sm font-semibold text-white sm:text-lg">
                    {shot.caption}
                  </p>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
