/**
 * Phone number normalization for East African markets.
 * Handles M-Pesa (Kenya), MoMo (Uganda), and local 0… formats.
 */

export interface CountryPhoneConfig {
  country: string;
  countryCode: string;
  defaultCountryCode: string;
  acceptedFormats: RegExp[];
  normalizeFormat: (phone: string) => string;
}

function makeNormalizer(countryDigits: string): (phone: string) => string {
  return (phone: string) => {
    let cleaned = phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = cleaned.slice(1);
    }
    if (!cleaned.startsWith(countryDigits)) {
      cleaned = countryDigits + cleaned;
    }
    return cleaned;
  };
}

const KenyaConfig: CountryPhoneConfig = {
  country: "Kenya",
  countryCode: "KE",
  defaultCountryCode: "+254",
  acceptedFormats: [/^254\d{9}$/, /^\+254\d{9}$/, /^07\d{8}$/, /^01\d{8}$/],
  normalizeFormat: makeNormalizer("254"),
};

const UgandaConfig: CountryPhoneConfig = {
  country: "Uganda",
  countryCode: "UG",
  defaultCountryCode: "+256",
  acceptedFormats: [/^256\d{9}$/, /^\+256\d{9}$/, /^07\d{8}$/, /^03\d{8}$/],
  normalizeFormat: makeNormalizer("256"),
};

const SouthSudanConfig: CountryPhoneConfig = {
  country: "South Sudan",
  countryCode: "SS",
  defaultCountryCode: "+211",
  acceptedFormats: [/^211\d{9}$/, /^\+211\d{9}$/, /^0\d{8,9}$/],
  normalizeFormat: makeNormalizer("211"),
};

const TanzaniaConfig: CountryPhoneConfig = {
  country: "Tanzania",
  countryCode: "TZ",
  defaultCountryCode: "+255",
  acceptedFormats: [/^255\d{9}$/, /^\+255\d{9}$/, /^0\d{9}$/],
  normalizeFormat: makeNormalizer("255"),
};

const RwandaConfig: CountryPhoneConfig = {
  country: "Rwanda",
  countryCode: "RW",
  defaultCountryCode: "+250",
  acceptedFormats: [/^250\d{9}$/, /^\+250\d{9}$/, /^0\d{9}$/],
  normalizeFormat: makeNormalizer("250"),
};

const COUNTRY_CONFIGS: Record<string, CountryPhoneConfig> = {
  KE: KenyaConfig,
  UG: UgandaConfig,
  SS: SouthSudanConfig,
  TZ: TanzaniaConfig,
  RW: RwandaConfig,
  // Currency aliases → ISO country
  KES: KenyaConfig,
  UGX: UgandaConfig,
  SSP: SouthSudanConfig,
  TZS: TanzaniaConfig,
  RWF: RwandaConfig,
};

const KNOWN_COUNTRY_PREFIXES = ["254", "256", "211", "250", "255"] as const;

/**
 * Guess the country from a local "0…" number. South Sudan mobile numbers are
 * 09xxxxxxxx (MTN SS 092, Zain 091, Digitel 098); Uganda and Kenya use 07/01/03.
 */
export function detectCountryFromLocalNumber(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (/^09\d{8}$/.test(digits) || /^9\d{8}$/.test(digits)) return "SS";
  return null;
}

/** Resolve ISO country (or currency) code for phone formatting. */
export function resolvePhoneCountry(options?: {
  countryCode?: string;
  currency?: string;
  paymentMethod?: string;
  phone?: string;
}): string {
  if (options?.phone) {
    const detected = detectCountryFromLocalNumber(options.phone);
    if (detected) return detected;
  }

  const method = (options?.paymentMethod || "").toLowerCase();
  if (method === "mpesa") return "KE";

  const currency = (options?.currency || "").toUpperCase();
  if (currency && COUNTRY_CONFIGS[currency]) {
    return COUNTRY_CONFIGS[currency].countryCode;
  }

  const country = (options?.countryCode || "").toUpperCase();
  if (country && COUNTRY_CONFIGS[country]) {
    return COUNTRY_CONFIGS[country].countryCode;
  }

  if (method === "mtn" || method === "mtn_momo") return "UG";
  return "SS";
}

export function getPhoneConfig(countryOrCurrency?: string): CountryPhoneConfig {
  if (!countryOrCurrency) return UgandaConfig;
  return COUNTRY_CONFIGS[countryOrCurrency.toUpperCase()] || UgandaConfig;
}

/** Digits-only national/international form without leading +. */
export function normalizePhoneNumber(phone: string, countryCode?: string): string {
  return getPhoneConfig(countryCode).normalizeFormat(phone);
}

/** E.164 with leading + for API payloads. */
export function formatPhoneForDisplay(phone: string, countryCode?: string): string {
  return `+${normalizePhoneNumber(phone, countryCode)}`;
}

/**
 * Normalize a customer-entered phone to E.164 for booking/payment APIs.
 * Preserves an explicit + / known country prefix; otherwise uses payment/currency region.
 */
export function toE164Phone(
  phone: string,
  options?: { countryCode?: string; currency?: string; paymentMethod?: string },
): string {
  const trimmed = phone.trim().replace(/[\s\-()]/g, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  for (const cc of KNOWN_COUNTRY_PREFIXES) {
    if (digits.startsWith(cc) && digits.length >= cc.length + 8) {
      return `+${digits}`;
    }
  }

  const region = resolvePhoneCountry({ ...options, phone: trimmed });
  return formatPhoneForDisplay(trimmed, region);
}

/**
 * Best-effort E.164 for booking lookup/cancel when region is unknown.
 * Local 0… numbers are left as-is for backend flexible matching.
 */
export function toLookupPhone(phone: string): string {
  const trimmed = phone.trim().replace(/[\s\-()]/g, "");
  if (!trimmed) return "";
  if (trimmed.startsWith("+")) return trimmed;

  const digits = trimmed.replace(/\D/g, "");
  for (const cc of KNOWN_COUNTRY_PREFIXES) {
    if (digits.startsWith(cc) && digits.length >= cc.length + 8) {
      return `+${digits}`;
    }
  }
  return trimmed;
}

export function isValidPhoneNumber(
  phone: string,
  options?: { countryCode?: string; currency?: string; paymentMethod?: string },
): boolean {
  const trimmed = phone.trim().replace(/[\s\-()]/g, "");
  if (!trimmed) return false;
  if (trimmed.startsWith("+")) {
    const digits = trimmed.slice(1);
    return (
      /^\d+$/.test(digits) &&
      KNOWN_COUNTRY_PREFIXES.some((cc) => digits.startsWith(cc) && digits.length === cc.length + 9)
    );
  }
  const region = resolvePhoneCountry({ ...options, phone: trimmed });
  const config = getPhoneConfig(region);
  const normalized = config.normalizeFormat(trimmed);
  return (
    config.acceptedFormats.some((format) => format.test(trimmed)) ||
    config.acceptedFormats.some((format) => format.test(normalized))
  );
}
