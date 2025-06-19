import React from 'react';

/**
 * 페이지 헤더 컴포넌트
 * @param title 페이지 타이틀
 * @param description 부연설명
 * @param color Tailwind 컬러명(blue, green, amber, purple, pink 등)
 */
const neonClassMap: Record<string, string> = {
  blue: 'h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-8',
  green: 'h-px bg-gradient-to-r from-transparent via-green-400 to-transparent mb-8',
  amber: 'h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent mb-8',
  purple: 'h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent mb-8',
  pink: 'h-px bg-gradient-to-r from-transparent via-pink-400 to-transparent mb-8',
};

export default function PageHeader({
  title,
  description,
  color = 'blue',
}: {
  title: string;
  description: string;
  color?: 'blue' | 'green' | 'amber' | 'purple' | 'pink';
}) {
  return (
    <section className="sticky top-0 z-30 bg-background/80 backdrop-blur mb-10">
      {/* 1단: 페이지 타이틀 */}
      <h1 className={`text-xl font-extrabold mb-2 text-${color}-500`}>{title}</h1>
      {/* 2단: 부연설명 */}
      <p className="text-base text-white mb-4">{description}</p>
      {/* 3단: 네온 구분선 */}
      <div className={neonClassMap[color]} />
    </section>
  );
} 