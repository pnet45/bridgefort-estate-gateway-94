import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, CircleHelp, MapPin, Plane, PlayCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import TravelsBookingForm from '@/components/travels/TravelsBookingForm';
import { Button } from '@/components/ui/button';

interface DestinationGuide {
  slug: string;
  name: string;
  city: string;
  price: string;
  image: string;
  intro: string;
  highlights: string[];
  planning: string[];
  itinerary: string[];
  workProgram?: boolean;
}

const guides: DestinationGuide[] = [
  {
    slug: 'dubai', name: 'United Arab Emirates', city: 'Dubai', price: '1,850,000',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&q=85',
    intro: 'A modern city break known for striking architecture, waterfront promenades, shopping, desert experiences and family-friendly attractions. Bridgefort Travels can help you plan the trip around your dates, budget and preferred pace.',
    highlights: ['Burj Khalifa and Downtown Dubai', 'Dubai Marina and the waterfront', 'Old Dubai, souks and cultural districts', 'Desert experiences and family attractions'],
    planning: ['Confirm passport validity and the correct UAE entry or visa route for your circumstances.', 'Compare flight dates, accommodation area and transfer needs before confirming costs.', 'Treat the displayed price as an indicative starting point; final quotations depend on dates and inclusions.'],
    itinerary: ['Arrival and hotel transfer', 'City landmarks and local culture', 'Optional desert or family activity', 'Flexible departure day'],
  },
  {
    slug: 'london', name: 'United Kingdom', city: 'London', price: '2,250,000',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1400&q=85',
    intro: 'London combines world-famous landmarks, museums, theatre, shopping and easy rail connections for wider UK trips. We can help organise the flight, hotel, itinerary and visa-documentation support appropriate to your travel purpose.',
    highlights: ['Westminster and the River Thames', 'Museums, galleries and historic sites', 'West End theatre and shopping districts', 'Day-trip options beyond central London'],
    planning: ['Identify the appropriate UK visa or entry requirements before paying for non-refundable travel.', 'Choose accommodation based on transport access and the places you plan to visit.', 'Budget for local transport, attraction tickets and seasonal price changes.'],
    itinerary: ['Arrival and neighbourhood orientation', 'Historic landmarks and museums', 'Shopping, theatre or a day trip', 'Departure or onward travel'],
  },
  {
    slug: 'istanbul', name: 'Türkiye', city: 'Istanbul', price: '1,780,000',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1400&q=85',
    intro: 'Istanbul is a meeting point of cultures, with historic architecture, waterfront views, markets and distinctive food. A tailored plan can balance major sights with time to explore at your own pace.',
    highlights: ['Historic Sultanahmet district', 'Bosphorus waterfront and ferry views', 'Grand Bazaar and local markets', 'Turkish cuisine and neighbourhood walks'],
    planning: ['Check the current Turkish entry requirements for your passport and purpose of travel.', 'Plan travel time between districts and allow room for traffic or ferry schedules.', 'Confirm what is included in the quote, including transfers and guided activities.'],
    itinerary: ['Arrival and hotel check-in', 'Historic landmarks and museums', 'Bosphorus and market exploration', 'Departure or optional extension'],
  },
  {
    slug: 'cape-town', name: 'South Africa', city: 'Cape Town', price: '920,000',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=1400&q=85',
    intro: 'Cape Town offers dramatic coastal scenery, mountain views, beaches, food and cultural experiences. It suits travellers looking for a relaxed city stay with optional outdoor excursions.',
    highlights: ['Table Mountain and city viewpoints', 'V&A Waterfront', 'Cape Peninsula and coastal scenery', 'Beaches, food and local culture'],
    planning: ['Check entry requirements and any current travel advisories before departure.', 'Consider the season and weather when choosing outdoor activities.', 'Confirm tour transport, entrance fees and accommodation location in the final itinerary.'],
    itinerary: ['Arrival and waterfront visit', 'Mountain or city sightseeing', 'Coastal excursion or leisure day', 'Departure'],
  },
  {
    slug: 'bali', name: 'Indonesia', city: 'Bali', price: '1,250,000',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1400&q=85',
    intro: 'Bali is known for tropical landscapes, temples, beaches, wellness retreats and cultural experiences. A good itinerary balances transfer time with the places and activities most important to you.',
    highlights: ['Ubud and its cultural attractions', 'Temple visits and rice terraces', 'Beach areas and coastal sunsets', 'Wellness, food and nature experiences'],
    planning: ['Confirm Indonesia entry requirements and any required online authorisations before travelling.', 'Select a base that fits your interests; road transfers can take time.', 'Check activity inclusions, local transport and seasonal conditions in the quote.'],
    itinerary: ['Arrival and transfer to your selected area', 'Culture and landscape day', 'Beach, wellness or optional excursion', 'Departure'],
  },
  {
    slug: 'new-york', name: 'United States', city: 'New York', price: '2,000,000',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=1400&q=85',
    intro: 'New York offers landmark skyline views, museums, theatre, neighbourhood food and shopping. We can help you coordinate the travel arrangements and build a realistic itinerary around your visit.',
    highlights: ['Central Park and Midtown landmarks', 'Museums and cultural institutions', 'Broadway and entertainment', 'Neighbourhood food and shopping'],
    planning: ['Review the correct US visa or entry route for your nationality and travel purpose.', 'Account for airport transfers and the city’s size when planning each day.', 'Confirm flight, accommodation, insurance and attraction costs before booking.'],
    itinerary: ['Arrival and local orientation', 'Landmarks and museums', 'Neighbourhood exploration or theatre', 'Departure'],
  },
  {
    slug: 'poland', name: 'Poland', city: 'Work & Residence Enquiry', price: '6,500,000',
    image: 'https://images.unsplash.com/photo-1519197924294-4ba991a11128?w=1400&q=85',
    intro: 'Bridgefort Travels accepts enquiries about work and residence pathways connected with Poland. Opportunities, employer sponsorship, eligibility and timelines must be assessed case by case; an enquiry is not a job offer or a visa guarantee.',
    highlights: ['Work and residence pathway assessment', 'Document and application preparation guidance', 'Discussion of employer, role and contract details', 'Clear review of quoted fees and inclusions'],
    planning: ['Request the written job or employer details and verify them independently.', 'Confirm official permit requirements and all fees before making a payment.', 'Do not resign from a job or purchase non-refundable travel based on an unverified offer.'],
    itinerary: ['Initial eligibility enquiry', 'Document checklist and pathway review', 'Written quotation and verification', 'Proceed only after terms and requirements are clear'],
    workProgram: true,
  },
  {
    slug: 'czech-republic', name: 'Czech Republic', city: 'Work & Residence Enquiry', price: '6,500,000',
    image: 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=1400&q=85',
    intro: 'Enquire about potential work and residence options connected with the Czech Republic. Roles, employer details, eligibility and processing times vary, and approval remains with the relevant authorities.',
    highlights: ['Initial eligibility discussion', 'Employer and role detail review', 'Document checklist and application guidance', 'Transparent explanation of fees and stages'],
    planning: ['Ask for verifiable employer, contract and permit information.', 'Confirm the applicable requirements from official Czech and consular sources.', 'Treat any fee as subject to a written quotation and agreed terms.'],
    itinerary: ['Initial enquiry', 'Eligibility and document review', 'Written pathway and cost review', 'Next steps after verification'],
    workProgram: true,
  },
  {
    slug: 'serbia', name: 'Serbia', city: 'Work & Residence Enquiry', price: '6,500,000',
    image: 'https://images.unsplash.com/photo-1555990538-1e6c1e4c1f5d?w=1400&q=85',
    intro: 'Bridgefort Travels can discuss enquiries relating to potential work and residence pathways in Serbia. Availability depends on real employers, role requirements, documentation and official decisions.',
    highlights: ['Pathway and eligibility discussion', 'Employer and vacancy verification', 'Preparation of a document checklist', 'Review of costs, timing and responsibilities'],
    planning: ['Request the exact employer and job description in writing.', 'Verify permit and residence requirements with official sources.', 'No job, salary, permit or visa outcome should be assumed until confirmed.'],
    itinerary: ['Initial enquiry', 'Document and employer review', 'Written quotation', 'Proceed after verification'],
    workProgram: true,
  },
  {
    slug: 'romania', name: 'Romania', city: 'Work & Residence Enquiry', price: '6,500,000',
    image: 'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=1400&q=85',
    intro: 'Enquire about possible Romania work and residence routes. Any opportunity must be reviewed against current employer, permit, eligibility and consular requirements.',
    highlights: ['Eligibility and pathway review', 'Employer and contract detail checks', 'Application document guidance', 'Written fee and timeline explanation'],
    planning: ['Obtain written employer and contract information before committing funds.', 'Check current work authorisation and visa steps from official sources.', 'Processing times and outcomes are not guaranteed.'],
    itinerary: ['Initial enquiry', 'Eligibility and document checklist', 'Employer and fee verification', 'Next steps once the pathway is confirmed'],
    workProgram: true,
  },
  {
    slug: 'portugal', name: 'Portugal', city: 'Work & Residence Enquiry', price: '6,500,000',
    image: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1400&q=85',
    intro: 'Explore an enquiry about potential work or residence routes connected with Portugal. Eligibility, work opportunities and official processing requirements depend on individual circumstances and current rules.',
    highlights: ['Initial profile and eligibility review', 'Employer or opportunity details', 'Document preparation guidance', 'Written breakdown of costs and steps'],
    planning: ['Verify the employer, role and contract independently.', 'Confirm current visa and work authorisation rules through official sources.', 'Avoid relying on guaranteed-job or guaranteed-visa promises.'],
    itinerary: ['Initial enquiry', 'Profile and document review', 'Written plan and quotation', 'Proceed after verification'],
    workProgram: true,
  },
  {
    slug: 'belarus', name: 'Belarus', city: 'Work & Residence Enquiry', price: '6,500,000',
    image: 'https://images.unsplash.com/photo-1513326738677-b0c1c9e8db6d?w=1400&q=85',
    intro: 'Bridgefort Travels can record an enquiry about potential work or residence arrangements involving Belarus. Suitability and feasibility require careful checks against current official guidance and individual circumstances.',
    highlights: ['Initial enquiry and eligibility discussion', 'Review of employer and role documentation', 'Document checklist', 'Written review of fees and risks'],
    planning: ['Check current government travel advice and entry requirements before proceeding.', 'Verify all employer and permit information with reliable official sources.', 'Do not make payments until the pathway, provider and written terms are clear.'],
    itinerary: ['Initial enquiry', 'Risk and eligibility review', 'Written quotation', 'Proceed only if requirements are verified'],
    workProgram: true,
  },
  {
    slug: 'moldova', name: 'Moldova', city: 'Work & Residence Enquiry', price: '6,500,000',
    image: 'https://images.unsplash.com/photo-1562835155-7b3b4c7c6f10?w=1400&q=85',
    intro: 'Enquire about possible work and residence pathways involving Moldova. Opportunities and eligibility must be checked individually and against current official rules.',
    highlights: ['Eligibility discussion', 'Employer and vacancy checks', 'Document preparation guidance', 'Transparent costs and next steps'],
    planning: ['Request written employer details and confirm they are genuine.', 'Review official visa, work permit and residence requirements.', 'Treat advertised fees and salaries as indicative until independently verified.'],
    itinerary: ['Initial enquiry', 'Document and employer review', 'Written plan', 'Proceed after verification'],
    workProgram: true,
  },
  {
    slug: 'ukraine', name: 'Ukraine', city: 'Work & Residence Enquiry', price: '6,500,000',
    image: 'https://images.unsplash.com/photo-1561542320-9a18cd340469?w=1400&q=85',
    intro: 'Any work or travel enquiry relating to Ukraine requires a careful review of current security conditions, official travel advice, entry requirements and the exact proposed arrangement.',
    highlights: ['Initial enquiry and feasibility review', 'Current travel-advice and safety checks', 'Document and pathway review', 'Written explanation of limitations and risks'],
    planning: ['Check current official travel advice before considering travel or relocation.', 'Verify employers, permits and any proposed services independently.', 'No application should proceed until safety, eligibility and legal requirements are clear.'],
    itinerary: ['Initial enquiry', 'Safety and eligibility review', 'Document and fee assessment', 'Proceed only if verified and appropriate'],
    workProgram: true,
  },
];

