"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockRevenueData } from "@/lib/mock-data";

export function RevenueChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-xl">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockRevenueData}>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-border"
              />
              <XAxis
                dataKey="month"
                className="text-xs"
                tick={{ fill: "oklch(0.65 0.01 80)" }}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: "oklch(0.65 0.01 80)" }}
                tickFormatter={(v) => `$${v / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.16 0.015 270)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  borderRadius: "8px",
                  color: "oklch(0.92 0.01 80)",
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <Bar
                dataKey="revenue"
                fill="oklch(0.78 0.16 75)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
