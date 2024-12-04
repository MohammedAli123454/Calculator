import React, { ReactNode } from 'react';

type PivotalTableProps<T> = {
  data: T[];
  rowKey: keyof T;
  columnKey: keyof T;
  valueKey: keyof T;
  formatNumber?: (num: number) => string;
};

// Helper function to render cell values
const renderCellValue = (value: any, formatNumber?: (num: number) => string): ReactNode => {
  if (value === undefined || value === null) return '-';
  if (typeof value === 'number' && formatNumber) return formatNumber(value);
  return value;
};

const PivotalTable = <T extends Record<string, any>>({
  data,
  rowKey,
  columnKey,
  valueKey,
  formatNumber,
}: PivotalTableProps<T>) => {
  const rowKeys = Array.from(new Set(data.map((item) => item[rowKey])));
  const columnKeys = Array.from(new Set(data.map((item) => item[columnKey])));

  // Create a lookup map for quick data access
  const dataMap: Record<string, Record<string, any>> = {};
  data.forEach((item) => {
    const row = item[rowKey] as string;
    const col = item[columnKey] as string;
    if (!dataMap[row]) dataMap[row] = {};
    dataMap[row][col] = item[valueKey];
  });

  // Compute row and column totals in a single loop
  const rowTotals: Record<string, number> = {};
  const columnTotals: Record<string, number> = {};
  
  data.forEach((item) => {
    const row = item[rowKey] as string;
    const column = item[columnKey] as string;
    const value = item[valueKey];

    if (typeof value === 'number') {
      rowTotals[row] = (rowTotals[row] || 0) + value;
      columnTotals[column] = (columnTotals[column] || 0) + value;
    }
  });

  // Calculate grand total (sum of all column totals)
  const grandTotal = Object.values(columnTotals).reduce((sum, value) => sum + value, 0);

  return (
    <div className="overflow-auto max-h-96">
      <table className="min-w-full border-collapse border border-gray-400 shadow-md">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 px-4 py-2" />
            {columnKeys.map((col) => (
              <th key={col as string} className="border border-gray-400 px-4 py-2">
                {col}
              </th>
            ))}
            <th className="border border-gray-400 px-4 py-2">Total</th>
          </tr>
        </thead>
        <tbody>
          {rowKeys.map((row) => (
            <tr key={row as string}>
              <td className="border border-gray-400 px-4 py-2 font-medium">{row}</td>
              {columnKeys.map((col) => (
                <td key={`${row}-${col}`} className="border border-gray-400 px-4 py-2 text-center">
                  {renderCellValue(dataMap[row]?.[col], formatNumber)}
                </td>
              ))}
              <td className="border border-gray-400 px-4 py-2 text-center">
                {renderCellValue(rowTotals[row], formatNumber)}
              </td>
            </tr>
          ))}
          <tr className="bg-gray-100">
            <td className="border border-gray-400 px-4 py-2 font-medium">Total</td>
            {columnKeys.map((col) => (
              <td key={col as string} className="border border-gray-400 px-4 py-2 text-center">
                {renderCellValue(columnTotals[col], formatNumber)}
              </td>
            ))}
            <td className="border border-gray-400 px-4 py-2 text-center">
              {renderCellValue(grandTotal, formatNumber)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PivotalTable;
