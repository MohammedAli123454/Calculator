import React, { ReactNode } from 'react';

type PivotalTableProps<T> = {
    data: T[];
    rowKey: keyof T;
    columnKey: keyof T;
    valueKey: keyof T;
    formatNumber?: (num: number) => string;
  };
// Type constraint to ensure T is a record with values that are ReactNode-compatible
type Renderable<T> = T extends string | number | boolean | ReactNode ? T : never;

const PivotalTable = <T extends Record<string, any>>({
    data,
    rowKey,
    columnKey,
    valueKey,
    formatNumber,
  }: PivotalTableProps<T>) => {
  const rowKeys = Array.from(new Set(data.map((item) => item[rowKey])));
  const columnKeys = Array.from(new Set(data.map((item) => item[columnKey])));

  // Helper function to ensure value is a ReactNode
  const renderCellValue = (value: T[keyof T] | undefined | null): ReactNode => {
    if (value === undefined || value === null) {
      return '-'; // Fallback for undefined or null values
    }

    if (typeof value === 'number' && formatNumber) {
      return formatNumber(value); // Format numbers if formatNumber is provided
    }

    // Ensure value is a renderable ReactNode type
    return value;
  };

  return (
    <div className="overflow-auto max-h-96">
      <table className="min-w-full border-collapse border border-gray-400 shadow-md">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-400 px-4 py-2"></th>
            {columnKeys.map((col) => (
              <th key={col as string} className="border border-gray-400 px-4 py-2">
                {col}
              </th>
            ))}
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
                    {renderCellValue(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PivotalTable;
