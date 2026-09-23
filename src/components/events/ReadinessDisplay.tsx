import React from "react";
import { ReadinessItem } from "../../lib/types";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
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
} from "lucide-react";

interface ReadinessDisplayProps {
  checklist: ReadinessItem[];
  onToggleItem?: (itemId: string) => void;
  interactive?: boolean;
}

export function ReadinessDisplay({
  checklist,
  onToggleItem,
  interactive = true,
}: ReadinessDisplayProps) {
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
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Stat */}
      <div className="flex items-center justify-between">
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

      {/* Progress Track */}
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${getProgressColor(
            percentage
          )}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Interactive Checklist */}
      <div className="space-y-2 pt-2">
        {checklist.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              if (interactive && onToggleItem) {
                onToggleItem(item.id);
              }
            }}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
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
                <p className="text-xs text-rose-500 font-medium mt-1">
                  ⚠️ {item.notes}
                </p>
              )}
            </div>

            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider px-1.5 py-0.5 bg-muted rounded">
              {item.category}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
