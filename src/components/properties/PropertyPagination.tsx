
const PropertyPagination = () => {
  return (
    <div className="mt-12 flex justify-center">
      <nav className="flex items-center space-x-2">
        <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100">Previous</button>
        <button className="px-3 py-1 bg-estate-blue text-white rounded">1</button>
        <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100">2</button>
        <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100">3</button>
        <button className="px-3 py-1 border border-gray-300 rounded text-gray-600 hover:bg-gray-100">Next</button>
      </nav>
    </div>
  );
};

export default PropertyPagination;
