"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const EmployeeList = () => {
  const employees = [
    {
      id: 1,
      name: "Alice Johnson",
      designation: "Software Engineer",
      department: "IT",
      email: "alice.johnson@example.com",
      location: "New York",
      phone: "+1-234-567-8901",
      hireDate: "2021-06-01",
      status: "Active",
      salary: "$120,000",
    },
    {
      id: 2,
      name: "Bob Smith",
      designation: "Product Manager",
      department: "Product",
      email: "bob.smith@example.com",
      location: "San Francisco",
      phone: "+1-234-567-8902",
      hireDate: "2020-03-15",
      status: "Active",
      salary: "$150,000",
    },
    {
      id: 3,
      name: "Charlie Brown",
      designation: "UX Designer",
      department: "Design",
      email: "charlie.brown@example.com",
      location: "Seattle",
      phone: "+1-234-567-8903",
      hireDate: "2019-09-25",
      status: "On Leave",
      salary: "$110,000",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Employee List</h1>
      <div className="w-full max-w-6xl overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center min-w-[50px]">ID</TableHead>
              <TableHead className="text-left min-w-[200px]">Name</TableHead>
              <TableHead className="text-left min-w-[150px]">Designation</TableHead>
              <TableHead className="text-left min-w-[150px]">Department</TableHead>
              <TableHead className="text-left min-w-[200px]">Email</TableHead>
              <TableHead className="text-left min-w-[150px]">Location</TableHead>
              <TableHead className="text-left min-w-[150px]">Phone</TableHead>
              <TableHead className="text-left min-w-[150px]">Hire Date</TableHead>
              <TableHead className="text-left min-w-[100px]">Status</TableHead>
              <TableHead className="text-right min-w-[150px]">Salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee, index) => (
              <TableRow key={employee.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <TableCell className="text-center">{employee.id}</TableCell>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.designation}</TableCell>
                <TableCell>{employee.department}</TableCell>
                <TableCell className="truncate">{employee.email}</TableCell>
                <TableCell>{employee.location}</TableCell>
                <TableCell>{employee.phone}</TableCell>
                <TableCell>{employee.hireDate}</TableCell>
                <TableCell>{employee.status}</TableCell>
                <TableCell className="text-right">{employee.salary}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EmployeeList;
