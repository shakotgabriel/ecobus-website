import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchClient } from "./search-client";

export const metadata: Metadata = {
  title: "Search Buses",
  description: "Find EcoBus departures, fares and available seats between Juba, Bor, Nimule, Kampala and Nairobi.",
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<main id="main-content" className="min-h-[60vh] pt-28" />}>
      <SearchClient />
    </Suspense>
  );
}
