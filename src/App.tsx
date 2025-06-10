import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Properties from './pages/Properties';
import Services from './pages/Services';
import Buy2Sell from './pages/Buy2Sell';
import Training from './pages/Training';
import Career from './pages/Career';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import CartPage from './pages/CartPage';
import PrivateRoute from './components/PrivateRoute';
import NotFound from './pages/NotFound';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './contexts/auth';
import { PropertyProvider } from './contexts/property';
import { EcommerceProvider } from './contexts/ecommerce';
import FloatingMessageButton from './components/FloatingMessageButton';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Sitemap from './pages/Sitemap';
import Index from './pages/Index';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <EcommerceProvider>
        <PropertyProvider>
          <Router>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/home" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/properties" element={<Properties />} />
              <Route path="/services" element={<Services />} />
              <Route path="/buy2sell" element={<Buy2Sell />} />
              <Route path="/training" element={<Training />} />
              <Route path="/career" element={<Career />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<BlogPost />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/create-post" 
                element={
                  <PrivateRoute>
                    <CreatePost />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/edit-post/:id" 
                element={
                  <PrivateRoute>
                    <EditPost />
                  </PrivateRoute>
                } 
              />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/sitemap" element={<Sitemap />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <FloatingMessageButton />
          </Router>
        </PropertyProvider>
      </EcommerceProvider>
    </AuthProvider>
  );
}

export default App;
