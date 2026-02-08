"use client";

interface RecentTransactionsProps {
  readonly transactions: any[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const getStatusStyles = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'succeeded' || s === 'paid') return 'bg-emerald-100 text-emerald-700';
    if (s === 'pending') return 'bg-amber-100 text-amber-700';
    if (s === 'failed') return 'bg-red-100 text-red-700';
    if (s === 'canceled' || s === 'cancelled') return 'bg-gray-100 text-gray-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Transactions</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-500">Customer</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
              <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions && transactions.length > 0 ? (
              transactions.map((txn, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{txn.customerName || 'Unknown'}</td>
                  <td className="py-3 px-4 text-gray-700">{txn.currency?.toUpperCase() || 'AED'} {((txn.amount || 0) / 100).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusStyles(txn.status)}`}>
                      {txn.status || 'unknown'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{txn.paymentDate ? new Date(txn.paymentDate).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-12 text-gray-500">
                  No recent transactions for the selected period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}