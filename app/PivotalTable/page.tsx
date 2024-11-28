"use client";

import React, { useEffect, useState } from "react";
import { sql } from "drizzle-orm";
import { db } from "../configs/db"; // Import your Drizzle database configuration
import { salesData } from "../configs/schema"; // Import the salesData schema
import { MultiSelect } from "react-multi-select-component";

// Define the type for the grouped sales data
interface GroupedSalesData {
  month: string;
  category: string;
  total_sales: number;
}

// Utility function to convert 'YYYY-MM' format to 'Jan', 'Feb', etc.
const getMonthName = (month: string) => {
  const monthIndex = parseInt(month.split("-")[1], 10) - 1; // Extract month index
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  return monthNames[monthIndex];
};

// Server-side function to fetch and group sales data by month and category
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
  const [groupedData, setGroupedData] = useState<GroupedSalesData[]>([]);
  const [uniqueMonths, setUniqueMonths] = useState<string[]>([]);
  const [uniqueCategories, setUniqueCategories] = useState<string[]>([]);
  const [isPivotalView, setIsPivotalView] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<
    { label: string; value: string }[]
  >([{ label: "All", value: "All" }]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchGroupedSalesData();
        const months = Array.from(new Set(data.map((item) => item.month.trim())));
        const categories = Array.from(new Set(data.map((item) => item.category)));

        setUniqueMonths(months);
        setUniqueCategories(categories);
        setGroupedData(data);
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredData =
    selectedCategories.some((item) => item.value === "All")
      ? groupedData
      : groupedData.filter((item) =>
          selectedCategories.some((category) => category.value === item.category)
        );

  const formatNumber = (num: number) => num.toLocaleString();

  const calculateCategoryTotal = (category: string) => {
    return uniqueMonths.reduce((total, month) => {
      const sales = filteredData.find(
        (item) => item.category === category && item.month.trim() === month
      );
      return total + (sales ? Number(sales.total_sales) : 0);
    }, 0);
  };

  const calculateMonthTotal = (month: string) => {
    return uniqueCategories.reduce((total, category) => {
      const sales = filteredData.find(
        (item) => item.category === category && item.month.trim() === month
      );
      return total + (sales ? Number(sales.total_sales) : 0);
    }, 0);
  };

  const calculateGrandTotal = () => {
    return filteredData.reduce((total, item) => total + item.total_sales, 0);
  };

  // Options for the Multi-Select component
  const categoryOptions = [
    { label: "All", value: "All" },
    ...uniqueCategories.map((category) => ({
      label: category,
      value: category,
    })),
  ];

  const handleCategoryChange = (selectedOptions: any) => {
    if (selectedOptions.some((option: any) => option.value === "All")) {
      setSelectedCategories([{ label: "All", value: "All" }]);
    } else {
      setSelectedCategories(selectedOptions);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sales Data</h2>

      {/* Category Selector */}
      <div className="mb-4 flex items-center space-x-4">
        <label htmlFor="category-select" className="font-bold">
          Filter by Category:
        </label>
        <MultiSelect
          options={categoryOptions}
          value={selectedCategories}
          onChange={handleCategoryChange}
          labelledBy="Select Categories"
          className="w-80"
        />
      </div>

      {/* Buttons to toggle between views */}
      <div className="mb-4">
        <button
          onClick={() => setIsPivotalView(false)}
          className="px-4 py-2 mr-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Non-Pivotal Table
        </button>
        <button
          onClick={() => setIsPivotalView(true)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Pivotal Table
        </button>
      </div>

      {/* Table */}
      {isPivotalView ? (
        <div className="overflow-auto" style={{ maxHeight: "400px" }}>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Category</th>
                {uniqueMonths.map((month) => (
                  <th key={month} className="border border-gray-300 px-4 py-2">
                    {getMonthName(month)}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {uniqueCategories
                .filter((category) =>
                  selectedCategories.some((item) => item.value === "All" || item.value === category)
                )
                .map((category) => (
                  <tr key={category}>
                    <td className="border border-gray-300 px-4 py-2">{category}</td>
                    {uniqueMonths.map((month) => {
                      const sales = filteredData.find(
                        (item) =>
                          item.category === category && item.month.trim() === month
                      );
                      return (
                        <td
                          key={`${category}-${month}`}
                          className="border border-gray-300 px-4 py-2 text-center"
                        >
                          {sales ? formatNumber(sales.total_sales) : 0}
                        </td>
                      );
                    })}
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {formatNumber(calculateCategoryTotal(category))}
                    </td>
                  </tr>
                ))}
              <tr className="bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 font-bold">
                  Grand Total
                </td>
                {uniqueMonths.map((month) => (
                  <td
                    key={`total-${month}`}
                    className="border border-gray-300 px-4 py-2 text-center font-bold"
                  >
                    {formatNumber(calculateMonthTotal(month))}
                  </td>
                ))}
                <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                  {formatNumber(calculateGrandTotal())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="overflow-auto" style={{ maxHeight: "400px" }}>
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Month</th>
                <th className="border border-gray-300 px-4 py-2">Category</th>
                <th className="border border-gray-300 px-4 py-2">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">
                    {getMonthName(item.month.trim())}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {item.category}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {formatNumber(item.total_sales)}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100">
                <td
                  colSpan={3}
                  className="border border-gray-300 px-4 py-2 text-center font-bold"
                >
                  Grand Total: {formatNumber(calculateGrandTotal())}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SalesTable;
