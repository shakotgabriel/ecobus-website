"use client";

import { Check, X } from "lucide-react";
import type { SeatMapResponse, SeatMapSeat } from "@/lib/services/trips";
import { busTypeLabel } from "@/lib/bus-types";
import { cn } from "@/lib/utils";

export function SeatMap({
  selectedSeats,
  onSeatToggle,
  apiSeatMap,
  loading,
}: {
  selectedSeats: string[];
  onSeatToggle: (seatId: string) => void;
  apiSeatMap?: SeatMapResponse | null;
  loading?: boolean;
}) {
  const seats = apiSeatMap?.seats || [];
  const rows = apiSeatMap?.total_rows || (seats.length > 0 ? Math.max(...seats.map((s) => s.row)) : 0);
  const columnsLeft = apiSeatMap?.columns_left ?? 2;
  const busLabel = apiSeatMap?.bus_type_display || busTypeLabel(apiSeatMap?.bus_type);
  const layout = apiSeatMap?.layout;

  if (loading) {
    return (
      <div className="bg-muted/30 rounded-xl p-4 sm:p-6 flex items-center justify-center min-h-[300px]">
        <div className="text-muted-foreground">Loading seat map...</div>
      </div>
    );
  }

  if (seats.length === 0) {
    return (
      <div className="bg-muted/30 rounded-xl p-4 sm:p-6 flex items-center justify-center min-h-[300px] text-center">
        <div className="text-muted-foreground text-sm">
          No seat map available for this trip.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 rounded-xl p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="px-3 py-1 border-2 border-dashed border-muted-foreground/30 rounded text-xs text-muted-foreground">
          DOOR
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-foreground">{busLabel}</p>
          <p className="text-[11px] text-muted-foreground">
            {layout ? `${layout} layout` : "Coach"} {apiSeatMap?.bus_name ? `· ${apiSeatMap.bus_name}` : ""}
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
        </div>
      </div>

      {/* Seat grid */}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, rowIndex) => {
          const rowSeats = seats
            .filter((s) => s.row === rowIndex + 1)
            .sort((a, b) => a.column.localeCompare(b.column));
          return (
            <div key={rowIndex} className="flex justify-center gap-2 sm:gap-3">
              <div className="flex gap-1 sm:gap-2">
                {rowSeats.slice(0, columnsLeft).map((seat) => (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedSeats.includes(String(seat.id))}
                    onClick={() => onSeatToggle(String(seat.id))}
                  />
                ))}
              </div>
              <div className="w-6 sm:w-10" /> {/* Aisle */}
              <div className="flex gap-1 sm:gap-2">
                {rowSeats.slice(columnsLeft).map((seat) => (
                  <SeatButton
                    key={seat.id}
                    seat={seat}
                    isSelected={selectedSeats.includes(String(seat.id))}
                    onClick={() => onSeatToggle(String(seat.id))}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-muted border border-border" />
          <span className="text-xs text-muted-foreground">Standard</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded border border-warning/50 bg-warning/20" />
          <span className="text-xs text-muted-foreground">VIP</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
            <Check className="w-3 h-3 text-primary-foreground" />
          </div>
          <span className="text-xs text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-muted-foreground/30" />
          <span className="text-xs text-muted-foreground">Booked</span>
        </div>
      </div>
    </div>
  );
}

function SeatButton({
  seat,
  isSelected,
  onClick,
}: {
  seat: SeatMapSeat;
  isSelected: boolean;
  onClick: () => void;
}) {
  const isBooked = seat.status !== "AVAILABLE";
  const isVip = seat.seat_type === "VIP";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isBooked}
      aria-pressed={isSelected}
      aria-label={`Seat ${seat.seat_number}, ${isVip ? "VIP" : "Standard"}${isBooked ? ", booked" : isSelected ? ", selected" : ""}`}
      title={`${seat.seat_number} · ${isVip ? "VIP" : "Standard"}`}
      className={cn(
        "w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-semibold text-sm transition-all flex items-center justify-center",
        isBooked &&
          "bg-muted-foreground/30 text-muted-foreground/50 cursor-not-allowed",
        !isBooked &&
          !isSelected &&
          !isVip &&
          "bg-muted hover:bg-accent border border-border text-foreground",
        !isBooked &&
          !isSelected &&
          isVip &&
          "border border-warning/50 bg-warning/20 text-foreground hover:bg-warning/30",
        isSelected && "bg-primary text-primary-foreground shadow-sm",
      )}
    >
      {isBooked ? (
        <X className="w-4 h-4 mx-auto" aria-hidden />
      ) : isSelected ? (
        <Check className="w-4 h-4 mx-auto" />
      ) : (
        seat.seat_number
      )}
    </button>
  );
}
