"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

// Nominal pipe sizes with corresponding values in meters
const nominalPipeSizes: { [key: string]: number } = {
  "0.50": 0.0213,
  "0.75": 0.0267,
  "1": 0.0334,
  "2": 0.0603,
  "3": 0.0889,
  "4": 0.1143,
  "5": 0.1413,
  "6": 0.1683,
  "7": 0.1937,
  "8": 0.2191,
  "9": 0.2445,
  "10": 0.273,
  "11": 0.2985,
  "12": 0.3238,
};

// TypeScript interface for the pipe data
interface Pipe {
  length: string;
  diameterInches: string;
}

// TypeScript interface for the form data
interface FormData {
  pipes: Pipe[];
}

export default function MultiplePipeSurfaceAreaCalculator() {
  const { control, register, handleSubmit } = useForm<FormData>({
    defaultValues: {
      pipes: [{ length: "", diameterInches: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pipes",
  });

  const [calculationResults, setCalculationResults] = useState<{
    pipes: { lengthMeters: string; diameterInches: string; surfaceArea: string }[];
    totalLengthMeters: string;
    totalSurfaceAreaMetersSquared: string;
  } | null>(null);

  const [formError, setFormError] = useState<string | null>(null); // Error state
  const [isAboutDialogOpen, setIsAboutDialogOpen] = useState(false); // About dialog state

  const handleFormSubmit = (formData: FormData) => {
    // Check if all fields are filled
    const allFieldsFilled = formData.pipes.every(
      (pipe) => pipe.length.trim() !== "" && pipe.diameterInches.trim() !== ""
    );

    if (!allFieldsFilled) {
      setFormError("Please fill all the fields or remove the blank fields");
      return;
    }

    setFormError(null); // Clear any previous error message

    let totalLengthMeters = 0;
    let totalSurfaceAreaMetersSquared = 0;

    const pipeCalculations = formData.pipes.map(({ length, diameterInches }) => {
      const lengthMeters = parseFloat(length);
      let diameterMeters: number;

      if (nominalPipeSizes[diameterInches]) {
        diameterMeters = nominalPipeSizes[diameterInches];
      } else {
        diameterMeters = parseFloat(diameterInches) * 0.0254;
      }

      const radiusMeters = diameterMeters / 2;
      const surfaceArea = 2 * Math.PI * radiusMeters * lengthMeters;

      totalLengthMeters += lengthMeters;
      totalSurfaceAreaMetersSquared += surfaceArea;

      return {
        lengthMeters: lengthMeters.toFixed(2),
        diameterInches,
        surfaceArea: surfaceArea.toFixed(2),
      };
    });

    setCalculationResults({
      pipes: pipeCalculations,
      totalLengthMeters: totalLengthMeters.toFixed(2),
      totalSurfaceAreaMetersSquared: totalSurfaceAreaMetersSquared.toFixed(2),
    });
  };

  return (
    // <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
    <div className="flex justify-center items-center min-h-screen  p-4">
      <Card className="w-full max-w-3xl p-4 relative">
        {/* About Button positioned at the top-right */}
        <Button
          onClick={() => setIsAboutDialogOpen(true)}
          className="absolute top-4 right-4 bg-indigo-500 text-white hover:bg-indigo-600"
        >
          About
        </Button>

        <CardHeader className="p-2">
          <h2 className="text-2xl font-bold mb-4">Pipe Surface Area Calculator</h2>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {formError && <p className="text-red-500">{formError}</p>} {/* Error message */}
            <div className="relative">
              {/* Fixed Labels without background */}
              <div className="sticky top-0 z-10 flex space-x-4 mb-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium">Pipe Length (meters)</label>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium">Pipe Diameter (inches)</label>
                </div>
                <div className="w-28"></div> {/* Empty space for buttons */}
              </div>

              <div className="space-y-4 overflow-y-auto max-h-96">
                {fields.map((field, index) => (
                  <div key={field.id} className="flex items-center space-x-4">
                    <div className="flex-1">
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`pipes.${index}.length`, { required: true })}
                        placeholder="Enter length in meters"
                        className="block w-full"
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`pipes.${index}.diameterInches`, { required: true })}
                        placeholder="Enter diameter in inches"
                        className="block w-full"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={() => append({ length: "", diameterInches: "" })}
                        className="bg-blue-500 text-white hover:bg-blue-600 flex-1 font-bold text-lg"
                      >
                        +
                      </Button>
                      {/* Disable remove button if it's the first item */}
                      <Button
                        type="button"
                        onClick={() => index > 0 && remove(index)}
                        className="bg-red-500 text-white hover:bg-red-600 flex-1"
                        disabled={index === 0}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
                <hr className="border-t border-gray-300 w-full mt-4" />
              </div>
            </div>
            <Button type="submit" className="bg-green-500 text-white hover:bg-green-600 w-full">
              Calculate Surface Area
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pt-4">
          {calculationResults && (
            <div className="w-full">
              <h3 className="text-lg font-bold mb-4">Calculation Results:</h3>
              <div className="w-full">
                {/* Table Header */}
                <div className="grid grid-cols-3 gap-4 p-2 bg-gray-200 font-semibold text-center">
                  <div>Length (m)</div>
                  <div>Diameter (inches)</div>
                  <div>Surface Area (m²)</div>
                </div>
                {/* Displaying pipe results in rows */}
                {calculationResults.pipes.map((pipe, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-3 gap-4 p-2 border-t text-center"
                  >
                    <div>{pipe.lengthMeters}</div>
                    <div>{pipe.diameterInches}</div>
                    <div>{pipe.surfaceArea}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 text-xl font-bold">
                <p>Total Pipe Length: {calculationResults.totalLengthMeters} m</p>
                <p>Total Surface Area: {calculationResults.totalSurfaceAreaMetersSquared} m²</p>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* About Button Dialog */}
      {isAboutDialogOpen && (
        <Dialog open={isAboutDialogOpen} onOpenChange={setIsAboutDialogOpen}>
          <DialogContent>
            <DialogTitle>It is developed by Mr. Mohammed Ali</DialogTitle>
            <DialogDescription>
              This calculator helps you calculate the surface area of pipes based on their length and diameter. You can add multiple pipes to calculate the total surface area.
            </DialogDescription>
            <Button onClick={() => setIsAboutDialogOpen(false)} className="mt-4 bg-red-500 text-white hover:bg-red-600">
              Close
            </Button>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}