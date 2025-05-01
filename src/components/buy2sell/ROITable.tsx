
import React from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

interface ROITableProps {
  isLoaded: boolean;
}

const ROITable: React.FC<ROITableProps> = ({ isLoaded }) => {
  return (
    <div className="mb-16 bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Projected Returns</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our Buy2Sell program offers guaranteed returns on your investment. Here's what you can expect based on investment period.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className={`overflow-x-auto ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Investment Type</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>6 Months ROI</TableHead>
                  <TableHead>12 Months ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Individual</TableCell>
                  <TableCell>Naira (₦)</TableCell>
                  <TableCell className="text-estate-blue font-semibold">10%</TableCell>
                  <TableCell className="text-estate-blue font-semibold">25%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Corporate</TableCell>
                  <TableCell>Naira (₦)</TableCell>
                  <TableCell className="text-estate-red font-semibold">12.5%</TableCell>
                  <TableCell className="text-estate-red font-semibold">30%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Individual</TableCell>
                  <TableCell>USD ($)</TableCell>
                  <TableCell className="text-green-600 font-semibold">8%</TableCell>
                  <TableCell className="text-green-600 font-semibold">20%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Corporate</TableCell>
                  <TableCell>USD ($)</TableCell>
                  <TableCell className="text-purple-600 font-semibold">10%</TableCell>
                  <TableCell className="text-purple-600 font-semibold">30%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className={`flex justify-center ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <img 
              src="/lovable-uploads/aeaad90d-a317-4a58-8cba-912498e233e5.png" 
              alt="ROI Investment Table" 
              className="rounded-lg shadow-lg max-w-full h-auto hover:scale-105 transition-transform duration-500"
              style={{ maxHeight: '500px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ROITable;
