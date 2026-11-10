"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main id="main-content" className="flex min-h-[70vh] items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-md text-center" role="alert">
        <h1 className="font-display text-3xl font-bold text-foreground">Something went wrong</h1>
        <p className="mt-3 text-muted-foreground">
          We couldn&apos;t load this page. Please try again — if you were paying, check your booking before
          paying again.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <Button asChild variant="outline">
            <Link href="/manage-booking">Check my booking</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
