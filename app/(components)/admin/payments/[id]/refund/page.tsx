"use client";

import RefundForm from '../../components/RefundForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function RefundPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
       <Link href={`/payments/${params.id}`} className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4"><ArrowLeftIcon className="h-5 w-5" /> Back to Payment</Link>
      <h1 className="text-2xl font-bold mb-4">Process Refund</h1>
      <RefundForm chargeId={params.id} maxAmount={5000} /> {/* TODO: Fetch real max amount */}
    </div>
  );
}