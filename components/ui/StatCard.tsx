"use client";

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CreditCardIcon,
  BanknotesIcon
} from '@heroicons/react/24/outline';

interface StatCardProps {
  readonly title: string;
  readonly value: string | number;
  readonly change?: string;
  readonly trend?: 'up' | 'down' | 'neutral';
  readonly icon?: React.ComponentType<{ className?: string }>;
  readonly gradient?: string;
  readonly children?: ReactNode;
}

const defaultGradients = {
  revenue: 'from-emerald-500 to-teal-600',
  customers: 'from-blue-500 to-indigo-600',
  payments: 'from-purple-500 to-pink-600',
  subscriptions: 'from-orange-500 to-amber-600',
  success: 'from-green-500 to-lime-600',
  warning: 'from-yellow-500 to-orange-600',
  danger: 'from-red-500 to-rose-600',
  info: 'from-cyan-500 to-blue-600',
  aurora: 'from-emerald-400 via-cyan-500 to-blue-600',
  sunset: 'from-fuchsia-500 via-pink-500 to-amber-500',
  neon: 'from-violet-500 via-purple-500 to-indigo-600',
  ocean: 'from-cyan-500 via-blue-500 to-indigo-500',
  default: 'from-gray-500 to-slate-600'
};

export default function StatCard({ 
  title, 
  value, 
  change, 
  trend = 'neutral',
  icon: Icon = CurrencyDollarIcon,
  gradient = 'default',
  children 
}: StatCardProps) {
  const gradientClass = defaultGradients[gradient as keyof typeof defaultGradients] || defaultGradients.default;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3, type: "spring" }}
      className="group relative"
    >
      {/* Glow effect */}
      <div className={`absolute -inset-1 bg-gradient-to-r ${gradientClass} rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition duration-500`}></div>
      
      {/* Card */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300 overflow-hidden">
        {/* Background decoration */}
        <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${gradientClass} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`}></div>
        <div className={`absolute -bottom-1 -right-1 w-12 h-12 bg-gradient-to-br ${gradientClass} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
        
        {/* Content */}
        <div className="relative">
          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`inline-flex h-10 w-10 rounded-lg bg-gradient-to-br ${gradientClass} items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-violet-500/40 transition-all duration-300 mb-3`}
          >
            <Icon className="h-5 w-5 text-white" />
          </motion.div>
          
          {/* Title and Value */}
          <div className="mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
              {title}
            </h3>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
              {change && trend !== 'neutral' && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  trend === 'up' 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {trend === 'up' ? (
                    <ArrowTrendingUpIcon className="w-3 h-3 inline" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-3 h-3 inline" />
                  )}
                  {change}
                </span>
              )}
            </div>
          </div>
          
          {/* Children */}
          {children && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              {children}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
