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
    </div>
  );
};

export default PieChartWithProps;
