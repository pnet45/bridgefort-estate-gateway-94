
const PropertyHero = () => {
  return (
    <section className="relative pt-16 lg:pt-20">
      <div className="h-[50vh] bg-cover bg-center" style={{ backgroundImage: 'url(/lovable-uploads/5f92d89a-e9fc-4c84-a49d-72cb376b8510.png)' }}>
        <div className="absolute inset-0 hero-overlay flex items-center">
          <div className="container-custom text-white">
            <h4 className="text-3xl md:text-5xl font-bold mb-4 text-gradient">Our Properties</h4>
            <p className="text-xl max-w-2xl">Discover our exclusive selection of residential and commercial properties.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyHero;
