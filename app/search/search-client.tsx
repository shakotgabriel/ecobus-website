"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Bus, Clock, Loader2, Search, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/lib/booking-context";
import { useCities } from "@/hooks/use-cities";
import { useAvailableRoutes } from "@/hooks/use-available-routes";
import { useTripsForRoute } from "@/hooks/use-trips-for-route";
import { formatCurrency, getCurrencyForCountry } from "@/lib/booking-data";
import { formatDepartureTime } from "@/lib/departure-time";
import { OPERATOR_TIMEZONE } from "@/lib/config";
import { imageForRoute } from "@/lib/public-images";
import type { TripResponse } from "@/lib/services/trips";

function todayInJuba() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: OPERATOR_TIMEZONE }).format(new Date());
}

const selectClass =
  "h-12 w-full rounded-xl border border-border bg-background px-3 text-sm font-medium text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary";

export function SearchClient() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { cities, cityObjects } = useCities();
  const { routes } = useAvailableRoutes();
  const { setRoute, setDate, setPassengers, setDepartureTime, openBookingModal } = useBooking();

  const from = params.get("from") ?? "";
  const to = params.get("to") ?? "";
  const date = params.get("date") ?? "";
  const passengers = Math.max(1, Math.min(10, Number(params.get("passengers")) || 1));

  const [form, setForm] = useState({ from, to, date: date || todayInJuba(), passengers });

  const { trips, loading, error } = useTripsForRoute({ origin: from, destination: to, departureDate: date });

  const fromOptions = useMemo(
    () => (routes.length > 0 ? [...new Set(routes.map((r) => r.from))] : cities),
    [routes, cities],
  );
  const toOptions = useMemo(() => {
    if (!form.from) return [];
    return routes.length > 0
      ? [...new Set(routes.filter((r) => r.from === form.from).map((r) => r.to))]
      : cities.filter((c) => c !== form.from);
  }, [routes, cities, form.from]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.date) return;
    const qs = new URLSearchParams({
      from: form.from,
      to: form.to,
      date: form.date,
      passengers: String(form.passengers),
    });
    router.push(`${pathname}?${qs.toString()}`);
  };

  const bookTrip = (trip: TripResponse) => {
    const matched = routes.find((r) => r.from === from && r.to === to);
    const originCity = cityObjects.find((c) => c.name === from);
    setRoute({
      ...(matched ?? {
        id: `${from}-${to}`,
        from,
        to,
        duration: trip.duration ?? "N/A",
        distance: "N/A",
        image: imageForRoute(from, to),
        departureTimes: [],
      }),
      regularPrice: trip.regular_price,
      vipPrice: trip.vip_price ?? trip.regular_price,
      currency: trip.currency || (originCity ? getCurrencyForCountry(originCity.country) : "SSP"),
    });
    setDate(new Date(`${date}T00:00:00`));
    setPassengers(passengers);
    setDepartureTime(trip.departure_time);
    openBookingModal(true);
  };

  const searched = Boolean(from && to && date);
  const prettyDate = date
    ? new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" }).format(
        new Date(`${date}T00:00:00Z`),
      )
    : "";

  return (
    <main id="main-content" className="pt-24 pb-16 sm:pt-28">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl">Search buses</h1>
        <p className="mt-2 text-muted-foreground">Compare departures, fares and seats left, then book in minutes.</p>

        <form
          role="search"
          onSubmit={submit}
          className="mt-8 grid gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_120px_auto] lg:items-end"
        >
          <div>
            <label htmlFor="search-from" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              From
            </label>
            <select
              id="search-from"
              className={selectClass}
              value={form.from}
              onChange={(e) => setForm((f) => ({ ...f, from: e.target.value, to: "" }))}
              required
            >
              <option value="">Select city</option>
              {fromOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search-to" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              To
            </label>
            <select
              id="search-to"
              className={selectClass}
              value={form.to}
              onChange={(e) => setForm((f) => ({ ...f, to: e.target.value }))}
              disabled={!form.from}
              required
            >
              <option value="">Select city</option>
              {toOptions.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search-date" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Date
            </label>
            <input
              id="search-date"
              type="date"
              className={selectClass}
              min={todayInJuba()}
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
          <div>
            <label htmlFor="search-passengers" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Passengers
            </label>
            <input
              id="search-passengers"
              type="number"
              inputMode="numeric"
              min={1}
              max={10}
              className={selectClass}
              value={form.passengers}
              onChange={(e) =>
                setForm((f) => ({ ...f, passengers: Math.max(1, Math.min(10, Number(e.target.value) || 1)) }))
              }
            />
          </div>
          <Button type="submit" className="h-12 gap-2 sm:col-span-2 lg:col-span-1">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </form>

        <section aria-live="polite" className="mt-10">
          {!searched ? (
            <p className="text-center text-muted-foreground">Choose a route and date to see departures.</p>
          ) : loading ? (
            <p className="flex items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Finding buses…
            </p>
          ) : error ? (
            <p className="text-center text-destructive">Couldn&apos;t load departures. Please try again.</p>
          ) : trips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center">
              <p className="font-semibold text-foreground">
                No buses from {from} to {to} on {prettyDate}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Try another date, or call us to ask about the schedule.</p>
            </div>
          ) : (
            <>
              <h2 className="mb-4 font-display text-lg font-semibold text-foreground">
                {from} <ArrowRight className="inline h-4 w-4" aria-hidden /> {to} · {prettyDate}
              </h2>
              <ul className="space-y-3">
                {trips.map((trip) => {
                  const soldOut = trip.available_seats < passengers;
                  return (
                    <li
                      key={trip.id}
                      className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <Bus className="h-5 w-5" aria-hidden />
                        </div>
                        <div>
                          <p className="text-xl font-semibold tabular-nums text-foreground">
                            {formatDepartureTime(trip.departure_time)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {trip.bus_type_display || trip.bus_type} · {trip.bus_name}
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                            {trip.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" aria-hidden />
                                {trip.duration}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" aria-hidden />
                              {trip.available_seats} seats left
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">From</p>
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrency(trip.regular_price, trip.currency)}
                          </p>
                        </div>
                        <Button onClick={() => bookTrip(trip)} disabled={soldOut}>
                          {soldOut ? "Not enough seats" : "Select seats"}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
