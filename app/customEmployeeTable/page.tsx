"use client";

import { useState, useMemo, useEffect } from "react";
import { useInfiniteQuery, QueryKey, QueryFunctionContext } from '@tanstack/react-query';
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { db } from "../configs/db"; // Import your Drizzle database configuration
import { employee } from "../configs/schema"; // Import the employee table schema

// Define the Employee type based on the employee table structure
type Employee = {
    empNo: string;
    empName: string;
    siteDesignation: string;
    designation: string;
    head: string;
    department: string;
    hod: string;
    doj: string;
    visa: string;
    iqamaNo: string;
    status: string;
    category: string;
    payrole: string;
    sponser: string;
    project: string;
    accommodationStatus: string;
  };
  
  // Server action to fetch paginated employee data
  const fetchEmployeeData = async ({ pageParam = 0, limit = 20 }): Promise<Employee[]> => {
    try {
      const employees = await db
        .select()
        .from(employee)
        .offset(pageParam * limit)
        .limit(limit)
        .execute();
  
      return employees.map((emp) => ({
        empNo: emp.empNo,
        empName: emp.empName,
        siteDesignation: emp.siteDesignation,
        designation: emp.designation,
        head: emp.head,
        department: emp.department,
        hod: emp.hod,
        doj: emp.doj.toString().split("T")[0],
        visa: emp.visa,
        iqamaNo: emp.iqamaNo,
        status: emp.status,
        category: emp.category,
        payrole: emp.payrole,
        sponser: emp.sponser,
        project: emp.project,
        accommodationStatus: emp.accommodationStatus,
      }));
    } catch (error) {
      console.error("Error fetching employee data:", error);
      throw new Error("Failed to fetch employee data from the database.");
    }
  };
  

