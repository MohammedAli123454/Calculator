// components/ChartWithManyCategories.tsx
"use client";

import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ChartConfig } from "@/components/ui/chart";

// Define the type for props
type ChartWithManyCategoriesProps = {
  chartData: any[];
  chartConfig: ChartConfig;
  dataKey: string;
  barKey: string;
  uniqueCategories: string[];
};

const ChartWithManyCategories: React.FC<ChartWithManyCategoriesProps> = ({
  chartData,
  chartConfig,
  dataKey,
  uniqueCategories,
}) => {
  // Debug logs to ensure props are being received correctly
  console.log('Chart Config:', chartConfig);
  console.log('Unique Categories:', uniqueCategories);
  console.log('Chart Data:', chartData);

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

          {/* Render bars for each unique category */}
          {uniqueCategories.map((category) => {
            console.log("categoryName" +category);
            const color = chartConfig[category]?.color || "#8884d8";
            return (
              <Bar
                key={category}
                dataKey={category}
                fill={color}
                radius={4}
              />
            );
          })}
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default ChartWithManyCategories;
