"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Checkbox } from "@/components/ui/checkbox";
import { sql } from "drizzle-orm";
import { Label } from '@/components/ui/label';
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
  const [searchQuery, setSearchQuery] = useState(""); // State to hold the search query
  const [fields, setFields] = useState([
    { key: "serial", label: "S.No.", selected: true, minWidth: "50px", maxLength: 3 },
    { key: "empNo", label: "Employee No", selected: true, minWidth: "120px", maxLength: 7 },
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

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null); // State to hold the selected employee
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

  // Filter data based on department, position, location, and search query
  const filteredData = useMemo(() => {
    const filtered = employeeData.filter((item) => {
      const matchesSearchQuery = item.empNo.toLowerCase().includes(searchQuery.toLowerCase()) || item.empName.toLowerCase().includes(searchQuery.toLowerCase());
      return (
        matchesSearchQuery &&
        (selectedDepartment !== "all" ? item.department === selectedDepartment : true) &&
        (selectedPosition !== "all" ? item.designation === selectedPosition : true) &&
        (selectedLocation !== "all" ? item.project === selectedLocation : true)
      );
    });
  
    // Assign serial numbers based on filtered data
    return filtered.map((item, index) => ({
      ...item,
      serial: index + 1, // Serial number based on its index in the filtered data
      doj: item.doj.toString().split("T")[0], // Format date
    }));
  }, [employeeData, selectedDepartment, selectedPosition, selectedLocation, searchQuery]);

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
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by Employee No or Name"
          className="w-full p-2 border rounded-md"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-3 gap-4 mb-2">
        {/* Department Filter */}
        <div className="flex flex-col">
          <Label htmlFor="department" className="text-md font-medium text-gray-600">
            Department
          </Label>
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
        </div>

        {/* Position Filter */}
        <div className="flex flex-col">
          <Label htmlFor="position" className="text-md font-medium text-gray-600">
            Position
          </Label>
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
        </div>

        {/* Location Filter */}
        <div className="flex flex-col">
          <Label htmlFor="location" className="text-md font-medium text-gray-600">
            Location
          </Label>
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
      </div>

      {/* Card wrapping the table */}
      <div className="w-full overflow-x-scroll">
        <Card className="min-w-[1000px] min-h-[500px] p-4">
          <div className="max-h-[550px] overflow-y-auto relative">
            <table className="w-full border-collapse">
              <thead className="sticky top-0 bg-white shadow-md z-10">
                <tr>
                  {fields.map((field) => (
                    <th
                      key={field.key}
                      className="px-1 py-1 font-normal text-left capitalize"  // Removed 'uppercase'
                      style={{ minWidth: field.minWidth }}
                    >
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, index) => (
                  <tr
                    key={item.empNo}
                    className={index % 2 === 0 ? "bg-gray-100" : "bg-white"} 
                    onClick={() => setSelectedEmployee(item)} // Set selected employee on row click
                  >
                    {fields.map((field) => {
                      if (field.selected) {
                        return (
                          <td
                            key={field.key}
                            className="px-2 py-2 text-left text-sm capitalize"  // Added 'capitalize' class
                            style={{ minWidth: field.minWidth }}
                          >
                            {field.key === "serial"
                              ? item.serial // Directly render the serial number from the data
                              : item[field.key as keyof Employee] && field.maxLength
                              ? truncateText(item[field.key as keyof Employee], field.maxLength)
                              : item[field.key as keyof Employee]}
                          </td>
                        );
                      }
                      return null; // Don't render anything if the field is not selected
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {selectedEmployee && (
        <Dialog open={!!selectedEmployee} onOpenChange={(open) => !open && setSelectedEmployee(null)}>
          <DialogContent className="max-w-4xl w-full">
            <DialogHeader>
              <DialogTitle>Employee Details</DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-5 gap-4">
              <Label htmlFor="empNo" className="col-span-1 text-md font-medium text-gray-600">Employee No:</Label>
              <div className="col-span-4">{selectedEmployee.empNo}</div>

              <Label htmlFor="empName" className="col-span-1 text-md font-medium text-gray-600">Name:</Label>
              <div className="col-span-4">{selectedEmployee.empName}</div>

              <Label htmlFor="designation" className="col-span-1 text-md font-medium text-gray-600">Designation:</Label>
              <div className="col-span-4">{selectedEmployee.designation}</div>

              <Label htmlFor="department" className="col-span-1 text-md font-medium text-gray-600">Department:</Label>
              <div className="col-span-4">{selectedEmployee.department}</div>

              <Label htmlFor="head" className="col-span-1 text-md font-medium text-gray-600">Head:</Label>
              <div className="col-span-4">{selectedEmployee.head}</div>

              <Label htmlFor="hod" className="col-span-1 text-md font-medium text-gray-600">HOD:</Label>
              <div className="col-span-4">{selectedEmployee.hod}</div>

              <Label htmlFor="doj" className="col-span-1 text-md font-medium text-gray-600">Date of Joining:</Label>
              <div className="col-span-4">{selectedEmployee.doj}</div>

              <Label htmlFor="status" className="col-span-1 text-md font-medium text-gray-600">Status:</Label>
              <div className="col-span-4">{selectedEmployee.status}</div>

              <Label htmlFor="visa" className="col-span-1 text-md font-medium text-gray-600">Visa:</Label>
              <div className="col-span-4">{selectedEmployee.visa}</div>

              <Label htmlFor="project" className="col-span-1 text-md font-medium text-gray-600">Project:</Label>
              <div className="col-span-4">{selectedEmployee.project}</div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Loading More Indicator */}
      <div ref={observerTargetRef} />
    </div>
  );
}
