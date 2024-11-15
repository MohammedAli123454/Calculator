'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // Assuming Label is imported from ShadCN UI
import Image from 'next/image';

type FormData = {
  innerDiameter: string;
  outerDiameter: string;
  width: string;
  height: string;
};

const CircularScaffoldingVolumeCalculator: React.FC = () => {
  const [result, setResult] = useState<number | null>(null);
  const [showImage, setShowImage] = useState(false); // New state to toggle image visibility

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      innerDiameter: '',
      outerDiameter: '',
      width: '',
      height: '',
    },
  });

  const calculateVolume = (data: FormData) => {
    const { innerDiameter, outerDiameter, width, height } = data;

    // Parsing values, assuming all inputs are strings
    const parsedInnerDiameter = parseFloat(innerDiameter);
    const parsedOuterDiameter = parseFloat(outerDiameter);
    const parsedWidth = parseFloat(width);
    const parsedHeight = parseFloat(height);

    // Validation to check if the parsed values are valid numbers
    if (
      isNaN(parsedInnerDiameter) ||
      isNaN(parsedOuterDiameter) ||
      isNaN(parsedWidth) ||
      isNaN(parsedHeight)
    ) {
      setResult(null);  // Reset the result if any value is invalid
      return;
    }

    const innerRadius = parsedInnerDiameter / 2;
    const outerRadius = innerRadius + parsedWidth;
    const volume =
      Math.PI * parsedHeight * (Math.pow(outerRadius, 2) - Math.pow(innerRadius, 2));
    setResult(volume);  // Set the calculated volume
  };

  const toggleImageVisibility = () => {
    setShowImage(prevState => !prevState); // Toggle image visibility
  };

  return (
    <div>
      <Card className="p-5">
        <h1 className="text-2xl font-semibold text-center mb-6">
          Circular Scaffolding Volume Calculation
        </h1>

        {/* Form Layout using Tailwind's Grid with col-span */}
        <form onSubmit={handleSubmit(calculateVolume)} className="space-y-6">
          {/* Inner Diameter Input */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            <Label htmlFor="innerDiameter" className="col-span-1 text-md font-medium text-gray-600">Inner Diameter</Label>
            <div className="col-span-4">
              <Input
                id="innerDiameter"
                className={`border-gray-300 rounded-md shadow-sm ${errors.innerDiameter ? 'border-red-500' : ''}`}
                placeholder="Inner Diameter of Scaffolding"
                {...register('innerDiameter', { required: 'Inner Diameter is required' })}
              />
              {errors.innerDiameter && <span className="text-red-500">{errors.innerDiameter.message}</span>}
            </div>
          </div>

          {/* Outer Diameter Input */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            <Label htmlFor="outerDiameter" className="col-span-1 text-md font-medium text-gray-600">Outer Diameter</Label>
            <div className="col-span-4">
              <Input
                id="outerDiameter"
                className="border-gray-300 rounded-md shadow-sm"
                placeholder="Outer Diameter of Scaffolding"
                {...register('outerDiameter')}
              />
               {errors.outerDiameter && <span className="text-red-500">{errors.outerDiameter.message}</span>}
            </div>
          </div>

          {/* Width Input */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            <Label htmlFor="width" className="col-span-1 text-md font-medium text-gray-600">Width</Label>
            <div className="col-span-4">
              <Input
                id="width"
                className="border-gray-300 rounded-md shadow-sm"
                placeholder="Width of Scaffolding"
                {...register('width')}
              />
                {errors.width && <span className="text-red-500">{errors.width.message}</span>}
            </div>
          </div>

          {/* Height Input */}
          <div className="grid grid-cols-5 gap-4 mb-4">
            <Label htmlFor="height" className="col-span-1 text-md font-medium text-gray-600">Height</Label>
            <div className="col-span-4">
              <Input
                id="height"
                className="border-gray-300 rounded-md shadow-sm"
                placeholder="Height of Scaffolding"
                {...register('height')}
              />
               {errors.height && <span className="text-red-500">{errors.height.message}</span>}
            </div>
          </div>

          {/* Calculate and Explanation Buttons */}
          <div className="flex justify-between mt-4">
            <Button type="submit" className="w-1/2 mr-2">Calculate Volume</Button>
            <Button
              onClick={toggleImageVisibility}
              className="w-1/2 ml-2"
            >
              {showImage ? 'Hide Explanation' : 'Show Explanation'}
            </Button>
          </div>
        </form>

        {/* Results Section */}
        <div className="mt-8 text-center">
          <h2 className="text-xl font-semibold mb-3">Results</h2>
          <Card className="p-4">
            <p className="text-lg font-medium">
              <span className="font-bold">Circular Scaffolding Volume:</span> {result ? result.toFixed(2) : 0} cubic meters
            </p>
          </Card>
        </div>

        {/* Image Display - Full-screen dialog */}
        {showImage && (
          <div
            className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
            onClick={toggleImageVisibility}
          >
            <div
              className="relative bg-white p-4 rounded-lg max-w-4xl max-h-full overflow-auto"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the image
            >
              <Image
                src="/CircularScaffolding.jpg"
                alt="Circular scaffolding explanation"
                width={1000} // Set an appropriate width for the image
                height={1000} // Set an appropriate height for the image
                className="rounded-lg"
              />
              <Button
                onClick={toggleImageVisibility}
                className="absolute top-4 right-4 bg-red-600 text-white rounded-full p-2"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CircularScaffoldingVolumeCalculator;
