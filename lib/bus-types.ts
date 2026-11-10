export const BUS_TYPE_LABELS: Record<string, string> = {
  EXECUTIVE_CRUISER: "Executive Cruiser (VIP)",
  CARGO_CRUISER: "Cargo Cruiser",
  COMFORT_CRUISER: "Comfort Cruiser",
}

export function busTypeLabel(busType?: string | null): string {
  if (!busType) return "Coach"
  return BUS_TYPE_LABELS[busType] || busType.replace(/_/g, " ")
}

export function uniqueBusTypes(types: Array<string | null | undefined>): string[] {
  return [...new Set(types.filter((type): type is string => Boolean(type)))]
}
