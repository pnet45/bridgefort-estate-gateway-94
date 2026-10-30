import React, { useMemo, useState } from "react";
import { Search, MapPin, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type City = { id: number; name: string | Record<string, string> };
type HotelResult = {
  id: number;
  price?: any;
  currency?: any;
  details?: any;
};
type LiveAvailability = { data?: any; redirectUrl?: string | null; redirectAvailable?: boolean };

const COUNTRIES = [
  { code: "ae", label: "United Arab Emirates" },
  { code: "gb", label: "United Kingdom" },
  { code: "tr", label: "Türkiye" },
  { code: "za", label: "South Africa" },
  { code: "id", label: "Indonesia" },
  { code: "us", label: "United States" },
  { code: "pl", label: "Poland" },
  { code: "cz", label: "Czech Republic" },
  { code: "rs", label: "Serbia" },
  { code: "ro", label: "Romania" },
  { code: "pt", label: "Portugal" },
  { code: "by", label: "Belarus" },
  { code: "md", label: "Moldova" },
  { code: "ua", label: "Ukraine" },
];

const cityName = (city: City) => typeof city.name === "string"
  ? city.name
  : city.name?.["en-gb"] || Object.values(city.name || {})[0] || "";

const getPrice = (value: any): number | null => {
  const product = value?.recommendation?.products?.[0] || value?.products?.[0];
  const candidates = [
    value?.price?.total?.booker_currency,
    value?.price?.display?.booker_currency,
    value?.price?.base?.booker_currency,
    value?.price?.total?.accommodation_currency,
    value?.price?.display?.accommodation_currency,
    product?.price?.total?.booker_currency,
    product?.price?.display?.booker_currency,
    product?.price?.total?.accommodation_currency,
    product?.price?.display?.accommodation_currency,
  ];
  const found = candidates.find((candidate) => typeof candidate === "number" && Number.isFinite(candidate));
  return typeof found === "number" ? found : null;
};

const getCurrency = (value: any) =>
  value?.currency?.booker || value?.currency?.accommodation || value?.currency || "";

const getPhoto = (details: any): string | null => {
  const photo = details?.photos?.[0];
  const value = photo?.url;
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    return value.max300 || value.max500 || value.max1000 || value.standard || value.main || null;
  }
  return null;
};

const getBookerPlatform = () =>
  typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches
    ? "mobile"
    : "desktop";

const formatMoney = (amount: number | null, currency: string) => {
  if (amount === null) return "Price shown after availability check";
  try {
    return new Intl.NumberFormat("en", { style: "currency", currency: currency || "USD", maximumFractionDigits: 0 }).format(amount);
  } catch {
    return `${currency || ""} ${amount.toLocaleString()}`.trim();
  }
};

