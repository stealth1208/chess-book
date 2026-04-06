'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export function TopNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Phân tích", path: "/" },
    { label: "Thư viện", path: "/library" },
  ];

  return (
    <header className="bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md flex-none w-full top-0 z-50 shadow-sm border-b-0 h-16">
      <nav className="flex justify-between items-center w-full px-6 h-16 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/">
            <span className="text-2xl font-extrabold text-red-600 dark:text-red-500 italic font-headline">Xiangqi Master</span>
          </Link>
          <div className="hidden md:flex gap-6 items-center font-headline font-semibold tracking-tight">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`transition-colors ${
                    isActive
                      ? "text-red-600 dark:text-red-400 border-b-2 border-red-500 pb-1"
                      : "text-slate-600 dark:text-slate-400 hover:text-red-500"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant">settings</span>
          </button>
          <button className="p-2 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-all flex items-center justify-center">
            <span className="material-symbols-outlined text-on-surface-variant">person</span>
          </button>
        </div>
      </nav>
    </header>
  );
}
