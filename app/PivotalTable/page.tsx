"use client";

import React, { useEffect, useState } from "react";
import { sql } from "drizzle-orm";
import { db } from "../configs/db"; // Import your Drizzle database configuration
import { salesData } from "../configs/schema"; // Import the salesData schema
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"; // Import ShadCN Label component
import { DialogTitle } from "@radix-ui/react-dialog"; // Import DialogTitle from Radix UI
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"; // For hiding the title visually if needed

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
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchGroupedSalesData();
        const months = Array.from(new Set(data.map((item) => item.month.trim())));
        const categories = Array.from(new Set(data.map((item) => item.category)));

        setUniqueMonths(months);
        setUniqueCategories(categories);
        setGroupedData(data);
        setSelectedCategories(categories); // Initially, select all categories
      } catch (error) {
        console.error("Error fetching sales data:", error);
      }
    };

    fetchData();
  }, []);

  const filteredData = groupedData.filter((item) =>
    selectedCategories.includes(item.category)
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((cat) => cat !== category)
        : [...prev, category]
    );
  };

  const selectAllCategories = () => setSelectedCategories(uniqueCategories);
  const deselectAllCategories = () => setSelectedCategories([]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sales Data</h2>

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
                .filter((category) => selectedCategories.includes(category))
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
            </tbody>
          </table>
        </div>
      )}

  {/* Drawer for Category Filters */}
<Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
  <DrawerTrigger asChild>
    <button className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 mt-4">
      Filter Categories
    </button>
  </DrawerTrigger>

  <DrawerContent>
    {/* Drawer Header with Title and Description for Accessibility */}
    <div className="p-4">
      <DrawerHeader>
        <DrawerTitle id="drawer-title">Filter by Category</DrawerTitle>
        <DrawerDescription id="drawer-description">
          Select categories to filter the sales data.
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex flex-col items-center space-y-4">
        <button
          onClick={selectAllCategories}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Select All
        </button>
        <button
          onClick={deselectAllCategories}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Deselect All
        </button>
      </div>

      <div className="mt-6 flex items-center space-x-4 space-y-3">
        {uniqueCategories.map((category) => (
          <div key={category} className="flex items-center">
            <input
              type="checkbox"
              className="mr-3"
              checked={selectedCategories.includes(category)}
              onChange={() => handleCategoryChange(category)}
            />
            <Label className="font-bold">{category}</Label>
          </div>
        ))}
      </div>
    </div>

    <DrawerFooter>
      <DrawerClose asChild>
        <button className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-800">
          Close
        </button>
      </DrawerClose>
    </DrawerFooter>
  </DrawerContent>
</Drawer>



    </div>
  );
};

export default SalesTable;
