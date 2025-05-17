
import React, { useEffect, useState } from 'react';
import { 
  FacebookIcon, 
  TwitterIcon, 
  LinkedinIcon, 
  Share2Icon,
  ArrowLeft
} from 'lucide-react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import Navbar from '../Navbar';
import Footer from '../Footer';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: number | string;
  title: string;
  summary?: string;
  content: string;
  image: string;
  author: string;
  date: string;
  category: string;
  authorImage?: string;
  excerpt?: string;
}

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Simulating API call to get blog post details
    const fetchBlogPost = () => {
      setLoading(true);
      
      // This would be replaced with an actual API call
      setTimeout(() => {
        const blogPosts: BlogPost[] = [
          {
            id: 1,
            title: "Understanding Property Value Appreciation in Lagos",
            summary: "Learn about the factors driving property value growth in Lagos and how to identify high-potential areas for investment.",
            content: `
              <h2>The Lagos Real Estate Boom</h2>
              <p>Lagos continues to be one of the fastest-growing real estate markets in Africa. Property values in prime areas have seen consistent appreciation over the past decade, making it an attractive destination for investors. This growth is driven by several key factors:</p>
              
              <ul>
                <li><strong>Population Growth:</strong> As Africa's most populous city, Lagos sees an influx of approximately 600,000 new residents yearly, creating constant demand for housing.</li>
                <li><strong>Limited Land Supply:</strong> With geographical constraints between the Atlantic Ocean and lagoons, developable land is scarce, particularly in desirable areas.</li>
                <li><strong>Infrastructure Development:</strong> Government investments in roads, bridges, and public transportation have significantly improved accessibility to previously remote areas.</li>
                <li><strong>Foreign Investment:</strong> International investors recognize the potential for high returns, bringing additional capital into the market.</li>
              </ul>
              
              <h2>High-Potential Growth Areas</h2>
              <p>While established areas like Ikoyi, Victoria Island, and Lekki Phase 1 continue to command premium prices, savvy investors are looking toward emerging locations:</p>
              
              <ol>
                <li><strong>Ibeju-Lekki:</strong> The development of the Lekki Free Trade Zone, Dangote Refinery, and Lagos Deep Sea Port has transformed this once-remote area into a hotbed for investment.</li>
                <li><strong>Epe:</strong> With improved road networks and its proximity to Lagos State University, Epe has seen property values rise by over 300% in specific locations over five years.</li>
                <li><strong>Sangotedo and Ajah:</strong> These areas continue to develop as residential hubs with improving infrastructure and amenities.</li>
              </ol>
              
              <h2>Investment Strategies for Maximum Appreciation</h2>
              <p>To maximize returns on Lagos real estate investments, consider these approaches:</p>
              
              <ul>
                <li><strong>Early Entry:</strong> Identify areas slated for major infrastructure projects and invest before development begins.</li>
                <li><strong>Land Banking:</strong> Purchasing undeveloped land in strategic locations can yield significant returns as development reaches these areas.</li>
                <li><strong>Buy-to-Let:</strong> The rental market remains strong, with annual rental yields ranging from 4-8% in prime residential areas.</li>
                <li><strong>Commercial Conversions:</strong> Acquiring residential properties in areas transitioning to commercial use can result in substantial valuation increases.</li>
              </ul>
              
              <h2>Risk Factors to Consider</h2>
              <p>Despite the promising outlook, investors should be aware of potential challenges:</p>
              
              <ul>
                <li><strong>Title Documentation:</strong> Ensure properties have clean, verifiable titles like Certificates of Occupancy.</li>
                <li><strong>Regulatory Changes:</strong> Stay informed about zoning regulations and building codes that may affect development potential.</li>
                <li><strong>Infrastructure Gaps:</strong> Some rapidly growing areas still lack essential services like water, electricity, and waste management.</li>
                <li><strong>Market Volatility:</strong> Economic factors can impact property values, particularly in the luxury segment.</li>
              </ul>
              
              <h2>Conclusion</h2>
              <p>Lagos real estate continues to offer significant opportunities for value appreciation when approached with research and strategic planning. By identifying growth drivers, focusing on emerging areas, and managing risk factors, investors can position themselves to benefit from the city's ongoing development and urbanization.</p>
              
              <p>At PWAN Bridgefort Property Managers, we specialize in identifying high-potential investment opportunities across Lagos and beyond. Contact us to learn how we can help you navigate this dynamic market.</p>
            `,
            image: "/lovable-uploads/5a69cf4b-e9ca-477d-bf00-2ac6fa768177.jpg",
            author: "Dalvin Silva, PhD",
            date: "May 10, 2023",
            category: "Real Estate Insights",
            authorImage: "/lovable-uploads/Dalvin-Silva-MD.png"
          },
          {
            id: 2,
            title: "5 Essential Steps to Secure Your Real Estate Investment",
            summary: "Protect your property investment with these critical steps every investor should take.",
            content: `
              <h2>Protecting Your Real Estate Investment</h2>
              <p>Real estate remains one of the most reliable long-term investments, but securing your investment requires careful planning and due diligence. Here are five essential steps to ensure your property investment is protected:</p>
              
              <h3>1. Comprehensive Due Diligence</h3>
              <p>Before committing to any property purchase, conduct thorough research including:</p>
              <ul>
                <li><strong>Title Verification:</strong> Ensure the property has clean title documents, free from encumbrances or disputes.</li>
                <li><strong>Survey Confirmation:</strong> Verify property boundaries with an official survey to prevent future boundary disputes.</li>
                <li><strong>Documentation Review:</strong> Have a qualified legal professional review all documents, including Certificates of Occupancy, approved building plans, and tax records.</li>
              </ul>
              
              <h3>2. Proper Legal Frameworks</h3>
              <p>Establishing the right legal structure for your investment provides protection and tax advantages:</p>
              <ul>
                <li><strong>Ownership Structure:</strong> Consider whether individual ownership, joint ventures, or creating a company is most appropriate for your situation.</li>
                <li><strong>Comprehensive Contracts:</strong> Use professionally drafted purchase agreements, deeds, and development contracts.</li>
                <li><strong>Investment Protection:</strong> For partnerships or group investments, clear documentation of ownership percentages and responsibilities is essential.</li>
              </ul>
              
              <h3>3. Insurance Coverage</h3>
              <p>Adequate insurance protects against unforeseen risks:</p>
              <ul>
                <li><strong>Property Insurance:</strong> Coverage against fire, natural disasters, and structural damage.</li>
                <li><strong>Liability Insurance:</strong> Protection if someone is injured on your property.</li>
                <li><strong>Title Insurance:</strong> Guards against unforeseen title defects that could threaten ownership.</li>
                <li><strong>Rental Income Protection:</strong> For investment properties, insurance that covers loss of rental income during repairs.</li>
              </ul>
              
              <h3>4. Professional Property Management</h3>
              <p>Effective management preserves and enhances property value:</p>
              <ul>
                <li><strong>Regular Maintenance:</strong> Preventive maintenance saves money by addressing issues before they become costly problems.</li>
                <li><strong>Tenant Screening:</strong> For rental properties, thorough tenant screening reduces risks of payment issues and property damage.</li>
                <li><strong>Compliance Management:</strong> Staying current with local regulations, tax obligations, and permits.</li>
              </ul>
              
              <h3>5. Diversification Strategy</h3>
              <p>Spreading risk across different property types and locations:</p>
              <ul>
                <li><strong>Property Type Mix:</strong> Consider balancing residential, commercial, and land investments based on your risk tolerance.</li>
                <li><strong>Geographic Diversification:</strong> Invest across different neighborhoods or cities to reduce impact of localized market downturns.</li>
                <li><strong>Investment Timing:</strong> Staggering purchases to avoid committing all capital during market peaks.</li>
              </ul>
              
              <h2>The Role of Professional Guidance</h2>
              <p>While these steps provide a foundation for securing your real estate investments, professional guidance is invaluable. Engaging experienced real estate consultants, legal advisors, and property managers helps navigate complex aspects of property investment and identify opportunities while mitigating risks.</p>
              
              <p>At PWAN Bridgefort Property Managers, we provide comprehensive investment advisory services to help you not only secure your investments but maximize their potential. Our team of experts can guide you through each step of the process, from property selection to ongoing management.</p>
              
              <h2>Conclusion</h2>
              <p>Securing real estate investments requires diligence, proper legal structuring, adequate insurance, effective management, and strategic diversification. By following these essential steps and leveraging professional expertise, investors can protect their assets while positioning themselves for long-term growth and returns.</p>
            `,
            image: "/lovable-uploads/b006d931-462b-4646-97c9-0b2f3bc1d210.jpg",
            author: "Augustin Owunmere",
            date: "June 15, 2023",
            category: "Investment Tips",
            authorImage: "/lovable-uploads/AUGUSTIN-OWUNMERE.png"
          },
          {
            id: 3,
            title: "PWAN Bridgefort Launches New Estate in Ibeju-Lekki",
            summary: "Explore our newest luxury development with premium amenities and investment potential.",
            content: `
              <h2>PWAN Bridgefort Unveils Prestigious New Estate in Ibeju-Lekki</h2>
              <p>PWAN Bridgefort Property Managers is proud to announce the launch of our newest premium development, Fortress Heights Estate, located in the rapidly developing Ibeju-Lekki area of Lagos.</p>
              
              <h3>Strategic Location</h3>
              <p>Fortress Heights Estate is strategically positioned to benefit from the area's explosive growth, situated just:</p>
              <ul>
                <li>15 minutes from the Lekki Free Trade Zone</li>
                <li>20 minutes from Dangote Refinery</li>
                <li>25 minutes from the upcoming Lagos International Airport</li>
                <li>30 minutes from the Lagos Deep Sea Port</li>
              </ul>
              
              <p>This prime location places residents at the center of what industry experts have called "New Lagos," the emerging economic and industrial hub that promises to transform the region.</p>
              
              <h3>World-Class Amenities</h3>
              <p>Fortress Heights Estate has been designed to deliver an exceptional living experience with amenities that include:</p>
              <ul>
                <li><strong>Infrastructure:</strong> Paved roads, drainage systems, underground electrical wiring</li>
                <li><strong>Security:</strong> Perimeter fencing, 24/7 security personnel, CCTV surveillance</li>
                <li><strong>Leisure:</strong> Recreational parks, fitness center, swimming pool</li>
                <li><strong>Utilities:</strong> Central water system, sustainable power solutions</li>
                <li><strong>Community:</strong> Shopping complex, educational facilities, healthcare center</li>
              </ul>
              
              <h3>Investment Potential</h3>
              <p>Beyond providing an exceptional living environment, Fortress Heights Estate represents a significant investment opportunity:</p>
              <ul>
                <li><strong>Early Investor Advantage:</strong> Introductory pricing offers substantial discount compared to projected future values</li>
                <li><strong>Flexible Payment Plans:</strong> Structured options ranging from 3 to 24 months</li>
                <li><strong>Capital Appreciation:</strong> Properties in comparable locations have shown 150-300% appreciation over 5 years</li>
                <li><strong>Rental Yield Potential:</strong> Projected annual rental yields of 6-8% once the estate is completed</li>
              </ul>
              
              <h3>Development Phases</h3>
              <p>The estate will be developed in three strategic phases:</p>
              <ol>
                <li><strong>Phase 1 (Immediate):</strong> Infrastructure development, perimeter security installation, and initial residential plots</li>
                <li><strong>Phase 2 (12-18 months):</strong> Community facilities, additional residential sections, and landscaping</li>
                <li><strong>Phase 3 (24-36 months):</strong> Commercial areas, premium amenities, and final residential offerings</li>
              </ol>
              
              <h3>Grand Opening Event</h3>
              <p>To celebrate this landmark development, PWAN Bridgefort will host a special launch event on July 15th, 2023. The event will feature:</p>
              <ul>
                <li>Site tours and property previews</li>
                <li>Special opening discounts for attendees</li>
                <li>Investment seminars by real estate experts</li>
                <li>Entertainment and refreshments</li>
              </ul>
              
              <h3>Words from Leadership</h3>
              <p>"Fortress Heights Estate represents our commitment to creating not just housing, but thriving communities with long-term value," said Dr. Dalvin Silva, Managing Director of PWAN Bridgefort. "We've incorporated sustainable design principles, modern amenities, and strategic planning to ensure this development meets the needs of residents while delivering strong returns for investors."</p>
              
              <h3>How to Participate</h3>
              <p>Interested investors and potential residents can:</p>
              <ul>
                <li>Register for the launch event via our website or contact our office</li>
                <li>Schedule a personal consultation with our property advisors</li>
                <li>Download the comprehensive investment brochure available on our website</li>
                <li>Take advantage of pre-launch reservation opportunities</li>
              </ul>
              
              <p>For more information about Fortress Heights Estate or to schedule a site visit, please contact our sales team at info@pwanbridgefort.com or call 080-PWAN-BRIDGE.</p>
              
              <p>PWAN Bridgefort continues to lead the way in creating valuable real estate investment opportunities while developing communities that enhance quality of life.</p>
            `,
            image: "/lovable-uploads/f4c5cb9d-d79d-419a-9577-444691d59b72.jpg",
            author: "Jane Owunmere",
            date: "July 1, 2023",
            category: "Latest News & Updates",
            authorImage: "/lovable-uploads/JaneOwunmere.png"
          },
          {
            id: 4,
            title: "How to Navigate the Land Documentation Process in Nigeria",
            summary: "A step-by-step guide to understanding and securing proper land documentation in Nigeria.",
            content: `
              <h2>Understanding Land Documentation in Nigeria</h2>
              <p>Proper land documentation is the foundation of secure real estate ownership in Nigeria. This guide walks you through the essential processes and documents required to protect your property interests.</p>
              
              <h3>The Hierarchy of Land Titles in Nigeria</h3>
              <p>Land titles in Nigeria follow a hierarchy of legal strength and security:</p>
              <ol>
                <li><strong>Certificate of Occupancy (C of O):</strong> The most secure form of land title, issued by the state governor under the Land Use Act of 1978.</li>
                <li><strong>Governor's Consent:</strong> Required documentation when transferring property with an existing C of O.</li>
                <li><strong>Registered Deed of Assignment:</strong> A transfer document registered with the lands registry.</li>
                <li><strong>Survey Plan:</strong> Official document showing the exact boundaries and dimensions of the land.</li>
                <li><strong>Receipt of Purchase:</strong> Basic proof of transaction but offers minimal legal protection.</li>
              </ol>
              
              <h3>The Process of Obtaining a Certificate of Occupancy</h3>
              <p>Securing a C of O involves several steps:</p>
              <ol>
                <li><strong>Application Submission:</strong> File an application with the state lands bureau with the required forms.</li>
                <li><strong>Site Inspection:</strong> Government officials verify the property location and current usage.</li>
                <li><strong>Processing Fee Payment:</strong> Various fees are required, including application, survey, and development charges.</li>
                <li><strong>Technical Review:</strong> Land information is verified against state records.</li>
                <li><strong>Approval Process:</strong> Applications pass through multiple departments for approval.</li>
                <li><strong>Issuance:</strong> After approval, the C of O is signed by the governor and issued to the applicant.</li>
              </ol>
              
              <p>This process typically takes 6-24 months, depending on the state and case specifics.</p>
              
              <h3>Common Documentation Challenges and Solutions</h3>
              <p>Several issues commonly arise during land documentation processes:</p>
              
              <h4>1. Multiple Claimants</h4>
              <p><strong>Challenge:</strong> Multiple parties claiming ownership of the same property.</p>
              <p><strong>Solution:</strong> Conduct thorough due diligence including:</p>
              <ul>
                <li>Comprehensive search at the lands registry</li>
                <li>Investigation of the property's history through local authorities</li>
                <li>Engagement with community leaders in traditional areas</li>
                <li>Verification of seller's identity and ownership documentation</li>
              </ul>
              
              <h4>2. Incomplete Documentation</h4>
              <p><strong>Challenge:</strong> Previous owners failed to complete proper documentation.</p>
              <p><strong>Solution:</strong></p>
              <ul>
                <li>Work with experienced property lawyers to regularize documentation</li>
                <li>Obtain affidavits and supporting documents from previous owners</li>
                <li>Engage with relevant government agencies to update records</li>
              </ul>
              
              <h4>3. Family Land Disputes</h4>
              <p><strong>Challenge:</strong> Disagreements among family members about land sales.</p>
              <p><strong>Solution:</strong></p>
              <ul>
                <li>Ensure all required family signatories participate in the transaction</li>
                <li>Obtain family receipt and consent documents</li>
                <li>Consider family land dispute resolution mechanisms before proceeding</li>
              </ul>
              
              <h3>The Role of Professionals in Land Documentation</h3>
              <p>Several professionals play crucial roles in the documentation process:</p>
              <ul>
                <li><strong>Property Lawyers:</strong> Provide legal guidance, conduct searches, and prepare documentation</li>
                <li><strong>Surveyors:</strong> Create accurate survey plans defining property boundaries</li>
                <li><strong>Estate Valuers:</strong> Determine fair property values for transaction and tax purposes</li>
                <li><strong>Land Consultants:</strong> Navigate government procedures and expedite processes</li>
              </ul>
              
              <h3>Digital Innovations in Land Documentation</h3>
              <p>Nigeria is gradually modernizing land administration through:</p>
              <ul>
                <li><strong>Geographic Information Systems (GIS):</strong> Digital mapping of land resources</li>
                <li><strong>Electronic Certificate of Occupancy:</strong> Some states now issue digital certificates</li>
                <li><strong>Online Search Capabilities:</strong> Remote verification of land records</li>
                <li><strong>Automated Application Processes:</strong> Streamlined submission and tracking systems</li>
              </ul>
              
              <h3>Conclusion</h3>
              <p>Navigating land documentation in Nigeria requires diligence, professional support, and patience. However, the security provided by proper documentation is invaluable for protecting your real estate investments. At PWAN Bridgefort, our legal team and property consultants specialize in guiding clients through these complex processes, ensuring your property rights are secured for generations to come.</p>
              
              <p>For personalized assistance with your land documentation needs, contact our team of experts today.</p>
            `,
            image: "/lovable-uploads/00f20cea-44fd-4566-bf5f-18091450610e.jpg",
            author: "Dr. Michael Akhuetie",
            date: "August 22, 2023",
            category: "Real Estate Insights",
            authorImage: "/lovable-uploads/DR-MICHAEL-AKHUETIE.png"
          },
          {
            id: 5,
            title: "PWAN Group Celebrates 10 Years of Transforming Real Estate Investment",
            summary: "Marking a decade of innovation, growth, and creating wealth through property ownership.",
            content: `
              <h2>PWAN Group: A Decade of Excellence in Real Estate</h2>
              <p>This month marks an extraordinary milestone as PWAN Group celebrates its 10th anniversary, reflecting on a remarkable journey that has transformed Nigeria's real estate landscape and created wealth opportunities for thousands of Nigerians.</p>
              
              <h3>Humble Beginnings to Industry Leadership</h3>
              <p>From its modest start in 2013, PWAN Group has grown into Nigeria's largest real estate network with over 30 affiliate companies, including PWAN Bridgefort Property Managers. The company's journey began with a vision to make property ownership accessible to average Nigerians through innovative approaches and flexible payment structures.</p>
              
              <p>"When we started, many thought our vision was too ambitious," recalls Dr. Augustine Onwumere, co-founder of PWAN Group. "Today, we've helped over 100,000 Nigerians become property owners and created business opportunities for thousands more through our unique marketing approach."</p>
              
              <h3>Celebration Events Nationwide</h3>
              <p>The anniversary celebration includes several events across Nigeria:</p>
              <ul>
                <li><strong>Gala Night:</strong> A prestigious evening honoring key contributors to the company's success</li>
                <li><strong>Corporate Social Responsibility Projects:</strong> Inauguration of community development initiatives in multiple states</li>
                <li><strong>Property Exhibition:</strong> Showcasing current and upcoming developments across the country</li>
                <li><strong>Free Investment Seminars:</strong> Educational sessions on real estate investment strategies</li>
              </ul>
              
              <h3>Revolutionary Business Model</h3>
              <p>PWAN Group pioneered the "Property Network Marketing" concept in Nigeria, which combines real estate development with a marketing structure that allows individuals to earn while helping others acquire property. This innovative approach has:</p>
              <ul>
                <li>Created over 300,000 direct and indirect jobs</li>
                <li>Developed more than 80 estates across Nigeria</li>
                <li>Built a network of over 100,000 independent marketers</li>
                <li>Made homeownership possible for people from diverse income brackets</li>
              </ul>
              
              <h3>Impact on Nigeria's Housing Deficit</h3>
              <p>Over the past decade, PWAN Group has contributed significantly to addressing Nigeria's housing deficit through:</p>
              <ul>
                <li><strong>Affordable Housing Developments:</strong> Creating budget-friendly options without compromising quality</li>
                <li><strong>Flexible Payment Structures:</strong> Pioneering installment payment plans ranging from 6 to 36 months</li>
                <li><strong>Geographic Expansion:</strong> Developing properties in previously overlooked areas with growth potential</li>
                <li><strong>Infrastructure Development:</strong> Investing in roads, drainage, and utilities in new communities</li>
              </ul>
              
              <h3>Words from Leadership</h3>
              <p>"This anniversary is not just about PWAN Group's achievements," states Dr. Jayne Onwumere, Group Managing Director. "It's a celebration of the thousands of Nigerians who have trusted us with their investment dreams and the dedicated team members who have made our vision a reality. We remain committed to our mission of creating wealth through real estate and expanding opportunities for more Nigerians in the decades to come."</p>
              
              <p>Dr. Dalvin Silva, Managing Director of PWAN Bridgefort, adds: "As part of the PWAN family, we at Bridgefort are proud to contribute to this legacy of excellence. The past decade has laid a foundation, but our vision for the future is even more ambitious as we continue to innovate and create exceptional value for our clients."</p>
              
              <h3>Looking Forward: The Next Decade</h3>
              <p>As PWAN Group enters its second decade, several strategic initiatives are underway:</p>
              <ul>
                <li><strong>International Expansion:</strong> Growing the PWAN model into other African countries</li>
                <li><strong>Sustainable Development:</strong> Increasing focus on environmentally friendly building practices</li>
                <li><strong>Technology Integration:</strong> Launching digital platforms to streamline property acquisition</li>
                <li><strong>Educational Empowerment:</strong> Expanding real estate training programs across the country</li>
              </ul>
              
              <h3>Anniversary Promotions</h3>
              <p>To mark this milestone, PWAN Group and its affiliates are offering special anniversary promotions, including:</p>
              <ul>
                <li>Discounted prices on selected properties</li>
                <li>Extended payment terms for anniversary period purchases</li>
                <li>Special incentives for property marketers</li>
                <li>Anniversary draw with prizes including a fully-paid trip to Dubai</li>
              </ul>
              
              <p>For more information about the anniversary celebrations or to take advantage of the anniversary promotions, visit our office or contact our customer service team.</p>
              
              <p>PWAN Group thanks all stakeholders, clients, and team members who have contributed to this remarkable journey and looks forward to continuing its mission of transforming lives through property ownership.</p>
            `,
            image: "/lovable-uploads/32104260-589d-4ad1-b846-3cf494e6c069.jpg",
            author: "Dalvin Silva, PhD",
            date: "September 5, 2023",
            category: "Latest News & Updates",
            authorImage: "/lovable-uploads/Dalvin-Silva-MD.png"
          }
        ];
        
        const selectedPost = blogPosts.find(post => post.id === parseInt(id || '1'));
        
        if (selectedPost) {
          setPost(selectedPost);
        }
        
        setLoading(false);
      }, 500);
    };
    
    fetchBlogPost();
  }, [id]);
  
  const handleShare = (platform: string) => {
    const url = window.location.href;
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(post?.title || '')}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
        break;
      default:
        // Copy link to clipboard
        navigator.clipboard.writeText(url).then(() => {
          toast({
            title: "Link copied!",
            description: "The link has been copied to your clipboard",
          });
        }).catch(() => {
          toast({
            variant: "destructive",
            title: "Failed to copy link",
            description: "Please try again or copy manually",
          });
        });
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };
  
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-16 px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-3/4 mb-6"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-10"></div>
            <div className="h-80 bg-gray-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-4/6"></div>
            </div>
          </div>
        </div>
        <Footer />
        <Toaster />
      </>
    );
  }
  
  if (!post) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate('/blog')}
              className="mb-6 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Back to Blog
            </Button>
            <h1 className="text-3xl font-bold text-red-600">Blog post not found</h1>
            <p className="mt-4">The blog post you are looking for does not exist or has been removed.</p>
            <div className="mt-8">
              <Link to="/blog" className="text-estate-blue hover:underline">
                Return to the blog homepage
              </Link>
            </div>
          </div>
        </div>
        <Footer />
        <Toaster />
      </>
    );
  }
  
  return (
    <>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="outline" 
            onClick={() => navigate('/blog')}
            className="mb-6 flex items-center gap-2"
          >
            <ArrowLeft size={16} />
            Back to Blog
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center mb-6">
            <div className="flex items-center">
              {post.authorImage ? (
                <img 
                  src={post.authorImage} 
                  alt={post.author} 
                  className="w-10 h-10 rounded-full object-cover mr-3" 
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 mr-3 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">
                    {post.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{post.author}</p>
                <p className="text-sm text-gray-500">{post.date}</p>
              </div>
            </div>
            
            <div className="ml-auto flex items-center space-x-2">
              <button 
                onClick={() => handleShare('facebook')}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Share on Facebook"
              >
                <FacebookIcon size={18} className="text-blue-600" />
              </button>
              <button 
                onClick={() => handleShare('twitter')}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Share on Twitter"
              >
                <TwitterIcon size={18} className="text-blue-400" />
              </button>
              <button 
                onClick={() => handleShare('linkedin')}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Share on LinkedIn"
              >
                <LinkedinIcon size={18} className="text-blue-700" />
              </button>
              <button 
                onClick={() => handleShare('copy')}
                className="p-2 rounded-full hover:bg-gray-100"
                aria-label="Copy link"
              >
                <Share2Icon size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
          
          <div className="mb-8">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-auto object-cover rounded-lg shadow-md" 
              style={{ maxHeight: '500px' }}
            />
          </div>
          
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: post.content }} />
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold mb-4">Share this article</h3>
            <div className="flex space-x-3">
              <button 
                onClick={() => handleShare('facebook')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <FacebookIcon size={20} />
                <span>Facebook</span>
              </button>
              <button 
                onClick={() => handleShare('twitter')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500"
              >
                <TwitterIcon size={20} />
                <span>Twitter</span>
              </button>
              <button 
                onClick={() => handleShare('linkedin')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800"
              >
                <LinkedinIcon size={20} />
                <span>LinkedIn</span>
              </button>
              <button 
                onClick={() => handleShare('copy')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                <Share2Icon size={20} />
                <span>Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <Toaster />
    </>
  );
};

export default BlogDetail;
