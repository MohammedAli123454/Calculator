import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";

const Page = () => {
  return (
    <div className="max-h-[500px] overflow-y-auto relative">
      <table className="w-full border-collapse">
        <thead className="sticky top-0 bg-white shadow-md z-10">
          <tr>
            <th className="px-4 py-2 font-bold text-left">Header 1</th>
            <th className="px-4 py-2 font-bold text-left">Header 2</th>
            <th className="px-4 py-2 font-bold text-left">Header 3</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 15 }).map((_, index) => (
            <tr key={index} className="even:bg-gray-100">
              <td className="px-4 py-2">Row {index + 1}, Col 1</td>
              <td className="px-4 py-2">Row {index + 1}, Col 2</td>
              <td className="px-4 py-2">Row {index + 1}, Col 3</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
