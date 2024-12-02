// components/LoadingSpinner.js
import React from 'react';
import { LoaderCircle } from "lucide-react";  // Import LoaderCircle component

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="w-128 p-16 bg-gray-100 rounded-lg shadow-lg flex flex-col items-center justify-center">
        <div className="flex items-center justify-center mb-4">
          <LoaderCircle className="animate-spin" color="blue" size={48} />
        </div>
        <p className="text-center text-lg font-medium text-gray-700">
          Loading data, please wait...
        </p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
