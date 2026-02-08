"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartData {
  date: string;
  amount: number;
}

interface RevenueChartProps {
  readonly data: ChartData[];
  readonly title?: string;
}

export default function RevenueChart({ data, title = "Revenue Analytics" }: RevenueChartProps) {
  const chartOptions = useMemo(() => ({
    chart: { type: 'line' as const, toolbar: { show: true } },
    colors: ['#3B82F6', '#10B981', '#F59E0B'],
    stroke: { curve: 'smooth' as const, width: 3 },
    grid: { show: true },
    xaxis: { categories: data.map(item => item.date) },
    yaxis: { show: true },
    tooltip: { theme: 'dark' as const },
    legend: { show: true },
  }), [data]);

  const chartSeries = useMemo(() => [{
    name: 'Revenue',
    data: data.map(item => item.amount)
  }], [data]);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">{title}</h2>
      <Chart options={chartOptions} series={chartSeries} type="line" height={400} />
    </div>
  );
}