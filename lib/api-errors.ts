/**
 * Turn Django REST Framework / API error payloads into readable user messages.
 */

const FIELD_LABELS: Record<string, string> = {
  payment_phone: "Phone number",
  phone_number: "Phone number",
  phone: "Phone number",
  payer_name: "Passenger name",
  first_name: "First name",
  last_name: "Last name",
  email: "Email",
  tickets: "Passenger",
  seat: "Seat",
  seat_ids: "Seats",
  trip: "Trip",
  non_field_errors: "",
  detail: "",
  message: "",
}

function humanizeField(key: string): string {
  if (key in FIELD_LABELS) return FIELD_LABELS[key]
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function collectMessages(value: unknown, fieldKey?: string, prefix?: string): string[] {
  const out: string[] = []

  if (value == null) return out

  if (typeof value === "string") {
    const label = fieldKey ? humanizeField(fieldKey) : ""
    const text = value.trim()
    if (!text) return out
    if (!label || fieldKey === "detail" || fieldKey === "message" || fieldKey === "non_field_errors") {
      out.push(prefix ? `${prefix}: ${text}` : text)
    } else {
      const startsWithLabel = text.toLowerCase().startsWith(label.toLowerCase())
      const msg = startsWithLabel ? text : `${label}: ${text}`
      out.push(prefix ? `${prefix} — ${msg}` : msg)
    }
    return out
  }

  if (Array.isArray(value)) {
    if (value.length > 0 && value.every((item) => item && typeof item === "object" && !Array.isArray(item))) {
      value.forEach((item, index) => {
        const itemPrefix =
          fieldKey === "tickets"
            ? `Passenger ${index + 1}`
            : prefix
              ? `${prefix} (${index + 1})`
              : `${humanizeField(fieldKey || "item")} ${index + 1}`
        out.push(...collectMessages(item, undefined, itemPrefix))
      })
      return out
    }
    value.forEach((item) => out.push(...collectMessages(item, fieldKey, prefix)))
    return out
  }

  if (typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out.push(...collectMessages(nested, key, prefix))
    }
  }

  return out
}

export function formatApiError(payload: unknown, fallback = "Something went wrong. Please try again."): string {
  if (payload == null) return fallback

  if (typeof payload === "string") {
    const trimmed = payload.trim()
    if (!trimmed) return fallback
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        return formatApiError(JSON.parse(trimmed), fallback)
      } catch {
        return trimmed
      }
    }
    return trimmed
  }

  if (typeof payload !== "object") {
    return String(payload) || fallback
  }

  const data = payload as Record<string, unknown>

  if (typeof data.detail === "string") return data.detail
  if (Array.isArray(data.detail)) {
    const msgs = collectMessages(data.detail, "detail")
    if (msgs.length) return uniqueJoin(msgs)
  }
  if (typeof data.message === "string") return data.message

  const msgs = collectMessages(data)
  if (msgs.length) return uniqueJoin(msgs)

  return fallback
}

function uniqueJoin(messages: string[]): string {
  const seen = new Set<string>()
  const unique: string[] = []
  for (const msg of messages) {
    const key = msg.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(msg)
  }
  return unique.join(" · ")
}

export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (error instanceof Error) return formatApiError(error.message, fallback)
  return formatApiError(error, fallback)
}
