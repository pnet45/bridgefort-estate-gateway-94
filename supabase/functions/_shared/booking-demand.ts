export const BOOKING_DEMAND_API_VERSION = "3.3";

export type TravelPartnerSearchKind = "accommodations" | "attractions";

export interface TravelPartnerSearchInput {
  kind: TravelPartnerSearchKind;
  country?: string;
  city?: number;
  checkin: string;
  checkout: string;
  currency: string;
  bookerCountry?: string;
  platform?: "desktop" | "mobile";
  adults?: number;
  rooms?: number;
}

export function isIsoDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function addUtcDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function validateTravelPartnerSearch(input: TravelPartnerSearchInput): string | null {
  if (input.kind !== "accommodations" && input.kind !== "attractions") return "Unsupported search type";
  if (!isIsoDate(input.checkin) || !isIsoDate(input.checkout)) return "Enter valid travel dates";
  if (!/^[A-Z]{3}$/.test(input.currency)) return "Choose a valid display currency";
  const today = new Date().toISOString().slice(0, 10);
  if (input.checkin < today) return "The start date cannot be in the past";

  if (input.kind === "accommodations") {
    if (input.checkout <= input.checkin) return "Check-out must be after check-in";
    if (input.checkin > addUtcDays(today, 500)) return "Accommodation check-in must be within the next 500 days";
    const nights = (Date.parse(`${input.checkout}T00:00:00.000Z`) - Date.parse(`${input.checkin}T00:00:00.000Z`)) / 86_400_000;
    if (nights < 1 || nights > 90) return "Accommodation stays must be between 1 and 90 nights";
    const adults = Number(input.adults ?? 2);
    const rooms = Number(input.rooms ?? 1);
    if (!Number.isInteger(adults) || adults < 1 || adults > 30 || !Number.isInteger(rooms) || rooms < 1 || rooms > 10) {
      return "Guest and room counts are outside supported limits";
    }
    if (!/^[a-z]{2}$/.test((input.bookerCountry ?? "ng").toLowerCase())) return "Invalid traveller country";
  } else {
    if (input.checkout < input.checkin) return "The end date cannot be before the start date";
    if (input.checkin > addUtcDays(today, 180) || input.checkout > addUtcDays(today, 180)) {
      return "Attraction dates must be within the next 180 days";
    }
    const days = (Date.parse(`${input.checkout}T00:00:00.000Z`) - Date.parse(`${input.checkin}T00:00:00.000Z`)) / 86_400_000;
    if (days > 90) return "Attraction searches can cover up to 90 days";
  }

  if (!(Number.isSafeInteger(input.city) && input.city !== 0) && !(typeof input.country === "string" && /^[a-z]{2}$/.test(input.country))) {
    return "Choose a destination city or country";
  }
  return null;
}
