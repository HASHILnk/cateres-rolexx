import React, { useState } from "react";
import { ReadinessItem } from "../../lib/types";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ChefHat,
  Boxes,
  Users,
  CreditCard,
  Truck,
  HeartHandshake,
  Plus,
  Trash2,
  X,
  ListTodo,
} from "lucide-react";

interface ReadinessDisplayProps {
  checklist: ReadinessItem[];
  onToggleItem?: (itemId: string) => void;
  onAddItem?: (item: Omit<ReadinessItem, "id">) => void;
  onDeleteItem?: (itemId: string) => void;
  interactive?: boolean;
}

export function ReadinessDisplay({
  checklist,
  onToggleItem,
  onAddItem,
  onDeleteItem,
  interactive = true,
}: ReadinessDisplayProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [taskLabel, setTaskLabel] = useState("");
  const [taskCategory, setTaskCategory] = useState<ReadinessItem["category"]>("client");
  const [taskNotes, setTaskNotes] = useState("");

  const total = checklist.length;
  const completed = checklist.filter((c) => c.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const getStatusColor = (pct: number) => {
    if (pct === 100) return "text-emerald-600 dark:text-emerald-400";
    if (pct >= 60) return "text-amber-600 dark:text-amber-400";
    return "text-rose-600 dark:text-rose-400";
  };

  const getProgressColor = (pct: number) => {
    if (pct === 100) return "bg-emerald-500";
    if (pct >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getCategoryIcon = (category: ReadinessItem["category"]) => {
    switch (category) {
      case "client":
        return <HeartHandshake className="w-3.5 h-3.5 text-blue-500" />;
      case "menu":
        return <ChefHat className="w-3.5 h-3.5 text-amber-500" />;
      case "stock":
        return <Boxes className="w-3.5 h-3.5 text-purple-500" />;
      case "staff":
        return <Users className="w-3.5 h-3.5 text-indigo-500" />;
      case "logistics":
        return <Truck className="w-3.5 h-3.5 text-orange-500" />;
      case "payment":
        return <CreditCard className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <ListTodo className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskLabel.trim() || !onAddItem) return;
    onAddItem({
      label: taskLabel.trim(),
      category: taskCategory,
      completed: false,
      notes: taskNotes.trim() || undefined,
    });
    setTaskLabel("");
    setTaskNotes("");
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      {/* Header Stat & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5">
            {percentage === 100 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : percentage >= 60 ? (
              <Clock className="w-4 h-4 text-amber-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-500" />
            )}
            Operations Readiness
          </div>
          <div className="text-xl font-bold flex items-baseline gap-2">
            <span className={getStatusColor(percentage)}>{percentage}%</span>
            <span className="text-xs font-normal text-muted-foreground">
              ({completed}/{total} verified)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAddItem && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAdding(!isAdding)}
              className="text-xs border-[#C5A059]/60 text-[#8C6D37] dark:text-[#E0BA6E] hover:bg-[#FAF5ED] dark:hover:bg-[#2A2418] gap-1.5 font-semibold"
            >
              {isAdding ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>Add Custom Task</span>
                </>
              )}
            </Button>
          )}

          <Badge
            variant="outline"
            className={`font-semibold ${
              percentage === 100
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300"
                : percentage >= 60
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300"
            }`}
          >
            {percentage === 100
              ? "Ready for Service"
              : percentage >= 60
              ? "In Progress"
              : "Action Required"}
          </Badge>
        </div>
      </div>

      {/* Progress Track */}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getProgressColor(
            percentage
          )}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Inline Add Task Form */}
      {isAdding && (
        <form
          onSubmit={handleSubmitTask}
          className="p-3.5 rounded-xl border border-[#C5A059]/50 bg-[#FAF7F0] dark:bg-[#1E1C18] space-y-3 shadow-sm animate-in fade-in-50 duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C6D37] dark:text-[#E0BA6E] flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-[#C5A059]" /> Create Custom Pre-Event Task
            </span>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-muted-foreground hover:text-foreground text-xs"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-muted-foreground">
              Task / Milestone Description *
            </label>
            <Input
              value={taskLabel}
              onChange={(e) => setTaskLabel(e.target.value)}
              placeholder="e.g. Verify welcome tea stall setup with venue manager"
              className="h-8 text-xs bg-white dark:bg-card"
              autoFocus
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Category
              </label>
              <select
                value={taskCategory}
                onChange={(e) => setTaskCategory(e.target.value as any)}
                className="w-full h-8 px-2 rounded-md border border-input bg-white dark:bg-card text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-[#C5A059]"
              >
                <option value="client">Client & Venue</option>
                <option value="menu">Menu & Cooking</option>
                <option value="stock">Stock & Equipment</option>
                <option value="staff">Service Staff & Crew</option>
                <option value="logistics">Logistics & Transit</option>
                <option value="payment">Payment & Billing</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">
                Note / Deadline (Optional)
              </label>
              <Input
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="e.g. Must complete 2 hrs before banquet"
                className="h-8 text-xs bg-white dark:bg-card"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(false)}
              className="h-7 text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-7 text-xs bg-[#C5A059] hover:bg-[#B58E45] text-white font-semibold"
            >
              Add to Checklist
            </Button>
          </div>
        </form>
      )}

      {/* Interactive Checklist */}
      <div className="space-y-2 pt-1">
        {checklist.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground italic border border-dashed rounded-lg">
            No milestones or tasks added for this banquet yet. Click &quot;Add Custom Task&quot; above to create one.
          </div>
        ) : (
          checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (interactive && onToggleItem) {
                  onToggleItem(item.id);
                }
              }}
              className={`group flex items-start gap-3 p-3 rounded-lg border transition-all ${
                item.completed
                  ? "bg-muted/30 border-border/50 text-muted-foreground"
                  : "bg-card border-border/80 text-foreground hover:border-[#C5A059]/40 shadow-xs"
              } ${interactive ? "cursor-pointer" : ""}`}
            >
              <div className="pt-0.5">
                <Checkbox
                  checked={item.completed}
                  onCheckedChange={() => {
                    if (interactive && onToggleItem) {
                      onToggleItem(item.id);
                    }
                  }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(item.category)}
                  <span
                    className={`text-sm font-medium leading-tight ${
                      item.completed ? "line-through opacity-70" : ""
                    }`}
                  >
                    {item.label}
                  </span>
                </div>

                {item.notes && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                    ℹ️ {item.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider px-1.5 py-0.5 bg-muted rounded">
                  {item.category}
                </span>

                {onDeleteItem && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="h-6 w-6 text-muted-foreground hover:text-red-500 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Delete milestone"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
