export const COMPANY_TAGLINE =
  "Your Comfort Zone. Safe, reliable, and affordable bus travel across South Sudan and East Africa."

export const COMPANY_EMAIL = "ecobus.co.ss@gmail.com"

export const COMPANY_HOURS = "Monday – Sunday, 6:00 AM – 8:00 PM"

export const COMPANY_PHONES = [
  {
    city: "Juba",
    numbers: ["+211 926 388 115", "+211 921 307 724"],
  },
  {
    city: "Kampala",
    numbers: ["+256 782 393 125"],
  },
  {
    city: "Nairobi",
    numbers: ["+254 140 342 959", "+254 140 344 198"],
  },
] as const

export const COMPANY_OFFICES = [
  { name: "Atlabara", detail: "Opposite University of Juba" },
  { name: "Sherikat", detail: "Kampala Park" },
  { name: "Bor", detail: "Main Park" },
  { name: "Nimule", detail: "Malakia Station" },
  { name: "Kampala", detail: "Bomba Road" },
] as const

/** Public site origin used for canonical URLs, sitemap and Open Graph. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://ecobus.co.ss").replace(/\/$/, "")

/** WhatsApp line for customer support (international format, digits only). */
export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "211926388115").replace(/\D/g, "")

export function whatsappHref(message?: string) {
  const text = message ? `?text=${encodeURIComponent(message)}` : ""
  return `https://wa.me/${WHATSAPP_NUMBER}${text}`
}

export function telHref(number: string) {
  return `tel:${number.replace(/\s/g, "")}`
}
