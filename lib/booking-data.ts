import { imageForRoute, PUBLIC_IMAGES } from "@/lib/public-images";

export interface Route {
  id: string;
  from: string;
  to: string;
  via?: string;
  duration: string;
  distance: string;
  regularPrice: number;
  vipPrice: number;
  currency: string;
  image: string;
  departureTimes: string[];
  isUpcoming?: boolean;
  allowedBusTypes?: string[];
  busTypes?: string[];
}

export interface Seat {
  id: string;
  number: string;
  type: "regular" | "vip";
  status: "available" | "booked" | "selected" | "yours";
  row: number;
  column: number;
}

export interface BookingDetails {
  route: Route | null;
  date: Date | null;
  passengers: number;
  departureTime: string;
  busClass: "regular" | "vip";
  selectedSeats: string[];
  passengerName: string;
  phoneNumber: string;
  paymentMethod: "mpesa" | "mtn";
}

export const destinations = [
  "Nairobi",
  "Kampala",
  "Juba",
  "Kigali",
];

export const routes: Route[] = [
  {
    id: "nairobi-kampala",
    from: "Nairobi",
    to: "Kampala",
    duration: "10-12 hours",
    distance: "660 km",
    regularPrice: 5000,
    vipPrice: 6500,
    currency: "KES",
    image: imageForRoute("Nairobi", "Kampala"),
    departureTimes: ["06:00 AM", "08:00 AM", "08:00 PM", "10:00 PM"],
  },
  {
    id: "nairobi-juba",
    from: "Nairobi",
    to: "Juba",
    via: "Kampala",
    duration: "18-20 hours",
    distance: "1,200 km",
    regularPrice: 8500,
    vipPrice: 11000,
    currency: "KES",
    image: imageForRoute("Nairobi", "Juba"),
    departureTimes: ["06:00 AM", "07:00 PM"],
  },
  {
    id: "kampala-nairobi",
    from: "Kampala",
    to: "Nairobi",
    duration: "10-12 hours",
    distance: "660 km",
    regularPrice: 120000,
    vipPrice: 150000,
    currency: "UGX",
    image: imageForRoute("Kampala", "Nairobi"),
    departureTimes: ["06:00 AM", "08:00 AM", "08:00 PM", "10:00 PM"],
  },
  {
    id: "kampala-juba",
    from: "Kampala",
    to: "Juba",
    duration: "8-10 hours",
    distance: "500 km",
    regularPrice: 100000,
    vipPrice: 130000,
    currency: "UGX",
    image: imageForRoute("Kampala", "Juba"),
    departureTimes: ["06:00 AM", "02:00 PM", "08:00 PM"],
  },
  {
    id: "juba-kampala",
    from: "Juba",
    to: "Kampala",
    duration: "8-10 hours",
    distance: "500 km",
    regularPrice: 350,
    vipPrice: 450,
    currency: "SSP",
    image: imageForRoute("Juba", "Kampala"),
    departureTimes: ["06:00 AM", "02:00 PM", "08:00 PM"],
  },
  {
    id: "nairobi-kigali",
    from: "Nairobi",
    to: "Kigali",
    via: "Kampala",
    duration: "16-18 hours",
    distance: "1,100 km",
    regularPrice: 7500,
    vipPrice: 9500,
    currency: "KES",
    image: PUBLIC_IMAGES.fleetC,
    departureTimes: ["06:00 AM", "08:00 PM"],
    isUpcoming: true,
  },
  {
    id: "kampala-kigali",
    from: "Kampala",
    to: "Kigali",
    duration: "6-8 hours",
    distance: "510 km",
    regularPrice: 80000,
    vipPrice: 100000,
    currency: "UGX",
    image: PUBLIC_IMAGES.bus3,
    departureTimes: ["07:00 AM", "09:00 AM", "03:00 PM"],
    isUpcoming: true,
  },
];

const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  "South Sudan": "SSP",
  "Kenya": "KES",
  "Uganda": "UGX",
  "Tanzania": "TZS",
  "Ethiopia": "ETB",
  "Rwanda": "RWF",
  "DR Congo": "CDF",
};

export function getCurrencyForCountry(country: string): string {
  return COUNTRY_CURRENCY_MAP[country] || "SSP";
}

// Payment method → currency mapping
export const PAYMENT_CURRENCY: Record<string, string> = {
  mpesa: "KES",
  mtn: "UGX",
};

export function formatCurrency(amount: number, currency: string): string {
  return (
    new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) +
    " " +
    currency
  );
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
