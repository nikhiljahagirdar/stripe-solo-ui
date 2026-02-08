"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon, ChartBarIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

interface DashboardHeaderProps {
  readonly title: string;
  readonly description?: string;
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly stats?: {
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down';
  }[];
  readonly children?: ReactNode;
}

export default function DashboardHeader({ 
  title, 
  description, 
  icon: Icon = SparklesIcon,
  stats,
  children 
}: DashboardHeaderProps) {
  return (
    <div className="relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-transparent to-purple-50 dark:from-blue-900/20 dark:via-transparent dark:to-purple-900/20 rounded-2xl"></div>
      
      <div className="relative">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left side - Title and description */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
              >
                <Icon className="h-5 w-5 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 max-w-2xl">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right side - Stats */}
          {stats && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {stat.label}
                    </span>
                    {stat.trend && (
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        stat.trend === 'up' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {stat.trend === 'up' ? '↑' : '↓'} {stat.change}
                      </span>
                    )}
                  </div>
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Children content */}
          {children && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2 mt-4"
            >
              {children}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
