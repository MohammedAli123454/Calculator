"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import data from "@/app/employee.json";  // Assuming this is your employee JSON data
import { db } from "../configs/db";  // Drizzle instance for DB connection
import { employee } from "../configs/schema";  // Employee schema import
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";

interface EmployeeData {
  EmpNo: string;
  EmpName: string;
  SiteDesignation: string;
  Designation: string;
  Head: string;
  Department: string;
  HOD: string;
  DOJ: string;
  VISA: string;
  IqamaNo: string;
  Status: string;
  Category: string;
  Payrole: string;
  Sponser: string;
  Project: string;
  AccomodationStatus: string;
}

const PushDataComponent = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const pushData = async () => {
    const jsonData = data as unknown as EmployeeData[];
    const totalItems = jsonData.length;
  
    console.log(jsonData);
  
    setShowDialog(true);
    setLoading(true);
    setSuccessMessage(null);
  
    try {
      // Iterate through each item in the JSON data
      for (let i = 0; i < totalItems; i++) {
        const item = jsonData[i];
  
        // Ensure that DOJ is properly formatted (DD/MM/YYYY => YYYY-MM-DD)
        let dojFormatted = null;
        if (item.DOJ) {
          const [day, month, year] = item.DOJ.split('/'); // Split the date string (DD/MM/YYYY)
          const doj = new Date(`${year}-${month}-${day}`); // Convert to YYYY-MM-DD format
  
          if (!isNaN(doj.getTime())) {
            dojFormatted = doj.toISOString().split("T")[0];  // Format to 'YYYY-MM-DD'
          } else {
            console.error(`Invalid DOJ value: ${item.DOJ} at index ${i}`);
            continue;  // Skip this item if DOJ is invalid
          }
        } else {
          console.error(`Missing DOJ value at index ${i}`);
          continue;  // Skip if DOJ is missing
        }
  
        // Ensure that category is not null or empty
        const category = item.Category ? item.Category : "Unknown";  // Use fallback value if Category is missing
  
        // Insert employee data into the employee table
        await db.insert(employee).values({
          empNo: item.EmpNo,
          empName: item.EmpName,
          siteDesignation: item.SiteDesignation,
          designation: item.Designation,
          head: item.Head,
          department: item.Department,
          hod: item.HOD,
          doj: dojFormatted,  // Use validated and formatted date string
          visa: item.VISA,
          iqamaNo: item.IqamaNo,
          status: item.Status,
          category,  // Fallback applied here
          payrole: item.Payrole,
          sponser: item.Sponser,
          project: item.Project,
          accommodationStatus: item.AccomodationStatus,
        });
  
        // Update progress
        setProgress(((i + 1) / totalItems) * 100);
      }
  
      setSuccessMessage("Data pushed successfully!");
    } catch (error) {
      console.error("Error pushing data:", error);
      setSuccessMessage("Failed to push data");
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
  };

  return (
    <div>
      {!loading && (
        <Button onClick={handlePushData} disabled={loading}>
          Push Data
        </Button>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogHeader>
          <DialogTitle>Data Insertion Progress</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-4">
          <Progress value={progress} className="w-full" />
          <span>{Math.round(progress)}%</span>
        </div>

        <DialogFooter>
          {successMessage && (
            <p id="dialog-description" className="text-center">
              {successMessage}
            </p>
          )}
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default PushDataComponent;
