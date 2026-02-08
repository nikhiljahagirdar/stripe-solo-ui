"use client";

import { Button } from '@/components/ui/Button';

const ScheduleManager = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">Subscription Schedule</h3>
      <p className="text-sm text-gray-500 mt-2">Manage future changes to this subscription, such as upgrades, downgrades, or cancellations.</p>
      <div className="mt-4"><Button disabled>Manage Schedule (Coming Soon)</Button></div>
    </div>
  );
};

export default ScheduleManager;