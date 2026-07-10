import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Clock, XCircle, Ban, Loader2, Plane, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

interface Booking {
  id: string;
  status: string;
  status_note: string | null;
  package: string;
  destination: string | null;
  departure_date: string;
  return_date: string;
  travelers: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

const statusMeta: Record<string, { icon: React.ElementType; label: string; colour: string; bg: string }> = {
  received: { icon: Clock, label: 'Received', colour: 'text-blue-600', bg: 'bg-blue-50 border-blue-200' },
  confirmed: { icon: CheckCircle2, label: 'Confirmed', colour: 'text-green-600', bg: 'bg-green-50 border-green-200' },
  rejected: { icon: XCircle, label: 'Rejected', colour: 'text-red-600', bg: 'bg-red-50 border-red-200' },
  cancelled: { icon: Ban, label: 'Cancelled', colour: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' },
};

const TravelBookingStatus = () => {
  const { token } = useParams<{ token: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    const fetchBooking = async () => {
      const { data, error } = await supabase.rpc('get_travel_booking_by_token', { _token: token });
      if (!active) return;
      if (error || !data || (Array.isArray(data) && data.length === 0)) {
        setNotFound(true);
      } else {
        setBooking(Array.isArray(data) ? data[0] : data);
      }
      setLoading(false);
    };
    fetchBooking();
    const t = setInterval(fetchBooking, 15000);
    return () => { active = false; clearInterval(t); };
  }, [token]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 section-padding bg-gradient-to-br from-muted/40 to-background">
        <div className="container-custom max-w-3xl">
          <Link to="/travels" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft size={16} /> Back to Travels
          </Link>

          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Loading booking…</p>
            </div>
          ) : notFound || !booking ? (
            <div className="bg-card border rounded-2xl p-10 text-center">
              <h1 className="font-display text-2xl font-bold mb-2">Booking not found</h1>
              <p className="text-muted-foreground mb-6">This booking link is invalid or has expired.</p>
              <Button asChild variant="cta"><Link to="/travels">Submit a new enquiry</Link></Button>
            </div>
          ) : (() => {
            const meta = statusMeta[booking.status] || statusMeta.received;
            const Icon = meta.icon;
            return (
              <div className="bg-card border rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-gradient-to-br from-estate-darkBlue to-estate-blue text-white p-8">
                  <div className="flex items-center gap-3 mb-2">
                    <Plane size={24} />
                    <span className="text-sm uppercase tracking-wider opacity-80">Bridgefort Travels</span>
                  </div>
                  <h1 className="font-display text-3xl md:text-4xl font-bold">Booking Status</h1>
                  <p className="opacity-85 mt-2">Reference: <span className="font-mono">{booking.id.slice(0, 8)}</span></p>
                </div>

                <div className="p-8">
                  <div className={`flex items-start gap-4 rounded-xl border p-5 mb-8 ${meta.bg}`}>
                    <Icon className={`shrink-0 ${meta.colour}`} size={32} />
                    <div className="flex-1">
                      <h2 className={`font-display text-xl font-bold ${meta.colour}`}>{meta.label}</h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        Last updated {new Date(booking.updated_at).toLocaleString()}
                      </p>
                      {booking.status_note && (
                        <p className="mt-3 text-sm bg-white/60 rounded-lg p-3 border">{booking.status_note}</p>
                      )}
                      {booking.status === 'received' && (
                        <p className="mt-3 text-sm text-muted-foreground">
                          A Bridgefort consultant is reviewing your enquiry and will confirm within 24 hours.
                        </p>
                      )}
                      {booking.status === 'confirmed' && (
                        <p className="mt-3 text-sm text-green-700">
                          Your trip is confirmed. Our consultant will reach out with payment & travel documents.
                        </p>
                      )}
                    </div>
                  </div>

                  <h3 className="font-display text-lg font-semibold mb-3">Trip details</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-sm">
                    <div><dt className="text-muted-foreground">Traveler</dt><dd className="font-medium">{booking.name}</dd></div>
                    <div><dt className="text-muted-foreground">Email</dt><dd className="font-medium">{booking.email}</dd></div>
                    <div><dt className="text-muted-foreground">Package</dt><dd className="font-medium">{booking.package}</dd></div>
                    <div><dt className="text-muted-foreground">Destination</dt><dd className="font-medium">{booking.destination || '—'}</dd></div>
                    <div><dt className="text-muted-foreground">Departure</dt><dd className="font-medium">{booking.departure_date}</dd></div>
                    <div><dt className="text-muted-foreground">Return</dt><dd className="font-medium">{booking.return_date}</dd></div>
                    <div><dt className="text-muted-foreground">Travelers</dt><dd className="font-medium">{booking.travelers}</dd></div>
                    <div><dt className="text-muted-foreground">Submitted</dt><dd className="font-medium">{new Date(booking.created_at).toLocaleDateString()}</dd></div>
                  </dl>

                  <div className="mt-8 pt-6 border-t flex flex-wrap gap-3">
                    <Button asChild variant="cta"><Link to="/travels">Plan another trip</Link></Button>
                    <Button asChild variant="outline"><Link to="/contact">Contact a consultant</Link></Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TravelBookingStatus;
