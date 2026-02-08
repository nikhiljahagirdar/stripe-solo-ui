"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { motion } from "framer-motion";

interface StatsCardProps {
  readonly title: string;
  readonly value: string;
  readonly change: number | string;
  readonly trend: 'up' | 'down';
  readonly icon: any;
  readonly delay: number;
  readonly gradient: string;
  readonly bgGradient: string;
  readonly iconBg: string;
}

export default function StatsCard({ title, value, change, trend, icon: Icon, delay, gradient, bgGradient, iconBg }: StatsCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className={`group relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br ${bgGradient}`}>
        <CardContent className="p-6 relative z-10 h-36 m-6">
          <div className="flex items-start justify-between">
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${iconBg} text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}>
              <Icon className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent mb-1`}>
                {value}
              </div>
              <div className="text-sm font-semibold text-gray-600 mb-1">
                {title}
              </div>
              <div className={`text-xs font-medium flex items-center justify-end gap-1 ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                <span>{change}%</span>
              </div>
            </div>
          </div>
          
          {/* Animated background elements */}
          <div className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${iconBg} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300 blur-2xl`} />
          <div className={`absolute -top-4 -left-4 w-20 h-20 bg-gradient-to-br ${gradient} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300 blur-xl`} />
        </CardContent>
      </Card>
    </motion.div>
  );
}