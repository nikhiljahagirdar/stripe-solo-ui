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
      type: 'bar' as const, 
      toolbar: { show: false },
      background: 'transparent',
      fontFamily: 'inherit',
      animations: {
        enabled: true,
        easing: 'easeinout' as const,
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        },
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      },
      dropShadow: {
        enabled: true,
        color: '#000',
        top: 4,
        left: 0,
        blur: 4,
        opacity: 0.05
      }
    },
    colors: ['#7C3AED', '#C4B5FD'], // Vibrant Violet and Light Violet
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '45%',
        borderRadius: 6,
        borderRadiusApplication: 'end' as const,
        dataLabels: {
          position: 'top',
        },
      },
    },
    dataLabels: { 
      enabled: false 
    },
    stroke: { 
      show: true,
      width: 4,
      colors: ['transparent']
    },
    grid: { 
      show: true,
      borderColor: '#F3F4F6',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 10
      }
    },
    xaxis: { 
      categories: currentYearData.map(item => item.month),
      labels: {
        style: {
          colors: '#9CA3AF',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: 'inherit'
        }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: { 
      labels: {
        style: {
          colors: '#9CA3AF',
          fontSize: '12px',
          fontWeight: 600,
          fontFamily: 'inherit'
        },
        formatter: (value: number) => `$${value.toLocaleString()}`
      }
    },
    fill: { 
      type: 'gradient', 
      gradient: { 
        shade: 'light',
        type: 'vertical',
        shadeIntensity: 0.25,
        gradientToColors: ['#4C1D95', '#A78BFA'],
        inverseColors: false,
        opacityFrom: 1, 
        opacityTo: 0.85,
        stops: [0, 100]
      } 
    },
    tooltip: { 
      theme: 'light',
      style: {
        fontSize: '13px',
        fontFamily: 'inherit'
      },
      y: {
        formatter: (value: number) => `$${value.toLocaleString()}`
      },
      marker: {
        show: true,
      }
    },
    legend: {
      show: true,
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      offsetY: -10,
      fontSize: '13px',
      fontWeight: 600,
      fontFamily: 'inherit',
      markers: {
        size: 6,
        strokeWidth: 0,
        shape: 'circle' as const,
        offsetX: 0,
        offsetY: 0
      },
      itemMargin: {
        horizontal: 15,
        vertical: 0
      },
      labels: {
        colors: '#4B5563'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Revenue Comparison</div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-700 to-purple-500">
            ${totalCurrentYear.toLocaleString()}
          </div>
          <div className={`flex items-center justify-end gap-1 text-sm font-bold mt-1 ${growth >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            {growth >= 0 ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
              </svg>
            )}
            <span>{Math.abs(growth).toFixed(1)}% vs last year</span>
          </div>
        </div>
      </div>
      
      <div className="relative pt-4">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-violet-400/5 blur-[100px] rounded-full pointer-events-none" />
        
        {currentYearData.length > 0 ? (
          <div className="-mx-2 relative z-10">
            <Chart options={chartOptions} series={chartSeries} type="bar" height={320} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[320px] relative z-10">
            <div className="text-center p-8 rounded-2xl bg-gray-50 border border-gray-100 shadow-inner">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-8 h-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500 text-sm font-medium">No revenue data available for this period</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}