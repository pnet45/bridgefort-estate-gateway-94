
import React from 'react';
import { Calendar, ArrowLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

// Sample blog post data - in a real application, this would come from an API or CMS
const blogPostsData = {
  '1': {
    title: 'Success Summit 2025 - Gearing Up for the Next Real Estate Revolution',
    content: `
      <h2>The MAY 2025 SUCCESS SUMMIT</h2>
      <p>Join us in Port Harcourt for our prestigious Success Summit 2025, where industry leaders come together to share insights and strategies in the real estate market.</p>
      
      <p>The event will feature keynote speeches, interactive workshops, and networking opportunities with professionals from across Nigeria and beyond. This year's summit will focus on innovation in real estate marketing, investment strategies for uncertain times, and leveraging technology to stay ahead in the property market.</p>
      
      <h3>Featured Speakers</h3>
      <p>We're thrilled to bring you some of the most respected voices in Nigerian real estate:</p>
      <ul>
        <li>Dr. Augustine Onwumere - Chairman, PWAN Group</li>
        <li>Dr. Jayne Onwumere - Group Managing Director, PWAN Group</li>
        <li>Dr. Dalvin Silva - Managing Director, PWAN Bridgefort</li>
        <li>Precious Silva - Business Development Director</li>
      </ul>
      
      <h3>Event Details</h3>
      <p>Date: May 15-17, 2025<br/>
      Location: Prestigious Hotel & Conference Center, Port Harcourt<br/>
      Time: 9:00 AM - 5:00 PM daily</p>
      
      <p>Early bird registration is now open with special discounts for PWAN affiliates and returning attendees.</p>
      
      <p>Don't miss this opportunity to transform your real estate career and connect with the brightest minds in the industry!</p>
    `,
    imageUrl: '/lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png',
    date: 'May 1, 2025',
    author: 'Dr. Dalvin Silva',
    category: 'Training Events',
    videoEmbed: '<iframe width="560" height="315" src="https://www.youtube.com/embed/Ahsv5NQXTUk" title="Real Estate Summit" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
  },
  '2': {
    title: 'Estate Inspection Day - Exploring Our Newest Developments',
    content: `
      <h2>Join Our Next Estate Inspection Day</h2>
      <p>We're excited to invite you to our upcoming Estate Inspection Day where you'll have the opportunity to explore our newest and most promising developments firsthand.</p>
      
      <p>Estate inspection days provide a unique opportunity to walk the land, visualize your future investment, and get expert insights directly from our property consultants. Whether you're a first-time buyer or an experienced investor, physically seeing the property is an essential step in making informed decisions.</p>
      
      <h3>Properties Featured This Month:</h3>
      <ul>
        <li>Bridgefort County - Our premium lagoon front estate with breathtaking views</li>
        <li>Fortress Hills Estate - Strategically located in the rapidly developing Ikorodu area</li>
        <li>Hampton Ville Estate - Affordable luxury in Epe with excellent appreciation potential</li>
      </ul>
      
      <h3>What to Expect:</h3>
      <p>Our inspection days include transportation from our office to the sites, refreshments, comprehensive site tours, and one-on-one consultation with our property experts.</p>
      
      <p>You'll receive detailed information about:</p>
      <ul>
        <li>Property specifications and available options</li>
        <li>Payment plans and financing options</li>
        <li>Development timelines and infrastructure plans</li>
        <li>Investment potential and ROI projections</li>
      </ul>
      
      <h3>Next Inspection Date:</h3>
      <p>Saturday, April 27, 2025<br/>
      Meeting Point: PWAN Bridgefort Head Office, Lagos<br/>
      Time: 9:00 AM prompt</p>
      
      <p>Spaces are limited to ensure a quality experience, so reserve your spot today by calling +2348030624059 or registering online.</p>
    `,
    imageUrl: '/lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png',
    date: 'April 22, 2025',
    author: 'Precious Silva',
    category: 'Estate News'
  }
  // More posts would be added here
};

const BlogDetail = () => {
  const { id } = useParams<{ id: string }>();
  const post = id ? blogPostsData[id as keyof typeof blogPostsData] : null;
  
  if (!post) {
    return (
      <div className="container-custom py-16">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Post not found</h1>
          <Link to="/blog" className="text-estate-blue hover:underline">
            Return to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-8 md:py-16">
      <div className="container-custom">
        <Link to="/blog" className="inline-flex items-center text-estate-blue hover:underline mb-8">
          <ArrowLeft size={16} className="mr-1" />
          Back to Blog
        </Link>
        
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <span className="bg-estate-blue text-white text-xs uppercase font-bold py-1 px-3 rounded-full">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-4 mb-6">{post.title}</h1>
            
            <div className="flex items-center text-gray-500 mb-6">
              <Calendar size={16} className="mr-1" />
              <span className="mr-4">{post.date}</span>
              <span>By {post.author}</span>
            </div>
          </div>
          
          <div className="rounded-lg overflow-hidden mb-8 max-h-[60vh]">
            <img 
              src={post.imageUrl} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="prose prose-lg max-w-none mb-10" dangerouslySetInnerHTML={{ __html: post.content }} />
          
          {post.videoEmbed && (
            <div className="my-10">
              <h3 className="text-xl font-bold mb-4">Related Video</h3>
              <div className="aspect-video rounded overflow-hidden" dangerouslySetInnerHTML={{ __html: post.videoEmbed }} />
            </div>
          )}
          
          <div className="border-t border-gray-200 pt-8 mt-10">
            <h3 className="text-xl font-bold mb-4">Share this article</h3>
            <div className="flex space-x-4">
              {/* Social media sharing buttons would go here */}
              <button className="px-4 py-2 bg-blue-600 text-white rounded">Facebook</button>
              <button className="px-4 py-2 bg-sky-500 text-white rounded">Twitter</button>
              <button className="px-4 py-2 bg-green-600 text-white rounded">WhatsApp</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;
