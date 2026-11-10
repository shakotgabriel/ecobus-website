"use client";

import { useState, useCallback } from "react";
import { format, startOfToday } from "date-fns";
import { CalendarIcon, MapPin, Users, Search } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBooking } from "@/lib/booking-context";
import { useCities } from "@/hooks/use-cities";
import { useAvailableRoutes } from "@/hooks/use-available-routes";
import { getCurrencyForCountry } from "@/lib/booking-data";
import { imageForRoute } from "@/lib/public-images";
import { cn } from "@/lib/utils";

export function QuickBookingCard() {
  const { setRoute, setDate, setPassengers, openBookingModal, setCurrentStep } =
    useBooking();
  const { cities, cityObjects } = useCities();
  const { routes } = useAvailableRoutes();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setLocalDate] = useState<Date | undefined>(undefined);
  const [passengers, setLocalPassengers] = useState(1);

  // Reset 'to' destination when 'from' changes
  const handleFromChange = useCallback((value: string) => {
    setFrom(value);
    setTo(""); // Reset 'to' when 'from' changes
  }, []);

  const handleSearch = useCallback(() => {
    if (!from || !to) return;

    const matchedRoute = routes.find(
      (r) => r.from === from && r.to === to && !r.isUpcoming,
    );

    if (matchedRoute) {
      setRoute(matchedRoute);
    } else {
      const originCity = cityObjects.find((c) => c.name === from);
      const currency = originCity ? getCurrencyForCountry(originCity.country) : "SSP";
      setRoute({
        id: `${from}-${to}`,
        from,
        to,
        duration: "N/A",
        distance: "N/A",
        regularPrice: 0,
        vipPrice: 0,
        currency,
        image: imageForRoute(from, to),
        departureTimes: [],
      });
    }

    if (date) setDate(date);
    setPassengers(passengers);
    // Skip step 0 since we already have route/date/passengers from this card
    openBookingModal(true);
  }, [
    from,
    to,
    date,
    passengers,
    routes,
    cityObjects,
    setRoute,
    setDate,
    setPassengers,
    openBookingModal,
  ]);

  const fromCities =
    routes.length > 0 ? [...new Set(routes.map((route) => route.from))] : cities;
  const availableToDestinations = from
    ? (routes.length > 0
        ? [...new Set(routes.filter((route) => route.from === from).map((route) => route.to))]
        : cities.filter((d) => d !== from))
    : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="surface-elevated w-full max-w-md rounded-xl border border-border/60 bg-card/95 p-3.5 backdrop-blur-sm sm:rounded-2xl sm:p-8"
    >
      <p className="eyebrow mb-1 sm:mb-2">Plan your trip</p>
      <h2 className="mb-3 font-display text-lg font-semibold tracking-tight text-foreground sm:mb-6 sm:text-2xl">
        Quick booking
      </h2>

      <div className="space-y-3 sm:space-y-4">
        {/* From */}
        <div className="space-y-2">
          <label htmlFor="quick-from" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            From
          </label>
          <Select value={from} onValueChange={handleFromChange}>
            <SelectTrigger id="quick-from" className="flex h-9 w-full items-center gap-2 border border-border/70 bg-muted/50 sm:h-12 sm:gap-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                <SelectValue placeholder="Select departure city" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {fromCities.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* To */}
        <div className="space-y-2">
          <label htmlFor="quick-to" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            To
          </label>
          {from ? (
            <Select value={to} onValueChange={setTo} key={`to-${from}`}>
              <SelectTrigger id="quick-to" className="flex h-9 w-full items-center gap-2 border border-border/70 bg-muted/50 sm:h-12 sm:gap-3">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <SelectValue placeholder="Select destination city" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {availableToDestinations.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex h-9 items-center gap-2 rounded-lg bg-muted/50 px-3 text-xs opacity-50 sm:h-12 sm:gap-3 sm:text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">
                Select departure city first
              </span>
            </div>
          )}
        </div>

        {/* Date & Passengers */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="space-y-2">
            <label htmlFor="quick-date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button id="quick-date"
                  variant="transparent"
                  className={cn(
                    "h-9 w-full justify-start border border-border/70 bg-muted/50 text-xs font-normal sm:h-12 sm:text-sm",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                  {date ? format(date, "dd/MM/yyyy") : "Pick date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setLocalDate}
                  disabled={(date) => date < startOfToday()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label htmlFor="quick-passengers" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Passengers
            </label>
            <div className="flex h-9 items-center rounded-lg border border-border/70 bg-muted/50 px-3 sm:h-12">
              <Users className="w-4 h-4 text-primary mr-2" />
              <input
                id="quick-passengers"
                type="number"
                inputMode="numeric"
                min={1}
                max={10}
                value={passengers}
                onChange={(e) =>
                  setLocalPassengers(
                    Math.max(1, Math.min(10, parseInt(e.target.value) || 1)),
                  )
                }
                className="w-full bg-transparent text-foreground font-medium outline-none"
              />
            </div>
          </div>
        </div>

        {/* Search Button */}
        <Button
          onClick={handleSearch}
          disabled={!from || !to || !date}
          className="mt-1 h-9 w-full gap-2 bg-secondary text-xs font-semibold text-secondary-foreground hover:bg-secondary/90 sm:mt-2 sm:h-12 sm:text-sm"
        >
          <Search className="w-4 h-4" />
          Search buses
        </Button>
      </div>
    </motion.div>
  );
}
