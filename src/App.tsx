
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/auth';
import { PropertyProvider } from '@/contexts/property';
import PrivateRoute from '@/components/PrivateRoute';

import Index from '@/pages/Index';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Services from '@/pages/Services';
import Properties from '@/pages/Properties';
import Contact from '@/pages/Contact';
import Blog from '@/pages/Blog';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import ResetPassword from '@/pages/ResetPassword';
import AuthCallback from '@/pages/AuthCallback';
import Dashboard from '@/pages/Dashboard';
import EditPost from '@/pages/EditPost';
import CreatePost from '@/pages/CreatePost';
import Buy2Sell from '@/pages/Buy2Sell';
import Training from '@/pages/Training';
import Career from '@/pages/Career';
import ScrollToTop from '@/components/ScrollToTop';
import FloatingMessageButton from '@/components/FloatingMessageButton';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <PropertyProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/buy2sell" element={<Buy2Sell />} />
            <Route path="/training" element={<Training />} />
            <Route path="/career" element={<Career />} />
            
            {/* Private Routes (require authentication) */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/create-post" element={<PrivateRoute><CreatePost /></PrivateRoute>} />
            <Route path="/edit-post/:id" element={<PrivateRoute><EditPost /></PrivateRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingMessageButton />
        </Router>
      </PropertyProvider>
    </AuthProvider>
  );
}

export default App;
