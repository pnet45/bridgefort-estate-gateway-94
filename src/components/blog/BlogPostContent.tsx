
import React from "react";
import DOMPurify from "dompurify";

/**
 * BlogPostContent
 * Renders the main blog post content. If content is short/lacking, uses a default enriched version with inline images.
 * Images are responsive and well-aligned for mobile/desktop.
 */
interface BlogPostContentProps {
  htmlContent?: string;
}

const BlogPostContent: React.FC<BlogPostContentProps> = ({ htmlContent }) => {
  // If content is missing or too short, use placeholder with images
  let html = htmlContent || "";
  if (!html || html.length < 300) {
    html = `
      <p>
        <img src="/lovable-uploads/e96b32e6-88d0-4155-8c87-cbe499a239d3.png" alt="Summit Event" class="rounded-lg w-full md:w-2/3 mx-auto mb-6 shadow-md" />
        The Nigerian real estate industry is entering a new era with exciting opportunities for buyers and investors. As urban populations rise, housing demand continues to intensify in key cities.
      </p>
      <p>
        Sustainable property development, smart communities, and digital-led services are reshaping the landscape.
      </p>
      <img src="/lovable-uploads/8038c999-40e2-49bf-afec-2cb0b5bc2c14.png" alt="Estate Tour" class="rounded-lg w-full md:w-2/3 mx-auto my-7 shadow-md" />
      <h2 class="text-2xl font-semibold mt-10 mb-3">Major Trends &amp; Opportunities</h2>
      <p>
        <strong>Prime locations</strong> in Lagos, Abuja, and Port Harcourt are especially attractive for <span class="text-estate-blue font-semibold">first-time homeowners</span> and <span class="text-estate-red font-semibold">long-term investors</span>. Infrastructure and eco-friendly design are top priorities for developers.
      </p>
      <ul class="list-disc pl-7 my-6">
        <li>Long-term appreciation and rental income potential</li>
        <li>Creative payment/financing plans for flexible purchase options</li>
        <li>Continuing innovation in estate amenities</li>
      </ul>
      <img src="/lovable-uploads/796b8bc3-c103-4ea9-bc00-f5ccc19ab812.png" alt="Real Estate Training" class="rounded-lg w-full md:w-2/3 mx-auto my-7 shadow-md" />
      <h2 class="text-2xl font-semibold mt-10 mb-3">Overcoming Market Challenges</h2>
      <p>
        While costs and regulatory hurdles persist, progress is clear. Collaboration between realtors, investors, and policymakers is ushering in fresh solutions with real impact.
      </p>
      <h2 class="text-2xl font-semibold mt-10 mb-3">The Road Ahead</h2>
      <p>
        Whether you’re buying your dream home or seeking lucrative returns, staying informed and working with trusted firms is critical for future success.
      </p>
    `;
  }

  const sanitizedHtml = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'h3', 'h4', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'img', 'span', 'br', 'div', 'blockquote'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'class', 'style', 'target', 'rel'],
  });

  return (
    <div
      className="post-content prose prose-estate max-w-none text-left leading-relaxed"
      style={{ textAlign: "left" }}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default BlogPostContent;