export default function EmployeeDataTable() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [fields, setFields] = useState([
    { key: "empNo", label: "Employee No", selected: true, colSpan: 2 },
    { key: "empName", label: "Employee Name", selected: true, colSpan: 3 },
    { key: "siteDesignation", label: "Site Designation", selected: true, colSpan: 2 },
    { key: "designation", label: "Designation", selected: true, colSpan: 2 },
    { key: "head", label: "Head", selected: true, colSpan: 2 },
    { key: "department", label: "Department", selected: true, colSpan: 2 },
    { key: "hod", label: "HOD", selected: true, colSpan: 2 },
    { key: "doj", label: "Date of Joining", selected: true, colSpan: 2 },
    { key: "visa", label: "Visa", selected: true, colSpan: 2 },
    { key: "iqamaNo", label: "Iqama No", selected: true, colSpan: 2 },
    { key: "status", label: "Status", selected: true, colSpan: 1 },
    { key: "category", label: "Category", selected: true, colSpan: 1 },
    { key: "payrole", label: "Payrole", selected: true, colSpan: 2 },
    { key: "sponser", label: "Sponser", selected: true, colSpan: 2 },
    { key: "project", label: "Project", selected: true, colSpan: 2 },
    { key: "accommodationStatus", label: "Accommodation Status", selected: true, colSpan: 3 },
  ]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery<Employee[], Error>({
    queryKey: ["employeeData", selectedDepartment, selectedPosition, selectedLocation],
  
    // Correct queryFn with QueryFunctionContext
    queryFn: async ({ pageParam = 0, signal }: QueryFunctionContext<any>) => {
      // Explicitly assert that pageParam is a number
      return fetchEmployeeData({
        pageParam: pageParam as number,  // Cast pageParam to number
      });
    },
  
    getNextPageParam: (lastPage) => {
      return lastPage.length ? lastPage.length : undefined;
    },
  
    initialPageParam: 0, // Start from the first page
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
    refetchOnWindowFocus: false,
  });
  const employeeData = data?.pages.flat() || [];

  const uniqueDepartments = useMemo(
    () => Array.from(new Set(employeeData.map((item) => item.department))).slice(0, 10),
    [employeeData]
  );
  const uniquePositions = useMemo(
    () => Array.from(new Set(employeeData.map((item) => item.designation))).slice(0, 10),
    [employeeData]
  );
  const uniqueLocations = useMemo(
    () => Array.from(new Set(employeeData.map((item) => item.project))).slice(0, 10),
    [employeeData]
  );

  const filteredData = useMemo(() => {
    return employeeData.filter((item) => {
      return (
        (selectedDepartment !== "all" ? item.department === selectedDepartment : true) &&
        (selectedPosition !== "all" ? item.designation === selectedPosition : true) &&
        (selectedLocation !== "all" ? item.project === selectedLocation : true)
      );
    });
  }, [employeeData, selectedDepartment, selectedPosition, selectedLocation]);

  // Simplified scrolling logic without IntersectionObserver
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  const selectedFields = fields.filter((field) => field.selected);

  const getColumnWidth = (key: string): string => {
    switch (key) {
      case "empNo":
        return "w-24"; // Employee No column width
      case "empName":
        return "w-48"; // Employee Name column width
      case "siteDesignation":
        return "w-32"; // Site Designation column width
      case "designation":
        return "w-32"; // Designation column width
      case "head":
        return "w-32"; // Head column width
      case "department":
        return "w-36"; // Department column width
      case "hod":
        return "w-32"; // HOD column width
      case "doj":
        return "w-32"; // Date of Joining column width
      case "visa":
        return "w-32"; // Visa column width
      case "iqamaNo":
        return "w-32"; // Iqama No column width
      case "status":
        return "w-20"; // Status column width
      case "category":
        return "w-24"; // Category column width
      case "payrole":
        return "w-32"; // Payrole column width
      case "sponser":
        return "w-32"; // Sponser column width
      case "project":
        return "w-40"; // Project column width
      case "accommodationStatus":
        return "w-40"; // Accommodation Status column width
      default:
        return "w-32"; // Default width for any other column
    }
  };
  

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="grid grid-cols-4 gap-4 mb-4 items-center">
        <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {uniqueDepartments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setSelectedPosition} value={selectedPosition}>
          <SelectTrigger>
            <SelectValue placeholder="All Positions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Positions</SelectItem>
            {uniquePositions.map((pos) => (
              <SelectItem key={pos} value={pos}>
                {pos}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setSelectedLocation} value={selectedLocation}>
          <SelectTrigger>
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {uniqueLocations.map((loc) => (
              <SelectItem key={loc} value={loc}>
                {loc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog>
          <DialogTrigger>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded">
              Select Fields
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Fields to Display</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {fields.map((field, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    checked={field.selected}
                    onCheckedChange={(checked) =>
                      setFields((prevFields) => {
                        const newFields = [...prevFields];
                        newFields[index].selected = checked as boolean;
                        return newFields;
                      })
                    }
                  />
                  <label className="text-sm">{field.label}</label>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
  {/* Table Header */}
  <div className="flex font-semibold text-gray-700 bg-gray-200 border-b pb-2">
    {selectedFields.map((field) => (
      <div
        key={field.key}
        className={`
          ${getColumnWidth(field.key)} 
          flex-shrink-0 
          flex-grow`}
      >
        {field.label}
      </div>
    ))}
  </div>

  {/* Table Body */}
  <div className="flex flex-col">
  {filteredData.map((item) => (
      <div
        // key={index}
        className="flex border-b py-2"
      >
         {selectedFields.map((field) => (
          <div
          key={field.key}
            className={`
              ${getColumnWidth(field.key)}
              flex-shrink-0
              flex-grow`}
          >
                 {item[field.key as keyof Employee]}
          </div>
        ))}
      </div>
    ))}
  </div>
</div>



      {/* Loading More Indicator */}
      {isFetchingNextPage && <div className="text-center p-4">Loading more...</div>}
    </div>
  );
}
