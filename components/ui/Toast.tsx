"use client";

import { useEffect } from 'react';

interface ToastProps {
  readonly message: string;
  readonly type?: 'success' | 'error' | 'warning' | 'info';
  readonly duration?: number;
  readonly onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const alertTypes = {
    success: 'alert-success',
    error: 'alert-error',
    warning: 'alert-warning',
    info: 'alert-info',
  };

  return (
    <div className="toast toast-top toast-end">
      <div className={`alert ${alertTypes[type]}`}>
        <div>
          <span>{message}</span>
        </div>
      </div>
    </div>
  );
}