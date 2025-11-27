import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';

interface TrainingEventFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
}

const TrainingEventFilters = ({
  selectedCategory,
  onCategoryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: TrainingEventFiltersProps) => {
  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="text-primary" size={20} />
        <h3 className="text-lg font-semibold text-foreground">Filter Events</h3>
      </div>
      
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="category" className="text-sm font-medium mb-2 block">
            Category
          </Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger id="category" className="bg-background">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent className="bg-background z-50">
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Training">Training</SelectItem>
              <SelectItem value="Seminar">Seminar</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="startDate" className="text-sm font-medium mb-2 block">
            Start Date
          </Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="bg-background"
          />
        </div>

        <div>
          <Label htmlFor="endDate" className="text-sm font-medium mb-2 block">
            End Date
          </Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="bg-background"
          />
        </div>
      </div>
    </div>
  );
};

export default TrainingEventFilters;