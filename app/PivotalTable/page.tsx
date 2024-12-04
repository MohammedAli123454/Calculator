"use client";
import React, { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import {
  fetchGroupedSalesData,
  fetchCategoryChartData,
  fetchUniqueMonths,
  fetchUniqueCategories,
} from "@/app/actions/queries";
import  ChartComponent  from "@/components/ChartComponent"
import LoadingSpinner from "@/components/LoadingSpinner";
import ChartWithManyCategories from "@/components/ChartWithManyCategories";
import ChartWithSingleCategory from "@/components/ChartWithSingleCategory";
const SalesTable = () => {
  const [selectedCategories, setSelectedCategories] = useState<{ label: string; value: string }[]>([{ label: "All", value: "All" }]);
  const [isPivotalView, setIsPivotalView] = useState(true);
  const [chartView, setChartView] = useState<'month' | 'category'>('month');

  // Data fetching with react-query
  const { data: groupedData = [], isLoading: loadingGroupedData, error: errorGroupedData } = useQuery({
    queryKey: ["groupedSalesData"],
    queryFn: fetchGroupedSalesData,
  });

  const { data: chartDataByCategory = [], isLoading: loadingChartData, error: errorChartData } = useQuery({
    queryKey: ["categoryChartData"],
    queryFn: fetchCategoryChartData,
  });

  const { data: uniqueMonths = [], isLoading: loadingUniqueMonths, error: errorUniqueMonths } = useQuery({
    queryKey: ['uniqueMonths'],
    queryFn: fetchUniqueMonths,
  });

  const { data: uniqueCategories = [], isLoading: loadingUniqueCategories, error: errorUniqueCategories } = useQuery({
    queryKey: ['uniqueCategories'],
    queryFn: fetchUniqueCategories,
  });

  // Check for loading state and display spinner with a card
  if (loadingGroupedData || loadingChartData || loadingUniqueMonths || loadingUniqueCategories) {
    return <LoadingSpinner />;
  }

  if (errorGroupedData || errorChartData) return <div>Error loading data!</div>;

  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const sortedUniqueMonths = uniqueMonths.sort((a, b) => {
  return monthOrder.indexOf(a) - monthOrder.indexOf(b);
});

  // Filter data based on selected categories
  const filteredData = selectedCategories.some((item) => item.value === "All")
    ? groupedData
    : groupedData.filter((item) =>
        selectedCategories.some((category) => category.value === item.category)
      );

  // Chart data for "Chart by Month"
  const chartData = sortedUniqueMonths.map((month) => {
    const monthData: Record<string, number | string> = { month };
    filteredData.forEach((item) => {
      if (item.month === month) {
        monthData[item.category] = item.total_sales;
      }
    });
    return monthData;
  });

 // Chart configuration for "Chart by Month" view with colors for each month
 const monthChartConfig: ChartConfig = uniqueCategories.reduce((acc, category, index) => {
  const colors = ["#2563eb", "#60a5fa", "#34d399", "#f87171", "#facc15", "#ef4444", "#9333ea", "#f59e0b", "#6d28d9", "#10b981"];
  acc[category] = { label: category, color: colors[index % colors.length] };
  return acc;
}, {} as ChartConfig);

  // Chart configuration for Chart by Category with unique colors for each category

const categoryChartConfig = uniqueCategories.reduce((acc, category, index) => {
  const colors = ["#2563eb", "#60a5fa", "#34d399", "#f87171", "#facc15", "#ef4444", "#9333ea", "#f59e0b", "#6d28d9", "#10b981"];
  acc[category] = { label: category, color: colors[index % colors.length] };
  return acc;
}, {} as ChartConfig);

  // Add fill property to the chart data otherwise the bar colors will be same
  const chartDataWithColors = chartDataByCategory.map((dataItem) => ({
    ...dataItem,
    fill: categoryChartConfig[dataItem.category]?.color || "#8884d8", // Fallback color
  }));
  


  // Filtered categories to display in the table
  const categoriesToDisplay =
    selectedCategories.some((item) => item.value === "All")
      ? uniqueCategories
      : selectedCategories.map((item) => item.value);

  // Format numbers with commas
  const formatNumber = (num: number) => num.toLocaleString();

  // Calculate total sales for a specific category
  const calculateCategoryTotal = (category: string) =>
    uniqueMonths.reduce((total, month) => {
      const sales = filteredData.find(
        (item) => item.category === category && item.month.trim() === month
      );
      return total + (sales ? sales.total_sales : 0);
    }, 0);

  // Calculate total sales for a specific month
  const calculateMonthTotal = (month: string) =>
    categoriesToDisplay.reduce((total, category) => {
      const sales = filteredData.find(
        (item) => item.category === category && item.month.trim() === month
      );
      return total + (sales ? sales.total_sales : 0);
    }, 0);

  // Calculate the overall grand total of sales
  const calculateGrandTotal = () =>
    filteredData.reduce((total, item) => total + item.total_sales, 0);

  // Multi-select options for categories
  const categoryOptions = [
    { label: "All", value: "All" },
    ...uniqueCategories.map((category) => ({
      label: category,
      value: category,
    })),
  ];

  // Handle changes in category selection
  const handleCategoryChange = (selectedOptions: any) => {
    if (selectedOptions.some((option: any) => option.value === "All")) {
      setSelectedCategories([{ label: "All", value: "All" }]);
    } else {
      setSelectedCategories(selectedOptions);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Sales Data Analysis</h2>

      {/* Filter by Category */}
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="category-select" className="font-medium">
          Filter by Category:
        </label>
        <MultiSelect
          options={categoryOptions}
          value={selectedCategories}
          onChange={handleCategoryChange}
          labelledBy="Select Categories"
          className="w-80 border rounded"
        />
      </div>

      {/* View Toggle Buttons */}
      <div className="mb-4">
        <button
          onClick={() => setIsPivotalView(false)}
          className="px-4 py-2 mr-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Non-Pivotal View
        </button>
        <button
          onClick={() => setIsPivotalView(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Pivotal View
        </button>
      </div>

      {/* Render Table */}
      {isPivotalView ? (
        <div className="overflow-auto max-h-96">
          <table className="min-w-full border-collapse border border-gray-400 shadow-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-4 py-2">Category</th>
                {uniqueMonths.map((month) => (
                  <th key={month} className="border border-gray-400 px-4 py-2">
                    {month}
                  </th>
                ))}
                <th className="border border-gray-400 px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {categoriesToDisplay.map((category) => (
                <tr key={category}>
                  <td className="border border-gray-400 px-4 py-2 font-medium">
                    {category}
                  </td>
                  {uniqueMonths.map((month) => {
                    const sales = filteredData.find(
                      (item) =>
                        item.category === category && item.month === month
                    );
                    return (
                      <td
                        key={`${category}-${month}`}
                        className="border border-gray-400 px-4 py-2 text-center"
                      >
                        {sales ? formatNumber(sales.total_sales) : "-"}
                      </td>
                    );
                  })}
                  <td className="border border-gray-400 px-4 py-2 text-center font-semibold">
                    {formatNumber(calculateCategoryTotal(category))}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-200">
                <td className="border border-gray-400 px-4 py-2 font-bold">
                  Grand Total
                </td>
                {uniqueMonths.map((month) => (
                  <td
                    key={`total-${month}`}
                    className="border border-gray-400 px-4 py-2 text-center font-bold"
                  >
                    {formatNumber(calculateMonthTotal(month))}
                  </td>
                ))}
                <td className="border border-gray-400 px-4 py-2 text-center font-bold">
                  {formatNumber(calculateGrandTotal())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-auto max-h-96">
          <table className="min-w-full border-collapse border border-gray-400 shadow-md">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-400 px-4 py-2">Month</th>
                <th className="border border-gray-400 px-4 py-2">Category</th>
                <th className="border border-gray-400 px-4 py-2">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-400 px-4 py-2">
                    {item.month}
                  </td>
                  <td className="border border-gray-400 px-4 py-2">{item.category}</td>
                  <td className="border border-gray-400 px-4 py-2 text-center">
                    {formatNumber(item.total_sales)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
 {/* View Toggle Buttons */}
 <div className="mb-4">
        <button
          onClick={() => setChartView('month')}
          className="px-4 py-2 mr-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Chart By Month BB
        </button>
        <button
          onClick={() => setChartView('category')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Chart By Category AA
        </button>
      </div>
      {/* Render the selected chart */}
      {chartView === 'month' ? (
        <ChartWithManyCategories
          chartData={chartData}
          chartConfig={monthChartConfig}
          dataKey="month"
          barKey="total_sales"
          uniqueCategories={uniqueCategories}
        />
      ) : (
        <ChartWithSingleCategory
          chartData={chartDataWithColors}
          chartConfig={categoryChartConfig}
          dataKey="category"
          barKey="total_sales"
        />
      )}
    </div>
  );
};
export default SalesTable;