'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  CalendarDays, 
  Image as ImageIcon,
  Settings,
  Upload
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Journal', href: '/journal', icon: BookOpen },
  { name: 'Kalender', href: '/calendar', icon: CalendarDays },
  { name: 'Playbook', href: '/playbook', icon: ImageIcon },
  { name: 'Last opp', href: '/upload', icon: Upload },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 glass-panel border-r border-[rgba(255,255,255,0.05)] h-screen flex flex-col p-4 fixed left-0 top-0">
      <div className="flex items-center gap-3 px-2 py-4 mb-8">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="font-bold text-white text-sm">TJ</span>
        </div>
        <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          TradingJournal
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                isActive 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-500 rounded-r-full" />
              )}
              <item.icon className={cn("w-5 h-5", isActive ? "text-blue-400" : "group-hover:text-gray-300")} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <button className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all w-full text-left">
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Innstillinger</span>
        </button>
      </div>
    </div>
  );
}
