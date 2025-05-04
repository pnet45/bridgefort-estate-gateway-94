
import { useState } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePropertyContext } from '../contexts/PropertyContext';

const PropertySearch = () => {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const navigate = useNavigate();
  const { allProperties } = usePropertyContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build search query parameters
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (propertyType) params.append('type', propertyType);
    if (priceRange) params.append('price', priceRange);
    
    // Navigate to properties page with search parameters
    navigate(`/properties?${params.toString()}`);
    
    console.log("Searching properties with filters:", { location, propertyType, priceRange });
    console.log("Available properties:", allProperties.length);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg -mt-20 relative z-10 mx-auto max-w-5xl">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <select
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Any Location</option>
              <option value="lagos">Lagos</option>
              <option value="abuja">Abuja</option>
              <option value="port-harcourt">Port Harcourt</option>
              <option value="ibadan">Ibadan</option>
              <option value="imo">Imo State</option>
              <option value="abia">Abia State</option>
              <option value="anambra">Anambra State</option>
              <option value="delta">Delta State</option>
              <option value="ogun">Ogun State</option>
              <option value="akwa-ibom">Akwa Ibom State</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label htmlFor="propertyType" className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
            <select
              id="propertyType"
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Any Type</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land</option>
              <option value="apartment">Apartment</option>
              <option value="house">House</option>
              <option value="villa">Villa</option>
            </select>
          </div>

          <div className="md:col-span-1">
            <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
            <select
              id="priceRange"
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="input-field w-full"
            >
              <option value="">Any Price</option>
              <option value="0-10000000">₦0 - ₦10M</option>
              <option value="10000000-30000000">₦10M - ₦30M</option>
              <option value="30000000-50000000">₦30M - ₦50M</option>
              <option value="50000000-100000000">₦50M - ₦100M</option>
              <option value="100000000+">₦100M+</option>
            </select>
          </div>

          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              className="w-full bg-estate-blue hover:bg-estate-darkBlue text-white py-2 px-4 rounded flex items-center justify-center transition duration-300"
            >
              <Search size={18} className="mr-2" />
              Search
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PropertySearch;
