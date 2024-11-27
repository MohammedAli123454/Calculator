"use client";

import React, { useEffect, useState } from "react";
import { sql } from "drizzle-orm";
import { db } from "../configs/db"; // Import your Drizzle database configuration
import { salesData } from "../configs/schema"; // Import the employee table schema

// Define the type for the grouped sales data
interface GroupedSalesData {
    month: string;
    category: string;
    total_sales: number;
  }
  
  // Utility function to convert 'YYYY-MM' format to 'Jan', 'Feb', etc.
  const getMonthName = (month: string) => {
    const monthIndex = parseInt(month.split('-')[1], 10) - 1; // Extract month index
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[monthIndex];
  };
  
  // Server-side function to fetch and group sales data by month and category
  async function fetchGroupedSalesData() {
    try {
      // Execute the SQL query using Drizzle ORM's db.execute with the correct query structure
      const result = await db.execute(sql`
        SELECT
          TO_CHAR(date, 'YYYY-MM') AS month,
          category,
          SUM(sales) AS total_sales
        FROM ${salesData}  -- Use the table reference (salesData)
        GROUP BY month, category
        ORDER BY month, category
      `);
  
      // Map result to desired format
      const groupedData = (result.rows as { month: string; category: string; total_sales: number }[]).map(row => ({
        month: row.month,
        category: row.category,
        total_sales: Number(row.total_sales),
      }));
  
      return groupedData;
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
  
    // Fetch sales data on component mount
    useEffect(() => {
      const fetchData = async () => {
        try {
          // Call the server action to get grouped sales data
          const data = await fetchGroupedSalesData();
  
          // Extract unique months and categories
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
  
    // Format number with commas for better readability (e.g., 1,000,000)
    const formatNumber = (num: number) => {
      return num.toLocaleString(); // This will format the number with commas
    };
  
    // Calculate total sales for a specific category
    const calculateCategoryTotal = (category: string) => {
      let categoryTotal = 0;
      uniqueMonths.forEach((month) => {
        const sales = groupedData.find(
          (item) => item.category === category && item.month.trim() === month
        );
        if (sales) {
          categoryTotal += Number(sales.total_sales); // Ensure number addition
        }
      });
      return categoryTotal;
    };
    
  
    // Calculate total sales for a specific month
    const calculateMonthTotal = (month: string) => {
      let monthTotal = 0;
      uniqueCategories.forEach((category) => {
        const sales = groupedData.find(
          (item) => item.category === category && item.month.trim() === month
        );
        if (sales) {
          monthTotal += Number(sales.total_sales); // Ensure number addition
        }
      });
      return monthTotal;
    };
  
    // Calculate the grand total of all sales (all categories, all months)
    const calculateGrandTotal = () => {
      let grandTotal = 0;
      groupedData.forEach((item) => {
        grandTotal += Number(item.total_sales); // Ensure number addition
      });
      return grandTotal;
    };
    
  
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
  
        {isPivotalView ? (
          // Pivotal Table View
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Category</th>
                {uniqueMonths.map((month) => (
                  <th key={month} className="border border-gray-300 px-4 py-2">
                    {getMonthName(month)} {/* Convert month to name (Jan, Feb, Mar) */}
                  </th>
                ))}
                <th className="border border-gray-300 px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {uniqueCategories.map((category) => (
                <tr key={category}>
                  <td className="border border-gray-300 px-4 py-2">{category}</td>
                  {uniqueMonths.map((month) => {
                    const sales = groupedData.find(
                      (item) => item.category === category && item.month.trim() === month
                    );
                    return (
                      <td
                        key={`${category}-${month}`}
                        className="border border-gray-300 px-4 py-2 text-center"
                      >
                        {sales ? formatNumber(sales.total_sales) : 0} {/* Format sales numbers */}
                      </td>
                    );
                  })}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {formatNumber(calculateCategoryTotal(category))} {/* Format the category total */}
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-100">
                <td className="border border-gray-300 px-4 py-2 font-bold">Grand Total</td>
                {uniqueMonths.map((month) => (
                  <td
                    key={`total-${month}`}
                    className="border border-gray-300 px-4 py-2 text-center font-bold"
                  >
                    {formatNumber(calculateMonthTotal(month))} {/* Format the month total */}
                  </td>
                ))}
                <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                  {formatNumber(calculateGrandTotal())} {/* Format the grand total */}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
          // Non-Pivotal Table View
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Month</th>
                <th className="border border-gray-300 px-4 py-2">Category</th>
                <th className="border border-gray-300 px-4 py-2">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {groupedData.map((item, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 px-4 py-2">{getMonthName(item.month.trim())}</td> {/* Convert month to name */}
                  <td className="border border-gray-300 px-4 py-2">{item.category}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    {formatNumber(item.total_sales)} {/* Format sales */}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  export default SalesTable;