"use client";
import Image from "next/image";

import { motion } from "framer-motion";
import {
  Shield,
  Clock,
  CreditCard,
  Headphones,
  MapPin,
  Star,
} from "lucide-react";
import { PUBLIC_IMAGES } from "@/lib/public-images";

const features = [
  {
    icon: Shield,
    title: "Safe & secure travel",
    description:
      "Professional drivers, maintained fleet, and GPS tracking on every departure.",
  },
  {
    icon: Clock,
    title: "Punctual departures",
    description:
      "Published schedules you can plan around — with clear delay communication.",
  },
  {
    icon: CreditCard,
    title: "Mobile money ready",
    description:
      "Pay instantly with M-Pesa or MTN Mobile Money. No cash required.",
  },
  {
    icon: Headphones,
    title: "Always-on support",
    description:
      "Help before, during, and after your journey from our regional teams.",
  },
  {
    icon: MapPin,
    title: "Regional coverage",
    description:
      "Offices in Juba, Kampala, and Nairobi, with routes to Bor and Nimule.",
  },
  {
    icon: Star,
    title: "Premium comfort",
    description:
      "Reclining seats, climate control, and charging on VIP coaches.",
  },
];

const highlights = [
  {
    src: PUBLIC_IMAGES.bus3,
    title: "Modern coaches",
    text: "Air conditioning, WiFi, TV screens, and CCTV on board.",
  },
  {
    src: PUBLIC_IMAGES.bus1,
    title: "Trusted fleet",
    text: "Red and black coaches maintained for cross-border travel.",
  },
  {
    src: PUBLIC_IMAGES.bus3,
    title: "Daily departures",
    text: "Juba connections to Kampala, Bor, Nimule, and Nairobi.",
  },
];

const stats = [
  { value: "3", label: "Countries" },
  { value: "5", label: "Offices" },
  { value: "4", label: "Core routes" },
  { value: "Daily", label: "Departures" },
];

export function WhyChooseUs() {
  return (
    <section className="bg-background py-10 sm:py-28">
      <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-8 max-w-2xl sm:mb-16"
        >
          <p className="eyebrow">Why EcoBus</p>
          <h2 className="mt-2 text-balance font-display text-xl font-semibold text-foreground sm:mt-3 sm:text-3xl md:text-4xl">
            Juba&apos;s trusted coach partner
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:mt-4 sm:text-base">
            Safe, comfortable, and affordable travel across South Sudan, Uganda,
            and Kenya.
          </p>
        </motion.div>

        <div className="mb-8 grid gap-3 md:grid-cols-3 sm:mb-16 sm:gap-5">
          {highlights.map((item, index) => (
            <motion.article
              key={item.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.45 }}
              className="group overflow-hidden rounded-xl border border-border/70 bg-card sm:rounded-2xl"
            >
              <div className="relative h-36 overflow-hidden sm:h-56">
                <Image
                  src={item.src}
                  alt={item.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5">
                  <h3 className="font-display text-sm font-semibold text-white sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-[11px] text-white/75 sm:mt-1 sm:text-sm">{item.text}</p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mb-10 grid gap-x-6 gap-y-6 sm:mb-20 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-12 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/8 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 font-display text-sm font-semibold text-foreground sm:mb-2 sm:text-lg">
                {feature.title}
              </h3>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-xl bg-secondary px-4 py-6 sm:rounded-2xl sm:px-12 sm:py-12"
        >
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 sm:gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.06 }}
                className={index > 0 ? "lg:border-l lg:border-white/10 lg:pl-8" : ""}
              >
                <p className="font-display text-xl font-semibold tabular-nums text-white sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] text-secondary-foreground/65 sm:mt-1.5 sm:text-sm">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
