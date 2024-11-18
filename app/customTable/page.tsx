"use client";
import { faker } from "@faker-js/faker";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

  const { data: employeeData = [], isLoading } = useQuery<Employee[]>({
    queryKey: ["employeeData"],
    queryFn: fetchEmployeeData,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const uniqueDepartments = useMemo(
    () => Array.from(new Set(employeeData.map((item) => item.department))).slice(0, 10),
    [employeeData]
  );
  const uniquePositions = useMemo(
    () => Array.from(new Set(employeeData.map((item) => item.position))).slice(0, 10),
    [employeeData]
  );
  const uniqueLocations = useMemo(
    () => Array.from(new Set(employeeData.map((item) => item.location))).slice(0, 10),
    [employeeData]
  );

  const filteredData = useMemo(() => {
    return employeeData.filter((item) => {
      return (
        (selectedDepartment !== "all" ? item.department === selectedDepartment : true) &&
        (selectedPosition !== "all" ? item.position === selectedPosition : true) &&
        (selectedLocation !== "all" ? item.location === selectedLocation : true)
      );
    });
  }, [employeeData, selectedDepartment, selectedPosition, selectedLocation]);

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

  const selectedFields = fields.filter((field) => field.selected);

  return (
    <div className="p-4">
      {/* Sticky Filters and Table Header */}
      <div className="sticky top-0 bg-white z-50">
        {/* Filters */}
        <div className="grid grid-cols-4 gap-4 mb-4 items-center">
          {/* Department Select */}
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

          {/* Position Select */}
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

          {/* Location Select */}
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

          {/* Field Selection Button */}
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
              <div className="flex flex-col space-y-2">
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
            </DialogContent>
          </Dialog>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 font-semibold text-gray-700 bg-gray-200 border-b pb-2">
          {selectedFields.map((field) => (
            <div
              key={field.key}
              className={`${
                field.key === "id" ? "col-span-1" :
                field.key === "name" ? "col-span-3" :
                field.key === "department" ? "col-span-2" :
                field.key === "position" ? "col-span-2" :
                field.key === "salary" ? "col-span-2" :
                field.key === "hireDate" ? "col-span-1" :
                "col-span-1"
              }`}
            >
              {field.label}
            </div>
          ))}
        </div>
      </div>

      {/* Table Data */}
      {filteredData.map((item) => (
        <div key={item.id} className="grid grid-cols-12 gap-4 py-2 border-b text-gray-600">
          {selectedFields.map((field) => (
            <div
              key={field.key}
              className={`${
                field.key === "id" ? "col-span-1" :
                field.key === "name" ? "col-span-3" :
                field.key === "department" ? "col-span-2" :
                field.key === "position" ? "col-span-2" :
                field.key === "salary" ? "col-span-2" :
                field.key === "hireDate" ? "col-span-1" :
                "col-span-1"
              }`}
            >
              {item[field.key as keyof Employee]}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
