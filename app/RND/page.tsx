"use client";
import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";

// Typing sales data more explicitly
type SaleData = { Date: string; Sale: number };

// JSON data representing sales information
const salesData: SaleData[] = [
  { "Date": "01/01/2024", "Sale": 44 },
  { "Date": "02/01/2024", "Sale": 7 },
  { "Date": "01/02/2024", "Sale": 6 },
  { "Date": "02/02/2024", "Sale": 6 },
  { "Date": "01/03/2024", "Sale": 8 },
  { "Date": "02/03/2024", "Sale": 7 },
  { "Date": "01/04/2024", "Sale": 4 },
  { "Date": "02/04/2024", "Sale": 5 },
  { "Date": "01/05/2024", "Sale": 4 },
  { "Date": "02/05/2024", "Sale": 5 },
  { "Date": "01/06/2024", "Sale": 3 },
  { "Date": "02/06/2024", "Sale": 4 },
  { "Date": "01/07/2024", "Sale": 4 },
  { "Date": "02/07/2024", "Sale": 5 },
  { "Date": "01/08/2024", "Sale": 6 },
  { "Date": "02/08/2024", "Sale": 6 },
  { "Date": "01/09/2024", "Sale": 77 },
  { "Date": "02/09/2024", "Sale": 88 },
  { "Date": "01/10/2024", "Sale": 6 },
  { "Date": "02/10/2024", "Sale": 5 },
  { "Date": "01/11/2024", "Sale": 5 },
  { "Date": "02/11/2024", "Sale": 3 },
  { "Date": "01/12/2024", "Sale": 3 },
  { "Date": "02/12/2024", "Sale": 2 }
];

type AggregatedData = {
  month: string;
  totalSales: number;
};

const SalesTable = () => {
  // State to toggle between views
  const [view, setView] = useState<'table' | 'aggregate' | 'rowFormat'>('table');

  // Memoize aggregated data to avoid recalculating on every render
  const aggregatedSales = useMemo(() => {
    const monthlySales = Array(12).fill(0); // Array of 12 months initialized to 0

    // Use forEach to aggregate sales data by month
    salesData.forEach(item => {
      const monthIndex = parseInt(item.Date.slice(3, 5), 10) - 1; // Extract month (MM) and adjust to 0-indexed
      monthlySales[monthIndex] += item.Sale; // Add the sales to the correct month
    });

    // Create aggregated data in month and total sales format
    const result: AggregatedData[] = [];
    monthlySales.forEach((totalSales, index) => {
      const month = new Date(2024, index).toLocaleString('default', { month: 'long' });
      result.push({ month, totalSales });
    });

    return result;
  }, []);

  return (
    <div>
      {/* ShadCN UI Buttons for toggling views */}
      <div className="mb-4">
        <Button onClick={() => setView('table')} className="mr-2">Show Sales Table</Button>
        <Button onClick={() => setView('aggregate')} className="mr-2">Show Aggregate Sales</Button>
        <Button onClick={() => setView('rowFormat')}>Show Sales in Row Format</Button>
      </div>

      {/* Render Sales Table */}
      {view === 'table' && (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Date</th>
              <th className="px-4 py-2 border-b">Sale</th>
            </tr>
          </thead>
          <tbody>
            {salesData.map((sale, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border-b">{sale.Date}</td>
                <td className="px-4 py-2 border-b">{sale.Sale}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Render Aggregate Sales (using aggregatedSales data) */}
      {view === 'aggregate' && (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Month</th>
              <th className="px-4 py-2 border-b">Total Sales</th>
            </tr>
          </thead>
          <tbody>
            {aggregatedSales.map((data, index) => (
              <tr key={index}>
                <td className="px-4 py-2 border-b">{data.month}</td>
                <td className="px-4 py-2 border-b">{data.totalSales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Render Row Format Sales (using aggregatedSales data) */}
      {view === 'rowFormat' && (
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b">Month</th>
              {aggregatedSales.map((data, index) => (
                <th key={index} className="px-4 py-2 border-b">{data.month}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="px-4 py-2 border-b">Sales</td>
              {aggregatedSales.map((data, index) => (
                <td key={index} className="px-4 py-2 border-b">{data.totalSales}</td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SalesTable;
