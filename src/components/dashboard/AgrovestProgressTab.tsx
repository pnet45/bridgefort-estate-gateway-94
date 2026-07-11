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
  { min: 10, max: 20 }, // Year 1 - paid annually
  { min: 30, max: 40 }, // Year 2 - paid quarterly
  { min: 30, max: 40 }, // Year 3 - paid quarterly
  { min: 40, max: 50 }, // Year 4 - paid quarterly
  { min: 40, max: 50 }, // Year 5 - paid quarterly
];
const TOTAL_MONTHS = 60;
const MS_PER_MONTH = 1000 * 60 * 60 * 24 * 30.4375;

const computeProgress = (purchaseDate: Date, now: Date) => {
  const rawMonths = (now.getTime() - purchaseDate.getTime()) / MS_PER_MONTH;
  const monthsElapsed = Math.max(0, Math.min(rawMonths, TOTAL_MONTHS));
  const timeProgressPct = (monthsElapsed / TOTAL_MONTHS) * 100;

  const fullYearsCompleted = Math.min(Math.floor(monthsElapsed / 12), 5);
  let cumulativeReturnPct = 0;
  for (let y = 0; y < fullYearsCompleted; y++) {
    const r = YEAR_RANGES[y];
    cumulativeReturnPct += (r.min + r.max) / 2;
  }
  const remainderMonths = monthsElapsed - fullYearsCompleted * 12;
  if (fullYearsCompleted < 5 && remainderMonths > 0) {
    const r = YEAR_RANGES[fullYearsCompleted];
    cumulativeReturnPct += ((r.min + r.max) / 2) * (remainderMonths / 12);
  }

  const currentYear = Math.min(fullYearsCompleted + (remainderMonths > 0 || fullYearsCompleted === 0 ? 1 : 0), 5);

  return { timeProgressPct, cumulativeReturnPct, currentYear, monthsElapsed };
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
          purchaseDate,
          progress: computeProgress(purchaseDate, now),
        });
      });
    });

    return rows;
  }, [orders]);

  const totalInvested = holdings.reduce((sum, h) => sum + h.amount, 0);
  const totalPlots = holdings.reduce((sum, h) => sum + h.quantity, 0);
  const blendedReturnPct =
    totalInvested > 0
      ? holdings.reduce((sum, h) => sum + h.amount * h.progress.cumulativeReturnPct, 0) / totalInvested
      : 0;
  const expectedReturnAmount = holdings.reduce(
    (sum, h) => sum + h.amount * (h.progress.cumulativeReturnPct / 100),
    0
  );

  if (holdings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Sprout className="h-10 w-10 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-1">No Agrovest investments yet</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-md mx-auto">
            Own a farm plot at Bridgefort Agrovest Estate and earn quarterly profit shares over a
            5-year term.
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
            <p className="text-xs text-muted-foreground mt-1">{totalPlots} plot{totalPlots === 1 ? '' : 's'}</p>
          </CardContent>
        </Card>
        <Card className="border-green-100">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingUp className="h-4 w-4" /> Expected Return So Far
            </div>
            <p className="text-2xl font-bold text-green-800">{blendedReturnPct.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground mt-1">≈ ₦{Math.round(expectedReturnAmount).toLocaleString()}</p>
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
                {h.quantity} plot{h.quantity === 1 ? '' : 's'} · ₦{h.amount.toLocaleString()} · purchased{' '}
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
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Expected cumulative return</span>
                  <span className="font-semibold text-green-700">
                    {h.progress.cumulativeReturnPct.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={Math.min(h.progress.cumulativeReturnPct, 100)}
                  className="h-2 [&>div]:bg-amber-500"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Projected figures based on Bridgefort Agrovest's published annual profit-share ranges
                (10–20% Year 1, 30–40% Years 2–3, 40–50% Years 4–5). Actual returns depend on harvest
                and market outcomes and are not guaranteed.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgrovestProgressTab;
