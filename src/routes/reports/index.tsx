import React, { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../../components/layout/AppShell";
import { useOperations } from "../../lib/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
} from "lucide-react";

export const Route = createFileRoute("/reports/")({
  component: ReportsPage,
});

function ReportsPage() {
  const { events, stock, transactions, metrics } = useOperations();

  // Dynamic Monthly Revenue & Expenses from real transactions and events
  const monthlyData = useMemo(() => {
    const monthMap: Record<
      string,
      { month: string; sortKey: string; revenue: number; expenses: number; events: number }
    > = {};

    // Process all completed transactions
    transactions.forEach((tx) => {
      if (tx.status === "cancelled" || !tx.date) return;
      const d = new Date(tx.date);
      if (isNaN(d.getTime())) return;
      const monthKey = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[sortKey]) {
        monthMap[sortKey] = { month: monthKey, sortKey, revenue: 0, expenses: 0, events: 0 };
      }
      if (tx.type === "income") {
        monthMap[sortKey].revenue += tx.amount;
      } else {
        monthMap[sortKey].expenses += tx.amount;
      }
    });

    // Process all active events
    events.forEach((ev) => {
      if (!ev.date || ev.status === "cancelled") return;
      const d = new Date(ev.date + (ev.date.includes("T") ? "" : "T00:00:00"));
      if (isNaN(d.getTime())) return;
      const monthKey = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      const sortKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (!monthMap[sortKey]) {
        monthMap[sortKey] = { month: monthKey, sortKey, revenue: 0, expenses: 0, events: 0 };
      }
      monthMap[sortKey].events += 1;

      // If transactions are empty, derive revenue from event budget & expenses from event.expenses
      if (transactions.length === 0) {
        monthMap[sortKey].revenue += ev.budget || 0;
        const evExpensesSum = (ev.expenses || []).reduce((acc, exp) => acc + (exp.amount || 0), 0);
        monthMap[sortKey].expenses += evExpensesSum;
      }
    });

    return Object.values(monthMap).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [transactions, events]);

  // Event Types Breakdown
  const typeData = useMemo(() => {
    const eventTypesCount = events.reduce((acc: Record<string, number>, ev) => {
      const type = ev.eventType || "Other";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(eventTypesCount).map((type) => ({
      name: type,
      value: eventTypesCount[type],
    }));
  }, [events]);

  const COLORS = ["#C5A059", "#1E2024", "#8F702F", "#E6C887", "#3B82F6", "#10B981"];

  // Equipment Category Distribution
  const equipmentData = useMemo(() => {
    const categoryCounts = stock.reduce((acc: Record<string, number>, item) => {
      const cat = item.category || "General";
      acc[cat] = (acc[cat] || 0) + item.totalQty;
      return acc;
    }, {});

    return Object.keys(categoryCounts).map((cat) => ({
      category: cat.split(" ")[0],
      fullName: cat,
      units: categoryCounts[cat],
    }));
  }, [stock]);

  const avgGuestCount = useMemo(() => {
    if (events.length === 0) return 0;
    return Math.round(
      events.reduce((sum, e) => sum + (e.guestCount || 0), 0) / events.length
    );
  }, [events]);

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in-50 duration-300">
        {/* HEADER */}
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            Operational Analytics & Reports
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Banquet volume trajectories, expense margins, and equipment
            utilization trends
          </p>
        </div>

        {/* TOP SUMMARY STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-border/80 shadow-xs p-4">
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Contracted Pipeline Value
            </span>
            <div className="text-2xl font-bold font-serif mt-1 text-[#8F702F] dark:text-[#E0BA6E]">
              ₹{metrics.totalPipelineRevenue.toLocaleString("en-IN")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Across active luxury banquets
            </p>
          </Card>

          <Card className="border-border/80 shadow-xs p-4">
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Overall Operating Margin
            </span>
            <div className="text-2xl font-bold font-serif mt-1 text-emerald-600 dark:text-emerald-400">
              {metrics.netMargin}%
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Healthy premium catering standard
            </p>
          </Card>

          <Card className="border-border/80 shadow-xs p-4">
            <span className="text-xs text-muted-foreground uppercase font-semibold">
              Average Guest Count
            </span>
            <div className="text-2xl font-bold font-serif mt-1 text-foreground">
              {avgGuestCount} Pax
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Grand banquet scale
            </p>
          </Card>
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Revenue vs Expenses */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-base font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#C5A059]" /> Monthly
                Revenue & Expenses (₹)
              </CardTitle>
              <CardDescription className="text-xs">
                Comparison of banquet turnover against direct culinary expenses
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 pt-4">
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" textAnchor="end" tick={{ fontSize: 11 }} />
                    <YAxis
                      tickFormatter={(val) => `₹${val / 100000}L`}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, ""]}
                      contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                    <Bar dataKey="revenue" name="Contract Revenue" fill="#C5A059" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" name="Culinary Expenses" fill="#1E2024" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#E8E4DC] rounded-xl bg-[#FAF8F5]">
                  <div className="w-10 h-10 rounded-full bg-[#F5EFE6] text-[#8C7443] flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#111215]">
                    No Financial Records Yet
                  </h4>
                  <p className="text-xs text-[#70757F] max-w-sm mt-1">
                    Log banquet bookings in Events or record income and expenses in the Money ledger to visualize monthly turnover.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Event Types Distribution */}
          <Card className="border-border/80 shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif text-base font-bold flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-[#C5A059]" /> Banquet Occasion
                Distribution
              </CardTitle>
              <CardDescription className="text-xs">
                Weddings, Corporate Galas, and Receptions breakdown
              </CardDescription>
            </CardHeader>
            <CardContent className="h-72 flex items-center justify-center pt-2">
              {typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => [`${val} Banquets`, "Volume"]}
                      contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#E8E4DC] rounded-xl bg-[#FAF8F5]">
                  <div className="w-10 h-10 rounded-full bg-[#F5EFE6] text-[#8C7443] flex items-center justify-center mb-2">
                    <PieChartIcon className="w-5 h-5" />
                  </div>
                  <h4 className="font-serif font-bold text-sm text-[#111215]">
                    No Banquet Occasions
                  </h4>
                  <p className="text-xs text-[#70757F] max-w-sm mt-1">
                    Create banquets categorized by Wedding, Reception, or Corporate Gala to see occasion distribution.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* WAREHOUSE EQUIPMENT ASSETS CHART */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif text-base font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#C5A059]" /> Equipment
              Inventory Units by Category
            </CardTitle>
            <CardDescription className="text-xs">
              Total hardware capacity in warehouse storage
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            {equipmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={equipmentData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} Units in Stock`, ""]}
                    contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                  />
                  <Bar dataKey="units" fill="#C5A059" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#E8E4DC] rounded-xl bg-[#FAF8F5]">
                <div className="w-10 h-10 rounded-full bg-[#F5EFE6] text-[#8C7443] flex items-center justify-center mb-2">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h4 className="font-serif font-bold text-sm text-[#111215]">
                  No Equipment in Warehouse
                </h4>
                <p className="text-xs text-[#70757F] max-w-sm mt-1">
                  Add inventory items in Warehouse Stock to track hardware capacity across categories.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
