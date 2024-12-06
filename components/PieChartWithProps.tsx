"use client";

import React from "react";
import {
  Pie,
  PieChart,
  Tooltip,
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ChartConfig } from "@/components/ui/chart";

const COLORS = ["#2563eb", "#60a5fa", "#34d399", "#f87171", "#facc15", "#ef4444", "#9333ea", "#f59e0b", "#6d28d9", "#10b981"];

type PieChartProps = {
  chartData: { [key: string]: any }[];
  chartConfig: ChartConfig;
  dataKey: string;
  pieKey: string;
};

const PieChartWithProps: React.FC<PieChartProps> = ({
  chartData,
  chartConfig,
  dataKey,
  pieKey,

}) => {
  return (
    <div className="mt-4">
      <ChartContainer
        config={chartConfig}
        className="mx-auto max-w-[500px] max-h-[600px] [&_.recharts-text]:fill-background" // Ensure the container allows for max size
      >
    <PieChart width={600} height={600}> 
          <ChartTooltip
            content={<ChartTooltipContent nameKey={dataKey} hideLabel />}
          />
          <Pie data={chartData} dataKey={pieKey} nameKey={dataKey} cx="50%"
            cy="50%"
            outerRadius={140}>
            <LabelList
              dataKey={dataKey}
              className="fill-background"
              stroke="none"
              fontSize={12}
              formatter={(value: keyof typeof chartConfig) =>
                chartConfig[value]?.label || value
              }
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      {/* Right side: Legends */}
      <div className="flex flex-col items-start pl-8">
  {chartData.map((entry, index) => (
    <div key={`legend-${index}`} className="flex items-center gap-2 leading-none py-2">
      <span className="w-4 h-4 block" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
      <span className="text-sm">
        {entry[dataKey]}: {entry[pieKey].toLocaleString()}
      </span>
    </div>
  ))}
</div>

    </div>
  );
};

export default PieChartWithProps;
