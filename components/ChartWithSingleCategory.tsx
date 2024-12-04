"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList } from "recharts";
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

            {/* tickLine={false}
            tickMargin={10}
            axisLine={false} */}

            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey={barKey} fill="#8884d8" radius={4}>
            {/* Bar value are shown under LabelList Component*/}
            <LabelList
              dataKey={barKey}
              position="top"
              fontSize={12}
              fill="#000" // Adjust this color as needed
            />
          </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    );
  };
  
  export default ChartWithSingleCategory;