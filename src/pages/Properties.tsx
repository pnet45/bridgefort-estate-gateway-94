import { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PropertyFilters from '../components/properties/PropertyFilters';
import PropertyGrid from '../components/properties/PropertyGrid';
import PropertyPagination from '../components/properties/PropertyPagination';
import PropertyHero from '../components/properties/PropertyHero';

// Sample properties data
const allProperties = [
  {
    id: '1',
    title: 'Hampton Ville Estate',
    location: 'Itoikin, Epe, Lagos',
    price: '₦3,500,000',
    imageUrl: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 500,
    propertyType: 'Villa',
    category: 'buy',
    type: 'residential',
    scheme: 1
  },
  {
    id: '2',
    title: 'Fortress Hills Estate',
    location: 'Imota, Ikorodu, Lagos',
    price: '₦4,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 500,
    propertyType: 'Apartment',
    category: 'buy',
    type: 'residential',
    scheme: 1
  },
  {
    id: '3',
    title: 'Greenfield County',
    location: 'Agbara, Ogun State',
    price: '₦1,500,000',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 500,
    propertyType: 'Commercial',
    category: 'buy',
    type: 'residential',
    scheme: 2
  },
  {
    id: '4',
    title: 'Precious Gardens Estate',
    location: 'Ode-Omi, Ibeju-Lekki',
    price: '₦1,500,000',
    imageUrl: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 500,
    propertyType: 'Penthouse',
    category: 'buy',
    type: 'residential',
    scheme: 1
  },
  {
    id: '5',
    title: 'Fountain Springs Estate',
    location: 'Ode-Omi, Ibeju-Lekki',
    price: 'Pre-Launch ₦2,500,000 | Actual Price: ₦3,500,000',
    imageUrl: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 500,
    propertyType: 'Villa',
    category: 'buy',
    type: 'residential',
    scheme: 1
  },
  {
    id: '6',
    title: 'Olanma Gardens',
    location: 'Ogbaku, Owerri, Imo State',
    price: '₦7,500,000 | Actual Price: ₦10,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 464,
    propertyType: 'House',
    category: 'buy',
    type: 'residential',
    scheme: 1
  },
  {
    id: '7',
    title: 'The Big League County',
    location: 'Warri, Delta State',
    price: '₦10,000,000 | Initial Deposit: ₦2,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 464,
    propertyType: 'House',
    category: 'buy',
    type: 'residential',
    scheme: 1
  },
  {
    id: '8',
    title: 'The Big League Smart City',
    location: 'Omagwa, Port Harcourt',
    price: '₦4,500,000 | Initail Deposit: ₦1,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1604014237800-1c9102c219da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 464,
    propertyType: 'House',
    category: 'buy',
    type: 'commercial',
    scheme: 1
  },
  {
    id: '9',
    title: 'The Big League Paradise',
    location: 'Oghara, Ethiope, Delta State',
    price: '₦4,000,000 | Initial Deposit: ₦1,500,000',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 464,
    propertyType: 'Land',
    category: 'buy',
    type: 'land',
    scheme: 1
  },
  {
    id: '10',
    title: 'Akuchi Luxury Estate',
    location: 'Ifite, Awka, Anambra State',
    price: '₦7,500,000 | Actual Price: ₦10,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 464,
    propertyType: 'Land',
    category: 'buy',
    type: 'land',
    scheme: 1
  },
  {
    id: '11',
    title: 'Afaoma Castle Estate',
    location: 'Uturu, Umuahia, Abia State',
    price: '₦7,500,000 | Actual Price: ₦10,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 464,
    propertyType: 'Land',
    category: 'buy',
    type: 'land',
    scheme: 1
  },
  {
    id: '12',
    title: 'The Big League Haven',
    location: 'Ogwashi-Uku, Asaba, Delta State',
    price: '₦7,500,000 | Initial Deposit: ₦1,000,000',
    imageUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    sqft: 464,
    propertyType: 'Land',
    category: 'buy',
    type: 'land',
    scheme: 1
  }
];

const Properties = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: 'all',
    type: 'all',
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

      <PropertyHero />

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <PropertyFilters 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filters={filters}
            handleFilterChange={handleFilterChange}
            showFilters={showFilters}
            toggleFilters={toggleFilters}
          />

          <div className="mb-6">
            <p className="text-gray-600">Showing {filteredProperties.length} properties</p>
          </div>

          <PropertyGrid properties={filteredProperties} />

          {filteredProperties.length > 0 && <PropertyPagination />}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Properties;
