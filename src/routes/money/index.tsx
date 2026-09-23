import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "../../components/layout/AppShell";
import { useOperations } from "../../lib/store";
import { Transaction } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { toast } from "sonner";
import {
  WalletCards,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CreditCard,
} from "lucide-react";

export const Route = createFileRoute("/money/")({
  component: MoneyPage,
});

function MoneyPage() {
  const { transactions, events, addTransaction } = useOperations();
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all");
  const [modalOpen, setModalOpen] = useState(false);

  // New Transaction Form
  const [txnType, setTxnType] = useState<"income" | "expense">("income");
  const [amount, setAmount] = useState<number>(50000);
  const [category, setCategory] = useState("Event Advance Payment");
  const [description, setDescription] = useState("");
  const [selectedEventId, setSelectedEventId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<any>("Bank Transfer");

  const totalIncome = transactions
    .filter((t) => t.type === "income" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense" && t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;
  const netMargin = totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0;

  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter === "all") return true;
    return t.type === typeFilter;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    const ev = events.find((e) => e.id === selectedEventId);

    addTransaction({
      date: new Date().toISOString().split("T")[0] ?? "2026-09-23",
      type: txnType,
      amount,
      category,
      description,
      eventId: selectedEventId || undefined,
      eventTitle: ev?.title || undefined,
      clientName: ev?.clientName || undefined,
      paymentMethod,
      status: "completed",
    });

    setModalOpen(false);
    setDescription("");
    setAmount(50000);
    toast.success(`Transaction of ₹${amount.toLocaleString()} logged!`);
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-in fade-in-50 duration-300">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              Money & Financial Operations
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Cash flow tracking, event milestone deposits, vendor expenses,
              and profit margins
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setTxnType("income");
                setCategory("Event Advance Payment");
                setModalOpen(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs h-10 px-4 gap-1.5"
            >
              <ArrowDownLeft className="w-4 h-4" /> Record Income / Advance
            </Button>
            <Button
              onClick={() => {
                setTxnType("expense");
                setCategory("Raw Materials & Groceries");
                setModalOpen(true);
              }}
              variant="outline"
              className="text-xs h-10 px-4 gap-1.5 border-border"
            >
              <ArrowUpRight className="w-4 h-4 text-red-500" /> Log Expense
            </Button>
          </div>
        </div>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-border/80 shadow-xs p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs uppercase font-semibold">
              <span>Total Received</span>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold font-serif mt-2 text-emerald-600 dark:text-emerald-400">
              ₹{totalIncome.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              From advance deposits & settlements
            </p>
          </Card>

          <Card className="border-border/80 shadow-xs p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs uppercase font-semibold">
              <span>Total Expenses</span>
              <TrendingDown className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold font-serif mt-2 text-red-600 dark:text-red-400">
              ₹{totalExpense.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Groceries, staff wages & fuel
            </p>
          </Card>

          <Card className="border-border/80 shadow-xs p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs uppercase font-semibold">
              <span>Net Margin</span>
              <DollarSign className="w-4 h-4 text-[#C5A059]" />
            </div>
            <div className="text-2xl font-bold font-serif mt-2 text-foreground">
              ₹{netCashflow.toLocaleString()}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {netMargin}% operational gross margin
            </p>
          </Card>

          <Card className="border-border/80 shadow-xs p-4">
            <div className="flex items-center justify-between text-muted-foreground text-xs uppercase font-semibold">
              <span>Payment Mode</span>
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold font-serif mt-2 text-blue-600 dark:text-blue-400">
              UPI & NEFT
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              100% direct bank verified
            </p>
          </Card>
        </div>

        {/* LEDGER CONTROLS */}
        <div className="flex items-center justify-between p-3 bg-card rounded-xl border border-border/80">
          <div className="flex items-center gap-2">
            <Button
              variant={typeFilter === "all" ? "default" : "outline"}
              size="sm"
              className="text-xs h-8"
              onClick={() => setTypeFilter("all")}
            >
              All Transactions ({transactions.length})
            </Button>
            <Button
              variant={typeFilter === "income" ? "default" : "outline"}
              size="sm"
              className="text-xs h-8 text-emerald-600"
              onClick={() => setTypeFilter("income")}
            >
              Income / Deposits
            </Button>
            <Button
              variant={typeFilter === "expense" ? "default" : "outline"}
              size="sm"
              className="text-xs h-8 text-red-600"
              onClick={() => setTypeFilter("expense")}
            >
              Expenses
            </Button>
          </div>
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="border border-border/80 rounded-xl bg-card overflow-hidden">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted text-muted-foreground font-semibold border-b border-border/60">
              <tr>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Transaction Type</th>
                <th className="p-3.5">Description</th>
                <th className="p-3.5">Event Association</th>
                <th className="p-3.5">Payment Method</th>
                <th className="p-3.5 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredTransactions.map((t) => {
                const isIncome = t.type === "income";

                return (
                  <tr key={t.id} className="hover:bg-muted/30">
                    <td className="p-3.5 text-muted-foreground">{t.date}</td>
                    <td className="p-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-semibold ${
                          isIncome
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-red-50 text-red-700 border-red-300"
                        }`}
                      >
                        {isIncome ? "+ Income" : "- Expense"}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-medium text-foreground">
                      {t.description}
                      <span className="block text-[10px] text-muted-foreground">
                        {t.category}
                      </span>
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {t.eventTitle || "General Operations"}
                    </td>
                    <td className="p-3.5 text-muted-foreground">
                      {t.paymentMethod}
                    </td>
                    <td
                      className={`p-3.5 text-right font-bold text-sm ${
                        isIncome
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isIncome ? "+" : "-"}₹{t.amount.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD TRANSACTION MODAL */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-bold">
              {txnType === "income"
                ? "Record Income / Payment"
                : "Log Operation Expense"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label className="text-xs">Transaction Type</Label>
              <Select
                value={txnType}
                onValueChange={(val: any) => setTxnType(val)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Income / Advance Deposit</SelectItem>
                  <SelectItem value="expense">Operational Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="tAmount" className="text-xs">
                Amount (₹) *
              </Label>
              <Input
                id="tAmount"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="tDesc" className="text-xs">
                Description / Memo *
              </Label>
              <Input
                id="tDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 50% Advance for Tariq & Zoya Banquet"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Link to Event (Optional)</Label>
              <Select
                value={selectedEventId}
                onValueChange={setSelectedEventId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="General Operations (No event)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">General Operations</SelectItem>
                  {events.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.title} ({e.date})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Payment Method</Label>
              <Select
                value={paymentMethod}
                onValueChange={setPaymentMethod}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bank Transfer">Bank Transfer (NEFT/IMPS)</SelectItem>
                  <SelectItem value="UPI">UPI / Google Pay</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-4">
              <Button type="submit" className="w-full bg-black text-white text-xs">
                Record Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
