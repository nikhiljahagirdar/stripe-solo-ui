"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/Select";

interface PageFiltersProps {
  year: string;
  month: string;
  onYearChange: (year: string) => void;
  onMonthChange: (month: string) => void;
}

const MONTH_OPTIONS = [
  { value: "all", label: "All" },
  { value: "1", label: "January 1" },
  { value: "2", label: "February 2" },
  { value: "3", label: "March 3" },
  { value: "4", label: "April 4" },
  { value: "5", label: "May 5" },
  { value: "6", label: "June 6" },
  { value: "7", label: "July 7" },
  { value: "8", label: "August 8" },
  { value: "9", label: "September 9" },
  { value: "10", label: "October 10" },
  { value: "11", label: "November 11" },
  { value: "12", label: "December 12" }
];

export default function PageFilters({ year, month, onYearChange, onMonthChange }: PageFiltersProps) {
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const startYear = 2010;
    const options = [{ value: "all", label: "All" }];
    for (let y = currentYear; y >= startYear; y -= 1) {
      options.push({ value: String(y), label: String(y) });
    }
    return options;
  }, []);

  return (
    <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Filter by:</span>
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 dark:text-gray-400">Year</label>
        <div className="w-32">
          <Select
            aria-label="Filter by year"
            value={year}
            onChange={(event) => onYearChange(event.target.value)}
            options={yearOptions}
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs text-gray-500 dark:text-gray-400">Month</label>
        <div className="w-40">
          <Select
            aria-label="Filter by month"
            value={month}
            onChange={(event) => onMonthChange(event.target.value)}
            options={MONTH_OPTIONS}
          />
        </div>
      </div>
    </div>
  );
}
