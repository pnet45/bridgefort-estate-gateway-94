
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
  const [docPayments, setDocPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchPayments() {
      if (user) {
        const [{ data: normal, error: err1 }, { data: docs, error: err2 }] = await Promise.all([
          supabase
            .from("payments")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("estate_documentation_payments")
            .select("*, estate:estate_id(name, location)")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false })
        ]);
        if (!cancelled) {
          setPayments(normal || []);
          setDocPayments(docs || []);
          setLoading(false);
        }
      }
    }
    fetchPayments();
    return () => { cancelled = true; };
  }, [user]);

  if (loading) {
    return <div>Loading My Payments...</div>;
  }

  if (!payments.length && !docPayments.length) {
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
          {/* Estate Documentation Payments */}
          {docPayments.length > 0 && (
            <>
              <div className="font-bold pb-2">Documentation Payments</div>
              {docPayments.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 border rounded-lg bg-blue-50 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-semibold text-estate-blue">
                      Estate: {doc.estate?.name || doc.estate_id}
                    </div>
                    <div className="text-xs text-gray-700">{doc.estate?.location}</div>
                  </div>
                  <div>
                    <div className="font-bold">
                      Documentation Fee: ₦{Number(doc.amount).toLocaleString()}
                    </div>
                    <div>
                      <Badge variant={doc.status === "completed" ? "default" : "secondary"}>
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Regular Estate Payments */}
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
