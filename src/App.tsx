
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Properties from "./pages/Properties";
import Services from "./pages/Services";
import Buy2Sell from "./pages/Buy2Sell";
import Contact from "./pages/Contact";
import Training from "./pages/Training";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import FloatingMessageButton from "./components/FloatingMessageButton";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import BlogDetail from "./components/blog/BlogDetail";

// Create a client
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster />
    <Sonner />
    <BrowserRouter>
      <ScrollToTop />
      <FloatingMessageButton />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/services" element={<Services />} />
        {/* Updated Buy2Sell route title */}
        <Route path="/buy2sell" element={<Buy2Sell />} />
        <Route path="/training" element={<Training />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/contact" element={<Contact />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
