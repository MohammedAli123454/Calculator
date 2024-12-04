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
  if (value === undefined || value === null) {
    return '-'; // Fallback for undefined or null values
  }

  if (typeof value === 'number' && formatNumber) {
    return formatNumber(value); // Format numbers if formatNumber is provided
  }

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

  // Calculate column totals by summing the values directly for each column
  const columnTotals: Record<string, number> = {};

  // Loop through rows and calculate totals for each column
  data.forEach((item) => {
    const column = item[columnKey] as string;
    const value = item[valueKey];

    if (typeof value === 'number') {
      columnTotals[column] = (columnTotals[column] || 0) + value;
    }
  });

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
              {columnKeys.map((col) => {
                const value = data.find(
                  (item) => item[rowKey] === row && item[columnKey] === col
                )?.[valueKey];
                return (
                  <td key={`${row}-${col}`} className="border border-gray-400 px-4 py-2 text-center">
                    {renderCellValue(value, formatNumber)}
                  </td>
                );
              })}
              {/* Render the Row Total */}
              <td className="border border-gray-400 px-4 py-2 text-center">
                {renderCellValue(
                  data
                    .filter((item) => item[rowKey] === row) // Only sum the items that match this row
                    .reduce((sum, item) => sum + (typeof item[valueKey] === 'number' ? item[valueKey] : 0), 0),
                  formatNumber
                )}
              </td>
            </tr>
          ))}
          {/* Grand Total Row */}
          <tr className="bg-gray-100">
            <td className="border border-gray-400 px-4 py-2 font-medium">Total</td>
            {columnKeys.map((col) => (
              <td key={col as string} className="border border-gray-400 px-4 py-2 text-center">
                {renderCellValue(columnTotals[col], formatNumber)}
              </td>
            ))}
            {/* Render the grand total (sum of all column totals) */}
            <td className="border border-gray-400 px-4 py-2 text-center">
              {renderCellValue(
                Object.values(columnTotals).reduce((total, current) => total + current, 0),
                formatNumber
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PivotalTable;
