"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Checkbox } from "@/components/ui/checkbox";
import { sql } from "drizzle-orm";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"; // ShadCN UI Table components
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"


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

type Field = {
  key: keyof Employee; // Ensure key is a key of Employee type
  label: string;
  selected: boolean;
  colSpan: number;
};

interface EmployeeRow {
  department: string;
  designation: string;
  project: string;
}

// Fetch unique records
const fetchUniqueRecords = async () => {
  try {
    // Execute raw SQL queries for distinct records
    const [departmentsResult, positionsResult, locationsResult] = await Promise.all([
      db.execute(sql`SELECT DISTINCT department FROM employee`),
      db.execute(sql`SELECT DISTINCT designation FROM employee`),
      db.execute(sql`SELECT DISTINCT project FROM employee`)
    ]);

    // Safely cast the result rows using a type guard
    const uniqueDepartments: string[] = (departmentsResult.rows as { department: string }[]).map((row) => row.department);
    const uniquePositions: string[] = (positionsResult.rows as { designation: string }[]).map((row) => row.designation);
    const uniqueLocations: string[] = (locationsResult.rows as { project: string }[]).map((row) => row.project);

    return { uniqueDepartments, uniquePositions, uniqueLocations };
  } catch (error) {
    console.error('Error fetching unique records:', error);
    return { uniqueDepartments: [], uniquePositions: [], uniqueLocations: [] };
  }
};

// Fetch paginated employee data
const fetchEmployeeData = async ({
  pageParam = 1,
  limit = 20,
}: {
  pageParam: number;
  limit: number;
}): Promise<{ employees: Employee[]; nextCursor: number | null }> => {
  try {
    // Fetch employees with pagination logic
    const employees = await db
      .select()
      .from(employee)
      .offset((pageParam - 1) * limit) // Adjust for 1-based pagination
      .limit(limit)
      .execute();

    // Count query to determine the total number of employees
    const countResult = await db.execute(sql`SELECT COUNT(*) FROM employee`);
    const totalEmployeeCount = Number(countResult.rows[0]?.count) || 0;

    // Calculate the next page cursor based on the total count and current page
    const nextCursor = (pageParam * limit) < totalEmployeeCount ? pageParam + 1 : null;

    return {
      employees: employees.map((emp) => ({
        ...emp,
        doj: emp.doj.toString().split('T')[0], // Format the date of joining
      })),
      nextCursor,
    };
  } catch (error) {
    console.error('Error fetching employee data:', error);
    return {
      employees: [],
      nextCursor: null,
    };
  }
};

export default function EmployeeDataTable() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [fields, setFields] = useState([
    { key: "empNo", label: "Employee No", selected: true, colSpan: 2, minWidth: "100px" },
    { key: "empName", label: "Employee Name", selected: true, colSpan: 3, minWidth: "200px" },
    { key: "siteDesignation", label: "Site Designation", selected: true, colSpan: 4, minWidth: "150px" },
    { key: "designation", label: "Designation", selected: true, colSpan: 2, minWidth: "150px" },
    { key: "head", label: "Head", selected: true, colSpan: 2, minWidth: "150px" },
    { key: "department", label: "Department", selected: true, colSpan: 2, minWidth: "150px" },
    { key: "hod", label: "HOD", selected: true, colSpan: 2, minWidth: "150px" },
    { key: "doj", label: "Date of Joining", selected: true, colSpan: 2, minWidth: "150px" },
    { key: "visa", label: "Visa", selected: true, colSpan: 2, minWidth: "150px" },
    { key: "iqamaNo", label: "Iqama No", selected: true, colSpan: 2, minWidth: "150px" },
    { key: "status", label: "Status", selected: true, colSpan: 1, minWidth: "100px" },
    { key: "category", label: "Category", selected: true, colSpan: 1, minWidth: "100px" },
    { key: "payrole", label: "Payrole", selected: true, colSpan: 2, minWidth: "150px" },
    { key: "sponser", label: "Sponser", selected: true, colSpan: 2, minWidth: "150px" },
    { key: "project", label: "Project", selected: true, colSpan: 2, minWidth: "150px" },
    { key: "accommodationStatus", label: "Accommodation Status", selected: true, colSpan: 3, minWidth: "200px" },
  ]);

  const observerTargetRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["employees"],
    queryFn: ({ pageParam = 1 }) => fetchEmployeeData({ pageParam, limit: 20 }), // Fetches employee data with pageParam
    initialPageParam: 1, // Starts with page 1
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor ?? undefined; // If there is no nextCursor, return undefined to indicate no more pages
    },
  });

  const employeeData = data?.pages.flatMap((page) => page.employees) || [];

  // Fetch unique departments, positions, and locations once
  const { data: uniqueRecords, isLoading: loadingUniqueRecords, error: uniqueRecordsError } = useQuery({
    queryKey: ["uniqueRecords"],  // Unique key for the query
    queryFn: fetchUniqueRecords,  // The function that fetches the unique records
    staleTime: 5 * 60 * 1000,      // Cache the data for 5 minutes
  });

  const uniqueDepartments = useMemo(() => uniqueRecords?.uniqueDepartments || [], [uniqueRecords]);
  const uniquePositions = useMemo(() => uniqueRecords?.uniquePositions || [], [uniqueRecords]);
  const uniqueLocations = useMemo(() => uniqueRecords?.uniqueLocations || [], [uniqueRecords]);

  const filteredData = useMemo(() => {
    return employeeData.filter((item) => {
      return (
        (selectedDepartment !== "all" ? item.department === selectedDepartment : true) &&
        (selectedPosition !== "all" ? item.designation === selectedPosition : true) &&
        (selectedLocation !== "all" ? item.project === selectedLocation : true)
      );
    });
  }, [employeeData, selectedDepartment, selectedPosition, selectedLocation]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.5 }
    );
  
    if (observerTargetRef.current) {
      observer.observe(observerTargetRef.current);
    }
  
    return () => {
      if (observerTargetRef.current) {
        observer.unobserve(observerTargetRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Employee List</h1>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <Select onValueChange={setSelectedDepartment} value={selectedDepartment}>
          <SelectTrigger>
            <SelectValue placeholder="All Departments" />
          </SelectTrigger>
          <SelectContent>
            {["all", ...uniqueDepartments].map((department) => (
              <SelectItem key={department} value={department}>
                {department}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setSelectedPosition} value={selectedPosition}>
          <SelectTrigger>
            <SelectValue placeholder="All Positions" />
          </SelectTrigger>
          <SelectContent>
            {["all", ...uniquePositions].map((position) => (
              <SelectItem key={position} value={position}>
                {position}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={setSelectedLocation} value={selectedLocation}>
          <SelectTrigger>
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            {["all", ...uniqueLocations].map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
{/* ShadCN UI Card wrapping the table */}
<div className="w-full overflow-x-scroll">
        <Card className="min-w-[1000px] min-h-[400px] p-6">
          <div className="w-full max-w-full">
            <Table className="min-w-full">
              <TableHeader>
                <TableRow>
                  {fields.map((field) => (
                    <TableHead key={field.key} className={`text-left min-w-[${field.minWidth}]`}>
                      {field.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow key={item.empNo} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    {fields.map((field) => (
                      <TableCell key={field.key} className={`text-left min-w-[${field.minWidth}]`}>
                        {item[field.key as keyof Employee]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>

      {/* Loading More Indicator */}
      <div ref={observerTargetRef} />
    </div>
  );
}
