"use client";

interface Transaction {
    id?: number;
    customerName?: string;
    customerEmail?: string;
    created?: number;
    amount: number;
    currency: string;
    status: string;
}

interface RecentTransactionsProps {
    readonly transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
    const getStatusStyles = (status: string) => {
        const s = (status || '').toLowerCase();
        if (s === 'succeeded' || s === 'paid') return 'bg-emerald-100 text-emerald-700';
        if (s === 'pending' || s === 'processing') return 'bg-amber-100 text-amber-700';
        if (s === 'failed') return 'bg-red-100 text-red-700';
        if (s === 'canceled' || s === 'cancelled') return 'bg-gray-100 text-gray-700';
        return 'bg-blue-100 text-blue-700';
    };

    return (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {transactions && transactions.length > 0 ? (
                transactions.slice(0, 10).map((transaction, index) => (
                    <div key={transaction.id || index} className="flex justify-between items-start p-3 rounded-lg bg-gradient-to-r from-violet-50/50 to-purple-50/50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200/30 dark:border-violet-700/30 hover:border-violet-300/50 dark:hover:border-violet-600/50 transition-all duration-200">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {transaction.customerName || 'Guest Customer'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {transaction.customerEmail || 'No email'}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                {transaction.created ? new Date(transaction.created * 1000).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                }) : 'N/A'}
                            </p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1 ml-3">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                {transaction.currency?.toUpperCase()} {parseFloat(String(transaction.amount || 0)).toFixed(2)}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${getStatusStyles(transaction.status)}`}>
                                {transaction.status || 'unknown'}
                            </span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-violet-500 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No recent payments</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Payments will appear here once transactions are made</p>
                </div>
            )}
        </div>
  );
}
