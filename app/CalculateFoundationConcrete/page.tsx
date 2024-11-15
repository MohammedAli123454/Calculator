'use client';

import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { Card } from '@/components/ui/card'; // Adjust path as needed
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Adjust import path as needed

// Define the TypeScript interface for form data
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

  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [unit, setUnit] = useState<'mm' | 'm' | 'inches'>('mm');
  const [volumes, setVolumes] = useState({
    foundationVolume: 0,
    leanConcreteVolume: 0,
    pedestalVolume: 0,
    total: 0,
  });
  const [dialogContent, setDialogContent] = useState<'image' | 'text'>('text'); // New state for dialog content type

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

  // Get the number of typical foundations
  const totalFoundationCount = parseInt(getValues('totalFoundation'), 10) || 0;

  // Total sums for all rows
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

  return (
    <FormProvider {...methods}>
      <div className="p-6 bg-gray-100 min-h-screen flex justify-center items-center">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogContent className="w-full max-w-[95%] max-h-[95vh] p-0 overflow-hidden">
            <DialogTitle>Notification</DialogTitle>
            <DialogDescription className="overflow-y-auto max-h-[80vh]">
              {dialogContent === 'image' ? (
                <img
                  src="/volume.jpeg"
                  alt="Volume Diagram"
                  className="w-full h-auto max-h-full"
                />
              ) : (
                dialogMessage
              )}
            </DialogDescription>
            <Button onClick={() => setOpenDialog(false)} className="mt-4">
              OK
            </Button>
          </DialogContent>
        </Dialog>

        <Card className="p-6 shadow-lg w-full max-w-4xl bg-white rounded-md">
          <h2 className="text-center mb-2 font-semibold text-xl text-gray-800">
            Foundation and Pedestal Volume Calculator
          </h2>

          {/* Unit Selection Radio Group (Flexed Horizontally) */}
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
            {/* Foundation and Pedestal Inputs Cards (Side by Side) */}
            <div className="flex gap-6">
              {/* Foundation Inputs Card */}
              <Card className="p-5 bg-gray-50 w-full sm:w-1/2 md:w-1/2"> {/* Ensuring flex-wrap and proper widths */}
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
              <Card className="p-5 bg-gray-50 w-full sm:w-1/2 md:w-1/2"> {/* Ensuring flex-wrap and proper widths */}
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

            {/* Typical Foundations Card (Full Width) */}
            <Card className="p-5 bg-gray-50 w-full">
              <h3 className="font-semibold mb-2 text-gray-700">Typical Foundations Numbers</h3>
              <div className="grid grid-cols-5 gap-4 items-center">
                <label className="col-span-1 text-md font-medium text-gray-600 mb-2">Foundation Type</label>
                <div className="col-span-4">
                  <Input
                    className="border-gray-300 rounded-md shadow-sm"
                    placeholder="Foundations Type"
                    {...register('type')}
                  />
                </div>

                <label className="col-span-1 text-md font-medium text-gray-600 mb-2">Total Foundations</label>
                <div className="col-span-4">
                  <Input
                    className="border-gray-300 rounded-md shadow-sm"
                    placeholder="Typical Foundations Numbers"
                    {...register('totalFoundation')}
                  />
                </div>
              </div>
            </Card>

            {/* Submit Button */}
            <Button type="submit" className="mt-5 bg-indigo-600 text-white w-full">
              Calculate
            </Button>
          </form>

          {/* Results Table */}
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

              {/* Table Body - Repeat for each typical foundation */}
              {Array.from({ length: totalFoundationCount }, (_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-6 gap-4 p-2 border-t text-center"
                >
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
        </Card>
      </div>
    </FormProvider>
  );
};

export default FoundationVolumeCalculator;
