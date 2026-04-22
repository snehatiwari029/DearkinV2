"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { WeekEntry } from "@/lib/pfml/types";

interface WeeklyTimelineProps {
  timeline: WeekEntry[];
  fullSalaryWeekly: number;
}

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-cream-dark rounded-card p-3 shadow-sm text-sm">
      <p className="font-semibold text-ink mb-2">Week {label}</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex justify-between gap-6">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-medium text-ink">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function WeeklyTimeline({ timeline, fullSalaryWeekly }: WeeklyTimelineProps) {
  if (!timeline.length) return null;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-ink-mid uppercase tracking-wider mb-1">
          Week-by-Week Income Timeline
        </h3>
        <p className="text-xs text-ink-light">
          Dashed line = your full weekly salary ({formatCurrency(fullSalaryWeekly)}/week)
        </p>
      </div>

      <div className="bg-parchment rounded-card border border-cream-dark p-4">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={timeline} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E0D6" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: "#6B6B6B" }}
              tickLine={false}
              axisLine={{ stroke: "#E8E0D6" }}
              label={{ value: "Week", position: "insideBottom", offset: -2, fontSize: 11, fill: "#9A9A9A" }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 11, fill: "#6B6B6B" }}
              tickLine={false}
              axisLine={false}
              width={68}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
              iconType="rect"
              iconSize={10}
            />
            <ReferenceLine
              y={fullSalaryWeekly}
              stroke="#C1694F"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: "Full salary", position: "right", fontSize: 10, fill: "#C1694F" }}
            />
            <Bar dataKey="pfmlBenefit" name="PFML Benefit" stackId="income" fill="#4A7C6F" radius={[0, 0, 0, 0]} />
            <Bar dataKey="employerTopUp" name="Employer Top-Up" stackId="income" fill="#C1694F" />
            <Bar dataKey="stdBenefit" name="STD Benefit" stackId="income" fill="#E0EDEB" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
