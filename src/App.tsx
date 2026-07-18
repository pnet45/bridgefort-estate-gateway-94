
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
import ScrollToTop from '@/components/ScrollToTop';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import CartSidebar from '@/components/ecommerce/CartSidebar';
import GlobalFloatingWidgets from '@/components/GlobalFloatingWidgets';

// Pages
import Index from '@/pages/Index';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Properties from '@/pages/Properties';
import EstateProperties from '@/pages/EstateProperties';
import ApartmentRentals from '@/pages/ApartmentRentals';
import Services from '@/pages/Services';
import Training from '@/pages/Training';
import Career from '@/pages/Career';
import CareerApplication from '@/pages/CareerApplication';
import Contact from '@/pages/Contact';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/AuthCallback';
import ResetPassword from '@/pages/ResetPassword';
import OTPResetPassword from '@/pages/OTPResetPassword';
import HomesSales from '@/pages/HomesSales';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Buy2Sell from '@/pages/Buy2Sell';
import CreatePost from '@/pages/CreatePost';
import EditPost from '@/pages/EditPost';
import CartPage from '@/pages/CartPage';
import PaymentSuccess from '@/pages/PaymentSuccess';
import NotFound from '@/pages/NotFound';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsOfService from '@/pages/TermsOfService';
import Sitemap from '@/pages/Sitemap';
import NDPP from '@/pages/NDPP';
import BridgefortMails from '@/pages/BridgefortMails';
import AdminAuth from '@/pages/AdminAuth';
import AdminConsole from '@/pages/AdminConsole';
import Listings from '@/pages/Listings';
import ListingDetails from '@/pages/ListingDetails';
import MyListings from '@/pages/MyListings';
import ListingFormPage from '@/pages/ListingFormPage';
import BridgefortRealtorsAuth from '@/pages/BridgefortRealtorsAuth';
import AnnouncementArticle from '@/pages/AnnouncementArticle';
import LocationsIndex from '@/pages/LocationsIndex';
import LocationLanding from '@/pages/LocationLanding';
import BHRealtors from '@/pages/BHRealtors';
import BHRealtorsWithdraw from '@/pages/BHRealtorsWithdraw';
import Travels from '@/pages/Travels';
import TravelBookingStatus from '@/pages/TravelBookingStatus';
import Agrovest from '@/pages/Agrovest';
import AgrovestCategoryDetail from '@/pages/AgrovestCategoryDetail';
import FiveKDailyPromo from '@/pages/FiveKDailyPromo';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <RecaptchaProvider>
        <AuthProvider>
          <EcommerceProvider>
            <ScrollToTop />
            <div className="App flex flex-col min-h-screen w-full">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/properties/estates" element={<EstateProperties />} />
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
              
              <GlobalFloatingWidgets />
              <CartSidebar />
              <ScrollToTopButton />
            </div>
          </EcommerceProvider>
        </AuthProvider>
        </RecaptchaProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
