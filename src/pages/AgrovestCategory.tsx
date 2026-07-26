import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, ArrowRight } from 'lucide-react';
import { getAgrovestCategory, agrovestCategories } from '@/data/agrovestCategories';

const AgrovestCategory: React.FC = () => {
  const { slug } = useParams();
  const cat = slug ? getAgrovestCategory(slug) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
    if (cat) document.title = `${cat.name} | Bridgefort Agrovest`;
  }, [cat]);

  if (!cat) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-28 pb-16 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-2">Category not found</h1>
          <Link to="/agrovest" className="text-green-700 underline">Back to Agrovest</Link>
        </main>
        <Footer />
      </div>
    );
  }

  const related = agrovestCategories.filter((c) => c.slug !== cat.slug && c.kind === cat.kind).slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <main className="flex-grow pt-24">
        <section className="relative h-[46vh] min-h-[320px] w-full overflow-hidden">
          <img src={cat.img} alt={cat.name} loading="eager" decoding="async"
            className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-green-950 via-green-950/60 to-transparent" />
          <div className="container mx-auto px-4 relative z-10 h-full flex flex-col justify-end pb-8">
            <Link to="/agrovest" className="text-green-100 hover:text-white text-sm inline-flex items-center gap-1 mb-3">
              <ArrowLeft className="h-4 w-4" /> Back to Agrovest
            </Link>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">{cat.name}</h1>
            <p className="text-green-100 text-lg">{cat.tagline}</p>
          </div>
        </section>

        <section className="section-padding">
          <div className="container mx-auto px-4 max-w-5xl grid lg:grid-cols-[1.4fr_1fr] gap-8">
            <div>
              <h2 className="text-2xl font-bold text-green-900 mb-3">Overview</h2>
              <p className="text-slate-700 leading-relaxed mb-6">{cat.description}</p>
              <Button asChild className="bg-green-700 hover:bg-green-800 text-white">
                <Link to="/agrovest#profit-sharing">
                  See Profit Share Plan <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-green-900 mb-3">Key Benefits</h3>
                <ul className="space-y-2">
                  {cat.benefits.map((b) => (
                    <li key={b} className="flex gap-2 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                      {b}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {related.length > 0 && (
          <section className="section-padding bg-green-50/50">
            <div className="container mx-auto px-4 max-w-5xl">
              <h2 className="text-xl font-bold text-green-900 mb-6">Related {cat.kind === 'crop' ? 'crops' : 'facilities'}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {related.map((r) => (
                  <Link key={r.slug} to={`/agrovest/${r.slug}`}
                    className="group rounded-xl overflow-hidden border border-green-100 bg-white hover:shadow-lg transition">
                    <div className="aspect-[4/3] overflow-hidden">
                      <img src={r.img} alt={r.name} loading="lazy" decoding="async"
                        className="w-full h-full object-cover transition-transform" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-semibold text-green-900">{r.name}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default AgrovestCategory;
