"use client";
import { faker } from "@faker-js/faker";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Define the type for Employee Data
type Employee = {
  id: string;
  name: string;
  department: string;
  position: string;
  salary: string;
  hireDate: string;
  location: string;
};

// Function to generate fake employee data
const fetchEmployeeData = async (): Promise<Employee[]> => {
  const minSalary = 40000;
  const maxSalary = 120000;

  return Array.from({ length: 2000 }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    department: faker.commerce.department(),
    position: faker.person.jobTitle(),
    salary: `$${Math.round(Math.random() * (maxSalary - minSalary) + minSalary)}`,
    hireDate: new Date(faker.date.past({ years: 10 })).toLocaleDateString("en-US"),
    location: faker.location.city(),
  }));
};

export default function EmployeeDataTable() {
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [fields, setFields] = useState([
    { key: "id", label: "ID", selected: true },
    { key: "name", label: "Name", selected: true },
    { key: "department", label: "Department", selected: true },
    { key: "position", label: "Position", selected: true },
    { key: "salary", label: "Salary", selected: true },
    { key: "hireDate", label: "Hire Date", selected: true },
    { key: "location", label: "Location", selected: true },
  ]);

  // Use TanStack Query to fetch employee data
  const { data: employeeData = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["employeeData"],
    queryFn: fetchEmployeeData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Memoize the unique values for departments, positions, and locations
  const uniqueDepartments = useMemo(
    () => Array.from(new Set(employeeData.map((item) => item.department))) as string[],
    [employeeData]
  );
  const uniquePositions = useMemo(
    () => Array.from(new Set(employeeData.map((item) => item.position))) as string[],
    [employeeData]
  );
  const uniqueLocations = useMemo(
    () => Array.from(new Set(employeeData.map((item) => item.location))) as string[],
    [employeeData]
  );

  // Memoize filtered data to avoid recalculating on every render
  const filteredData = useMemo(() => {
    return employeeData.filter((item) => {
      return (
        (selectedDepartment !== "all" ? item.department === selectedDepartment : true) &&
        (selectedPosition !== "all" ? item.position === selectedPosition : true) &&
        (selectedLocation !== "all" ? item.location === selectedLocation : true)
      );
    });
  }, [employeeData, selectedDepartment, selectedPosition, selectedLocation]);

  // Handle field selection change
  const handleFieldChange = (key: string) => {
    setFields((prevFields) =>
      prevFields.map((field) =>
        field.key === key ? { ...field, selected: !field.selected } : field
      )
    );
  };

  if (isLoading) {
    return <div>Loading data...</div>;
  }

  // Get the list of selected fields
  const selectedFields = fields.filter((field) => field.selected);

  return (
    <div className="p-4">
      {/* Filters */}
      <div className="flex space-x-4 mb-4">
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
      </div>

      {/* Field Selection */}
      <div className="flex space-x-4 mb-4">
        {fields.map((field) => (
          <label key={field.key} className="flex items-center space-x-2">
            <Checkbox
              checked={field.selected}
              onCheckedChange={() => handleFieldChange(field.key)}
            />
            <span>{field.label}</span>
          </label>
        ))}
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-6 gap-4 font-semibold text-gray-700 border-b pb-2">
        {selectedFields.map((field) => (
          <div key={field.key}>{field.label}</div>
        ))}
      </div>

      {/* Table Data */}
      {filteredData.map((item) => (
        <div key={item.id} className="grid grid-cols-6 gap-4 py-2 border-b text-gray-600">
          {selectedFields.map((field) => (
            <div key={field.key}>{item[field.key as keyof Employee]}</div>
          ))}
        </div>
      ))}
    </div>
  );
}
