import React from 'react';

export interface BibleTestamentSectionProps {
  title: string;
  books: string[];
  testament: 'old' | 'new';
  icon: React.ComponentType<{ className?: string }>;
  gradient: string;
  onBookClick?: (book: string, testament: 'old' | 'new') => void;
}

const BibleTestamentSection: React.FC<BibleTestamentSectionProps> = ({
  title, books, testament, icon: Icon, gradient, onBookClick
}) => {
  const BookCard = ({ book, index }: { book: string; index: number }) => (
    <div
      className="group relative bg-gray-800/40 hover:bg-gray-700/60 border-2 border-dashed border-blue-400/70 hover:border-orange-400/80 rounded-xl p-4 cursor-pointer \
                 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/20 \
                 hover:scale-[1.08] hover:-translate-y-2 hover:rotate-1 \
                 hover:shadow-2xl overflow-hidden animate-pulse-subtle hover:animate-float"
      onClick={() => onBookClick && onBookClick(book, testament)}
    >
      {/* 물결 애니메이션 */}
      <div className="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 \
                      transition-opacity duration-500">
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/70 via-cyan-400/80 to-blue-500/70 \
                          animate-wave-flow transform-gpu will-change-transform">
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center space-y-3 relative z-10">
        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 \
                        rounded-full flex items-center justify-center text-white text-xs font-semibold\n                        shadow-lg ring-1 ring-emerald-400/20 group-hover:ring-2 \
                        group-hover:ring-emerald-400/40 transition-all duration-300">
          {index + 1}
        </div>
        <div className="text-center">
          <h3 className="text-white font-medium group-hover:text-emerald-400 transition-colors text-sm">
            {book}
          </h3>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="relative">
        <div className={`flex items-center space-x-4 p-6 rounded-2xl bg-gradient-to-r ${gradient} \
                        border border-gray-700/30`}>
          <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <p className="text-white/80">{books.length}권의 성경</p>
          </div>
        </div>
      </div>
      {/* 성경 목록 그리드 */}
      <div className={`grid gap-3 ${
        testament === 'old' 
          ? 'grid-cols-7 grid-rows-6' 
          : 'grid-cols-7 grid-rows-4'
      }`}>
        {books.map((book, index) => (
          <BookCard key={book} book={book} index={index} />
        ))}
      </div>
    </div>
  );
};

export default BibleTestamentSection; 