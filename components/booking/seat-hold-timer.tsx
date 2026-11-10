"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";
import { cn } from "@/lib/utils";

function secondsUntil(iso: string) {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 1000));
}

/** Shows how long the selected seats stay reserved and fires `onExpire` once at zero. */
export function SeatHoldTimer({
  expiresAt,
  onExpire,
  onExtend,
  extending,
}: {
  expiresAt: string;
  onExpire: () => void;
  onExtend: () => void;
  extending?: boolean;
}) {
  const [left, setLeft] = useState(() => secondsUntil(expiresAt));

  useEffect(() => {
    setLeft(secondsUntil(expiresAt));
    const id = window.setInterval(() => {
      const next = secondsUntil(expiresAt);
      setLeft(next);
      if (next <= 0) {
        window.clearInterval(id);
        onExpire();
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [expiresAt, onExpire]);

  const minutes = Math.floor(left / 60);
  const seconds = String(left % 60).padStart(2, "0");
  const urgent = left <= 60;

  return (
    <div
      role="status"
      aria-live={urgent ? "assertive" : "off"}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm",
        urgent ? "border-warning/50 bg-warning/10 text-warning-foreground" : "border-border bg-muted/40 text-muted-foreground",
      )}
    >
      <span className="flex items-center gap-2">
        <Timer className="h-4 w-4 shrink-0" aria-hidden />
        Seats held for{" "}
        <span className="font-semibold tabular-nums text-foreground">
          {minutes}:{seconds}
        </span>
      </span>
      {urgent && (
        <button
          type="button"
          onClick={onExtend}
          disabled={extending}
          className="font-semibold text-primary underline-offset-2 hover:underline disabled:opacity-60"
        >
          {extending ? "Extending…" : "Keep my seats"}
        </button>
      )}
    </div>
  );
}