const TravelDestination = () => {
  const { slug = '' } = useParams();
  const navigate = useNavigate();
  const guide = guides.find((item) => item.slug === slug);

  useEffect(() => {
    document.title = guide ? `${guide.name} Travel Guide | Bridgefort Travels` : 'Travel Guide | Bridgefort Travels';
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [guide]);

  const enquire = () => {
    document.getElementById('destination-enquiry')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!guide) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="container-custom flex flex-1 flex-col items-start justify-center gap-4 px-4 pb-16 pt-32">
          <h1 className="text-3xl font-bold">Destination guide not found</h1>
          <p className="text-muted-foreground">Choose a destination from the Bridgefort Travels page to view its guide.</p>
          <Button asChild variant="cta"><Link to="/travels">Browse destinations</Link></Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="relative pt-[88px] lg:pt-[136px]">
          <div className="relative min-h-[360px] overflow-hidden sm:min-h-[440px]">
            <img src={guide.image} alt={`${guide.name} travel destination`} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/55 to-slate-950/20" />
            <div className="container-custom relative z-10 flex min-h-[360px] flex-col justify-center py-12 text-white sm:min-h-[440px]">
              <Link to="/travels" className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/85 transition hover:text-white">
                <ArrowLeft size={16} /> All destinations
              </Link>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">Bridgefort Travels destination guide</p>
              <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl lg:text-6xl">{guide.name}</h1>
              {guide.city !== 'Work & Residence Enquiry' && <p className="mt-3 text-lg text-white/85 sm:text-xl">Explore {guide.city}</p>}
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/85 sm:text-lg">{guide.intro}</p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-md">
                  <span className="block text-xs text-white/75">Indicative starting price</span>
                  <span className="text-xl font-bold text-amber-300">₦{guide.price}</span>
                </div>
                <Button variant="cta" size="lg" onClick={enquire}>Enquire about this destination <ArrowRight size={17} className="ml-2" /></Button>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-10 sm:px-6 md:py-14 lg:px-8">
          <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
            <article className="min-w-0">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Destination overview</p>
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Plan a trip that fits you</h2>
              <p className="mb-8 leading-7 text-muted-foreground">{guide.intro}</p>

              <div className="mb-9 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <img src={guide.image} alt={`${guide.name} landmark and scenery`} className="h-56 w-full object-cover" loading="lazy" />
                  <div className="p-4"><p className="font-semibold">Destination highlights</p><p className="mt-1 text-sm leading-6 text-muted-foreground">A visual starting point for exploring {guide.name}.</p></div>
                </div>
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <img src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=900&q=80" alt="Travel planning with a map and travel essentials" className="h-56 w-full object-cover" loading="lazy" />
                  <div className="p-4"><p className="font-semibold">Build your itinerary</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Tell us your priorities so we can tailor a practical travel plan.</p></div>
                </div>
              </div>

              <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Places and experiences to consider</h2>
              <ul className="mb-9 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {guide.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 rounded-xl border border-border/70 bg-card p-4">
                    <MapPin size={18} className="mt-1 shrink-0 text-amber-600" />
                    <span className="leading-6">{highlight}</span>
                  </li>
                ))}
              </ul>

              <h2 className="mb-4 text-2xl font-bold sm:text-3xl">A simple trip-planning outline</h2>
              <ol className="mb-9 space-y-3">
                {guide.itinerary.map((step, index) => (
                  <li key={step} className="flex items-start gap-4 rounded-xl bg-muted/50 p-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-estate-blue text-sm font-bold text-white">{index + 1}</span>
                    <span className="pt-1 leading-6">{step}</span>
                  </li>
                ))}
              </ol>

              <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Important planning notes</h2>
              <ul className="mb-9 space-y-3">
                {guide.planning.map((note) => (
                  <li key={note} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 size={18} className="mt-1 shrink-0 text-estate-blue" />
                    <span className="leading-7">{note}</span>
                  </li>
                ))}
              </ul>

              <div className="rounded-2xl border border-border bg-card p-5 sm:p-7">
                <div className="flex items-start gap-3">
                  <PlayCircle className="mt-1 shrink-0 text-estate-blue" size={24} />
                  <div>
                    <h2 className="text-xl font-bold">See short videos of {guide.name}</h2>
                    <p className="mt-2 leading-7 text-muted-foreground">Explore short destination clips and travel inspiration before you decide. Video availability and content are provided by the external video platform.</p>
                    <a
                      href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${guide.name} ${guide.city === 'Work & Residence Enquiry' ? 'work and residence information' : 'travel shorts landmarks'}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-2 font-semibold text-estate-blue hover:underline"
                    >
                      Watch destination videos <ArrowRight size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </article>

            <aside className="h-fit rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7 lg:sticky lg:top-40">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-estate-blue/10 text-estate-blue"><Plane size={22} /></div>
                <div><h2 className="font-bold">Travel support</h2><p className="text-sm text-muted-foreground">Plan with a consultant</p></div>
              </div>
              <div className="mb-5 flex items-start gap-3">
                <CalendarDays size={18} className="mt-1 shrink-0 text-amber-600" />
                <div><p className="font-semibold">Dates and availability</p><p className="text-sm leading-6 text-muted-foreground">Your quote is confirmed after your dates and requirements are reviewed.</p></div>
              </div>
              <div className="mb-5 flex items-start gap-3">
                <CircleHelp size={18} className="mt-1 shrink-0 text-amber-600" />
                <div><p className="font-semibold">Clear next steps</p><p className="text-sm leading-6 text-muted-foreground">We will review your enquiry and explain the available options and required documents.</p></div>
              </div>
              <p className="mb-5 border-t border-border pt-4 text-sm leading-6 text-muted-foreground">Prices shown are indicative starting points, not a confirmed booking or guarantee of visa, job or residence approval. Final costs and availability depend on your requirements and current conditions.</p>
              <Button className="w-full" variant="cta" onClick={enquire}>Start an enquiry</Button>
              <Link to="/travels" className="mt-4 inline-flex w-full items-center justify-center text-sm font-semibold text-estate-blue hover:underline">Compare other destinations</Link>
            </aside>
          </div>
        </section>

        <div id="destination-enquiry" className="scroll-mt-36">
          <TravelsBookingForm initialPackage="Custom" initialDestination={guide.name} />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TravelDestination;
