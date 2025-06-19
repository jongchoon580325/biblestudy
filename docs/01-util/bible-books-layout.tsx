import React, { useState } from 'react';
import { ChevronRight, BookOpen, Scroll } from 'lucide-react';

const BibleBooksLayout = () => {
  const [selectedBook, setSelectedBook] = useState<{ book: string; testament: string } | null>(null);

  // 구약 39권
  const oldTestament = [
    '창세기', '출애굽기', '레위기', '민수기', '신명기',
    '여호수아', '사사기', '룻기', '사무엘상', '사무엘하',
    '열왕기상', '열왕기하', '역대상', '역대하', '에스라',
    '느헤미야', '에스더', '욥기', '시편', '잠언',
    '전도서', '아가', '이사야', '예레미야', '예레미야애가',
    '에스겔', '다니엘', '호세아', '요엘', '아모스',
    '오바댜', '요나', '미가', '나훔', '하박국',
    '스바냐', '학개', '스가랴', '말라기'
  ];

  // 신약 27권
  const newTestament = [
    '마태복음', '마가복음', '누가복음', '요한복음', '사도행전',
    '로마서', '고린도전서', '고린도후서', '갈라디아서', '에베소서',
    '빌립보서', '골로새서', '데살로니가전서', '데살로니가후서', '디모데전서',
    '디모데후서', '디도서', '빌레몬서', '히브리서', '야고보서',
    '베드로전서', '베드로후서', '요한일서', '요한이서', '요한삼서',
    '유다서', '요한계시록'
  ];

  const handleBookClick = (book: string, testament: string) => {
    setSelectedBook({ book, testament });
    // 여기서 Next.js 라우팅 또는 상태 관리 로직 구현
    console.log(`${testament} - ${book} 선택됨`);
  };

  const BookCard = ({ book, testament, index }: { book: string; testament: string; index: number }) => (
    <div
      className="group relative bg-gray-800/40 hover:bg-gray-700/60 border-2 border-dashed 
                 border-pink-300/30 hover:border-emerald-400/50 rounded-xl p-4 cursor-pointer 
                 transition-all duration-500 hover:shadow-lg hover:shadow-emerald-500/20 
                 hover:scale-[1.08] hover:-translate-y-2 hover:rotate-1 
                 hover:shadow-2xl overflow-hidden
                 animate-pulse-subtle hover:animate-float"
      onClick={() => handleBookClick(book, testament)}
    >
      {/* 물결 애니메이션 */}
      <div className="absolute bottom-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 
                      transition-opacity duration-500">
        <div className="relative w-full h-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/70 via-cyan-400/80 to-blue-500/70 
                          animate-wave-flow transform-gpu will-change-transform">
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center space-y-3 relative z-10">
        <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 
                        rounded-full flex items-center justify-center text-white text-xs font-semibold
                        shadow-lg ring-1 ring-emerald-400/20 group-hover:ring-2 
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

  const TestamentSection = ({ title, books, testament, icon: Icon, gradient }: {
    title: string;
    books: string[];
    testament: string;
    icon: React.ElementType;
    gradient: string;
  }) => (
    <div className="space-y-6">
      {/* 섹션 헤더 */}
      <div className="relative">
        <div className={`flex items-center space-x-4 p-6 rounded-2xl bg-gradient-to-r ${gradient} 
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
          <BookCard
            key={book}
            book={book}
            testament={testament}
            index={index}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <style jsx global>{`
        @keyframes wave-flow {
          0% {
            transform: translateX(-100%) scaleX(1.2);
            clip-path: polygon(0% 60%, 20% 40%, 40% 60%, 60% 30%, 80% 50%, 100% 40%, 100% 100%, 0% 100%);
          }
          25% {
            transform: translateX(-50%) scaleX(1);
            clip-path: polygon(0% 40%, 20% 60%, 40% 30%, 60% 50%, 80% 40%, 100% 60%, 100% 100%, 0% 100%);
          }
          50% {
            transform: translateX(0%) scaleX(0.8);
            clip-path: polygon(0% 50%, 20% 30%, 40% 50%, 60% 70%, 80% 60%, 100% 50%, 100% 100%, 0% 100%);
          }
          75% {
            transform: translateX(50%) scaleX(1);
            clip-path: polygon(0% 60%, 20% 50%, 40% 70%, 60% 40%, 80% 50%, 100% 30%, 100% 100%, 0% 100%);
          }
          100% {
            transform: translateX(100%) scaleX(1.2);
            clip-path: polygon(0% 40%, 20% 70%, 40% 50%, 60% 60%, 80% 30%, 100% 50%, 100% 100%, 0% 100%);
          }
        }
        
        .animate-wave-flow {
          animation: wave-flow 3s ease-in-out infinite;
        }

        @keyframes pulse-subtle {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.95;
            transform: scale(1.005);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(-8px) scale(1.08) rotate(1deg);
          }
          25% {
            transform: translateY(-12px) scale(1.1) rotate(0.5deg);
          }
          50% {
            transform: translateY(-6px) scale(1.085) rotate(1.5deg);
          }
          75% {
            transform: translateY(-10px) scale(1.095) rotate(0.8deg);
          }
        }

        @keyframes glow-pulse {
          0%, 100% {
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(16, 185, 129, 0.4), 0 0 60px rgba(16, 185, 129, 0.1);
          }
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 4s ease-in-out infinite;
        }

        .animate-float {
          animation: float 2s ease-in-out infinite, glow-pulse 2s ease-in-out infinite;
        }

        .group:hover .animate-float {
          animation-play-state: running;
        }
      `}</style>
      
      <div className="max-w-7xl mx-auto space-y-12">
        {/* 페이지 헤더 */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <BookOpen className="w-8 h-8 text-emerald-400" />
            <h1 className="text-4xl font-bold text-white">성경자료실</h1>
          </div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            구약과 신약 성경 자료를 한눈에 확인하고 필요한 성경을 쉽게 찾아보세요.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-teal-500 mx-auto rounded-full"></div>
        </div>

        {/* 구약 섹션 */}
        <TestamentSection
          title="구약 (Old Testament)"
          books={oldTestament}
          testament="old"
          icon={Scroll}
          gradient="from-amber-600/20 to-orange-600/20"
        />

        {/* 구분선 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center">
            <div className="bg-gray-900 px-6 py-2">
              <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* 신약 섹션 */}
        <TestamentSection
          title="신약 (New Testament)"
          books={newTestament}
          testament="new"
          icon={BookOpen}
          gradient="from-emerald-600/20 to-teal-600/20"
        />

        {/* 선택된 책 표시 제거 */}
      </div>
    </div>
  );
};

export default BibleBooksLayout;