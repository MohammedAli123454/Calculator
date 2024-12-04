// components/ChartConfigDisplay.tsx
import React from 'react';

// Define the type for ChartConfig
interface ChartConfig {
  [key: string]: {
    label: string;
    color: string;
  };
}

// Sample data from the provided code
const uniqueMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const monthChartConfig: ChartConfig = uniqueMonths.reduce((acc, month, index) => {
  const colors = ["#2563eb", "#60a5fa", "#34d399", "#f87171", "#facc15", "#ef4444", "#9333ea", "#f59e0b", "#6d28d9", "#10b981"];
  acc[month] = { label: month, color: colors[index % colors.length] };
  return acc;
}, {} as ChartConfig);

// Component to display chart configuration
const ChartConfigDisplay: React.FC = () => {
  return (
    <div>
      <h2>Chart Configuration Colors by Month</h2>
      <ul>
        {Object.entries(monthChartConfig).map(([month, { label, color }]) => (
          <li key={month} style={{ color }}>
            {label}: {color}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChartConfigDisplay;
