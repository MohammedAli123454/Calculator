"use client";

import React from "react";

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
        <table className="table-auto w-full border-collapse border border-gray-300 text-sm">
          <thead className="bg-gray-200 font-semibold">
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-center w-16">ID</th>
              <th className="border border-gray-300 px-4 py-2 text-left min-w-[200px]">NAME</th>
              <th className="border border-gray-300 px-4 py-2 text-left min-w-[150px]">DESIGNATION</th>
              <th className="border border-gray-300 px-4 py-2 text-left min-w-[150px]">DEPARTMENT</th>
              <th className="border border-gray-300 px-4 py-2 text-left min-w-[200px]">EMAIL</th>
              <th className="border border-gray-300 px-4 py-2 text-left min-w-[150px]">LOCATION</th>
              <th className="border border-gray-300 px-4 py-2 text-left min-w-[150px]">PHONE</th>
              <th className="border border-gray-300 px-4 py-2 text-left min-w-[150px]">HIRE DATE</th>
              <th className="border border-gray-300 px-4 py-2 text-left min-w-[100px]">STATUS</th>
              <th className="border border-gray-300 px-4 py-2 text-right min-w-[150px]">SALARY</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee, index) => (
              <tr key={employee.id} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="border border-gray-300 px-4 py-2 text-center">{employee.id}</td>
                <td className="border border-gray-300 px-4 py-2 text-left">{employee.name}</td>
                <td className="border border-gray-300 px-4 py-2 text-left">{employee.designation}</td>
                <td className="border border-gray-300 px-4 py-2 text-left">{employee.department}</td>
                <td className="border border-gray-300 px-4 py-2 text-left truncate">{employee.email}</td>
                <td className="border border-gray-300 px-4 py-2 text-left">{employee.location}</td>
                <td className="border border-gray-300 px-4 py-2 text-left">{employee.phone}</td>
                <td className="border border-gray-300 px-4 py-2 text-left">{employee.hireDate}</td>
                <td className="border border-gray-300 px-4 py-2 text-left">{employee.status}</td>
                <td className="border border-gray-300 px-4 py-2 text-right">{employee.salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;
