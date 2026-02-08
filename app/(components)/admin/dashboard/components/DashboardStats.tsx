"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { IoWalletOutline, IoCashOutline, IoReceiptOutline, IoPeopleOutline } from "react-icons/io5";

interface StatsProps {
  readonly totalRevenue: number;
  readonly totalCustomers: number;
  readonly totalPayments: number;
  readonly totalSubscriptions: number;
}

export default function DashboardStats({ totalRevenue, totalCustomers, totalPayments, totalSubscriptions }: StatsProps) {
  const statsCards = [
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: IoCashOutline,
      gradient: "from-violet-500 via-purple-500 to-indigo-500",
      bgGradient: "from-violet-50 to-purple-50",
      iconBg: "from-violet-500 to-purple-500"
    },
    {
      title: "Total Customers",
      value: totalCustomers.toLocaleString(),
      icon: IoPeopleOutline,
      gradient: "from-emerald-500 via-green-500 to-teal-500",
      bgGradient: "from-emerald-50 to-green-50",
      iconBg: "from-emerald-500 to-green-500"
    },
    {
      title: "Total Payments",
      value: totalPayments.toLocaleString(),
      icon: IoWalletOutline,
      gradient: "from-rose-500 via-pink-500 to-fuchsia-500",
      bgGradient: "from-rose-50 to-pink-50",
      iconBg: "from-rose-500 to-pink-500"
    },
    {
      title: "Total Subscriptions",
      value: totalSubscriptions.toLocaleString(),
      icon: IoReceiptOutline,
      gradient: "from-amber-500 via-orange-500 to-red-500",
      bgGradient: "from-amber-50 to-orange-50",
      iconBg: "from-amber-500 to-orange-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsCards.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card 
            interactive
            variant="elevated"
            className={`group relative overflow-hidden bg-gradient-to-br ${stat.bgGradient} border-0`}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.iconBg} text-white shadow-xl shadow-violet-500/25 group-hover:shadow-2xl group-hover:shadow-violet-500/40 transition-all duration-300`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-1`}>
                    {stat.value.toLocaleString()}
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    {stat.title}
                  </div>
                </div>
              </div>
              
              <div className={`absolute -bottom-2 -right-2 w-20 h-20 bg-gradient-to-br ${stat.iconBg} rounded-full opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
              <div className={`absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-full opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}