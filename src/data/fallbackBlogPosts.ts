
import { BlogPost } from "@/types/blog";
import { salesStrategyBlogPost } from "./salesStrategyBlogPost";

export const fallbackPosts: BlogPost[] = [
  {
    id: 'ode-omi-land-allocation-2026',
    title: 'PWAN Bridgefort Delivers Again: Successful Land Allocation & Possession at Ode-Omi Estates',
    excerpt: 'PWAN Bridgefort proudly celebrates the successful physical allocation and handover of plots to clients at Precious Gardens Estate and The Ambassadors Parks and Gardens Estate, Ode-Omi.',
    image_path: '/images/allocation-1.jpg',
    created_at: new Date().toISOString(),
    category: 'Estate Allocation',
    profiles: { first_name: 'Emmanuel', last_name: 'Etokakpan' }
  },
  {
    id: 'precious-gardens-physical-allocation-2025',
    title: 'Physical Allocation - Precious Gardens Estate Scheme 1',
    excerpt: 'We are excited to officially inform you that your plot has been successfully demarcated and ready for allocation at Precious Gardens Scheme 1, Ebute-Okun, Ode-Omi, Ogun Waterside LGA.',
    image_path: '/lovable-uploads/9979be2c-1112-4567-bbf9-d036d65b9a61.png',
    created_at: new Date().toISOString(),
    category: 'Estate Allocation',
    profiles: { first_name: 'Emmanuel', last_name: 'Etokakpan' }
  },
  {
    id: 'sales-strategy-closing-deals-millions',
    title: 'MEGA SALES STRATEGY: Closing Deals in Millions - The Game-Changing Event You Can\'t Miss',
    excerpt: 'Join Dr. Dalvin Silva for exclusive training events that reveal the irrefutable methods of sales masters. Learn strategies that have helped thousands close million-naira deals.',
    image_path: '/lovable-uploads/8010a8f6-6f7b-4572-a872-da50579b5a14.png',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    category: 'Training & Events',
    profiles: { first_name: 'Dr. Dalvin', last_name: 'Silva' }
  },
  {
    id: '1',
    title: 'Success Summit 2025 - Gearing Up for the Next Real Estate Revolution',
    excerpt: 'Join us for an unforgettable experience at the MAY 2025 SUCCESS SUMMIT — LIVE in Port Harcourt with industry leaders and experts.',
    image_path: '/lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png',
    created_at: '2025-05-01T00:00:00Z',
    category: 'Training Events',
    profiles: { first_name: 'Dr. Dalvin', last_name: 'Silva' }
  },
  {
    id: '2',
    title: 'Estate Inspection Day - Exploring Our Newest Developments',
    excerpt: 'Explore our newest estates with our expert team. See firsthand the investment opportunities awaiting you.',
    image_path: '/lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png',
    created_at: '2025-04-22T00:00:00Z',
    category: 'Estate News',
    profiles: { first_name: 'Precious', last_name: 'Silva' }
  },
  {
    id: '3',
    title: 'Masterclass: Real Estate Sales Strategies for 2025',
    excerpt: 'Learn cutting-edge sales techniques from our top performers in this intensive masterclass designed for both beginners and professionals.',
    image_path: '/lovable-uploads/796b8bc3-c103-4ea9-bc00-f5ccc19ab812.png',
    created_at: '2025-04-15T00:00:00Z',
    category: 'Training Events',
    profiles: { first_name: 'Gideon', last_name: 'Vincent' }
  }
];
