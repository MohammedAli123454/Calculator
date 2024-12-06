"use client";
import React, { useEffect, useState } from "react";
import { MultiSelect } from "react-multi-select-component";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useQuery } from "@tanstack/react-query";
import {
  fetchGroupedSalesData,
  fetchCategoryChartData,
  fetchUniqueMonths,
  fetchUniqueCategories,
} from "@/app/actions/queries";
import  ChartComponent  from "@/components/ChartComponent"
import LoadingSpinner from "@/components/LoadingSpinner";
import ChartWithManyCategories from "@/components/ChartWithManyCategories";
import ChartWithSingleCategory from "@/components/ChartWithSingleCategory";
import SimpleTable from "@/components/SimpleTable";
import PivotalTable from "@/components/PivotalTable";
import PieChartWithProps from "@/components/PieChartWithProps";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@/components/ui/menubar"
import { Dialog, DialogContent, DialogTrigger,DialogTitle } from "@/components/ui/dialog";


const SalesTable = () => {
  const [selectedCategories, setSelectedCategories] = useState<{ label: string; value: string }[]>([{ label: "All", value: "All" }]);
  const [isPivotalView, setIsPivotalView] = useState(true);
  const [chartView, setChartView] = useState<'month' | 'category' | 'pie'>('month');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("Chart View");

  type SalesData = {
    month: string;
    category: string;
    total_sales: number;
  };

  // Data fetching with react-query
  const { data: groupedData = [], isLoading: loadingGroupedData, error: errorGroupedData } = useQuery({
    queryKey: ["groupedSalesData"],
    queryFn: fetchGroupedSalesData,
  });

  const { data: chartDataByCategory = [], isLoading: loadingChartData, error: errorChartData } = useQuery({
    queryKey: ["categoryChartData"],
    queryFn: fetchCategoryChartData,
  });

  const { data: uniqueMonths = [], isLoading: loadingUniqueMonths, error: errorUniqueMonths } = useQuery({
    queryKey: ['uniqueMonths'],
    queryFn: fetchUniqueMonths,
  });

  const { data: uniqueCategories = [], isLoading: loadingUniqueCategories, error: errorUniqueCategories } = useQuery({
    queryKey: ['uniqueCategories'],
    queryFn: fetchUniqueCategories,
  });

  // Check for loading state and display spinner with a card
  if (loadingGroupedData || loadingChartData || loadingUniqueMonths || loadingUniqueCategories) {
    return <LoadingSpinner />;
  }

  if (errorGroupedData || errorChartData) return <div>Error loading data!</div>;

  const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const sortedUniqueMonths = uniqueMonths.sort((a, b) => {
  return monthOrder.indexOf(a) - monthOrder.indexOf(b);
});

 // Ensure groupedData is typed correctly
 const groupedDataTyped: SalesData[] = groupedData as SalesData[];

 // Filter data based on selected categories
 const filteredData: SalesData[] = selectedCategories.some((item) => item.value === "All")
   ? groupedDataTyped
   : groupedDataTyped.filter((item) =>
       selectedCategories.some((category) => category.value === item.category)
     );

  // Chart data for "Chart by Month"
  const chartData = sortedUniqueMonths.map((month) => {
    const monthData: Record<string, number | string> = { month };
    filteredData.forEach((item) => {
      if (item.month === month) {
        monthData[item.category] = item.total_sales;
      }
    });
    return monthData;
  });

 // Chart configuration for "Chart by Month" view with colors for each month
 const monthChartConfig: ChartConfig = uniqueCategories.reduce((acc, category, index) => {
  const colors = ["#2563eb", "#60a5fa", "#34d399", "#f87171", "#facc15", "#ef4444", "#9333ea", "#f59e0b", "#6d28d9", "#10b981"];
  acc[category] = { label: category, color: colors[index % colors.length] };
  return acc;
}, {} as ChartConfig);

  // Chart configuration for Chart by Category with unique colors for each category

const categoryChartConfig = uniqueCategories.reduce((acc, category, index) => {
  const colors = ["#2563eb", "#60a5fa", "#34d399", "#f87171", "#facc15", "#ef4444", "#9333ea", "#f59e0b", "#6d28d9", "#10b981"];
  acc[category] = { label: category, color: colors[index % colors.length] };
  return acc;
}, {} as ChartConfig);

  // Add fill property to the chart data otherwise the bar colors will be same
  const chartDataWithColors = chartDataByCategory.map((dataItem) => ({
    ...dataItem,
    fill: categoryChartConfig[dataItem.category]?.color || "#8884d8", // Fallback color
  }));
  


  // Filtered categories to display in the table
  const categoriesToDisplay =
    selectedCategories.some((item) => item.value === "All")
      ? uniqueCategories
      : selectedCategories.map((item) => item.value);

  // Format numbers with commas
  const formatNumber = (num: number) => num.toLocaleString();

  // Calculate total sales for a specific category
  const calculateCategoryTotal = (category: string) =>
    uniqueMonths.reduce((total, month) => {
      const sales = filteredData.find(
        (item) => item.category === category && item.month.trim() === month
      );
      return total + (sales ? sales.total_sales : 0);
    }, 0);

  // Multi-select options for categories
  const categoryOptions = [
    { label: "All", value: "All" },
    ...uniqueCategories.map((category) => ({
      label: category,
      value: category,
    })),
  ];

  // Handle changes in category selection
  const handleCategoryChange = (selectedOptions: any) => {
    if (selectedOptions.some((option: any) => option.value === "All")) {
      setSelectedCategories([{ label: "All", value: "All" }]);
    } else {
      setSelectedCategories(selectedOptions);
    }
  };
// Update dialog title based on selected menu item
const handleMenuSelect = (viewType: string) => {
  setChartView(viewType as 'month' | 'category' | 'pie');
  setIsDialogOpen(true);
  let title = "";
  switch (viewType) {
    case 'month':
      title = "Detailed View (Bar Chart)";
      break;
    case 'category':
      title = "Category Summary (Bar Chart)";
      break;
    case 'pie':
      title = "Category Distribution (Pie Chart)";
      break;
    default:
      title = "Chart View";
  }
  setDialogTitle(title);
};



  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">Sales Data Analysis</h2>
      <div className="flex items-center justify-between mb-4">
      {/* Filter by Category */}
      <div className="mb-4 flex items-center gap-4">
        <label htmlFor="category-select" className="font-medium">
          Filter by Category:
        </label>
        <MultiSelect
          options={categoryOptions}
          value={selectedCategories}
          onChange={handleCategoryChange}
          labelledBy="Select Categories"
          className="w-80 border rounded"
        />
      </div>
 {/* View Toggle Menu */}
 <div className="mb-4">
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>Chart View</MenubarTrigger>
              <MenubarContent>
                <MenubarItem onSelect={() => handleMenuSelect('month')}>
                  Detailed View (Bar Chart)
                </MenubarItem>
                <MenubarItem onSelect={() => handleMenuSelect('category')}>
                  Category Summary (Bar Chart)
                </MenubarItem>
                <MenubarItem onSelect={() => handleMenuSelect('pie')}>
                  Category Distribution (Pie Chart)
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>


 {/* View Toggle Menu */}
 <div className="mb-4">
  <Menubar>
    <MenubarMenu>
      <MenubarTrigger>Table View</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onSelect={() => setIsPivotalView(true)}>
          Pivotal View
        </MenubarItem>
        <MenubarItem onSelect={() => setIsPivotalView(false)}>
          Detail View
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  </Menubar>
</div>

</div>



<Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
  <DialogTrigger className="ml-2 bg-blue-500 text-white px-4 py-2 rounded">View Chart</DialogTrigger>
  <DialogContent
    aria-describedby="chart-description" // Add this line to reference the description
    style={{ minWidth: '1000px', minHeight: '700px' }}
  >
  <DialogTitle>{dialogTitle}</DialogTitle>
    <p id="chart-description" className="sr-only">This dialog displays different types of sales data charts.</p> {/* Hidden description */}
    <div className="p-4">
      {/* Render the selected chart */}
      {chartView === 'month' && (
        <ChartWithManyCategories
          chartData={chartData}
          chartConfig={monthChartConfig}
          dataKey="month"
          barKey="total_sales"
          uniqueCategories={uniqueCategories}
        />
      )}
      {chartView === 'category' && (
        <ChartWithSingleCategory
          chartData={chartDataWithColors}
          chartConfig={categoryChartConfig}
          dataKey="category"
          barKey="total_sales"
        />
      )}
      {chartView === 'pie' && (
        <PieChartWithProps
          chartData={chartDataWithColors}
          chartConfig={categoryChartConfig}
          dataKey="category"
          pieKey="total_sales"
        />
      )}
    </div>
    <button
            onClick={() => setIsDialogOpen(false)}
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
  </DialogContent>
</Dialog>

        
      {/* Render Table */}
      {isPivotalView ? (
        <PivotalTable
          data={filteredData}  // Ensure the filteredData is passed correctly
          rowKey="category"
          columnKey="month"
          valueKey="total_sales"
          formatNumber={(num) => num.toLocaleString()}
        />
      ) : (
        <SimpleTable
          data={filteredData}  // Ensure the filteredData is passed correctly
          columns={[
            { header: "Month", accessor: "month" },
            { header: "Category", accessor: "category" },
            { header: "Total Sales", accessor: "total_sales" },
          ]}
          formatNumber={(num) => num.toLocaleString()}
        />
      )}
    </div>
  );
};
export default SalesTable;