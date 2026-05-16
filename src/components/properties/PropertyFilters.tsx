
import { Search, Filter, MapPin } from 'lucide-react';
import { usePropertyContext } from '../../contexts/property';
import { locations } from '@/data/locations';

const PropertyFilters = () => {
  const {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters,
    showFilters,
    toggleFilters
  } = usePropertyContext();

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  return (
    <div className="mb-10 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search by location, property type, or title..."
            className="input-field w-full pl-10 transition-all duration-300 focus:ring-2 focus:ring-estate-blue"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search size={18} className="absolute left-3 top-3 text-gray-400 transition-colors duration-300" />
        </div>
        
        <button 
          onClick={toggleFilters}
          className="flex items-center justify-center py-2 px-4 border border-estate-blue text-estate-blue rounded hover:bg-estate-blue hover:text-white transition-all duration-300 transform hover:scale-105"
        >
          <Filter size={18} className="mr-2 transition-transform duration-300" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 animate-fade-in animate-scale-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="category"
                name="category"
                className="input-field w-full transition-all duration-300 focus:ring-2 focus:ring-estate-blue"
                value={filters.category}
                onChange={handleFilterChange}
              >
                <option value="all">All</option>
                <option value="buy">Buy</option>
                <option value="rent">Rent</option>
              </select>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                id="type"
                name="type"
                className="input-field w-full transition-all duration-300 focus:ring-2 focus:ring-estate-blue"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="all">All Types</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">Min Price (₦)</label>
              <input
                type="number"
                id="minPrice"
                name="minPrice"
                placeholder="Minimum Price"
                className="input-field w-full transition-all duration-300 focus:ring-2 focus:ring-estate-blue"
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
            </div>

            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">Max Price (₦)</label>
              <input
                type="number"
                id="maxPrice"
                name="maxPrice"
                placeholder="Maximum Price"
                className="input-field w-full transition-all duration-300 focus:ring-2 focus:ring-estate-blue"
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;
