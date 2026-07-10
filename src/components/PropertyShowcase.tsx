
import React from 'react';
import { Download, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { AspectRatio } from './ui/aspect-ratio';

const PropertyShowcase = () => {
  const handleDownload = () => {
    // Replace with actual PDF URL when available
    const pdfUrl = "./lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf";
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = "fortress-hills-subscription-form.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="container-custom py-16">
      <div className="flex flex-col md:flex-row items-start gap-8">
        <div className="w-full md:w-1/2">
          <div className="rounded-xl overflow-hidden border-4 border-estate-blue w-full max-w-2xl mx-auto">
            <AspectRatio ratio={16/9}>
              <img 
                src="/lovable-uploads/731e5107-538f-41a5-9af8-5b864bd49831.png"
                alt="Fortress Hills Estate"
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>
        </div>
        
        <div className="w-full md:w-1/2 space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-estate-blue">Fortress Hills Estate 🏡</h2>
            <p className="text-xl font-medium">Exclusive Land Deals in Imota, Ikorodu, Lagos!</p>
            <p className="text-lg">Subscribe to our formidable estate at Fortress Hills with our unbeatable Price!</p>
            
            <div className="flex items-center gap-2 text-lg">
              <MapPin className="text-estate-blue" />
              <p>Imota, Ikorodu, Lagos</p>
            </div>
            
            <p className="font-medium">📜 Title: Survey Plan & Deed</p>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-2xl font-bold text-estate-red mb-4">PRICE ALERT</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-semibold">PHASE 1</p>
                  <p className="text-xl font-bold">₦4.0M</p>
                </div>
                <div>
                  <p className="font-semibold">PHASE 2</p>
                  <p className="text-xl font-bold">₦3.5M</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">WHY INVEST IN THE FORTRESS HILLS ESTATES?</h3>
              <ul className="list-none space-y-2">
                <li>✓ Rapidly Developing Area – Prime location with high appreciation potential.</li>
                <li>✓ Secure Investment – Comes with Deed of Assignment & Survey Plan.</li>
                <li>✓ Flexible Payment Plan – Invest with ease and grow your wealth effortlessly.</li>
                <li>✓ Secure your plot today at Fortress Hills and enjoy our promo offer!</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">🛣️ STRATEGIC LOCATION & LANDMARKS</h3>
              <ul className="list-none grid grid-cols-2 gap-2">
                <li>✓ Caleb University</li>
                <li>✓ Imota Palace</li>
                <li>✓ Lagos State University of Science & Technology</li>
                <li>✓ Ikorodu-Epe Expressway</li>
                <li>✓ Caleb Powerplant</li>
                <li>✓ Agbowa Market</li>
                <li>✓ Sagamu Road</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">🏗️ ESTATE FEATURES</h3>
              <ul className="list-none grid grid-cols-2 gap-2">
                <li>✓ Gated Community 🏘️</li>
                <li>✓ Security & Surveillance 🔒</li>
                <li>✓ Green Parks & Recreation 🌳</li>
                <li>✓ Modern Road Network 🛣️</li>
                <li>✓ WiFi Connectivity 📶</li>
                <li>✓ Shopping & Commercial Hubs 🏬</li>
              </ul>
            </div>

            <div className="bg-estate-blue bg-opacity-5 p-4 rounded-lg space-y-4">
              <p className="font-semibold">📢 Don't Miss This Opportunity!</p>
              <p>Secure your dream property now with Bridgefort Homes Development Ltd.</p>
              
              <div>
                <p className="font-medium">📞 Call/WhatsApp: For Further Inquiries & Site Inspection</p>
                <p className="font-medium">💳 Payments To: Zenith Bank – Bridgefort Homes Development Ltd</p>
                <p className="font-medium">Account Number: 1310702860</p>
              </div>
              
              <div>
                <p className="font-medium">Follow us for updates:</p>
                <p>Instagram | Facebook | YouTube | TikTok: @pwanbridgefort.official</p>
              </div>
              
              <p className="font-bold text-estate-blue">Your Future Starts Here – Invest in Fortress Hills Today!</p>
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleDownload}
                className="bg-estate-blue hover:bg-estate-darkBlue text-white w-full md:w-auto"
              >
                <Download className="mr-2" />
                Download Subscription Form
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyShowcase;
