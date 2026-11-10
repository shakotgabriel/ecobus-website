"use client";
import Image from "next/image";

import { motion } from "framer-motion";
import { Target, Eye, Award, Shield, Heart, Clock, MapPin } from "lucide-react";
import { COMPANY_OFFICES } from "@/lib/company";
import { PUBLIC_IMAGES } from "@/lib/public-images";

const values = [
  {
    icon: Shield,
    title: "Safety First",
    description:
      "Every journey begins and ends with safety. Our fleet undergoes rigorous maintenance checks.",
  },
  {
    icon: Heart,
    title: "Customer Care",
    description:
      "We treat every passenger like family. Your comfort and satisfaction is our priority.",
  },
  {
    icon: Clock,
    title: "Reliability",
    description:
      "We keep our promises. When we say departure at 6 AM, we mean 6 AM sharp.",
  },
  {
    icon: Award,
    title: "Excellence",
    description:
      "We continuously improve our services to deliver the best travel experience.",
  },
];

const OFFICE_CITY: Record<string, string> = {
  Atlabara: "Juba",
  Sherikat: "Juba",
  Bor: "Bor",
  Nimule: "Nimule",
  Kampala: "Kampala",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <main id="main-content" className="pt-16">
        <section className="relative flex min-h-[32vh] items-end overflow-hidden sm:min-h-[52vh]">
          <Image
            src={PUBLIC_IMAGES.bus1}
            alt="EcoBus coach"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.22_0.06_255_/_0.35)_0%,oklch(0.22_0.06_255_/_0.84)_100%)]" />
          <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-8 pt-20 sm:px-6 sm:pb-16 sm:pt-28 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Our story
              </p>
              <h1 className="mt-2 max-w-2xl font-display text-2xl font-semibold text-white text-balance sm:mt-3 sm:text-3xl md:text-5xl">
                About EcoBus
              </h1>
              <p className="mt-2 max-w-xl text-xs leading-relaxed text-white/75 sm:mt-4 sm:text-base">
                Your Comfort Zone — safe, reliable, and affordable bus travel
                from Juba across South Sudan and East Africa.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-10 sm:py-28">
          <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-10">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <p className="eyebrow">Your Comfort Zone</p>
                <h2 className="mt-2 font-display text-xl font-semibold text-foreground sm:mt-3 sm:text-3xl md:text-4xl">
                  Juba&apos;s trusted transport partner
                </h2>
                <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    EcoBus is Juba&apos;s trusted bus operator, connecting South
                    Sudan to Uganda, Kenya, and towns across the country. We are
                    committed to safe, comfortable, and affordable travel for
                    everyone.
                  </p>
                  <p>
                    Our coaches carry air conditioning, TV screens, free WiFi,
                    and CCTV. Trained drivers and well-maintained buses run the
                    Juba corridors to Kampala, Bor, Nimule, and Nairobi.
                  </p>
                  <p>
                    The EcoBus promise is simple: travel smart, travel in
                    comfort, and arrive with peace of mind.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-3"
              >
                <div className="relative col-span-2 overflow-hidden rounded-2xl">
                  <Image
                    src={PUBLIC_IMAGES.bus3}
                    alt="EcoBus coach on the road"
                    width={520}
                    height={175}
                    sizes="(min-width: 1024px) 40vw, 100vw"
                    className="h-64 w-full object-cover sm:h-72"
                  />
                </div>
                <div className="relative overflow-hidden rounded-2xl">
                  <Image
                    src={PUBLIC_IMAGES.bus1}
                    alt="EcoBus coach exterior"
                    width={540}
                    height={250}
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="h-40 w-full object-cover sm:h-44"
                  />
                </div>
                <div className="relative overflow-hidden rounded-2xl">
                  <Image
                    src={PUBLIC_IMAGES.fleetA}
                    alt="EcoBus departure"
                    width={1024}
                    height={640}
                    sizes="(min-width: 1024px) 20vw, 50vw"
                    className="h-40 w-full object-cover sm:h-44"
                  />
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-primary/90 to-transparent p-4">
                    <div>
                      <p className="font-display text-3xl font-semibold text-white">
                        Juba
                      </p>
                      <p className="text-xs text-white/85">Home terminal</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="bg-[linear-gradient(180deg,oklch(0.97_0.015_255)_0%,oklch(0.985_0.006_25)_100%)] py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-8"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Target className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  Our Mission
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  To provide safe, comfortable, and affordable bus travel from
                  Juba across South Sudan and East Africa, with modern coaches
                  and a team that treats every passenger with care.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.08 }}
                className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-8"
              >
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/80 text-secondary-foreground">
                  <Eye className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  Our Vision
                </h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">
                  To be the coach people in South Sudan choose first — known
                  for comfort, safety, reliability, and fair fares.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 max-w-2xl"
            >
              <p className="eyebrow">What drives us</p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-foreground md:text-4xl">
                Our core values
              </h2>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <value.icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-20 sm:py-28">
          <Image
            src={PUBLIC_IMAGES.bus1}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-secondary/92" />
          <div className="relative z-10 mx-auto max-w-[90rem] px-5 sm:px-6 lg:px-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-12 max-w-2xl"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Where to find us
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold text-white md:text-4xl">
                Our offices
              </h2>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {COMPANY_OFFICES.map((office, index) => (
                <motion.div
                  key={office.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
                >
                  <MapPin className="h-5 w-5 text-primary" aria-hidden />
                  <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-primary">
                    {OFFICE_CITY[office.name] ?? office.name}
                  </p>
                  <h3 className="mt-1 font-display font-semibold text-white">{office.name}</h3>
                  <p className="mt-1 text-sm text-white/65">{office.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
