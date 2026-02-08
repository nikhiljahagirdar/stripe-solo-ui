"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DataPoint {
  x: string;
  y: number;
}

interface BarChartProps {
  readonly data: DataPoint[];
  readonly title?: string;
  readonly height?: number;
  readonly color?: string;
}

export default function BarChart({ data, title, height = 350, color = "#10B981" }: BarChartProps) {
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'bar',
      toolbar: { show: false }
    },
    colors: [color],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false,
        columnWidth: '60%'
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 5
    },
    xaxis: {
      categories: data.map(item => item.x),
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px'
        }
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '12px'
      }
    },
    legend: {
      show: false
    }
  }), [data, color]);

  const chartSeries = useMemo(() => [{
    name: title || 'Data',
    data: data.map(item => item.y)
  }], [data, title]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      {title && <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>}
      <Chart options={chartOptions as any} series={chartSeries} type="bar" height={height} />
    </div>
  );
}