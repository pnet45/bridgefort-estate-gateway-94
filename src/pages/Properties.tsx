
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyCard from '../components/PropertyCard';
import { Search, Filter } from 'lucide-react';

// Sample properties data
const allProperties = [
  {
    id: '1',
    title: 'Luxury Villa with Ocean View',
    location: 'Victoria Island, Lagos',
    price: '₦75,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    beds: 5,
    baths: 6,
    sqft: 4500,
    propertyType: 'Villa',
    category: 'buy',
    type: 'residential'
  },
  {
    id: '2',
    title: 'Modern Apartment in City Center',
    location: 'Ikeja, Lagos',
    price: '₦45,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    beds: 3,
    baths: 2,
    sqft: 1800,
    propertyType: 'Apartment',
    category: 'buy',
    type: 'residential'
  },
  {
    id: '3',
    title: 'Commercial Building for Investment',
    location: 'Lekki, Lagos',
    price: '₦120,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    beds: 0,
    baths: 2,
    sqft: 5000,
    propertyType: 'Commercial',
    category: 'buy',
    type: 'commercial'
  },
  {
    id: '4',
    title: 'Luxury Penthouse with City View',
    location: 'Ikoyi, Lagos',
    price: '₦95,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    beds: 4,
    baths: 5,
    sqft: 3200,
    propertyType: 'Penthouse',
    category: 'buy',
    type: 'residential'
  },
  {
    id: '5',
    title: 'Office Space in Business District',
    location: 'Marina, Lagos',
    price: '₦320,000/year',
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    beds: 0,
    baths: 2,
    sqft: 2500,
    propertyType: 'Office',
    category: 'rent',
    type: 'commercial'
  },
  {
    id: '6',
    title: 'Family Home with Garden',
    location: 'Ajah, Lagos',
    price: '₦55,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    beds: 4,
    baths: 3,
    sqft: 2800,
    propertyType: 'House',
    category: 'buy',
    type: 'residential'
  },
  {
    id: '7',
    title: 'Modern Studio Apartment',
    location: 'Surulere, Lagos',
    price: '₦180,000/year',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    beds: 1,
    baths: 1,
    sqft: 750,
    propertyType: 'Studio',
    category: 'rent',
    type: 'residential'
  },
  {
    id: '8',
    title: 'Retail Shop in Mall',
    location: 'Lekki Phase 1, Lagos',
    price: '₦250,000/year',
    imageUrl: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    beds: 0,
    baths: 1,
    sqft: 1200,
    propertyType: 'Retail',
    category: 'rent',
    type: 'commercial'
  },
  {
    id: '9',
    title: 'Waterfront Land for Development',
    location: 'Banana Island, Lagos',
    price: '₦150,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    beds: 0,
    baths: 0,
    sqft: 10000,
    propertyType: 'Land',
    category: 'buy',
    type: 'land'
  }
];

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all', // 'buy', 'rent', 'all'
    type: 'all', // 'residential', 'commercial', 'land', 'all'
    minPrice: '',
    maxPrice: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  // Filter properties based on selected filters and search query
  const filteredProperties = allProperties.filter(property => {
    // Filter by category
    const categoryMatch = filters.category === 'all' || property.category === filters.category;
    
    // Filter by type
    const typeMatch = filters.type === 'all' || property.type === filters.type;
    
    // Filter by price
    const price = parseInt(property.price.replace(/[^0-9]/g, ''));
    const minPriceMatch = !filters.minPrice || price >= parseInt(filters.minPrice);
    const maxPriceMatch = !filters.maxPrice || price <= parseInt(filters.maxPrice);
    
    // Filter by search query
    const searchMatch = !searchQuery || 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.propertyType.toLowerCase().includes(searchQuery.toLowerCase());
    
    return categoryMatch && typeMatch && minPriceMatch && maxPriceMatch && searchMatch;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative">
        <div className="h-[40vh] bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1500&q=80)' }}>
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center">
            <div className="container-custom text-white">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Our Properties</h1>
              <p className="text-xl max-w-2xl">Discover our exclusive selection of residential and commercial properties.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          {/* Search and Filters */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search by location, property type, or title..."
                  className="input-field w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              </div>
              
              <button 
                onClick={toggleFilters}
                className="flex items-center justify-center py-2 px-4 border border-estate-blue text-estate-blue rounded hover:bg-estate-blue hover:text-white transition duration-300"
              >
                <Filter size={18} className="mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
            </div>

            {/* Collapsible Filters */}
            {showFilters && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-6 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      id="category"
                      name="category"
                      className="input-field w-full"
                      value={filters.category}
                      onChange={handleFilterChange}
                    >
                      <option value="all">All</option>
                      <option value="buy">Buy</option>
                      <option value="rent">Rent</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                    <select
                      id="type"
                      name="type"
                      className="input-field w-full"
                      value={filters.type}
                      onChange={handleFilterChange}
                    >
                      <option value="all">All Types</option>
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="land">Land</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700 mb-1">Min Price (₦)</label>
                    <input
                      type="number"
                      id="minPrice"
                      name="minPrice"
                      placeholder="Minimum Price"
                      className="input-field w-full"
                      value={filters.minPrice}
                      onChange={handleFilterChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700 mb-1">Max Price (₦)</label>
                    <input
                      type="number"
                      id="maxPrice"
                      name="maxPrice"
                      placeholder="Maximum Price"
                      className="input-field w-full"
                      value={filters.maxPrice}
                      onChange={handleFilterChange}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="mb-6">
              <p className="text-gray-600">Showing {filteredProperties.length} properties</p>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.length > 0 ? (
              filteredProperties.map(property => (
                <PropertyCard key={property.id} {...property} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-xl text-gray-500">No properties match your search criteria.</p>
                <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
              </div>
            )}
          </div>

          {/* Pagination (static for now) */}
          {filteredProperties.length > 0 && (
            <div className="mt-12 flex justify-center">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100">Previous</button>
                <button className="px-3 py-1 bg-estate-blue text-white rounded">1</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100">2</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100">3</button>
                <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100">Next</button>
              </nav>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;
