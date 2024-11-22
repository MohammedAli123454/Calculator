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
  key: keyof Employee | "serial";  // Allow 'serial' for the new column
  label: string;
  selected: boolean;
  colSpan: number;
  minWidth: string;
  maxLength: number;
};


// Fetch unique records
const fetchUniqueRecords = async () => {
  try {
    const [departmentsResult, positionsResult, locationsResult] = await Promise.all([
      db.execute(sql`SELECT DISTINCT department FROM employee`),
      db.execute(sql`SELECT DISTINCT designation FROM employee`),
      db.execute(sql`SELECT DISTINCT project FROM employee`)
    ]);
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
}) => {
  try {
    const employees = await db
      .select()
      .from(employee)
      .offset((pageParam - 1) * limit)
      .limit(limit)
      .execute();

    const countResult = await db.execute(sql`SELECT COUNT(*) FROM employee`);
    const totalEmployeeCount = Number(countResult.rows[0]?.count) || 0;

    // Add serial numbers dynamically
    const employeesWithSerial = employees.map((emp, index) => ({
      ...emp,
      serial: (pageParam - 1) * limit + index + 1, // Compute serial number
      doj: emp.doj.toString().split("T")[0], // Format date
    }));

    const nextCursor = pageParam * limit < totalEmployeeCount ? pageParam + 1 : null;

    return {
      employees: employeesWithSerial,
      nextCursor,
    };
  } catch (error) {
    console.error("Error fetching employee data:", error);
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
    { key: "serial", label: "S.No.", selected: true, minWidth: "50px", maxLength: 3 },
    { key: "empNo", label: "Employee No", selected: true, minWidth: "110px", maxLength: 7 },
    { key: "empName", label: "Employee Name", selected: true, minWidth: "220px", maxLength: 20 },
    { key: "siteDesignation", label: "Site Designation", selected: true, minWidth: "220px", maxLength: 20 },
    { key: "designation", label: "Designation", selected: true, minWidth: "220px", maxLength: 20 },
    { key: "head", label: "Head", selected: true, minWidth: "150px", maxLength: 10 },
    { key: "department", label: "Department", selected: true, minWidth: "220px", maxLength: 20 },
    { key: "hod", label: "HOD", selected: true, minWidth: "100px", maxLength: 10 },
    { key: "doj", label: "Date of Joining", selected: true, minWidth: "150px", maxLength: 15 },
    { key: "visa", label: "Visa", selected: true, minWidth: "150px", maxLength: 10 },
    { key: "iqamaNo", label: "Iqama No", selected: true, minWidth: "150px", maxLength: 15 },
    { key: "status", label: "Status", selected: true, minWidth: "100px", maxLength: 10 },
    { key: "category", label: "Category", selected: true, minWidth: "100px", maxLength: 10 },
    { key: "payrole", label: "Payrole", selected: true, minWidth: "150px", maxLength: 10 },
    { key: "sponser", label: "Sponser", selected: true, minWidth: "220px", maxLength: 20 },
    { key: "project", label: "Project", selected: true, minWidth: "220px", maxLength: 20 },
    { key: "accommodationStatus", label: "Accommodation Status", selected: true, minWidth: "200px", maxLength: 10 },
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
    queryFn: ({ pageParam = 1 }) => fetchEmployeeData({ pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor ?? undefined;
    },
  });

  const employeeData = data?.pages.flatMap((page) => page.employees) || [];

  const { data: uniqueRecords, isLoading: loadingUniqueRecords, error: uniqueRecordsError } = useQuery({
    queryKey: ["uniqueRecords"],
    queryFn: fetchUniqueRecords,
    staleTime: 5 * 60 * 1000,
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

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
  };

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

      {/* Card wrapping the table */}
      <div className="w-full overflow-x-scroll">
        <Card className="min-w-[1000px] min-h-[500px] p-6">
          <div className="w-full max-h-[500px] overflow-y-auto">
            <Table className="min-w-full table-auto">
              <TableHeader>
                <TableRow>
                  {fields.map((field) => (
                    <TableHead
                      key={field.key}
                      className="text-left sticky top-0 bg-white z-10"
                      style={{
                        minWidth: field.minWidth,
                        zIndex: 10,
                      }}
                    >
                      {field.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
  {filteredData.map((item, index) => (
    <TableRow
      key={item.empNo}
      className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
    >
      {fields.map((field) => {
        if (field.selected) {
          return (
            <TableCell
              key={field.key}
              className="text-left"
              style={{ minWidth: field.minWidth }}
            >
              {field.key === "serial"
                ? item.serial // Directly render the serial number from the data
                : item[field.key as keyof Employee] && field.maxLength
                ? truncateText(item[field.key as keyof Employee], field.maxLength)
                : item[field.key as keyof Employee]}
            </TableCell>
          );
        }
        return null; // Don't render anything if the field is not selected
      })}
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