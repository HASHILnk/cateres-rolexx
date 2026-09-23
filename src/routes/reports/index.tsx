import React from "react";
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
  Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/reports/")({
  component: ReportsPage,
});

function ReportsPage() {
  const { events, stock, transactions, metrics } = useOperations();

  // Monthly Revenue & Banquet Volume data
  const monthlyData = [
    { month: "Jun 2026", events: 3, revenue: 1150000, expenses: 420000 },
    { month: "Jul 2026", events: 4, revenue: 1480000, expenses: 580000 },
    { month: "Aug 2026", events: 5, revenue: 1950000, expenses: 710000 },
    { month: "Sep 2026", events: 6, revenue: 2365000, expenses: 840000 },
    { month: "Oct 2026 (Est)", events: 8, revenue: 3100000, expenses: 1050000 },
  ];

  // Event Types Breakdown
  const eventTypesCount = events.reduce((acc: any, ev) => {
    acc[ev.eventType] = (acc[ev.eventType] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.keys(eventTypesCount).map((type) => ({
    name: type,
    value: eventTypesCount[type],
  }));

  const COLORS = ["#C5A059", "#1E2024", "#8F702F", "#E6C887", "#3B82F6", "#10B981"];

  // Equipment Category Distribution
  const categoryCounts = stock.reduce((acc: any, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.totalQty;
    return acc;
  }, {});

  const equipmentData = Object.keys(categoryCounts).map((cat) => ({
    category: cat.split(" ")[0],
    units: categoryCounts[cat],
  }));

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
              ₹{metrics.totalPipelineRevenue.toLocaleString()}
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
              {Math.round(
                events.reduce((sum, e) => sum + e.guestCount, 0) /
                  (events.length || 1)
              )}{" "}
              Pax
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="month" textAnchor="end" tick={{ fontSize: 11 }} />
                  <YAxis
                    tickFormatter={(val) => `₹${val / 100000}L`}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, ""]}
                    contentStyle={{ fontSize: "12px", borderRadius: "8px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="revenue" name="Contract Revenue" fill="#C5A059" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Culinary Expenses" fill="#1E2024" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
