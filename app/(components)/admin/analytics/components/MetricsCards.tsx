"use client";

import MetricCard from "./MetricCard";
import { IoCash, IoPeople, IoCard, IoTrendingUp, IoWallet } from "react-icons/io5";

interface Metric {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
}

interface MetricsCardsProps {
  readonly metrics: Metric[];
}

export default function MetricsCards({ metrics }: MetricsCardsProps) {
  const getMetricStyles = (title: string) => {
    switch (title) {
      case 'Total Revenue':
        return {
          icon: IoWallet,
          gradient: "from-blue-600 via-indigo-600 to-violet-600",
          bgGradient: "from-blue-50 to-indigo-50",
          iconBg: "from-blue-600 to-indigo-600"
        };
      case 'Net Revenue':
        return {
          icon: IoCash,
          gradient: "from-emerald-600 via-teal-600 to-cyan-600",
          bgGradient: "from-emerald-50 to-teal-50",
          iconBg: "from-emerald-600 to-teal-600"
        };
      case 'New Customers':
        return {
          icon: IoPeople,
          gradient: "from-orange-600 via-amber-600 to-yellow-600",
          bgGradient: "from-orange-50 to-amber-50",
          iconBg: "from-orange-600 to-amber-600"
        };
      case 'Successful Payments':
        return {
            icon: IoCard,
            gradient: "from-pink-600 via-rose-600 to-red-600",
            bgGradient: "from-pink-50 to-rose-50",
            iconBg: "from-pink-600 to-rose-600"
        };
      case 'Avg. Order Value':
        return {
          icon: IoTrendingUp,
          gradient: "from-violet-600 via-purple-600 to-fuchsia-600",
          bgGradient: "from-violet-50 to-purple-50",
          iconBg: "from-violet-600 to-purple-600"
        };
      default:
        return {
          icon: IoCard,
          gradient: "from-gray-600 to-slate-600",
          bgGradient: "from-gray-50 to-slate-50",
          iconBg: "from-gray-600 to-slate-600"
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => {
        const styles = getMetricStyles(metric.title);
        return (
          <MetricCard
            key={index}
            {...metric}
            {...styles}
            delay={index * 0.1}
          />
        );
      })}
    </div>
  );
}