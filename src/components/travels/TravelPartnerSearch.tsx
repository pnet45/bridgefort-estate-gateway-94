import { useState } from "react";
import { CalendarDays, ExternalLink, Hotel, MapPin, Search, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

type SearchKind = "accommodations" | "attractions";
type ResultItem = Record<string, any>;

const countries = [
  ["ae", "United Arab Emirates"], ["gb", "United Kingdom"], ["tr", "Türkiye"],
  ["za", "South Africa"], ["id", "Indonesia"], ["us", "United States"],
  ["pl", "Poland"], ["cz", "Czech Republic"], ["rs", "Serbia"], ["ro", "Romania"],
  ["pt", "Portugal"], ["by", "Belarus"], ["md", "Moldova"], ["ua", "Ukraine"],
  ["nl", "Netherlands"], ["fr", "France"], ["es", "Spain"], ["it", "Italy"],
];

function getRedirect(item: ResultItem, kind: SearchKind): string | null {
  const urls = item?.url ?? item?.urls;
  const candidate = kind === "accommodations"
    ? (urls?.web?.search_results ?? urls?.web?.landing_page ?? urls?.web?.detail)
    : (urls?.web?.detail ?? urls?.web?.search_results);
  return typeof candidate === "string" && candidate.startsWith("https://www.booking.com/") ? candidate : null;
}
function getTitle(item: ResultItem, kind: SearchKind): string {
  const value = item?.name ?? item?.accommodation?.name ?? item?.title ?? item?.id;
  if (typeof value === "string") return value;
  if (value && typeof value === "object") return value["en-gb"] ?? value.en ?? Object.values(value)[0] as string ?? "Travel option";
  return kind === "accommodations" ? "Accommodation option" : "Attraction or experience";
}
function getPrice(item: ResultItem): string | null {
  const price = item?.price?.total ?? item?.price?.book ?? item?.price?.amount;
  const currency = item?.price?.currency;
  return typeof price === "number" && currency ? new Intl.NumberFormat(undefined, { style: "currency", currency }).format(price) : null;
}

export default function TravelPartnerSearch() {
  const [kind, setKind] = useState<SearchKind>("accommodations");
  const [country, setCountry] = useState("ae");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [adults, setAdults] = useState("2");
  const [rooms, setRooms] = useState("1");
  const [items, setItems] = useState<ResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setItems([]);
    setSearched(false);
    if (!checkin || !checkout || checkout <= checkin) {
      setError("Choose valid dates. Check-out must be after check-in.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("booking-demand-api", {
        body: { kind, country, checkin, checkout, currency, adults: Number(adults), rooms: Number(rooms) },
      });
      if (invokeError) throw invokeError;
      if (data?.error) throw new Error(data.error);
      setItems(Array.isArray(data?.data) ? data.data : []);
      setSearched(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Travel search is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-padding bg-muted/40" aria-labelledby="partner-search-title">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-estate-blue mb-2">Live travel discovery</p>
          <h2 id="partner-search-title" className="font-display text-3xl md:text-4xl font-bold mb-3">Find Stays &amp; Experiences</h2>
          <p className="text-muted-foreground">Explore live options from Booking.com. Prices and availability can change; booking and payment are completed on Booking.com.</p>
        </div>

        <form onSubmit={submit} className="max-w-5xl mx-auto rounded-2xl border bg-card p-5 md:p-7 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Travel search type">
            <Button type="button" variant={kind === "accommodations" ? "default" : "outline"} onClick={() => setKind("accommodations")} className="gap-2">
              <Hotel className="h-4 w-4" /> Stays
            </Button>
            <Button type="button" variant={kind === "attractions" ? "default" : "outline"} onClick={() => setKind("attractions")} className="gap-2">
              <Ticket className="h-4 w-4" /> Experiences
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <label className="text-sm font-medium">Destination country
              <span className="relative mt-1 block">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="h-11 w-full rounded-md border bg-background pl-9 pr-3 text-sm">
                  {countries.map(([code, name]) => <option key={code} value={code}>{name}</option>)}
                </select>
              </span>
            </label>
            <label className="text-sm font-medium">Check-in / start date
              <span className="relative mt-1 block">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input required type="date" min={new Date().toISOString().slice(0, 10)} value={checkin} onChange={(e) => setCheckin(e.target.value)} className="h-11 w-full rounded-md border bg-background pl-9 pr-2 text-sm" />
              </span>
            </label>
            <label className="text-sm font-medium">Check-out / end date
              <span className="relative mt-1 block">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input required type="date" min={checkin || new Date().toISOString().slice(0, 10)} value={checkout} onChange={(e) => setCheckout(e.target.value)} className="h-11 w-full rounded-md border bg-background pl-9 pr-2 text-sm" />
              </span>
            </label>
            <label className="text-sm font-medium">Display currency
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm">
                {["USD", "EUR", "GBP", "NGN", "AED", "ZAR"].map((code) => <option key={code}>{code}</option>)}
              </select>
            </label>
          </div>

          {kind === "accommodations" && <div className="grid grid-cols-2 gap-4 mt-4 max-w-md">
            <label className="text-sm font-medium">Adults
              <select value={adults} onChange={(e) => setAdults(e.target.value)} className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm">
                {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((v) => <option key={v}>{v}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Rooms
              <select value={rooms} onChange={(e) => setRooms(e.target.value)} className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm">
                {Array.from({ length: 5 }, (_, i) => String(i + 1)).map((v) => <option key={v}>{v}</option>)}
              </select>
            </label>
          </div>}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={loading} className="gap-2">{loading ? "Searching…" : <><Search className="h-4 w-4" /> Search live options</>}</Button>
            <span className="text-xs text-muted-foreground">Live inventory depends on Booking.com partner access and destination coverage.</span>
          </div>
          {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        </form>

        {searched && <div className="max-w-5xl mx-auto mt-8">
          <h3 className="font-display text-xl font-semibold mb-4">{items.length ? `${items.length} options found` : "No matching options found"}</h3>
          {items.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => {
              const url = getRedirect(item, kind);
              const title = getTitle(item, kind);
              const price = getPrice(item);
              return <article key={String(item.id ?? index)} className="rounded-xl border bg-card p-5 flex flex-col">
                <h4 className="font-semibold text-lg">{title}</h4>
                {typeof item.location?.city === "string" && <p className="text-sm text-muted-foreground mt-1">{item.location.city}</p>}
                {price && <p className="font-semibold text-estate-blue mt-3">From {price} <span className="font-normal text-xs text-muted-foreground">for the selected dates</span></p>}
                <p className="text-xs text-muted-foreground mt-3">Availability and final prices are confirmed on Booking.com.</p>
                {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-auto pt-5 text-sm font-semibold text-estate-blue hover:underline">Continue on Booking.com <ExternalLink className="h-4 w-4" /></a> : <p className="text-xs text-muted-foreground mt-auto pt-5">Booking link not supplied for this result.</p>}
              </article>;
            })}
          </div>}
        </div>}
      </div>
    </section>
  );
}
