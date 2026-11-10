import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-[70vh] items-center justify-center px-4 pt-24 pb-16">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-primary">404</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-foreground">Page not found</h1>
        <p className="mt-3 text-muted-foreground">
          The page you were looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild>
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/manage-booking">Find my booking</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
