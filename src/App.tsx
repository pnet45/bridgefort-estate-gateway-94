
import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth';
import { EcommerceProvider } from '@/contexts/ecommerce';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';

const RECAPTCHA_V3_KEY = (import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY as string | undefined) || '';
const RecaptchaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) =>
  RECAPTCHA_V3_KEY ? (
    <GoogleReCaptchaProvider
      reCaptchaKey={RECAPTCHA_V3_KEY}
      scriptProps={{ async: true, defer: true, appendTo: 'head' }}
    >
      {children}
    </GoogleReCaptchaProvider>
  ) : (
    <>{children}</>
  );
import PrivateRoute from '@/components/PrivateRoute';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import ScrollToTop from '@/components/ScrollToTop';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import CartSidebar from '@/components/ecommerce/CartSidebar';
import GlobalFloatingWidgets from '@/components/GlobalFloatingWidgets';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { NotificationModalHost } from '@/components/notifications/NotificationModalHost';
import { ComparisonProvider } from '@/contexts/comparison/ComparisonContext';
import ComparisonTray from '@/components/properties/ComparisonTray';

const Index = lazy(() => import('@/pages/Index'));
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Properties = lazy(() => import('@/pages/Properties'));
const EstateProperties = lazy(() => import('@/pages/EstateProperties'));
const EstateDetails = lazy(() => import('@/pages/EstateDetails'));
const ApartmentRentals = lazy(() => import('@/pages/ApartmentRentals'));
const Services = lazy(() => import('@/pages/Services'));
const Training = lazy(() => import('@/pages/Training'));
const Career = lazy(() => import('@/pages/Career'));
const CareerApplication = lazy(() => import('@/pages/CareerApplication'));
const Contact = lazy(() => import('@/pages/Contact'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const Auth = lazy(() => import('@/pages/Auth'));
const AuthCallback = lazy(() => import('@/pages/AuthCallback'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));
const OTPResetPassword = lazy(() => import('@/pages/OTPResetPassword'));
const HomesSales = lazy(() => import('@/pages/HomesSales'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const StaffWorkHub = lazy(() => import('@/pages/StaffWorkHub'));
const Profile = lazy(() => import('@/pages/Profile'));
const Buy2Sell = lazy(() => import('@/pages/Buy2Sell'));
const CreatePost = lazy(() => import('@/pages/CreatePost'));
const EditPost = lazy(() => import('@/pages/EditPost'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
const BMCPartnerAgreement = lazy(() => import('@/pages/BMCPartnerAgreement'));
const BMCPrivacyNotice = lazy(() => import('@/pages/BMCPrivacyNotice'));
const Sitemap = lazy(() => import('@/pages/Sitemap'));
const NDPP = lazy(() => import('@/pages/NDPP'));
const BridgefortMails = lazy(() => import('@/pages/BridgefortMails'));
const AdminAuth = lazy(() => import('@/pages/AdminAuth'));
const AdminConsole = lazy(() => import('@/pages/AdminConsole'));
const Listings = lazy(() => import('@/pages/Listings'));
const ListingDetails = lazy(() => import('@/pages/ListingDetails'));
const MyListings = lazy(() => import('@/pages/MyListings'));
const ListingFormPage = lazy(() => import('@/pages/ListingFormPage'));
const BridgefortRealtorsAuth = lazy(() => import('@/pages/BridgefortRealtorsAuth'));
const AnnouncementArticle = lazy(() => import('@/pages/AnnouncementArticle'));
const LocationsIndex = lazy(() => import('@/pages/LocationsIndex'));
const LocationLanding = lazy(() => import('@/pages/LocationLanding'));
const BMCPartnerHub = lazy(() => import('@/pages/BMCPartnerHub'));
const BMC = lazy(() => import('@/pages/BMC'));
const BHRealtorsWithdraw = lazy(() => import('@/pages/BHRealtorsWithdraw'));
const Travels = lazy(() => import('@/pages/Travels'));
const TravelDestination = lazy(() => import('@/pages/TravelDestination'));
const TravelBookingStatus = lazy(() => import('@/pages/TravelBookingStatus'));
const Agrovest = lazy(() => import('@/pages/Agrovest'));
const AgrovestCategoryDetail = lazy(() => import('@/pages/AgrovestCategoryDetail'));
const FiveKDailyPromo = lazy(() => import('@/pages/FiveKDailyPromo'));
const Gallery = lazy(() => import('@/pages/Gallery'));

import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Keep database-backed page data visible during navigation and brief
      // network interruptions; table-specific Realtime listeners invalidate
      // only the dataset that actually changed.
      // Keep fetched records mounted while a background refresh runs. Realtime
      // subscriptions and successful mutations invalidate only affected keys;
      // focus/reconnect also revalidate stale data without blanking the page.
      staleTime: 5 * 60 * 1000,
      gcTime: 24 * 60 * 60 * 1000,
      // Native file pickers temporarily background mobile browsers. Avoid a global refetch on return.
      // Targeted mutations and Realtime invalidations refresh only changed records.
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
      placeholderData: (previousData) => previousData,
      retry: 1,
      networkMode: 'online',
    },
  },
});

function AppLayout() {
  const location = useLocation();

  // Google Analytics — fire a page_view on every client-side route change (SPA)
  useEffect(() => {
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag === 'function') {
      w.gtag('event', 'page_view', { page_path: location.pathname + location.search });
    }
  }, [location.pathname, location.search]);

  return (
    <QueryClientProvider client={queryClient}>
      <RecaptchaProvider>
        <AuthProvider>
          <EcommerceProvider>
            <ComparisonProvider>
              <ScrollToTop />
              <div className="App flex flex-col min-h-screen w-full">
              <ErrorBoundary>
                <Suspense fallback={
                  <div className="mx-auto w-full max-w-7xl flex-1 space-y-6 px-4 py-8" role="status" aria-label="Loading page">
                    <div className="h-8 w-2/5 animate-pulse rounded-lg bg-muted" />
                    <div className="h-4 w-3/5 animate-pulse rounded bg-muted/80" />
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {[0, 1, 2].map((item) => (
                        <div key={item} className="space-y-3 rounded-xl border border-border p-4">
                          <div className="aspect-[16/9] animate-pulse rounded-lg bg-muted" />
                          <div className="h-4 w-4/5 animate-pulse rounded bg-muted" />
                          <div className="h-3 w-full animate-pulse rounded bg-muted/80" />
                          <div className="h-3 w-2/3 animate-pulse rounded bg-muted/80" />
                        </div>
                      ))}
                    </div>
                    <span className="sr-only">Loading page content…</span>
                  </div>
                }>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/properties/estates" element={<EstateProperties />} />
		    <Route path="/properties/estates/:id" element={<EstateDetails />} />
                    <Route path="/properties/apartments" element={<ApartmentRentals />} />
                    <Route path="/homes-sales" element={<HomesSales />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/training" element={<Training />} />
                    <Route path="/agrovest" element={<Agrovest />} />
                    <Route path="/agrovest/:slug" element={<AgrovestCategoryDetail />} />
                    <Route path="/5k-daily-promo" element={<FiveKDailyPromo />} />
                    <Route path="/travels" element={<Travels />} />
                    <Route path="/travels/destination/:slug" element={<TravelDestination />} />
                    <Route path="/travels/booking/:token" element={<TravelBookingStatus />} />
                    <Route path="/career" element={<Career />} />
                    <Route path="/career/apply" element={<CareerApplication />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogPost />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/bridgefort-realtors-login" element={<BridgefortRealtorsAuth />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/auth/reset-password" element={<ResetPassword />} />
                    <Route path="/auth/otp-reset" element={<OTPResetPassword />} />
                    <Route path="/listings" element={<Listings />} />
                    <Route path="/listings/my" element={<PrivateRoute><MyListings /></PrivateRoute>} />
                    <Route path="/listings/new" element={<PrivateRoute><ListingFormPage /></PrivateRoute>} />
                    <Route path="/listings/edit/:id" element={<PrivateRoute><ListingFormPage /></PrivateRoute>} />
                    <Route path="/listings/:id" element={<ListingDetails />} />
                    <Route path="/announcements/:id" element={<AnnouncementArticle />} />
                    <Route path="/locations" element={<LocationsIndex />} />
                    <Route path="/locations/:slug" element={<LocationLanding />} />
                    <Route path="/buy2sell" element={<Buy2Sell />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/payment-success" element={<PaymentSuccess />} />
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                    <Route path="/terms-of-service" element={<TermsOfService />} />
                    <Route path="/bmc" element={<BMC />} />
                    <Route path="/bmc-partner-agreement" element={<BMCPartnerAgreement />} />
                    <Route path="/bmc-privacy-notice" element={<BMCPrivacyNotice />} />
                    <Route path="/sitemap" element={<Sitemap />} />
                    <Route path="/NDPP" element={<NDPP />} />
                    <Route path="/admin-login" element={<AdminAuth />} />
                    <Route path="/admin-console" element={
                      <PrivateRoute>
                        <AdminConsole />
                      </PrivateRoute>
                    } />
                    {/* Protected Routes */}
                    <Route path="/dashboard" element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    } />
                    <Route path="/staff-workspace" element={
                      <PrivateRoute>
                        <StaffWorkHub />
                      </PrivateRoute>
                    } />
                    <Route path="/profile" element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    } />
                    {/* BMC is now the unified partner destination. Keep the legacy BH-Realtors
                        workspace reachable without changing existing membership or referral records. */}
                    <Route path="/bh-realtors" element={
                      <PrivateRoute>
                        <BMCPartnerHub />
                      </PrivateRoute>
                    } />
                    <Route path="/bmc-partner-hub" element={
                      <PrivateRoute>
                        <BMCPartnerHub />
                      </PrivateRoute>
                    } />
                    <Route path="/bh-realtors/legacy" element={
                      <PrivateRoute>
                        <Navigate to="/bmc-partner-hub#legacy-bh-membership" replace />
                      </PrivateRoute>
                    } />
                    <Route path="/bh-realtors/withdraw" element={
                      <PrivateRoute>
                        <BHRealtorsWithdraw />
                      </PrivateRoute>
                    } />
                    <Route path="/create-post" element={
                      <PrivateRoute>
                        <CreatePost />
                      </PrivateRoute>
                    } />
                    <Route path="/edit-post/:id" element={
                      <PrivateRoute>
                        <EditPost />
                      </PrivateRoute>
                    } />
                    <Route path="/bridgefortmails" element={
                      <PrivateRoute>
                        <BridgefortMails />
                      </PrivateRoute>
                    } />
                    
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
              
              <GlobalFloatingWidgets />
              <CartSidebar />
              <ScrollToTopButton />

              {/* Unified notification system — mounted once so every route is covered.
                  See src/lib/notifications/notify.ts for the dispatcher. */}
              <ShadcnToaster />
              <SonnerToaster />
              <NotificationModalHost />
              <ComparisonTray />
            </div>
          </ComparisonProvider>
        </EcommerceProvider>
      </AuthProvider>
    </RecaptchaProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;
