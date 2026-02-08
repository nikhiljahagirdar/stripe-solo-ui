import React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  readonly title: string;
  readonly value: string;
  readonly icon: React.ReactNode;
  readonly gradient: string; // Tailwind gradient classes for text, e.g., "from-violet-500 via-purple-500 to-indigo-500"
  readonly bgGradient: string; // Tailwind gradient classes for background, e.g., "from-violet-50 to-purple-50"
  readonly iconBg: string; // Tailwind gradient classes for icon background, e.g., "from-violet-600 to-purple-600"
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  gradient,
  bgGradient,
  iconBg,
}) => {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl hover-lift transition-all duration-300 bg-gradient-to-br border border-neutral-100/50 dark:border-neutral-800/50",
        bgGradient
      )}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-3 rounded-2xl bg-gradient-to-br text-white shadow-lg group-hover:shadow-xl transition-all duration-300 hover-lift",
              iconBg
            )}
          >
            {icon}
          </div>
          <div className="text-right">
            <div
              className={cn(
                "text-3xl lg:text-4xl font-bold bg-gradient-to-r bg-clip-text text-transparent mb-1",
                gradient
              )}
            >
              {value}
            </div>
            <div className="text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              {title}
            </div>
          </div>
        </div>

        {/* Animated background elements */}
        <div
          className={cn(
            "absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 animate-pulse-slow",
            iconBg
          )}
        />
        <div
          className={cn(
            "absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300 animate-bounce-gentle",
            gradient
          )}
        />
      </div>
    </div>
  );
};

export default StatCard;
