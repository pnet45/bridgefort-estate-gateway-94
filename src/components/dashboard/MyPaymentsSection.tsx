
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth";

const PLAN_LABELS: Record<string, string> = {
  "outright": "Outright",
  "1-3": "1-3 Months",
  "4-6": "4-6 Months",
  "7-12": "7-12 Months",
};

const MyPaymentsSection: React.FC = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => {
          setPayments(data || []);
          setLoading(false);
        });
    }
  }, [user]);

  if (loading) {
    return <div>Loading My Payments...</div>;
  }

  if (!payments.length) {
    return <Card>
      <CardHeader><CardTitle>My Payments</CardTitle></CardHeader>
      <CardContent>
        <p className="text-gray-600">No payment records found.</p>
      </CardContent>
    </Card>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.map((pm) => (
            <div
              key={pm.id}
              className="p-4 border rounded-lg bg-white flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div>
                <div className="font-semibold text-estate-blue">
                  Property: {pm.property_id}
                </div>
                <div className="text-xs">Plan: {PLAN_LABELS[pm.plan_type] || pm.plan_type}</div>
                <div className="text-xs">Tenor: {pm.months} month(s)</div>
              </div>
              <div>
                <div className="font-bold">Total: ₦{Number(pm.total_amount).toLocaleString()}</div>
                <div className="text-sm text-green-700">Paid: ₦{Number(pm.amount_paid).toLocaleString()}</div>
                <div className="text-sm text-red-700">Balance: ₦{Number(pm.balance).toLocaleString()}</div>
                <div>
                  <Badge variant={pm.status === "completed" ? "default" : "secondary"}>
                    {pm.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyPaymentsSection;
