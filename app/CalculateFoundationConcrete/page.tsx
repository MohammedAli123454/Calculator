'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import * as ExcelJS from 'exceljs';
import Image from 'next/image';

interface FormData {
  foundationLength: string;
  foundationWidth: string;
  foundationHeight: string;
  pedestalLength: string;
  pedestalWidth: string;
  pedestalHeight: string;
  type: string;
  totalFoundation: string;
}

const FoundationVolumeCalculator: React.FC = () => {
  const methods = useForm<FormData>({
    defaultValues: {
      foundationLength: '',
      foundationWidth: '',
      foundationHeight: '',
      pedestalLength: '',
      pedestalWidth: '',
      pedestalHeight: '',
      type: '',
      totalFoundation: '',
    },
  });

  const { register, handleSubmit, getValues } = methods;

  const [unit, setUnit] = useState<'mm' | 'm' | 'inches'>('mm');
  const [showImage, setShowImage] = useState(false); // State to toggle image visibility
  const [volumes, setVolumes] = useState({
    foundationVolume: 0,
    leanConcreteVolume: 0,
    pedestalVolume: 0,
    total: 0,
  });

  const convertToMeters = (value: number): number => {
    switch (unit) {
      case 'mm':
        return value / 1000;
      case 'inches':
        return value * 0.0254;
      case 'm':
      default:
        return value;
    }
  };

  const calculateVolume = (data: FormData) => {
    const {
      foundationLength,
      foundationWidth,
      foundationHeight,
      pedestalLength,
      pedestalWidth,
      pedestalHeight,
    } = data;

    const fLength = convertToMeters(parseFloat(foundationLength) || 0);
    const fWidth = convertToMeters(parseFloat(foundationWidth) || 0);
    const fHeight = convertToMeters(parseFloat(foundationHeight) || 0);
    const pLength = convertToMeters(parseFloat(pedestalLength) || 0);
    const pWidth = convertToMeters(parseFloat(pedestalWidth) || 0);
    const pHeight = convertToMeters(parseFloat(pedestalHeight) || 0);

    const foundationVol = fLength * fWidth * fHeight;
    const leanConcreteVol = (fLength + 0.02) * (fWidth + 0.02) * 0.05;
    const pedestalVol = pLength * pWidth * pHeight;
    const total = foundationVol + leanConcreteVol + pedestalVol;

    setVolumes({
      foundationVolume: parseFloat(foundationVol.toFixed(2)),
      leanConcreteVolume: parseFloat(leanConcreteVol.toFixed(2)),
      pedestalVolume: parseFloat(pedestalVol.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    });
  };

  const getPlaceholderText = (baseText: string) => {
    const unitText = unit === 'mm' ? 'MM' : unit === 'inches' ? 'INCHES' : 'Meters';
    return `${baseText} in ${unitText}`;
  };

  const totalFoundationCount = parseInt(getValues('totalFoundation'), 10) || 0;

  let totalLeanConcrete = 0;
  let totalFoundationVolume = 0;
  let totalPedestalVolume = 0;
  let totalOverall = 0;

  for (let i = 0; i < totalFoundationCount; i++) {
    totalLeanConcrete += volumes.leanConcreteVolume;
    totalFoundationVolume += volumes.foundationVolume;
    totalPedestalVolume += volumes.pedestalVolume;
    totalOverall += volumes.total;
  }
  // Function to export the data to Excel using ExcelJS
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Foundation Volumes');

    // Define column headers
    worksheet.columns = [
      { header: 'S.No', key: 'serial', width: 10 },
      { header: 'Type', key: 'type', width: 20 },
      { header: 'Lean Concrete', key: 'leanConcrete', width: 20 },
      { header: 'Foundation', key: 'foundation', width: 20 },
      { header: 'Pedestal', key: 'pedestal', width: 20 },
      { header: 'Total', key: 'total', width: 20 },
    ];

    // Add data rows
    for (let i = 0; i < totalFoundationCount; i++) {
      const row = worksheet.addRow({
        serial: i + 1,
        type: getValues('type'),
        leanConcrete: `${volumes.leanConcreteVolume} m³`,
        foundation: `${volumes.foundationVolume} m³`,
        pedestal: `${volumes.pedestalVolume} m³`,
        total: `${volumes.total} m³`,
      });

      // Set row height
      row.height = 20;

      // Set borders for all cells in this row
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        // Set alignment to center for all cells
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      });
    }

    // Add the total row
    const totalRow = worksheet.addRow({
      serial: 'Total',
      type: '',
      leanConcrete: `${totalLeanConcrete.toFixed(2)} m³`,
      foundation: `${totalFoundationVolume.toFixed(2)} m³`,
      pedestal: `${totalPedestalVolume.toFixed(2)} m³`,
      total: `${totalOverall.toFixed(2)} m³`,
    });

    // Set row height and borders for the total row
    totalRow.height = 20;
    totalRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.font = { bold: true }; // Make the total row bold
    });

    // Set styles for the header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, size: 12 };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 20; // Set header row height

    // Add borders to the header row
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Write the Excel file to the browser
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'foundation_volumes.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleImageVisibility = () => {
    setShowImage(prevState => !prevState); // Toggle image visibility
  };
  return (
    <FormProvider {...methods}>
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Card className="p-6 shadow-lg w-full max-w-4xl bg-white rounded-md">
          <h2 className="text-center mb-2 font-semibold text-xl text-gray-800">
            Foundation and Pedestal Volume Calculator
          </h2>

          <div className="mb-5 flex gap-4 justify-center">
            <RadioGroup
              onValueChange={(value) => setUnit(value as 'mm' | 'm' | 'inches')}
              value={unit}
              className="flex gap-4"
            >
              <FormItem className="flex items-center space-x-3">
                <FormControl>
                  <RadioGroupItem value="m" className="cursor-pointer" />
                </FormControl>
                <FormLabel className="font-normal">Meters</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3">
                <FormControl>
                  <RadioGroupItem value="mm" className="cursor-pointer" />
                </FormControl>
                <FormLabel className="font-normal">Millimeters</FormLabel>
              </FormItem>
              <FormItem className="flex items-center space-x-3">
                <FormControl>
                  <RadioGroupItem value="inches" className="cursor-pointer" />
                </FormControl>
                <FormLabel className="font-normal">Inches</FormLabel>
              </FormItem>
            </RadioGroup>
          </div>

          <form onSubmit={handleSubmit(calculateVolume)} className="space-y-6">
            <div className="flex gap-6">
              {/* Foundation Inputs Card */}
              <Card className="p-5 bg-gray-50 w-full sm:w-1/2 md:w-1/2">
                <h3 className="font-semibold mb-2 text-gray-700">Foundation Inputs</h3>
                <div className="grid grid-cols-5 gap-4 items-center">
                  <label className="col-span-1 text-md font-medium text-gray-600 mb-2">Length</label>
                  <div className="col-span-4">
                    <Input
                      className="border-gray-300 rounded-md shadow-sm"
                      placeholder={getPlaceholderText('Foundation Length')}
                      {...register('foundationLength')}
                    />
                  </div>

                  <label className="col-span-1 text-md font-medium text-gray-600 mb-2">Width</label>
                  <div className="col-span-4">
                    <Input
                      className="border-gray-300 rounded-md shadow-sm"
                      placeholder={getPlaceholderText('Foundation Width')}
                      {...register('foundationWidth')}
                    />
                  </div>

                  <label className="col-span-1 text-md font-medium text-gray-600 mb-2">Height</label>
                  <div className="col-span-4">
                    <Input
                      className="border-gray-300 rounded-md shadow-sm"
                      placeholder={getPlaceholderText('Foundation Height')}
                      {...register('foundationHeight')}
                    />
                  </div>
                </div>
              </Card>

              {/* Pedestal Inputs Card */}
              <Card className="p-5 bg-gray-50 w-full sm:w-1/2 md:w-1/2">
                <h3 className="font-semibold mb-2 text-gray-700">Pedestal Inputs</h3>
                <div className="grid grid-cols-5 gap-4 items-center">
                  <label className="col-span-1 text-md font-medium text-gray-600 mb-2">Length</label>
                  <div className="col-span-4">
                    <Input
                      className="border-gray-300 rounded-md shadow-sm"
                      placeholder={getPlaceholderText('Pedestal Length')}
                      {...register('pedestalLength')}
                    />
                  </div>

                  <label className="col-span-1 text-md font-medium text-gray-600 mb-2">Width</label>
                  <div className="col-span-4">
                    <Input
                      className="border-gray-300 rounded-md shadow-sm"
                      placeholder={getPlaceholderText('Pedestal Width')}
                      {...register('pedestalWidth')}
                    />
                  </div>

                  <label className="col-span-1 text-md font-medium text-gray-600 mb-2">Height</label>
                  <div className="col-span-4">
                    <Input
                      className="border-gray-300 rounded-md shadow-sm"
                      placeholder={getPlaceholderText('Pedestal Height')}
                      {...register('pedestalHeight')}
                    />
                  </div>
                </div>
              </Card>
            </div>

            {/* Typical Foundations Card */}
            <Card className="p-5 bg-gray-50 w-full">
              <h3 className="font-semibold mb-2 text-gray-700">Typical Foundations Numbers</h3>
              <div className="grid grid-cols-5 gap-4 items-center">
                <label className="col-span-1 text-md font-medium text-gray-600 mb-2">Foundation Type</label>
                <div className="col-span-4">
                  <Input
                    className="border-gray-300 rounded-md shadow-sm"
                    placeholder="Foundation Type"
                    {...register('type')}
                  />
                </div>

                <label className="col-span-1 text-md font-medium text-gray-600 mb-2">Total Foundations</label>
                <div className="col-span-4">
                  <Input
                    className="border-gray-300 rounded-md shadow-sm"
                    placeholder="Total Foundations"
                    {...register('totalFoundation')}
                  />
                </div>
              </div>
            </Card>




            <Button type="submit" className="mt-5 bg-indigo-600 text-white w-full">
              Calculate
            </Button>
          </form>


          {/* Show Explanation Button */}
          <Button
            type="button"
            className="mt-4 ml-4 bg-green-600 text-white"
            onClick={toggleImageVisibility}
          >
            Show Explanation
          </Button>


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
                  src="/volume.jpeg"
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




          <Card className="p-5 mt-8 bg-gray-50">
            <h3 className="font-semibold mb-4 text-gray-700">Concrete Volume in m³</h3>
            <div className="w-full">
              {/* Table Header */}
              <div className="grid grid-cols-6 gap-4 p-2 bg-gray-200 font-semibold text-center">
                <div>S.No</div>
                <div>Type</div>
                <div>Lean Concrete</div>
                <div>Foundation</div>
                <div>Pedestal</div>
                <div>Total</div>
              </div>

              {/* Table Body */}
              {Array.from({ length: totalFoundationCount }, (_, index) => (
                <div key={index} className="grid grid-cols-6 gap-4 p-2 border-t text-center">
                  <div>{index + 1}</div>
                  <div>{getValues('type')}</div>
                  <div>{volumes.leanConcreteVolume} m³</div>
                  <div>{volumes.foundationVolume} m³</div>
                  <div>{volumes.pedestalVolume} m³</div>
                  <div>{volumes.total} m³</div>
                </div>
              ))}

              {/* Total Row */}
              <div className="grid grid-cols-6 gap-4 p-2 border-t font-semibold text-center bg-gray-100">
                <div>Total</div>
                <div></div>
                <div>{totalLeanConcrete.toFixed(2)} m³</div>
                <div>{totalFoundationVolume.toFixed(2)} m³</div>
                <div>{totalPedestalVolume.toFixed(2)} m³</div>
                <div>{totalOverall.toFixed(2)} m³</div>
              </div>
            </div>
          </Card>
          <Button
            type="button"
            className="mt-4 ml-4"
            onClick={exportToExcel}
          >
            Export to Excel
          </Button>
        </Card>
      </div>
    </FormProvider>
  );
};

export default FoundationVolumeCalculator;