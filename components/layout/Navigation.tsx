"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  href: string;
  label: string;
}

interface NavigationProps {
  readonly items: NavItem[];
  readonly className?: string;
}

export default function Navigation({ items, className = '' }: NavigationProps) {
  const pathname = usePathname();

  return (
    <nav className={`flex space-x-8 ${className}`}>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            pathname === item.href
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}