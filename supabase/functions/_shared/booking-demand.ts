export const BOOKING_DEMAND_API_VERSION = "3.3";

export type TravelPartnerSearchKind = "accommodations" | "attractions";

export interface TravelPartnerSearchInput {
  kind: TravelPartnerSearchKind;
  country?: string;
  city?: number;
  checkin: string;
  checkout: string;
  currency: string;
  adults?: number;
  rooms?: number;
}

export function validateTravelPartnerSearch(input: TravelPartnerSearchInput): string | null {
  if (input.kind !== "accommodations" && input.kind !== "attractions") return "Unsupported search type";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.checkin) || !/^\d{4}-\d{2}-\d{2}$/.test(input.checkout)) return "Invalid dates";
  if (input.checkout <= input.checkin) return "Checkout must be after check-in";
  if (!/^[A-Z]{3}$/.test(input.currency)) return "Invalid currency";
  if (!(Number.isInteger(input.city) || (typeof input.country === "string" && /^[a-z]{2}$/i.test(input.country)))) {
    return "A Booking.com city ID or country code is required";
  }
  return null;
}
