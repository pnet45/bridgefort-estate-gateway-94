
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
          <h2 className="text-3xl font-bold mb-4">Projected Profit</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our Buy and Resell program offers guaranteed profit on your land trading. Here's what you can expect based on 12 to 24 months trading period.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className={`overflow-x-auto ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Land Trading Type</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>12 Months Profit</TableHead>
                  <TableHead>24 Months Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold">Individual</TableCell>
                  <TableCell>Naira (₦)</TableCell>
                  <TableCell className="text-estate-blue font-semibold">25%</TableCell>
                  <TableCell className="text-estate-blue font-semibold">50%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Corporate</TableCell>
                  <TableCell>Naira (₦)</TableCell>
                  <TableCell className="text-estate-red font-semibold">30%</TableCell>
                  <TableCell className="text-estate-red font-semibold">60%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Individual</TableCell>
                  <TableCell>USD ($)</TableCell>
                  <TableCell className="text-green-600 font-semibold">20%</TableCell>
                  <TableCell className="text-green-600 font-semibold">40%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-semibold">Corporate</TableCell>
                  <TableCell>USD ($)</TableCell>
                  <TableCell className="text-purple-600 font-semibold">30%</TableCell>
                  <TableCell className="text-purple-600 font-semibold">60%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <div className={`flex justify-center ${isLoaded ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '200ms' }}>
            <img 
              src="/lovable-uploads/aeaad90d-a317-4a58-8cba-912498e233e5.png" 
              alt="Profit Land Trading Table" 
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
