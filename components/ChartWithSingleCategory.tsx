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
  LabelList,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { ChartConfig } from "@/components/ui/chart";

// ChartWithSingleCategory Component
type ChartWithSingleCategoryProps = {
  chartData: any[];
  chartConfig: ChartConfig;
  dataKey: string;
  barKey: string;
};

const ChartWithSingleCategory: React.FC<ChartWithSingleCategoryProps> = ({
  chartData,
  chartConfig,
  dataKey,
  barKey,
}) => {
  // Function to determine the color based on the category value from chartData
  const getColor = (category: string) => {
    return chartConfig[category]?.color || "#8884d8"; // Fallback color if not found
  };

  // Assuming chartData contains only one item, get the category value for the color
  const categoryValue = chartData[0]?.[dataKey];
  const barColor = categoryValue ? getColor(categoryValue) : "#8884d8";

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
          <XAxis
            dataKey={dataKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis />
          <Tooltip content={<ChartTooltipContent />} />
          <Legend />
          {/* Only one Bar component, with color set dynamically */}
          <Bar
            dataKey={barKey}
            fill={barColor}
            radius={4}
          >
            {/* Display bar values using LabelList */}
            <LabelList
              dataKey={barKey}
              position="top"
              fontSize={12}
              fill="#000" // Adjust label color as needed
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
};

export default ChartWithSingleCategory;
