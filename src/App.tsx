
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/auth';
import { EcommerceProvider } from '@/contexts/ecommerce';
import PrivateRoute from '@/components/PrivateRoute';
import ScrollToTop from '@/components/ScrollToTop';
import FloatingMessageButton from '@/components/FloatingMessageButton';
import CartSidebar from '@/components/ecommerce/CartSidebar';

// Pages
import Index from '@/pages/Index';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Properties from '@/pages/Properties';
import Services from '@/pages/Services';
import Training from '@/pages/Training';
import Career from '@/pages/Career';
import Contact from '@/pages/Contact';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import Auth from '@/pages/Auth';
import AuthCallback from '@/pages/AuthCallback';
import ResetPassword from '@/pages/ResetPassword';
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

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <EcommerceProvider>
            <ScrollToTop />
            <div className="App">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/properties" element={<Properties />} />
                <Route path="/services" element={<Services />} />
                <Route path="/training" element={<Training />} />
                <Route path="/career" element={<Career />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogPost />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route path="/auth/reset-password" element={<ResetPassword />} />
                <Route path="/buy2sell" element={<Buy2Sell />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/sitemap" element={<Sitemap />} />
                
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
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              <FloatingMessageButton />
              <CartSidebar />
            </div>
          </EcommerceProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
