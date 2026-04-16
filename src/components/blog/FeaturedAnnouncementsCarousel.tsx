import React, { useState, useEffect } from "react";
import DOMPurify from "dompurify";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

const announcementItems = [
  {
    id: "ode-omi-land-allocation-2026",
    title: "PWAN Bridgefort Delivers Again: Successful Land Allocation at Ode-Omi Estates",
    text: "PWAN Bridgefort proudly celebrates the successful physical allocation and handover of plots to clients at Precious Gardens Estate and The Ambassadors Parks and Gardens Estate, Ode-Omi, Ogun State.",
    img: "/images/allocation-1.jpg",
    fullContent: `
      <h2>PWAN Bridgefort Delivers Again: Successful Land Allocation & Possession at Ode-Omi Estates</h2>

      <p>PWAN Bridgefort Estates and Investment Ltd proudly celebrates the successful physical allocation and handover of plots to clients at two of its fast-rising developments — <strong>Precious Gardens Estate</strong> and <strong>The Ambassadors Parks and Gardens Estate</strong>, both strategically located at Ode-Omi, Ogun Waterside LGA, Ogun State, along the thriving Ibeju-Lekki Lagos–Calabar Coastal Road corridor.</p>

      <img src="/images/allocation-1.jpg" alt="Client receiving allocation documents" style="width:100%;border-radius:8px;margin:16px 0" />

      <p>The allocation event was filled with excitement, satisfaction, and a deep sense of fulfillment as clients physically stepped onto their lands, marking a major milestone in their investment journey. True to its promise, PWAN Bridgefort once again demonstrated reliability and integrity by delivering value exactly as assured.</p>

      <img src="/images/allocation-3.jpg" alt="Happy land owner at Ode-Omi" style="width:100%;border-radius:8px;margin:16px 0" />

      <p>These estates continue to gain remarkable attention and appreciation in value, driven by ongoing and projected infrastructural developments in the area. With the Lagos–Calabar Coastal Road running directly in front of the estates, improved access roads, and the unique positioning of the land between the Atlantic Ocean and the Lagos Lagoon, the location stands out as a prime investment destination with high future returns.</p>

      <img src="/images/allocation-4.jpg" alt="Plot allocation at Precious Gardens" style="width:100%;border-radius:8px;margin:16px 0" />

      <p>Representing the company at the event, the Admin/Inspection Officer, <strong>Emmanuel Etokakpan</strong>, officially presented the plots to their rightful owners, guiding them through the process and ensuring a smooth and transparent allocation experience.</p>

      <img src="/images/allocation-5.jpg" alt="Successful allocation ceremony" style="width:100%;border-radius:8px;margin:16px 0" />

      <h2>Client Testimonials</h2>

      <p><em>"I am truly impressed. Seeing my plot physically today gives me so much confidence. PWAN Bridgefort has proven to be a company that keeps its word."</em> – <strong>Mr. Adebayo</strong></p>

      <p><em>"This is a dream come true for me. The location is perfect, and I can already see the future value. I'm glad I invested early."</em> – <strong>Mrs. Okeke</strong></p>

      <img src="/images/allocation-22.jpg" alt="Proud land owner with certificate" style="width:100%;border-radius:8px;margin:16px 0" />

      <p><em>"The process was seamless from start to finish. Today's allocation has strengthened my trust in PWAN Bridgefort."</em> – <strong>Mr. Musa</strong></p>

      <p><em>"I'm excited about what is coming here. With the coastal road and developments around, this is definitely a wise investment."</em> – <strong>Mrs. Daniels</strong></p>

      <img src="/images/allocation-222.jpg" alt="Document handover at Ode-Omi" style="width:100%;border-radius:8px;margin:16px 0" />

      <p>The successful allocation further reinforces PWAN Bridgefort's commitment to transparency, client satisfaction, and delivering premium real estate opportunities. As development continues to unfold within the Ode-Omi axis, investors can remain confident that their assets are positioned for significant growth.</p>

      <p><strong>At PWAN Bridgefort Estates and Investment Ltd, we don't just sell land — we deliver value, security, and a future you can build on.</strong></p>

      <p><em>"…Rebuilding the Future."</em></p>
    `
  },
  {
    id: "customer-service-week-2025",
    title: "PWAN Bridgefort Celebrates Customer Service Week",
    text: "Exciting value-driven activities from October 6-10, 2025! Join us as we celebrate service excellence with client appreciation visits, recognition events, and special goodwill gestures to our valued investors.",
    img: "/lovable-uploads/Happy new week.png",
    fullContent: `
      <h2>PWAN Bridgefort Celebrates Customer Service Week with Exciting Value-Driven Activities</h2>
      
      <p>In line with its commitment to client satisfaction and its "customer-first" approach to real estate service delivery, PWAN Bridgefort Estates and Investment Ltd has rolled out a series of exciting and rewarding activities to commemorate this year's International Customer Service Week, holding from October 6 to 10, 2025, with the theme, "Ignite a Spark — Delivering Service Excellence!"</p>

      <p>This year's theme recognizes the energy and dedication that drive customer service excellence — "from the front desk to the inspection field, from the sales representative to the project manager, and from every interaction to every fulfilled dream of land ownership." It is a celebration of the people and processes that make every client experience exceptional.</p>

      <p>The Customer Service Week, which began over three decades ago, is a global event dedicated to celebrating the importance of customer service and the people who serve and support customers every day. Across the world, it serves as a reminder that great service builds lasting relationships, and at PWAN Bridgefort, this celebration holds a special place in the company's culture of appreciation and excellence.</p>

      <p>In a statement, PWAN Bridgefort Estates and Investment Ltd announced that this year's celebration promises to be memorable, with a lineup of engaging and appreciative activities for both clients and staff. Activities include client appreciation visits to selected subscribers, thank-you messages to loyal investors, recognition of outstanding customer service staff, and interactive sessions with management to discuss ways to further enhance customer experience.</p>

      <p>The company will also extend goodwill gestures to long-term subscribers in its estate projects, such as Hampton Court, Agbara, and other ongoing developments, appreciating their trust and continued investment with the brand.</p>

      <p>Speaking on the celebration, Mr. Emmanuel Etokakpan, the Administrative/Logistics/IT Officer of PWAN Bridgefort, noted that customer satisfaction remains the foundation of the company's growth and success.</p>

      <p>"At PWAN Bridgefort, we believe that every satisfied customer becomes a bridge to another opportunity to serve. This week is not just about celebration — it's a reaffirmation of our promise to make real estate investment seamless, trustworthy, and rewarding for every client. We celebrate our customers for their confidence in our brand, and we celebrate our team for their daily dedication to excellence," he said.</p>

      <p>Also commenting, Mrs. Raphela Essi, the Head of Legal and Client Relations, emphasized the significance of the celebration:</p>

      <p>"Our clients are at the heart of everything we do. From consultation to allocation, we ensure transparency, professionalism, and care in all our dealings. The Customer Service Week gives us an opportunity to appreciate those who make it possible — our customers and our dedicated service team."</p>

      <p>Over the years, PWAN Bridgefort Estates and Investment Ltd has continuously implemented innovative measures to enhance the customer experience. These include the introduction of flexible daily, weekly, and monthly real estate savings subscription plans, digital communication channels for seamless support, and dedicated post-purchase service teams to ensure clients are satisfied throughout their investment journey.</p>

      <p>With a clear focus on service excellence and customer trust, analysts and clients alike believe that PWAN Bridgefort Estates and Investment Ltd is well positioned to remain a leader in customer-focused real estate solutions in Nigeria.</p>

      <p><strong>📍 PWAN Bridgefort Estates & Investment Ltd</strong><br/>
      117 Wosilat Okoya Seriki Street, Eleganza Gardens Estate, opposite VGC Estate, Lekki, Lagos State<br/>
      📞 +234 803 062 4059 | 🌐 www.pwanbridgefort.ng | ✉️ info@pwanbridgefort.ng</p>

      <p><em>"…Rebuilding the Future."</em><br/>
      #CustomerServiceWeek #PWANBridgefort #ServiceExcellence #RebuildingTheFuture #CustomerAppreciation</p>
    `
  },
  {
    id: "fortress-hills-allocation-october-2025",
    title: "Fortress Hills Allocation - This October 2025",
    text: "Exciting news! Physical allocation for Fortress Hills Estate is happening this October 2025. All subscribers who have completed their payments are invited to the allocation ceremony.",
    img: "/lovable-uploads/2025-CURRENT-SUB-FORM-FORTRESS-HILLS-IKORODU-PHASE-1-&-2.pdf",
    fullContent: `
      <h2>Fortress Hills Estate - Physical Allocation This October 2025</h2>
      
      <p><strong>Dear Valued Investors,</strong></p>

      <p>We are thrilled to announce that the physical allocation of plots at <strong>Fortress Hills Estate, Ikorodu Phase 1 & 2</strong> will take place this October 2025!</p>

      <h3>Allocation Details:</h3>
      <ul>
        <li><strong>Date:</strong> Saturday, 25th October 2025</li>
        <li><strong>Time:</strong> 9:00 AM Prompt</li>
        <li><strong>Venue:</strong> Fortress Hills Estate Site, Ikorodu, Lagos State</li>
      </ul>

      <h3>What to Expect:</h3>
      <p>The allocation day will be a memorable event with the following activities:</p>
      <ul>
        <li>Physical identification and allocation of individual plots</li>
        <li>Distribution of allocation documents</li>
        <li>Estate tour and facility inspection</li>
        <li>Light refreshments for all attendees</li>
        <li>Q&A session with our property development team</li>
      </ul>

      <h3>What to Bring:</h3>
      <ul>
        <li>Valid means of identification (Driver's License, National ID, or International Passport)</li>
        <li>Your subscription receipt or payment evidence</li>
        <li>A copy of your payment schedule (if on installment)</li>
      </ul>

      <h3>About Fortress Hills Estate:</h3>
      <p>Located in the rapidly developing Ikorodu axis of Lagos, Fortress Hills Estate offers:</p>
      <ul>
        <li>Strategic location with excellent road network</li>
        <li>Proximity to major amenities (schools, hospitals, shopping centers)</li>
        <li>24-hour security and estate management</li>
        <li>Good drainage system and electricity infrastructure</li>
        <li>Recreational facilities and green spaces</li>
        <li>Approved estate layout and documentation</li>
      </ul>

      <h3>Investment Highlights:</h3>
      <p>Fortress Hills Estate represents an excellent investment opportunity with:</p>
      <ul>
        <li><strong>High ROI Potential:</strong> Property values in Ikorodu have appreciated significantly over the past years</li>
        <li><strong>Flexible Payment Plans:</strong> We offer convenient payment options for all investors</li>
        <li><strong>Instant Allocation:</strong> Your plot is ready and waiting for you</li>
        <li><strong>Secure Title:</strong> All documentation processed with Lagos State Government</li>
      </ul>

      <h3>For Enquiries:</h3>
      <p>If you have any questions or need clarification, please contact us:</p>
      <p><strong>📞 Phone:</strong> +234 803 062 4059<br/>
      <strong>✉️ Email:</strong> info@pwanbridgefort.ng<br/>
      <strong>🌐 Website:</strong> www.pwanbridgefort.ng<br/>
      <strong>📍 Office:</strong> 117 Wosilat Okoya Seriki Street, Eleganza Gardens Estate, opposite VGC Estate, Lekki, Lagos State</p>

      <p><strong>Don't miss this opportunity to claim your plot at Fortress Hills Estate!</strong></p>

      <p><em>"…Rebuilding the Future."</em><br/>
      #FortressHills #PropertyAllocation #PWANBridgefort #IkoroduRealEstate #LagosProperty #RebuildingTheFuture</p>
    `
  },
  {
    id: "precious-gardens-allocation",
    title: "Physical Allocation - Precious Gardens Estate Scheme 1",
    text: "Your plot has been successfully demarcated and ready for allocation! Allocation Day: Saturday, 20th September 2025 at 9:00 AM. Documents ready for pickup on the same day.",
    img: "/lovable-uploads/9979be2c-1112-4567-bbf9-d036d65b9a61.png",
    fullContent: `
      <h2>Physical Allocation - Precious Gardens Estate Scheme 1</h2>
      
      <p>Dear Valued Investor,</p>

      <p>We are pleased to inform you that your plot at Precious Gardens Estate Scheme 1 has been successfully demarcated and is ready for physical allocation.</p>

      <h3>Allocation Details:</h3>
      <ul>
        <li><strong>Date:</strong> Saturday, 20th September 2025</li>
        <li><strong>Time:</strong> 9:00 AM Prompt</li>
        <li><strong>Venue:</strong> Precious Gardens Estate, Scheme 1</li>
      </ul>

      <p>All allocation documents will be available for pickup on the same day. Please bring a valid means of identification and your payment receipts.</p>

      <p>We look forward to welcoming you to your new property!</p>

      <p><strong>For more information, contact:</strong><br/>
      📞 +234 803 062 4059<br/>
      ✉️ info@pwanbridgefort.ng</p>
    `
  },
  {
    id: "hiring-executives",
    title: "Join Our Team: We're Hiring Marketing & Sales Executives",
    text: "We are recruiting goal-driven and passionate Marketing and Sales Executives for immediate employment (remuneration is very attractive: basic salary and commissions).",
    img: "/lovable-uploads/e36d5fd8-2846-41e4-a03b-16f1a93f04df.png",
    fullContent: `
      <h2>Join Our Team: We're Hiring Marketing & Sales Executives</h2>
      
      <p>PWAN Bridgefort Estates and Investment Ltd is expanding and we are looking for talented individuals to join our dynamic team!</p>

      <h3>Position: Marketing & Sales Executive</h3>

      <h3>Requirements:</h3>
      <ul>
        <li>Goal-driven and passionate about real estate</li>
        <li>Excellent communication and interpersonal skills</li>
        <li>Self-motivated with a proven track record in sales</li>
        <li>Ability to work independently and as part of a team</li>
      </ul>

      <h3>Benefits:</h3>
      <ul>
        <li>Attractive basic salary</li>
        <li>Lucrative commission structure</li>
        <li>Career growth opportunities</li>
        <li>Professional development training</li>
      </ul>

      <p><strong>To apply, visit:</strong> <a href="/career">www.pwanbridgefort.ng/career</a></p>

      <p>Join us in rebuilding the future!</p>
    `
  }
];

const FeaturedAnnouncementsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedArticle, setSelectedArticle] = useState<typeof announcementItems[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Animation effects array
  const animations = [
    "animate-fade-in",
    "animate-scale-in",
    "animate-slide-in-right"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 2) % announcementItems.length);
    }, 15000); // Change slides every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const currentItems = [
    announcementItems[currentIndex],
    announcementItems[(currentIndex + 1) % announcementItems.length]
  ];

  const handleReadMore = (item: typeof announcementItems[0]) => {
    setSelectedArticle(item);
    setIsDialogOpen(true);
  };

  return (
    <>
      <section className="py-10 bg-white">
        <div className="container-custom">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Featured Announcements</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {currentItems.map((item, i) => (
              <div 
                key={item.id} 
                className={`rounded-lg overflow-hidden shadow bg-gray-50 flex flex-col transition-all ${animations[Math.floor(Math.random() * animations.length)]}`}
              >
                <div className="h-44 overflow-hidden">
                  <img 
                    src={item.img} 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/lovable-uploads/PropertyHero.png';
                    }}
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-bold text-xl text-estate-blue mb-2">{item.title}</h3>
                  <p className="text-gray-700 mb-3 flex-grow">{item.text}</p>
                  <button 
                    onClick={() => handleReadMore(item)}
                    className="self-start bg-estate-blue text-white px-4 py-2 rounded shadow hover:bg-estate-blue/90 text-sm font-medium transition-colors"
                  >
                    Read Full Article
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Slide indicators */}
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: Math.ceil(announcementItems.length / 2) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i * 2)}
                className={`w-2 h-2 rounded-full transition-all ${
                  currentIndex === i * 2 ? 'bg-estate-blue w-8' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Full Article Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <DialogTitle className="text-2xl font-bold pr-8">
                {selectedArticle?.title}
              </DialogTitle>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </DialogHeader>
          
          <ScrollArea className="max-h-[calc(90vh-120px)] px-6 pb-6">
            {selectedArticle?.img && (
              <img 
                src={selectedArticle.img} 
                alt={selectedArticle.title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedArticle?.fullContent || '', {
                ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'img', 'span', 'br', 'div'],
                ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style'],
              }) }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeaturedAnnouncementsCarousel;
