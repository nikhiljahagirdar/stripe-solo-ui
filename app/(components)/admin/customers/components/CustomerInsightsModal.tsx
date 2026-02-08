import { useEffect, useState } from "react";
import { LoadingState } from "@/components";
import StatCard from "@/components/common/StatCard";

import { motion } from "framer-motion";
import { IoAnalytics, IoCash, IoCard, IoCalendar, IoTrendingUp, IoClose } from "react-icons/io5";

interface CustomerInsightsModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly customerId: string;
  readonly customerName: string;
  readonly token: string;
}

export default function CustomerInsightsModal({ 
  isOpen, 
  onClose, 
  customerId, 
  customerName, 
  token 
}: CustomerInsightsModalProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && customerId && token) {
      fetchInsights();
    }
  }, [isOpen, customerId, token]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/v1/customers/${customerId}/insights`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setInsights(data);
      }
    } catch (error) {
      console.error('Error fetching customer insights:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Customer Insights - {customerName}</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <IoClose className="h-6 w-6" />
              </button>
            </div>
            <div>
              {loading ? (
                <LoadingState message="Loading customer insights..." />
              ) : insights ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <StatCard
                        title="Total Payments"
                        value={insights.totalPayments || 0}
                        icon={<IoCard className="w-7 h-7" />}
                        gradient="from-blue-600 to-indigo-600"
                        bgGradient="from-blue-50 to-indigo-50"
                        iconBg="from-blue-600 to-indigo-600"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <StatCard
                        title="Total Revenue"
                        value={`$${((insights.totalRevenue || 0) / 100).toFixed(2)}`}
                        icon={<IoCash className="w-7 h-7" />}
                        gradient="from-emerald-600 to-teal-600"
                        bgGradient="from-emerald-50 to-teal-50"
                        iconBg="from-emerald-600 to-teal-600"
                      />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <StatCard
                        title="Avg. Payment"
                        value={`$${(((insights.totalRevenue || 0) / Math.max(insights.totalPayments || 1, 1)) / 100).toFixed(2)}`}
                        icon={<IoTrendingUp className="w-7 h-7" />}
                        gradient="from-purple-600 to-violet-600"
                        bgGradient="from-purple-50 to-violet-50"
                        iconBg="from-purple-600 to-violet-600"
                      />
                    </motion.div>
                  </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-200 rounded-lg p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold flex items-center space-x-2">
                          <IoCalendar className="h-5 w-5 text-gray-600" />
                          <span>Recent Activity</span>
                        </h3>
                      </div>
                      <div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-700">Last Payment</span>
                            <span className="text-sm text-gray-600">
                              {insights.lastPayment ? new Date(insights.lastPayment).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <span className="text-sm font-medium text-gray-700">Customer Since</span>
                            <span className="text-sm text-gray-600">
                              {insights.customerSince ? new Date(insights.customerSince).toLocaleDateString() : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-sm font-medium text-gray-700">Status</span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                              Active
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <IoAnalytics className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <div className="text-lg font-medium text-gray-500 mb-2">
                    No insights available
                  </div>
                  <div className="text-sm text-gray-400">
                    This customer doesn't have any activity data yet
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}