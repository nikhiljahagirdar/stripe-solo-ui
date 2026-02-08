"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DataPoint {
  label: string;
  value: number;
}

interface PieChartProps {
  readonly data: DataPoint[];
  readonly title?: string;
  readonly height?: number;
  readonly colors?: string[];
}

export default function PieChart({ data, title, height = 350, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] }: PieChartProps) {
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'pie'
    },
    colors: colors,
    labels: data.map(item => item.label),
    legend: {
      position: 'bottom',
      fontSize: '12px',
      labels: {
        colors: '#64748b'
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px'
      }
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  }), [data, colors]);

  const chartSeries = useMemo(() => data.map(item => item.value), [data]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <Chart options={chartOptions as any} series={chartSeries} type="pie" height={height} />
    </div>
  );
}