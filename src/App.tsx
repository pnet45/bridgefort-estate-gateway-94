
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
const Profile = lazy(() => import('@/pages/Profile'));
const Buy2Sell = lazy(() => import('@/pages/Buy2Sell'));
const CreatePost = lazy(() => import('@/pages/CreatePost'));
const EditPost = lazy(() => import('@/pages/EditPost'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('@/pages/TermsOfService'));
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
const BHRealtors = lazy(() => import('@/pages/BHRealtors'));
const BHRealtorsWithdraw = lazy(() => import('@/pages/BHRealtorsWithdraw'));
const Travels = lazy(() => import('@/pages/Travels'));
const TravelBookingStatus = lazy(() => import('@/pages/TravelBookingStatus'));
const Agrovest = lazy(() => import('@/pages/Agrovest'));
const AgrovestCategoryDetail = lazy(() => import('@/pages/AgrovestCategoryDetail'));
const FiveKDailyPromo = lazy(() => import('@/pages/FiveKDailyPromo'));

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <RecaptchaProvider>
        <AuthProvider>
          <EcommerceProvider>
          <ComparisonProvider>
            <ScrollToTop />
            <div className="App flex flex-col min-h-screen w-full">
              <ErrorBoundary>
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-slate-600">Loading…</div>}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/home" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/properties/estates" element={<EstateProperties />} />
		    <Route path="/properties/estates/:id" element={<EstateDetails />} />
                    <Route path="/properties/apartments" element={<ApartmentRentals />} />
                    <Route path="/homes-sales" element={<HomesSales />} />
                    <Route path="/services" element={<Services />} />
                    <Route path="/training" element={<Training />} />
                    <Route path="/agrovest" element={<Agrovest />} />
                    <Route path="/agrovest/:slug" element={<AgrovestCategoryDetail />} />
                    <Route path="/5k-daily-promo" element={<FiveKDailyPromo />} />
                    <Route path="/travels" element={<Travels />} />
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
                    <Route path="/profile" element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    } />
                    <Route path="/bh-realtors" element={
                      <PrivateRoute>
                        <BHRealtors />
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
      </Router>
    </QueryClientProvider>
  );
}

export default App;
