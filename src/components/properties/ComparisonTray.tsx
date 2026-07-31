import { useState } from 'react';
import { Scale, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useComparison } from '@/contexts/comparison/ComparisonContext';

const formatPrice = (n?: number) => (typeof n === 'number' ? `₦${n.toLocaleString()}` : '—');

const ComparisonTray = () => {
  const { items, remove, clear } = useComparison();
  const [open, setOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 glass-strong rounded-2xl p-4 shadow-xl w-[min(92vw,320px)]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <Scale size={18} className="text-estate-purple" />
            Compare ({items.length})
          </div>
          <button onClick={clear} className="text-muted-foreground hover:text-foreground text-xs">
            Clear
          </button>
        </div>
        <div className="flex gap-2 mb-3">
          {items.map((p) => (
            <div key={p.id} className="relative flex-1 min-w-0">
              <img
                src={p.imageUrl}
                alt={p.title}
                className="w-full h-14 object-cover rounded-lg"
              />
              <button
                onClick={() => remove(p.id)}
                className="absolute -top-1.5 -right-1.5 bg-background border border-border rounded-full p-0.5"
                aria-label={`Remove ${p.title} from comparison`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <Button className="w-full btn-cta" onClick={() => setOpen(true)}>
          Compare now
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Compare properties</DialogTitle>
          </DialogHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left p-2 text-muted-foreground font-medium w-32">&nbsp;</th>
                  {items.map((p) => (
                    <th key={p.id} className="p-2 text-left min-w-[180px]">
                      <img src={p.imageUrl} alt={p.title} className="w-full h-24 object-cover rounded-lg mb-2" loading="lazy" decoding="async" />
                      <p className="font-semibold text-foreground">{p.title}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Location', render: (p: typeof items[number]) => p.location },
                  { label: 'Type', render: (p: typeof items[number]) => p.propertyType },
                  { label: 'Price per plot', render: (p: typeof items[number]) => formatPrice(p.pricePerPlot) },
                  { label: 'Size', render: (p: typeof items[number]) => (p.size ? `${p.size} sqm` : '—') },
                  {
                    label: 'Available plots',
                    render: (p: typeof items[number]) =>
                      typeof p.availablePlots === 'number' ? `${p.availablePlots} of ${p.totalPlots ?? '—'}` : '—',
                  },
                  {
                    label: 'Bedrooms',
                    render: (p: typeof items[number]) => (p.bedrooms ? p.bedrooms : '—'),
                  },
                  {
                    label: 'Payment plans',
                    render: (p: typeof items[number]) => (p.paymentPlans?.length ? p.paymentPlans.join(', ') : '—'),
                  },
                ].map((row) => (
                  <tr key={row.label} className="border-t border-border">
                    <td className="p-2 text-muted-foreground font-medium">{row.label}</td>
                    {items.map((p) => (
                      <td key={p.id} className="p-2 text-foreground">
                        {row.render(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ComparisonTray;
