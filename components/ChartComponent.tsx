"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ChartConfig } from "@/components/ui/chart";

type ChartComponentProps = {
  chartData: any[];
  chartConfig: ChartConfig;
  dataKey: string;
  barKey: string;
  uniqueCategories?: string[];
};

const ChartComponent: React.FC<ChartComponentProps> = ({
  chartData,
  chartConfig,
  dataKey,
  barKey,
  uniqueCategories,
}) => {
  return (
    <div className="mt-4">
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart
          data={chartData}
          width={800}
          height={400}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey={dataKey} tickLine={false} tickMargin={10} axisLine={false} />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          {uniqueCategories?.map((category) => (
            <Bar key={category} dataKey={category} fill={chartConfig[category]?.color || "#8884d8"} radius={4} />
          ))}
          {!uniqueCategories && (
            <Bar dataKey={barKey} fill="#8884d8" radius={4} />
          )}
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default ChartComponent;