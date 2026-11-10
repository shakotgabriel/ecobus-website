import { Moon, Sun, Sunset } from "lucide-react";
import { OPERATOR_TIMEZONE } from "@/lib/config";

export function getTimeIcon(time: string) {
  let hour24 = 0;
  if (time.includes("T")) {
    hour24 = Number(
      new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hour12: false, timeZone: OPERATOR_TIMEZONE })
        .format(new Date(time)),
    ) % 24;
  } else if (time.includes(":")) {
    // "HH:MM" or "HH:MM AM/PM"
    const hour = parseInt(time.split(":")[0]);
    const isPM = time.toUpperCase().includes("PM");
    hour24 = isPM && hour !== 12 ? hour + 12 : !isPM && hour === 12 ? 0 : hour;
  }

  if (hour24 >= 5 && hour24 < 12)
    return { icon: Sun, label: "Morning", color: "text-warning" };
  if (hour24 >= 12 && hour24 < 17)
    return { icon: Sun, label: "Afternoon", color: "text-primary" };
  if (hour24 >= 17 && hour24 < 20)
    return { icon: Sunset, label: "Evening", color: "text-primary" };
  return { icon: Moon, label: "Night", color: "text-info" };
}

export function formatDepartureTime(time: string): string {
  if (time.includes("T")) {
    const d = new Date(time);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: OPERATOR_TIMEZONE,
    });
  }
  return time;
}
