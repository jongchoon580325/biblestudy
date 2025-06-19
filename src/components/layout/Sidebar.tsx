'use client';

import Link from 'next/link';
import { Home, FolderOpen, BookOpen, CheckSquare, Upload, BarChart } from 'lucide-react';

// 메뉴별 컬러 매핑
const menuColors: Record<string, string> = {
  HOME: 'text-indigo-500',
  '전체자료실': 'text-blue-500',
  '성경자료실': 'text-green-500',
  '일반자료실': 'text-amber-500',
  '자료업로드': 'text-purple-500',
  '데이터관리': 'text-pink-500',
};

const navigation = [
  { name: 'HOME', href: '/', icon: Home },
  { name: '전체자료실', href: '/all-materials', icon: FolderOpen },
  { name: '성경자료실', href: '/bible-materials', icon: BookOpen },
  { name: '일반자료실', href: '/general-materials', icon: CheckSquare },
  { name: '자료업로드', href: '/upload', icon: Upload },
  { name: '데이터관리', href: '/data-management', icon: BarChart },
];

export default function Sidebar() {
  return (
    <aside className="flex min-h-screen w-52 flex-col border-r border-border bg-gradient-to-b from-background to-slate-900/80 shadow-xl">
      {/* 상단 로고/타이틀 */}
      <div className="flex h-16 items-center border-b border-border px-4 justify-center">
        <span className="font-extrabold text-xl tracking-wider text-emerald-400 drop-shadow-lg select-none">성경자료관리</span>
      </div>
      {/* 네비게이션 메뉴 */}
      <nav className="flex-1 px-2 py-6 space-y-2">
        {navigation.map((item) => {
          const color = menuColors[item.name] || 'text-primary';
          return (
            <Link
              key={item.name}
              href={item.href}
              className={
                `group flex items-center gap-3 rounded-xl px-4 py-3 text-base font-normal transition-all duration-200 bg-transparent hover:bg-gradient-to-r hover:from-indigo-50/80 hover:to-indigo-100/60 dark:hover:from-indigo-900/30 dark:hover:to-indigo-800/20 hover:scale-[1.04] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400/60 `
              }
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              {/* 아이콘에 컬러 적용 및 인터랙션 */}
              <item.icon className={`w-6 h-6 transition-colors duration-200 group-hover:scale-110 group-hover:rotate-[-8deg] ${color}`} />
              {/* 메뉴명에 컬러 적용 및 인터랙션 */}
              <span className={`transition-colors duration-200 text-white group-hover:${color.replace('text-', 'text-')} font-normal`}>{item.name}</span>
            </Link>
          );
        })}
      </nav>
      {/* 하단 여백 및 모던 효과 */}
      <div className="flex-1" />
      <div className="h-8" />
    </aside>
  );
} 