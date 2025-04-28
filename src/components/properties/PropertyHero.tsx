
const PropertyHero = () => {
  return (
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
  );
};

export default PropertyHero;
