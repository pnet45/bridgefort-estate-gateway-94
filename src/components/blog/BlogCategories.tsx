
import React from 'react';

const categories = [
  { name: 'Estate News', count: 15 },
  { name: 'Training Events', count: 8 },
  { name: 'Success Stories', count: 12 },
  { name: 'Investment Tips', count: 7 },
  { name: 'Market Updates', count: 9 }
];

const BlogCategories = () => {
  return (
    <div className="flex flex-wrap gap-3 justify-center">
      <button className="bg-estate-blue text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition">
        All Posts
      </button>
      
      {categories.map((category, index) => (
        <button 
          key={index}
          className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-full hover:bg-gray-100 transition flex items-center"
        >
          {category.name} 
          <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
            {category.count}
          </span>
        </button>
      ))}
    </div>
  );
};

export default BlogCategories;
