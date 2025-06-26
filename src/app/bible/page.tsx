// 성경자료실(신구약 카드 그리드) 페이지
import React from "react";
import Link from "next/link";

// 성경책 데이터 (CSV 기반, order순)
const BIBLE_BOOKS = [
  // 구약
  { name: "창세기", group: "구약", order: 1 },
  { name: "출애굽기", group: "구약", order: 2 },
  { name: "레위기", group: "구약", order: 3 },
  { name: "민수기", group: "구약", order: 4 },
  { name: "신명기", group: "구약", order: 5 },
  { name: "여호수아", group: "구약", order: 6 },
  { name: "사사기", group: "구약", order: 7 },
  { name: "룻기", group: "구약", order: 8 },
  { name: "사무엘상", group: "구약", order: 9 },
  { name: "사무엘하", group: "구약", order: 10 },
  { name: "열왕기상", group: "구약", order: 11 },
  { name: "열왕기하", group: "구약", order: 12 },
  { name: "역대상", group: "구약", order: 13 },
  { name: "역대하", group: "구약", order: 14 },
  { name: "에스라", group: "구약", order: 15 },
  { name: "느헤미야", group: "구약", order: 16 },
  { name: "에스더", group: "구약", order: 17 },
  { name: "욥기", group: "구약", order: 18 },
  { name: "시편", group: "구약", order: 19 },
  { name: "잠언", group: "구약", order: 20 },
  { name: "전도서", group: "구약", order: 21 },
  { name: "아가", group: "구약", order: 22 },
  { name: "이사야", group: "구약", order: 23 },
  { name: "예레미야", group: "구약", order: 24 },
  { name: "예레미야애가", group: "구약", order: 25 },
  { name: "에스겔", group: "구약", order: 26 },
  { name: "다니엘", group: "구약", order: 27 },
  { name: "호세아", group: "구약", order: 28 },
  { name: "요엘", group: "구약", order: 29 },
  { name: "아모스", group: "구약", order: 30 },
  { name: "오바댜", group: "구약", order: 31 },
  { name: "요나", group: "구약", order: 32 },
  { name: "미가", group: "구약", order: 33 },
  { name: "나훔", group: "구약", order: 34 },
  { name: "하박국", group: "구약", order: 35 },
  { name: "스바냐", group: "구약", order: 36 },
  { name: "학개", group: "구약", order: 37 },
  { name: "스가랴", group: "구약", order: 38 },
  { name: "말라기", group: "구약", order: 39 },
  // 신약
  { name: "마태복음", group: "신약", order: 1 },
  { name: "마가복음", group: "신약", order: 2 },
  { name: "누가복음", group: "신약", order: 3 },
  { name: "요한복음", group: "신약", order: 4 },
  { name: "사도행전", group: "신약", order: 5 },
  { name: "로마서", group: "신약", order: 6 },
  { name: "고린도전서", group: "신약", order: 7 },
  { name: "고린도후서", group: "신약", order: 8 },
  { name: "갈라디아서", group: "신약", order: 9 },
  { name: "에베소서", group: "신약", order: 10 },
  { name: "빌립보서", group: "신약", order: 11 },
  { name: "골로새서", group: "신약", order: 12 },
  { name: "데살로니가전서", group: "신약", order: 13 },
  { name: "데살로니가후서", group: "신약", order: 14 },
  { name: "디모데전서", group: "신약", order: 15 },
  { name: "디모데후서", group: "신약", order: 16 },
  { name: "디도서", group: "신약", order: 17 },
  { name: "빌레몬서", group: "신약", order: 18 },
  { name: "히브리서", group: "신약", order: 19 },
  { name: "야고보서", group: "신약", order: 20 },
  { name: "베드로전서", group: "신약", order: 21 },
  { name: "베드로후서", group: "신약", order: 22 },
  { name: "요한1서", group: "신약", order: 23 },
  { name: "요한2서", group: "신약", order: 24 },
  { name: "요한3서", group: "신약", order: 25 },
  { name: "유다서", group: "신약", order: 26 },
  { name: "요한계시록", group: "신약", order: 27 },
];

function BookGrid({ books, color }: { books: { name: string; order: number }[]; color: string }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
      {books.map((book) => (
        <Link key={book.name} href={`/bible/${encodeURIComponent(book.name)}`}>
          <div
            className={`bible-book-card relative overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg hover:border-${color}-400 hover:bg-${color}-50/30`}
          >
            <div className={`book-title text-sm font-semibold mb-2 text-${color}-700 dark:text-${color}-300 transition-all duration-300`}>{book.name}</div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function BibleRoom() {
  const oldBooks = BIBLE_BOOKS.filter((b) => b.group === "구약").sort((a, b) => a.order - b.order);
  const newBooks = BIBLE_BOOKS.filter((b) => b.group === "신약").sort((a, b) => a.order - b.order);
  return (
    <main className="w-full max-w-[1024px] mx-auto py-8 min-h-[70vh]">
      <section className="mb-10">
        <h2 className="text-lg font-bold text-blue-500 mb-3">구약 성경</h2>
        <BookGrid books={oldBooks} color="blue" />
      </section>
      <section>
        <h2 className="text-lg font-bold text-emerald-500 mb-3">신약 성경</h2>
        <BookGrid books={newBooks} color="emerald" />
      </section>
    </main>
  );
} 