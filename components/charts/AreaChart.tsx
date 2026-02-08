"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DataPoint {
  x: string | number;
  y: number;
}

interface AreaChartProps {
  readonly data: DataPoint[];
  readonly title?: string;
  readonly height?: number;
  readonly color?: string;
}

export default function AreaChart({ data, title, height = 350, color = "#8B5CF6" }: AreaChartProps) {
  const chartOptions = useMemo(() => ({
    chart: {
      type: 'area',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    colors: [color],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    stroke: {
      curve: 'smooth',
      width: 2
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
      <Chart options={chartOptions as any} series={chartSeries} type="area" height={height} />
    </div>
  );
}