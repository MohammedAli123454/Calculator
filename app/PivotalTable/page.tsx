"use client";

import React, { useEffect, useState } from "react";
import { sql } from "drizzle-orm";
import { db } from "../configs/db"; // Drizzle database configuration
import { salesData } from "../configs/schema"; // Schema for the sales data
import { MultiSelect } from "react-multi-select-component";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define the type for grouped sales data
interface GroupedSalesData {
  month: string; // 'YYYY-MM' format representing the month
  category: string; // Product or sales category
  total_sales: number; // Total sales amount
}

// Utility function to get month names (e.g., 'Jan', 'Feb') from 'YYYY-MM' format
const getMonthName = (month: string) => {
  const monthIndex = parseInt(month.split("-")[1], 10) - 1; // Extract zero-based month index
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return monthNames[monthIndex];
};

// Fetch and group sales data by month and category from the database
async function fetchGroupedSalesData() {
  try {
    const result = await db.execute(sql`
      SELECT
        TO_CHAR(date, 'YYYY-MM') AS month,
        category,
        SUM(sales) AS total_sales
      FROM ${salesData}
      GROUP BY month, category
      ORDER BY month, category
    `);

    // Transform rows into a strongly typed array
    return (result.rows as { month: string; category: string; total_sales: number }[]).map(
      (row) => ({
        month: row.month,
        category: row.category,
        total_sales: Number(row.total_sales),
      })
    );
  } catch (error) {
    console.error("Error fetching grouped sales data:", error);
    return [];
  }
}

const SalesTable = () => {
  const [groupedData, setGroupedData] = useState<GroupedSalesData[]>([]); // All sales data
  const [uniqueMonths, setUniqueMonths] = useState<string[]>([]); // Unique months in data
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]); // Unique categories in data
  const [isPivotalView, setIsPivotalView] = useState(true); // Toggle view type
  const [selectedCategories, setSelectedCategories] = useState<
    { label: string; value: string }[]
  >([{ label: "All", value: "All" }]); // Categories selected for filtering
  const [chartView, setChartView] = useState<'month' | 'category'>('month'); // Chart view type

  // Fetch and process data on initial render
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchGroupedSalesData();
        setUniqueMonths([...new Set(data.map((item) => item.month.trim()))]);
        setUniqueCategories([...new Set(data.map((item) => item.category))]);
        setGroupedData(data);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchData();
  }, []);

  // Filter data based on selected categories
  const filteredData = selectedCategories.some((item) => item.value === "All")
    ? groupedData
    : groupedData.filter((item) =>
        selectedCategories.some((category) => category.value === item.category)
      );

  // Chart data transformation
  const chartData = uniqueMonths.map((month) => {
    const monthData: Record<string, number | string> = { month: getMonthName(month) };
    filteredData.forEach((item) => {
      if (item.month === month) {
        monthData[item.category] = item.total_sales;
      }
    });
    return monthData;
  });

  const chartDataByCategory = uniqueCategories.map((category) => {
    const categoryData: Record<string, number | string> = { category };
    uniqueMonths.forEach((month) => {
      const sales = filteredData.find((item) => item.category === category && item.month === month);
      categoryData[month] = sales ? sales.total_sales : 0;
    });
    return categoryData;
  });

  // Chart configuration for ShadCN
  const chartConfig = uniqueCategories.reduce((acc, category, index) => {
    const colors = ["#2563eb", "#60a5fa", "#34d399", "#f87171", "#facc15"];
    acc[category] = { label: category, color: colors[index % colors.length] };
    return acc;
  }, {} as ChartConfig);

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
                    {getMonthName(month)}
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
                    {getMonthName(item.month)}
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

      {/* Render Chart */}
      <div className="mt-4">
        <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
          <BarChart
            data={chartView === 'month' ? chartData : chartDataByCategory}
            width={800}
            height={400}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey={chartView === 'month' ? "month" : "category"}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => (chartView === 'month' ? value.slice(0, 3) : value)}
            />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Legend />
            {uniqueCategories.map((category) => (
              <Bar
                key={category}
                dataKey={category}
                fill={chartConfig[category]?.color || "#8884d8"}
                radius={4}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </div>

      {/* Chart View Toggle Buttons */}
      <div className="mb-4">
        <button
          onClick={() => setChartView('month')}
          className="px-4 py-2 mr-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Chart By Month
        </button>
        <button
          onClick={() => setChartView('category')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Chart By Category
        </button>
      </div>
    </div>
  );
};

export default SalesTable;
