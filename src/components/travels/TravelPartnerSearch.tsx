import { useMemo, useState, type FormEvent } from "react";
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
  ["de", "Germany"], ["ng", "Nigeria"], ["ca", "Canada"], ["gh", "Ghana"],
];

const today = () => {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};
const localized = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const text = record["en-gb"] ?? record.en ?? Object.values(record)[0];
    return typeof text === "string" ? text : "";
  }
  return "";
};

function getRedirect(item: ResultItem): string | null {
  const raw = (typeof item?.url === "string" ? item.url : item?.url?.web)
    ?? item?.urls?.web?.search_results
    ?? item?.urls?.web?.landing_page
    ?? item?.urls?.web?.detail;
  if (typeof raw !== "string") return null;
  try {
    const url = new URL(raw);
    return url.protocol === "https:" && (url.hostname === "booking.com" || url.hostname === "www.booking.com")
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function getTitle(item: ResultItem, kind: SearchKind): string {
  const value = item?.details?.name ?? item?.name ?? item?.title ?? item?.accommodation?.name ?? item?.id;
  return localized(value) || (kind === "accommodations" ? "Accommodation option" : "Attraction or experience");
}

function getPrice(item: ResultItem): { amount: number; currency: string } | null {
  const product = item?.products?.[0] ?? item?.recommendation?.products?.[0];
  const candidates = [
    item?.price?.total?.booker_currency,
    item?.price?.display?.booker_currency,
    item?.price?.booker_currency,
    item?.price?.book,
    item?.price?.total?.accommodation_currency,
    item?.price?.display?.accommodation_currency,
    item?.price?.total?.amount,
    item?.price?.amount,
    product?.price?.total?.booker_currency,
    product?.price?.booker_currency,
    product?.price?.book,
    product?.price?.total?.amount,
    product?.price?.amount,
  ];
  const amount = candidates.find((value) => typeof value === "number" && Number.isFinite(value));
  if (typeof amount !== "number") return null;
  const currencyValue = item?.currency?.booker ?? item?.currency?.accommodation
    ?? item?.price?.currency ?? product?.price?.currency ?? item?.currency ?? "USD";
  return { amount, currency: typeof currencyValue === "string" ? currencyValue : "USD" };
}

function formatPrice(price: { amount: number; currency: string }): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: price.currency,
      maximumFractionDigits: 0,
    }).format(price.amount);
  } catch {
    return `${price.currency} ${price.amount.toLocaleString()}`;
  }
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

  const selectedCountry = useMemo(() => countries.find(([code]) => code === country)?.[1] ?? country, [country]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setItems([]);
    setSearched(false);
    if (!checkin || !checkout || checkin < today() || (kind === "accommodations" ? checkout <= checkin : checkout < checkin)) {
      setError(kind === "accommodations"
        ? "Choose valid dates. Check-out must be after check-in."
        : "Choose valid dates. The end date cannot be before the start date.");
      return;
    }
    setLoading(true);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke("booking-demand-api", {
        body: {
          kind,
          country,
          checkin,
          checkout,
          currency,
          bookerCountry: "ng",
          platform: typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
          adults: Number(adults),
          rooms: Number(rooms),
        },
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
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-estate-blue mb-2">Booking.com Demand API 3.3</p>
          <h2 id="partner-search-title" className="font-display text-3xl md:text-4xl font-bold mb-3">Find Stays &amp; Experiences</h2>
          <p className="text-muted-foreground">Explore accommodation and experiences for your travel dates. Final prices, availability and reservations are confirmed securely on Booking.com.</p>
        </div>

        <form onSubmit={submit} className="max-w-5xl mx-auto rounded-2xl border bg-card p-5 md:p-7 shadow-sm">
          <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="Travel search type">
            <Button type="button" variant={kind === "accommodations" ? "default" : "outline"} onClick={() => { setKind("accommodations"); setItems([]); setSearched(false); setError(""); }} className="gap-2">
              <Hotel className="h-4 w-4" /> Stays
            </Button>
            <Button type="button" variant={kind === "attractions" ? "default" : "outline"} onClick={() => { setKind("attractions"); setItems([]); setSearched(false); setError(""); }} className="gap-2">
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
            <label className="text-sm font-medium">Start date
              <span className="relative mt-1 block">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input required type="date" min={today()} value={checkin} onChange={(e) => setCheckin(e.target.value)} className="h-11 w-full rounded-md border bg-background pl-9 pr-2 text-sm" />
              </span>
            </label>
            <label className="text-sm font-medium">{kind === "accommodations" ? "Check-out date" : "End date"}
              <span className="relative mt-1 block">
                <CalendarDays className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input required type="date" min={kind === "accommodations" ? (checkin || today()) : (checkin || today())} value={checkout} onChange={(e) => setCheckout(e.target.value)} className="h-11 w-full rounded-md border bg-background pl-9 pr-2 text-sm" />
              </span>
            </label>
            <label className="text-sm font-medium">Display currency
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm">
                {["USD", "EUR", "GBP", "NGN", "AED", "ZAR"].map((code) => <option key={code} value={code}>{code}</option>)}
              </select>
            </label>
          </div>

          {kind === "accommodations" && <div className="grid grid-cols-2 gap-4 mt-4 max-w-md">
            <label className="text-sm font-medium">Adults
              <select value={adults} onChange={(e) => setAdults(e.target.value)} className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm">
                {Array.from({ length: 10 }, (_, i) => String(i + 1)).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium">Rooms
              <select value={rooms} onChange={(e) => setRooms(e.target.value)} className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm">
                {Array.from({ length: 5 }, (_, i) => String(i + 1)).map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
            </label>
          </div>}

          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? "Searching…" : <><Search className="h-4 w-4" /> Search live options</>}
            </Button>
            <span className="text-xs text-muted-foreground">Destination: {selectedCountry}. Prices and inventory depend on partner coverage.</span>
          </div>
          {error && <p role="alert" className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
        </form>

        {loading && <div className="max-w-5xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" aria-label="Loading travel results">
          {Array.from({ length: 3 }, (_, index) => <div key={index} className="rounded-xl border bg-card p-5 animate-pulse">
            <div className="h-5 w-2/3 rounded bg-muted" />
            <div className="mt-4 h-3 w-1/2 rounded bg-muted" />
            <div className="mt-8 h-4 w-1/3 rounded bg-muted" />
            <div className="mt-6 h-10 w-full rounded bg-muted" />
          </div>)}
        </div>}

        {searched && !loading && <div className="max-w-5xl mx-auto mt-8" aria-live="polite">
          <h3 className="font-display text-xl font-semibold mb-4">{items.length ? `${items.length} options found` : "No matching options found"}</h3>
          {items.length > 0 && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, index) => {
              const url = getRedirect(item);
              const title = getTitle(item, kind);
              const price = getPrice(item);
              const cityName = localized(item?.details?.location?.city ?? item?.location?.city ?? item?.city?.name ?? item?.details?.location?.address ?? item?.location?.name);
              return <article key={String(item.id ?? index)} className="rounded-xl border bg-card p-5 flex flex-col min-w-0">
                <h4 className="font-semibold text-lg break-words">{title}</h4>
                {cityName && <p className="text-sm text-muted-foreground mt-1">{cityName}</p>}
                {price && <p className="font-semibold text-estate-blue mt-3">From {formatPrice(price)} <span className="font-normal text-xs text-muted-foreground">for the selected dates</span></p>}
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
