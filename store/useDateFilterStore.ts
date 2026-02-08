"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface DateFilterState {
  year: string;
  month: string;
  setYear: (year: string) => void;
  setMonth: (month: string) => void;
  reset: () => void;
}

export const useDateFilterStore = create<DateFilterState>()(
  persist(
    (set) => ({
      year: "all",
      month: "all",
      setYear: (year) => set({ year }),
      setMonth: (month) => set({ month }),
      reset: () => set({ year: "all", month: "all" }),
    }),
    {
      name: "date-filters",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
