import React from "react";
import CareerForm from "../components/career/CareerForm";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { PropertyProvider } from "../contexts/property";
import WhatsAppChat from "../components/WhatsAppChat";
import { CheckCircle2, FileText, Clock3 } from "lucide-react";

const ApplicationTips = () => (
  <aside className="rounded-2xl border border-border bg-card p-5 shadow-sm">
    <h2 className="text-base font-semibold text-foreground">Before you apply</h2>
    <p className="mt-1 text-sm text-muted-foreground">
      A few quick checks will help us review your application smoothly.
    </p>
    <ul className="mt-5 space-y-4 text-sm text-foreground">
      <li className="flex items-start gap-3">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-estate-blue" />
        <span>Complete the required fields with accurate contact details.</span>
      </li>
      <li className="flex items-start gap-3">
        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-estate-blue" />
        <span>Attach an up-to-date resume in PDF, DOC or DOCX format (maximum 10 MB).</span>
      </li>
      <li className="flex items-start gap-3">
        <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-estate-blue" />
        <span>Our team will contact you if your application is shortlisted.</span>
      </li>
    </ul>
  </aside>
);

const CareerApplication = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const defaultPosition = location.state?.position || "";

  return (
    <PropertyProvider>
      <div className="flex min-h-screen flex-col bg-muted/30">
        <Navbar />
        {/* Navbar is fixed: reserve its full responsive height before page content. */}
        <div className="flex-1 pt-[88px] lg:pt-[150px]">
          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
            <button
              type="button"
              className="mb-6 inline-flex min-h-10 items-center text-sm font-medium text-estate-blue transition-colors hover:text-estate-darkBlue hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-estate-blue focus-visible:ring-offset-2"
              onClick={() => navigate(-1)}
            >
              <span aria-hidden="true" className="mr-2">←</span>
              Back to Career Page
            </button>

            <div className="mb-8 max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-estate-blue">
                Careers at Bridgefort
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Apply to Join Our Team
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Take the first step towards an exciting career with Bridgefort Homes Development Ltd.
                Complete the form below and our team will be in touch.
              </p>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
              <section className="min-w-0" aria-label="Career application form">
                <CareerForm defaultPosition={defaultPosition} />
              </section>
              <div className="order-first lg:order-last">
                <ApplicationTips />
              </div>
            </div>
          </main>
        </div>
        <Footer />
        <WhatsAppChat />
      </div>
    </PropertyProvider>
  );
};

export default CareerApplication;