const BookingComHotelSearch: React.FC = () => {
  const today = new Date().toISOString().slice(0, 10);
  const [country, setCountry] = useState("ae");
  const [cityQuery, setCityQuery] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesLoaded, setCitiesLoaded] = useState(false);
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [adults, setAdults] = useState("2");
  const [rooms, setRooms] = useState("1");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [results, setResults] = useState<HotelResult[]>([]);
  const [availability, setAvailability] = useState<Record<number, LiveAvailability>>({});
  const [lookingId, setLookingId] = useState<number | null>(null);

  const selectedCity = useMemo(
    () => cities.find((city) => cityName(city).toLowerCase() === cityQuery.trim().toLowerCase()),
    [cities, cityQuery],
  );

  const loadCities = async () => {
    setCitiesLoading(true);
    setSearchError("");
    const { data, error } = await supabase.functions.invoke("booking-demand-cities", {
      body: { country },
    });
    setCitiesLoading(false);
    if (error || data?.error) {
      setSearchError(data?.error || error?.message || "Could not load destination cities.");
      return;
    }
    setCities(Array.isArray(data?.data) ? data.data : []);
    setCitiesLoaded(true);
  };

  const searchHotels = async (event: React.FormEvent) => {
    event.preventDefault();
    setSearchError("");
    setResults([]);
    setAvailability({});
    if (!checkin || !checkout || checkout <= checkin) {
      setSearchError("Choose a check-in date and a later check-out date.");
      return;
    }
    if (cityQuery.trim() && !selectedCity) {
      setSearchError(citiesLoaded
        ? "Choose a city from the suggestions, or clear the city field to search the whole country."
        : "Load city options and choose a matching suggestion, or clear the city field to search the whole country.");
      return;
    }

    setSearching(true);
    const { data, error } = await supabase.functions.invoke("booking-demand-search", {
      body: {
        country,
        city: selectedCity?.id,
        checkin,
        checkout,
        adults: Number(adults),
        rooms: Number(rooms),
        bookerCountry: "ng",
        platform: getBookerPlatform(),
      },
    });
    setSearching(false);
    if (error || data?.error) {
      setSearchError(data?.error || error?.message || "Hotel search could not be completed.");
      return;
    }
    setResults(Array.isArray(data?.data) ? data.data : []);
    if (!Array.isArray(data?.data) || data.data.length === 0) {
      setSearchError("No accommodation matched those dates. Try another date or destination.");
    }
  };

  const checkAvailability = async (hotel: HotelResult) => {
    setLookingId(hotel.id);
    setSearchError("");
    const { data, error } = await supabase.functions.invoke("booking-demand-look", {
      body: {
        accommodation: hotel.id,
        checkin,
        checkout,
        adults: Number(adults),
        rooms: Number(rooms),
        bookerCountry: "ng",
        platform: "desktop",
      },
    });
    setLookingId(null);
    if (error || data?.error) {
      setSearchError(data?.error || error?.message || "Live availability could not be retrieved.");
      return;
    }
    setAvailability((current) => ({ ...current, [hotel.id]: data as LiveAvailability }));
  };

  return (
    <section className="section-padding bg-muted/40">
      <div className="container-custom">
        <div className="max-w-3xl mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-estate-blue">Powered by Booking.com Demand API</span>
          <h2 className="font-display text-3xl md:text-4xl font-bold mt-2 mb-3">Find a place to stay</h2>
          <p className="text-muted-foreground">
            Compare accommodation options and check live prices. Booking.com securely completes the reservation;
            Bridgefort remains available to help plan the rest of your journey.
          </p>
        </div>

        <div className="bg-card border rounded-2xl shadow-sm p-5 md:p-7">
          <form onSubmit={searchHotels} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <Label htmlFor="booking-country">Destination country</Label>
              <Select value={country} onValueChange={(value) => {
                setCountry(value);
                setCityQuery("");
                setCities([]);
                setCitiesLoaded(false);
                setResults([]);
                setAvailability({});
              }}>
                <SelectTrigger id="booking-country" className="mt-1.5 h-11">
                  <SelectValue placeholder="Choose a country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((item) => <SelectItem key={item.code} value={item.code}>{item.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="booking-city">City (optional)</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="booking-city"
                  list="booking-city-options"
                  value={cityQuery}
                  onChange={(event) => setCityQuery(event.target.value)}
                  placeholder="Choose or type a city"
                  className="h-11 min-w-0"
                  maxLength={80}
                />
                <datalist id="booking-city-options">
                  {cities.map((city) => <option key={city.id} value={cityName(city)} />)}
                </datalist>
                <Button type="button" variant="outline" className="h-11 shrink-0" onClick={loadCities} disabled={citiesLoading}>
                  {citiesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Load"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {citiesLoaded ? `${cities.length} city options loaded` : "Load city options or search the selected country."}
              </p>
            </div>

            <div>
              <Label htmlFor="booking-checkin">Check-in</Label>
              <Input id="booking-checkin" type="date" min={today} value={checkin} onChange={(event) => setCheckin(event.target.value)} className="mt-1.5 h-11" required />
            </div>
            <div>
              <Label htmlFor="booking-checkout">Check-out</Label>
              <Input id="booking-checkout" type="date" min={checkin || today} value={checkout} onChange={(event) => setCheckout(event.target.value)} className="mt-1.5 h-11" required />
            </div>
            <div>
              <Label htmlFor="booking-adults">Adults</Label>
              <Select value={adults} onValueChange={setAdults}>
                <SelectTrigger id="booking-adults" className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{Array.from({ length: 10 }, (_, i) => String(i + 1)).map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="booking-rooms">Rooms</Label>
              <Select value={rooms} onValueChange={setRooms}>
                <SelectTrigger id="booking-rooms" className="mt-1.5 h-11"><SelectValue /></SelectTrigger>
                <SelectContent>{Array.from({ length: 5 }, (_, i) => String(i + 1)).map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <Button type="submit" variant="cta" className="w-full md:w-auto min-w-48" disabled={searching}>
                {searching ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Searching…</> : <><Search className="h-4 w-4 mr-2" />Search accommodation</>}
              </Button>
            </div>
          </form>

          {searchError && <p role="alert" className="mt-5 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{searchError}</p>}

          {results.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between gap-3 mb-4">
                <h3 className="font-display text-xl font-semibold">Available accommodation options</h3>
                <span className="text-xs text-muted-foreground">{results.length} results</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {results.map((hotel) => {
                  const details = hotel.details || {};
                  const name = details.name?.["en-gb"] || Object.values(details.name || {})[0] || `Accommodation ${hotel.id}`;
                  const address = details.location?.address?.["en-gb"] || Object.values(details.location?.address || {})[0] || "";
                  const price = getPrice(hotel);
                  const currency = getCurrency(hotel);
                  const photo = getPhoto(details);
                  const live = availability[hotel.id];
                  const livePrice = getPrice(live?.data);
                  const liveCurrency = getCurrency(live?.data) || currency;
                  return (
                    <article key={hotel.id} className="overflow-hidden rounded-xl border bg-background">
                      {photo && <img src={photo} alt={String(name)} loading="lazy" className="h-44 w-full object-cover" />}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-semibold leading-snug">{String(name)}</h4>
                            {address && <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3 shrink-0" />{String(address)}</p>}
                          </div>
                          {details.rating?.stars && <span className="shrink-0 text-xs font-semibold">{details.rating.stars}★</span>}
                        </div>
                        <p className="mt-3 text-sm font-semibold">{formatMoney(price, currency)}</p>
                        {details.description?.text?.["en-gb"] && <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{details.description.text["en-gb"]}</p>}
                        {!live ? (
                          <Button type="button" variant="outline" className="mt-4 w-full" onClick={() => checkAvailability(hotel)} disabled={lookingId === hotel.id}>
                            {lookingId === hotel.id ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Checking live price…</> : "Check live availability"}
                          </Button>
                        ) : (
                          <div className="mt-4 rounded-lg border p-3">
                            <p className="text-sm font-semibold">{formatMoney(livePrice, liveCurrency)}</p>
                            <p className="text-xs text-muted-foreground mt-1">Live availability returned by Booking.com for your selected dates.</p>
                            {live.redirectUrl ? (
                              <a href={live.redirectUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-estate-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-estate-darkBlue">
                                Continue to Booking.com <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            ) : (
                              <p className="mt-3 text-xs text-muted-foreground">A web booking link was not returned for this option. Please try another property.</p>
                            )}
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">
                Prices and availability can change before checkout. The final booking, payment and confirmation take place on Booking.com.
              </p>
            </div>
          )}
        </div>

        <p className="mt-5 text-sm text-muted-foreground">
          Prefer to plan flights, visas or a complete holiday package with our team? <a href="#booking" className="font-semibold text-estate-blue hover:underline">Send Bridgefort a travel enquiry.</a>
        </p>
      </div>
    </section>
  );
};

export default BookingComHotelSearch;
