/**
 * Local public image helpers for route/destination cards and homepage polish.
 * Assets live under /public — each section should use a distinct photo.
 */

export const PUBLIC_IMAGES = {
  hero: "/hero-ecobus.jpg",
  bus1: "/bus-highway.jpg",
  bus3: "/bus-front.jpg",
  fleetA: "/eco-bus-fleet.jpg",
  fleetB: "/eco-bus-routes.jpg",
  fleetC: "/bus-highway.jpg",
  logo: "/logo-ecobus.png",
  mark: "/logo-mark.png",
  placeholder: "/placeholder.jpg",
} as const

/** Ordered gallery for homepage fleet strip — one unique image each. */
export const FLEET_GALLERY = [
  {
    src: PUBLIC_IMAGES.bus1,
    alt: "EcoBus coach on the highway",
    caption: "Highway comfort",
    position: "center",
  },
  {
    src: PUBLIC_IMAGES.bus3,
    alt: "EcoBus coach ready to depart",
    caption: "Ready to board",
    position: "center 35%",
  },
  {
    src: PUBLIC_IMAGES.fleetA,
    alt: "EcoBus coach in South Sudan livery",
    caption: "Modern fleet",
    position: "78% 62%",
  },
  {
    src: PUBLIC_IMAGES.fleetB,
    alt: "EcoBus routes from Juba",
    caption: "Juba departures",
    position: "18% 78%",
  },
] as const

const CITY_IMAGE_CYCLE = [
  PUBLIC_IMAGES.bus1,
  PUBLIC_IMAGES.bus3,
  PUBLIC_IMAGES.fleetA,
  PUBLIC_IMAGES.fleetB,
] as const

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

/** Stable image for a city or corridor label. */
export function imageForDestination(label: string): string {
  if (!label) return PUBLIC_IMAGES.bus1
  return CITY_IMAGE_CYCLE[hashString(label.toLowerCase()) % CITY_IMAGE_CYCLE.length]
}

export function imageForRoute(from: string, to: string): string {
  return imageForDestination(`${from}-${to}`)
}
