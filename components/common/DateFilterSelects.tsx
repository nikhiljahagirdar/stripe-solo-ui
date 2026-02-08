"use client";

import { useMemo } from "react";
import { Select } from "@/components/ui/Select";
import { useDateFilterStore } from "@/store/useDateFilterStore";

const MONTH_OPTIONS = [
  { value: "all", label: "All" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" }
];

export default function DateFilterSelects() {
  const year = useDateFilterStore((state) => state.year);
  const month = useDateFilterStore((state) => state.month);
  const setYear = useDateFilterStore((state) => state.setYear);
  const setMonth = useDateFilterStore((state) => state.setMonth);

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
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Year</span>
        <div className="w-28">
        <Select
          aria-label="Filter by year"
          value={year}
          onChange={(event) => setYear(event.target.value)}
          options={yearOptions}
          className="py-2 px-3 text-xs"
        />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400">Month</span>
        <div className="w-36">
        <Select
          aria-label="Filter by month"
          value={month}
          onChange={(event) => setMonth(event.target.value)}
          options={MONTH_OPTIONS}
          className="py-2 px-3 text-xs"
        />
        </div>
      </div>
    </div>
  );
}
