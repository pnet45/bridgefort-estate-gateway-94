import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sprout, TrendingUp, Calendar, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface OrderItem {
  plot_id: string;
  plot_number?: number;
  property_name: string;
  quantity: number;
  price: number;
  unit?: string;
}

interface OrderRow {
  id: string;
  items: OrderItem[] | any;
  payment_status: string;
  created_at: string;
}

// Bridgefort Agrovest's published annual profit-share ranges, used to
// project an expected cumulative return based on how much of the 5-year
// term has elapsed since purchase.
const YEAR_RANGES = [
  { min: 10, max: 20, cadence: 'Paid annually' },
  { min: 30, max: 40, cadence: 'Paid quarterly' },
  { min: 30, max: 40, cadence: 'Paid quarterly' },
  { min: 40, max: 50, cadence: 'Paid quarterly' },
  { min: 40, max: 50, cadence: 'Paid quarterly' },
];
const TOTAL_MONTHS = 60;
const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.4375;

const computeProgress = (purchaseDate: Date, now: Date) => {
  const rawMonths = (now.getTime() - purchaseDate.getTime()) / MS_PER_MONTH;
  const monthsElapsed = Math.max(0, Math.min(rawMonths, TOTAL_MONTHS));
  const timeProgressPct = (monthsElapsed / TOTAL_MONTHS) * 100;

  const fullYearsCompleted = Math.min(Math.floor(monthsElapsed / 12), 5);
  const remainderMonths = monthsElapsed - fullYearsCompleted * 12;
  const currentYear = Math.min(fullYearsCompleted + (remainderMonths > 0 || fullYearsCompleted === 0 ? 1 : 0), 5);
  const currentRange = YEAR_RANGES[currentYear - 1] || YEAR_RANGES[4];
  return { timeProgressPct, currentYear, currentRange, monthsElapsed };
};

const AgrovestProgressTab: React.FC<{ orders: OrderRow[] }> = ({ orders }) => {
  const holdings = useMemo(() => {
    const now = new Date();
    const rows: {
      orderId: string;
      propertyName: string;
      quantity: number;
      amount: number;
      purchaseDate: Date;
      progress: ReturnType<typeof computeProgress>;
    }[] = [];

    (orders || []).forEach((order) => {
      const status = (order.payment_status || '').toLowerCase();
      if (!['completed', 'paid', 'success'].includes(status)) return;

      const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
      items.forEach((item) => {
        const isAgrovest =
          (item.plot_id && item.plot_id.toLowerCase().startsWith('agrovest-')) ||
          (item.property_name && item.property_name.toLowerCase().includes('agrovest'));
        if (!isAgrovest) return;

        const purchaseDate = new Date(order.created_at);
        rows.push({
          orderId: order.id,
          propertyName: item.property_name,
          quantity: item.quantity,
          amount: item.price * item.quantity,
          unit: item.property_name?.toLowerCase().includes('aquaculture') || item.plot_id?.toLowerCase().includes('aquaculture') ? 'pond' : item.property_name?.toLowerCase().includes('livestock') ? 'pair' : 'plot',
          purchaseDate,
          progress: computeProgress(purchaseDate, now),
        });
      });
    });

    return rows;
  }, [orders]);

  const totalInvested = holdings.reduce((sum, h) => sum + h.amount, 0);
  const totalPlots = holdings.reduce((sum, h) => sum + h.quantity, 0);

  if (holdings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Sprout className="h-10 w-10 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">No Agrovest investments yet</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Join one or more Bridgefort Agrovest agricultural operation units and participate in the 5-year profit-share programme.
          </p>
          <Button asChild className="bg-green-700 hover:bg-green-800">
            <Link to="/agrovest">Explore Agrovest</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="border-green-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Wallet className="h-4 w-4" /> Total Invested
            </div>
            <p className="text-2xl font-bold text-green-800">₦{totalInvested.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">{totalPlots} subscribed unit{totalPlots === 1 ? '' : 's'}</p>
          </CardContent>
        </Card>
        <Card className="border-green-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="h-4 w-4" /> Profit-Share Programme
            </div>
            <p className="text-lg font-bold text-green-800">10–20% → 30–40% → 40–50%</p>
            <p className="text-xs text-muted-foreground mt-1">Share of net profits, subject to the programme terms</p>
          </CardContent>
        </Card>
        <Card className="border-green-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Calendar className="h-4 w-4" /> Active Investments
            </div>
            <p className="text-2xl font-bold text-green-800">{holdings.length}</p>
            <p className="text-xs text-muted-foreground mt-1">across all purchases</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {holdings.map((h, idx) => (
          <Card key={`${h.orderId}-${idx}`} className="border-green-100">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sprout className="h-4 w-4 text-green-600" />
                  {h.propertyName}
                </CardTitle>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Year {h.progress.currentYear} of 5
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {h.quantity} {h.unit}{h.quantity === 1 ? '' : h.unit === 'pond' ? 's' : h.unit === 'pair' ? 's' : 's'} · ₦{h.amount.toLocaleString()} · purchased{' '}
                {h.purchaseDate.toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Contract progress</span>
                  <span>{h.progress.timeProgressPct.toFixed(0)}% of 5 years</span>
                </div>
                <Progress value={h.progress.timeProgressPct} className="h-2" />
              </div>
              <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Current programme year</span>
                  <span className="font-semibold text-green-800">Year {h.progress.currentYear}: {h.progress.currentRange.min}%–{h.progress.currentRange.max}% of net profits</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{h.progress.currentRange.cadence}</span>
                  <span>Projected share</span>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                The percentages are a share of net profits generated by the relevant agricultural operation, not a guaranteed percentage of your subscription amount. Actual distributions depend on production, harvest, processing, sales and the applicable programme terms.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgrovestProgressTab;
