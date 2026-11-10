import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Destinations & Routes",
  description:
    "Bus routes and fares from Juba to Kampala, Nairobi, Bor and Nimule. Check schedules and book your seat online.",
  alternates: { canonical: "/destinations" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
