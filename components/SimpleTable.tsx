import React, { ReactNode } from 'react';

type SimpleTableProps<T> = {
  data: T[];
  columns: { header: string; accessor: keyof T }[];
  formatNumber?: (num: number) => string;
};

const SimpleTable = <T,>({ data, columns, formatNumber }: SimpleTableProps<T>) => {
  // Helper function to ensure the value is a ReactNode
  const renderCellValue = (value: T[keyof T]): ReactNode => {
    if (typeof value === 'number' && formatNumber) {
      return formatNumber(value);
    }
    // Ensure value is a type that can be rendered by React
    if (value !== undefined && value !== null) {
      return value as ReactNode;
    }
    return '-'; // Fallback for undefined or null values
  };

  return (
    <div className="overflow-auto max-h-96">
      <table className="min-w-full border-collapse border border-gray-400 shadow-md">
        <thead>
          <tr className="bg-gray-200">
            {columns.map((col) => (
              <th key={col.accessor as string} className="border border-gray-400 px-4 py-2">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {columns.map((col) => (
                <td key={col.accessor as string} className="border border-gray-400 px-4 py-2 text-center">
                  {renderCellValue(row[col.accessor])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SimpleTable;
