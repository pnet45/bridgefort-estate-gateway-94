import { parseJson, safeBookingWebUrl, validIsoDate } from "./booking-demand.ts";

Deno.test("safeBookingWebUrl accepts HTTPS Booking.com destinations", () => {
  if (safeBookingWebUrl("https://www.booking.com/hotel/gb/example.html") === null) {
    throw new Error("Expected a Booking.com URL to be accepted");
  }
  if (safeBookingWebUrl({ web: "https://booking.com/searchresults.html" }) === null) {
    throw new Error("Expected the Demand API web URL shape to be accepted");
  }
});

Deno.test("safeBookingWebUrl rejects non-Booking domains and unsafe protocols", () => {
  for (const value of [
    "http://www.booking.com/hotel/example",
    "https://booking.com.attacker.example/path",
    "javascript:alert(1)",
    "https://example.com/?next=https://booking.com",
  ]) {
    if (safeBookingWebUrl(value) !== null) throw new Error(`Unsafe redirect was accepted: ${value}`);
  }
});

Deno.test("validIsoDate rejects rollover and non-ISO dates", () => {
  if (!validIsoDate("2026-11-11")) throw new Error("Expected a valid ISO date");
  for (const value of ["2026-02-30", "11/11/2026", "2026-2-01", "not-a-date"]) {
    if (validIsoDate(value)) throw new Error(`Invalid date was accepted: ${value}`);
  }
});

Deno.test("parseJson rejects arrays and oversized payloads", async () => {
  const arrayPayload = await parseJson(new Request("https://example.test", {
    method: "POST",
    body: JSON.stringify([1, 2, 3]),
  }));
  if (arrayPayload !== null) throw new Error("Array payload should be rejected");

  const oversized = await parseJson(new Request("https://example.test", {
    method: "POST",
    body: JSON.stringify({ value: "x".repeat(100) }),
  }), 16);
  if (oversized !== null) throw new Error("Oversized payload should be rejected");
});
