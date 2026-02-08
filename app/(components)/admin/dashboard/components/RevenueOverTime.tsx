"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface RevenueData {
  month: string;
  revenue: number;
}

interface RevenueOverTimeProps {
  readonly currentYearData: RevenueData[];
  readonly lastYearData: RevenueData[];
}

export default function RevenueOverTime({ currentYearData, lastYearData }: RevenueOverTimeProps) {
  const chartOptions = useMemo(() => ({
    chart: { 
      type: 'area' as const, 
      toolbar: { show: false },
      background: 'transparent',
      sparkline: { enabled: false }
    },
    colors: ['#10B981', '#60A5FA'],
    fill: { 
      type: 'gradient', 
      gradient: { 
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.5,
        gradientToColors: ['#34D399', '#93C5FD'],
        opacityFrom: 0.6, 
        opacityTo: 0.1,
        stops: [0, 100]
      } 
    },
    stroke: { 
      curve: 'smooth' as const, 
      width: 3,
      colors: ['#10B981', '#60A5FA']
    },
    grid: { 
      show: true,
      borderColor: '#F3F4F6',
      strokeDashArray: 3,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } }
    },
    xaxis: { 
      categories: currentYearData.map(item => item.month),
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
          fontWeight: 500
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { 
      labels: {
        style: {
          colors: '#6B7280',
          fontSize: '12px',
          fontWeight: 500
        },
        formatter: (value: number) => `$${value.toLocaleString()}`
      }
    },
    tooltip: { 
      theme: 'light',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: (value: number) => `$${value.toLocaleString()}`
      }
    },
    dataLabels: { enabled: false },
    markers: {
      size: 0,
      hover: {
        size: 6,
        sizeOffset: 3
      }
    },
    legend: {
      show: true,
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      fontSize: '12px',
      fontWeight: 500,
      labels: {
        colors: '#6B7280'
      }
    }
  }), [currentYearData]);

  const chartSeries = useMemo(() => [
    {
      name: 'Current Year',
      data: currentYearData.map(item => item.revenue)
    },
    {
      name: 'Last Year',
      data: lastYearData.map(item => item.revenue)
    }
  ], [currentYearData, lastYearData]);

  const totalCurrentYear = currentYearData.reduce((sum, item) => sum + item.revenue, 0);
  const totalLastYear = lastYearData.reduce((sum, item) => sum + item.revenue, 0);
  const growth = totalLastYear > 0 ? ((totalCurrentYear - totalLastYear) / totalLastYear * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Year over Year Comparison</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${totalCurrentYear.toLocaleString()}
          </div>
          <div className={`text-xs font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}% vs last year
          </div>
        </div>
      </div>
      <div>
        {currentYearData.length > 0 ? (
          <div className="-mx-2">
            <Chart options={chartOptions} series={chartSeries} type="area" height={300} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-80">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm">No revenue data available</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}