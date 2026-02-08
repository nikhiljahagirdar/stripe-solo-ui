"use client";

import PaymentForm from '../components/PaymentForm';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function CreatePaymentPage() {
  return (
    <div className="p-6">
      <Link href="/payments" className="text-gray-500 hover:text-gray-700 flex items-center gap-2 mb-4"><ArrowLeftIcon className="h-5 w-5" /> Back to Payments</Link>
      <h1 className="text-2xl font-bold mb-4">Create Payment Intent</h1>
      <PaymentForm />
    </div>
  );
}