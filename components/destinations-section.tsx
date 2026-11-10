"use client";
import Image from "next/image";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBooking } from "@/lib/booking-context";
import { routes as fallbackRoutes, formatCurrency } from "@/lib/booking-data";
import { useAvailableRoutes } from "@/hooks/use-available-routes";
import { config } from "@/lib/config";
import { busTypeLabel } from "@/lib/bus-types";
import { imageForRoute } from "@/lib/public-images";

export function DestinationsSection({
  showAll = false,
}: {
  showAll?: boolean;
}) {
  const { setRoute, openBookingModal, setCurrentStep } = useBooking();
  const { routes: apiRoutes, loading, error } = useAvailableRoutes();
  
  // Prefer live API routes; only fall back when explicitly enabled.
  const routes =
    apiRoutes.length > 0
      ? apiRoutes
      : config.useLocalData
        ? fallbackRoutes
        : [];
  const displayRoutes = showAll
    ? routes
    : routes.filter((r) => !r.isUpcoming).slice(0, 4);

  const handleBookRoute = (route: (typeof routes)[0]) => {
    setRoute(route);
    // Start at step 0 to let user select date and passengers
    setCurrentStep(0);
    openBookingModal();
  };

  return (
    <section className="py-20 sm:py-28 bg-[linear-gradient(180deg,oklch(0.96_0.02_255)_0%,oklch(0.985_0.006_25)_100%)]">
      <div className="mx-auto max-w-[90rem] px-5 sm:px-6 lg:px-10">
        {!showAll && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mb-14"
          >
            <p className="eyebrow">Routes</p>
            <h2 className="mt-3 font-display text-3xl md:text-4xl font-semibold text-foreground text-balance">
              Popular destinations
            </h2>
            <p className="mt-4 text-base text-muted-foreground leading-relaxed">
              Daily EcoBus departures from Juba to Kampala, Bor, Nimule, and
              Nairobi.
            </p>
          </motion.div>
        )}

        {/* Routes Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading && routes.length === 0
            ? // Loading skeletons
              Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-card rounded-2xl overflow-hidden border border-border"
                >
                  <Skeleton className="h-48 w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="space-y-2">
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))
            : !loading && displayRoutes.length === 0
              ? (
                <div className="col-span-full rounded-2xl border border-dashed p-10 text-center">
                  <p className="text-muted-foreground">
                    {error
                      ? "Could not load live routes. Check that the API is running."
                      : "No scheduled routes are available right now. Check back soon."}
                  </p>
                </div>
              )
            : displayRoutes.map((route, index) => {
              const coachTypes = (route.busTypes && route.busTypes.length > 0
                ? route.busTypes
                : route.allowedBusTypes) || [];
              return (
            <motion.div
              key={route.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group bg-card rounded-2xl overflow-hidden border border-border/70 hover:border-border hover:shadow-[0_12px_32px_oklch(0.2_0.03_250_/_0.08)] transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={route.image || imageForRoute(route.from, route.to)}
                  alt={`${route.from} to ${route.to}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

                {/* Route Badge */}
                <div className="absolute top-3 right-3 flex max-w-[70%] flex-wrap justify-end gap-1">
                  {route.isUpcoming ? (
                    <Badge className="bg-warning text-warning-foreground font-semibold">
                      Coming Soon
                    </Badge>
                  ) : coachTypes.length > 0 ? (
                    coachTypes.map((type) => (
                      <Badge
                        key={type}
                        className="bg-white/90 text-foreground"
                      >
                        {busTypeLabel(type)}
                      </Badge>
                    ))
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-white/90 text-foreground"
                    >
                      Live route
                    </Badge>
                  )}
                </div>

                {/* Route Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-xs text-white/70 uppercase tracking-wider mb-1">
                    Route
                  </p>
                  <h3 className="font-display text-lg font-semibold text-white flex items-center gap-2 flex-wrap">
                    <span>{route.from}</span>
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span>{route.to}</span>
                  </h3>
                  {route.via && (
                    <p className="text-xs text-white/70 mt-1">
                      via {route.via}
                    </p>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {/* Duration & Distance */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{route.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{route.distance}</span>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">
                        VIP seat
                      </span>
                    </div>
                    <span className="font-semibold tabular-nums text-primary">
                      {formatCurrency(route.vipPrice, route.currency)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground ml-6">
                      Standard seat
                    </span>
                    <span className="font-medium tabular-nums text-foreground">
                      {formatCurrency(route.regularPrice, route.currency)}
                    </span>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  onClick={() => handleBookRoute(route)}
                  disabled={route.isUpcoming}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                >
                  {route.isUpcoming ? "Coming Soon" : "Book This Route"}
                </Button>
              </div>
            </motion.div>
              );
              })
          }
        </div>

        {/* View All Link */}
        {!showAll && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button variant="outline" size="lg" className="gap-2 h-11 px-6" asChild>
              <Link href="/destinations">
                View all destinations
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
