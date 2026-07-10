
import React from "react";
import CareerForm from "../components/career/CareerForm";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { PropertyProvider } from "../contexts/property";
import WhatsAppChat from "../components/WhatsAppChat";
import { Toaster } from "@/components/ui/toaster";

// Simple sidebar example - you can expand/replace the content as needed
const Sidebar = () => (
  <aside className="bg-white border-r w-full sm:w-64 p-6 overflow-y-auto h-full">
    <div className="mb-4 font-semibold text-lg text-estate-blue">Application Tips</div>
    <ul className="text-gray-700 text-sm space-y-3">
      <li>✔️ Fill in all required fields accurately</li>
      <li>✔️ Tailor your cover letter for the role</li>
      <li>✔️ Double-check your contact info</li>
      <li>📑 Attach a clear, up-to-date resume</li>
      <li>🕑 We'll contact you if shortlisted</li>
    </ul>
  </aside>
);

const CareerApplication = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Read the defaultPosition from navigation state (set by OpenPositions)
  const defaultPosition = location.state?.position || "";

  return (
    <PropertyProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex flex-1 flex-col sm:flex-row bg-gray-50">
          <Sidebar />
          <main className="flex-1 p-4 md:p-12 overflow-y-auto">
            <button
              className="mb-4 text-estate-blue font-medium hover:underline"
              onClick={() => navigate(-1)}
            >
              &larr; Back to Career Page
            </button>
            <div className="w-full max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-bold mb-3 animate-scale-in">Apply to Join Our Team</h2>
                <p className="text-gray-600 max-w-2xl mx-auto animate-fade-in">
                  Take the first step towards an exciting career with Bridgefort Homes Development Ltd. Submit your application and we'll be in touch.
                </p>
              </div>
              <CareerForm defaultPosition={defaultPosition} />
            </div>
          </main>
        </div>
        <Footer />
        <Toaster />
        <WhatsAppChat />
      </div>
    </PropertyProvider>
  );
};

export default CareerApplication;
