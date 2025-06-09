"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { AppointmentOverview } from "@/types/dashboard";

interface OverviewProps {
  data: AppointmentOverview[];
}

export function Overview({ data }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip 
          formatter={(value: any) => [`${value}`, 'Appointments']}
          labelFormatter={(value) => `Date: ${value}`}
        />
        <Bar
          dataKey="scheduled"
          fill="hsl(var(--chart-1))"
          radius={[4, 4, 0, 0]}
          name="Scheduled"
        />
        <Bar
          dataKey="completed"
          fill="hsl(var(--chart-2))"
          radius={[4, 4, 0, 0]}
          name="Completed"
        />
        <Bar
          dataKey="canceled"
          fill="hsl(var(--chart-3))"
          radius={[4, 4, 0, 0]}
          name="Canceled"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}