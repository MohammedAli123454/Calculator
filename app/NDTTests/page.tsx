"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,

} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"


// Define a TypeScript type for the test data
type Test = {
  test_name: string;
  description: string;
};

// Sample data for tests
const tests = [
    {
        test_name: "Procedure Qualification Record (PQR)",
        description: "Documents the test results and parameters of a welding procedure to verify compliance with welding codes and standards.",
      },
      {
        test_name: "Welder Qualification Test (WQT)",
        description: "Evaluates a welder's ability to produce welds that meet predefined quality standards.",
      },
      {
        test_name: "Welding Procedure Specification (WPS)",
        description: "Provides a detailed guideline describing how a welding process is to be performed, including materials, techniques, and parameters.",
      },
    {
      test_name: "Ultrasonic Testing (UT)",
      description: "Uses high-frequency sound waves to detect internal defects and measure material thickness.",
    },
    {
      test_name: "Penetrant Testing (PT)",
      description: "A surface inspection method using liquid dye to detect surface-breaking defects.",
    },
    {
      test_name: "Magnetic Particle Testing (MT)",
      description: "Uses magnetic fields and iron particles to detect surface and near-surface defects in ferromagnetic materials.",
    },
    {
      test_name: "Radiographic Testing (RT)",
      description: "Uses X-rays or gamma rays to view the internal structure of materials and detect internal defects.",
    },
    {
      test_name: "Phased Array Ultrasonic Testing (PAUT)",
      description: "Advanced ultrasonic method that uses an array of transducers to create detailed images and detect defects.",
    },
    {
      test_name: "Hardness Testing",
      description: "Measures the resistance of a material to deformation or indentation, typically using methods like Rockwell, Brinell, or Vickers.",
    },
    {
      test_name: "Positive Material Identification (PMI)",
      description: "Verifies the material composition using methods like X-ray fluorescence or optical emission spectrometry.",
    },
    {
      test_name: "Ferrite Testing",
      description: "Measures the amount of ferrite in stainless steel or welds to ensure proper composition and weldability.",
    },
    {
      test_name: "Continuity Test",
      description: "Checks the electrical continuity of conductors or components to ensure a complete electrical circuit.",
    },
    {
      test_name: "Leak Testing",
      description: "Detects leaks in systems by pressurizing with air, water, or gas and monitoring for pressure drops or visible leakage.",
    },
    {
      test_name: "Field Density Testing (FDT)",
      description: "Measures the density or compaction of materials like soil or concrete, ensuring compliance with specifications.",
    },
    {
      test_name: "Hydrostatic Testing (Hydro Test)",
      description: "Tests the strength and integrity of pressure systems by filling them with water and applying pressure to check for leaks or deformations.",
    },
    {
      test_name: "Pneumatic Testing",
      description: "Tests for leaks in pipes or vessels by using compressed air or other gases instead of water.",
    },
    {
      test_name: "Service Testing",
      description: "Simulates actual operating conditions to ensure the system or component functions as expected under normal service conditions.",
    },
    {
      test_name: "Nitrogen Testing",
      description: "Uses nitrogen gas to pressurize a system to check for leaks by monitoring pressure changes or escaping gas.",
    },
  ];

export default function Home() {
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);

  const handleTestClick = (test: Test) => {
    setSelectedTest(test);
  };

  const handleCloseDialog = () => {
    setSelectedTest(null);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center justify-center">
      {/* Test Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <Button
            key={test.test_name}
            onClick={() => handleTestClick(test)}
             className="bg-white text-black p-8 border border-gray-300 rounded-xl shadow-md hover:shadow-lg hover:border-blue-500 hover:bg-blue-50 transition-transform duration-200 ease-in-out transform hover:scale-105 text-center"
          >
            <div className="font-semibold text-lg">{test.test_name}</div>
          </Button>
        ))}
      </div>

      {/* Dialog for displaying description */}
      {selectedTest && (
        <Dialog open={!!selectedTest} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent className="bg-white p-8 rounded-lg shadow-xl max-w-xl mx-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold text-gray-900">
                {selectedTest.test_name}
              </DialogTitle>
              <DialogDescription className="mt-4 text-gray-600 text-base">
                {selectedTest.description}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                onClick={handleCloseDialog}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
