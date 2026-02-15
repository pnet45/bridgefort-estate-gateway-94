import { salesStrategyBlogPost } from './salesStrategyBlogPost';
import { customerServiceWeekPost } from './customerServiceWeekPost';
import { valentineBlogPost } from './valentineBlogPost';

export const blogPosts = [
  valentineBlogPost,
  customerServiceWeekPost,
  salesStrategyBlogPost,
  {
    id: 'real-estate-investment-tips',
    title: 'Top 10 Real Estate Investment Tips for 2025',
    excerpt: 'Essential strategies to maximize your real estate investment returns in the current market.',
    content: 'Your comprehensive guide to successful real estate investing...',
    category: 'Investment',
    author: 'PWAN Bridgefort Team',
    publishedAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    featured: false,
    image: '/lovable-uploads/Homeslider.png'
  },
  {
    id: 'property-market-trends',
    title: 'Nigerian Property Market Trends 2025',
    excerpt: 'Analyzing the current state and future prospects of Nigeria\'s property market.',
    content: 'An in-depth analysis of market trends and opportunities...',
    category: 'Market Analysis',
    author: 'PWAN Bridgefort Research',
    publishedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    featured: false,
    image: '/lovable-uploads/Homeslider2.png'
  }
];