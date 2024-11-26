"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import salesJson from "@/app/sales.json";
import { db } from "@/app/configs/db"; // Drizzle instance for DB connection
import { salesData } from "@/app/configs/schema"; // Schema import for sales_data
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface SalesData {
  Date: string; // Updated field name to match the JSON
  Category: string; // Updated field name to match the JSON
  Sales: number; // Updated field name to match the JSON
}

const PushSalesDataComponent = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [skippedEntries, setSkippedEntries] = useState<number[]>([]); // To track skipped indices

  const logError = (message: string, index: number) => {
    console.error(`${message} at index ${index}`);
  };

  const pushData = async () => {
    const jsonData = salesJson as unknown as SalesData[];
    const totalItems = jsonData.length;
    const skippedIndices: number[] = [];

    setShowDialog(true);
    setLoading(true);
    setSuccessMessage(null);

    try {
      for (let i = 0; i < totalItems; i++) {
        const item = jsonData[i];

        // Check and log the Date field before validation
        console.log(`Item ${i}: Date = ${item.Date}`);

        // Validate the Date
        let formattedDate = null;
        if (item.Date) {
          const parsedDate = new Date(item.Date);
          if (!isNaN(parsedDate.getTime())) {
            formattedDate = parsedDate.toISOString().split("T")[0];
          } else {
            logError(`Invalid Date value: ${item.Date}`, i);
            skippedIndices.push(i);
            continue; // Skip invalid Date
          }
        } else {
          logError("Missing Date value", i);
          skippedIndices.push(i);
          continue; // Skip if Date is missing
        }

        // Log Category and Sales values for debugging
        console.log(`Item ${i}: Category = ${item.Category}, Sales = ${item.Sales}`);

        // Validate Category and Sales values
        const category = item.Category || "Unknown"; // Fallback for missing Category
        const sales = typeof item.Sales === "number" && !isNaN(item.Sales) ? item.Sales : 0; // Ensure Sales is a valid number

        if (sales === 0 && (typeof item.Sales !== "number" || isNaN(item.Sales))) {
          logError("Invalid Sales value", i);
          skippedIndices.push(i);
          continue; // Skip invalid Sales
        }

        // Insert Sales data into the database
        try {
          await db.insert(salesData).values({
            date: formattedDate,
            category,
            sales,
          });
        } catch (dbError) {
          logError(`Database insert failed: ${dbError}`, i);
          skippedIndices.push(i);
          continue; // Skip if database insert fails
        }

        // Update Progress
        setProgress(((i + 1) / totalItems) * 100);
      }

      setSkippedEntries(skippedIndices);
      setSuccessMessage("Sales data pushed successfully!");
    } catch (error) {
      console.error("Error pushing sales data:", error);
      setSuccessMessage("Failed to push sales data.");
    } finally {
      setLoading(false);
    }
  };

  const handlePushData = () => {
    pushData();
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setProgress(0);
    setSkippedEntries([]);
  };

  return (
    <div>
      {!loading && (
        <Button onClick={handlePushData} disabled={loading}>
          Push Sales Data
        </Button>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogHeader>
          <DialogTitle>Sales Data Insertion Progress</DialogTitle>
        </DialogHeader>

        <DialogContent
          aria-describedby="dialog-description"
          className="flex flex-col items-center space-y-4"
        >
          <Progress value={progress} className="w-full" />
          <span>{Math.round(progress)}%</span>
        </DialogContent>

        <DialogFooter>
          {successMessage && (
            <p id="dialog-description" className="text-center">
              {successMessage}
            </p>
          )}
          {skippedEntries.length > 0 && (
            <p className="text-sm text-red-500 text-center">
              Skipped indices: {skippedEntries.join(", ")}
            </p>
          )}
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default PushSalesDataComponent;
