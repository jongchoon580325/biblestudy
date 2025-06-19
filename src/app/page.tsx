'use client';

import React, { useState, useEffect } from 'react';
import { 
  Book, 
  Upload, 
  Database, 
  BookOpen, 
  FileText,
  Cross,
  Heart,
  Star,
  Quote
} from 'lucide-react';

const BiblicalHomepage = () => {
  const [currentVerse] = useState({
    text: "하나님의 말씀은 살아 있고 활력이 있어 좌우에 날선 어떤 검보다도 예리하다",
    reference: "히브리서 4:12"
  });

  // 통계 카운터 애니메이션 (현재 stats 미사용, 추후 필요시 복구)
  useEffect(() => {
    // 애니메이션용 코드 자리 (현재 미사용)
  }, []);

  const mainFeatures = [
    {
      icon: Database,
      title: "전체자료실",
      description: "모든 성경 자료를 한눈에 탐색하고 관리하세요",
      color: "from-blue-500 to-blue-600",
      stats: "1,247개 자료"
    },
    {
      icon: BookOpen,
      title: "성경자료실",
      description: "성경 연구와 설교를 위한 전문 자료 모음",
      color: "from-purple-500 to-purple-600",
      stats: "854개 자료"
    },
    {
      icon: FileText,
      title: "일반자료실",
      description: "교회 운영과 신앙 생활에 필요한 다양한 자료",
      color: "from-green-500 to-green-600",
      stats: "393개 자료"
    },
    {
      icon: Upload,
      title: "자료업로드",
      description: "새로운 자료를 업로드하여 공동체와 나누세요",
      color: "from-amber-500 to-amber-600",
      stats: "쉬운 업로드"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
        <div className="relative px-6 py-16 sm:py-24 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <div className="relative bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-full">
                  <Cross className="w-12 h-12 text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-amber-400 bg-clip-text text-transparent">
              성경 자료의 디지털 성소
            </h1>
            
            <p className="text-xl sm:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
              하나님의 말씀을 연구하고 나누는 모든 이들을 위한 <br />
              통합 자료 관리 플랫폼
            </p>


          </div>
        </div>
      </div>

      {/* Main Features Grid */}
      <div className="px-6 py-16 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
          
          <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
            {mainFeatures.map((feature, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:transform hover:scale-105"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative p-6">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm mb-4">{feature.description}</p>
                  
                  <div className="flex items-center text-sm text-slate-300">
                    <Star className="w-4 h-4 mr-1 text-amber-400" />
                    {feature.stats}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily Verse */}
      <div className="px-6 py-16 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 backdrop-blur-sm border border-amber-500/20 p-8 sm:p-12">
            <div className="absolute top-4 left-4 opacity-20">
              <Quote className="w-16 h-16 text-amber-400" />
            </div>
            
            <div className="relative text-center">
              <h3 className="text-2xl font-semibold mb-6 text-amber-400">오늘의 말씀</h3>
              
              <blockquote className="text-xl sm:text-2xl font-medium text-white mb-6 leading-relaxed">
                &quot;{currentVerse.text}&quot;
              </blockquote>
              
              <cite className="text-amber-300 font-semibold">
                - {currentVerse.reference}
              </cite>
            </div>
            
            <div className="absolute bottom-4 right-4 opacity-20">
              <Heart className="w-16 h-16 text-amber-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-16 lg:px-8 bg-gradient-to-r from-slate-900/50 to-slate-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-4">
            <button className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors duration-200">
              <BookOpen className="w-5 h-5 mr-2" />
              성경읽기
            </button>
            
            <button className="flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl font-medium transition-colors duration-200">
              <BookOpen className="w-5 h-5 mr-2" />
              성경 공부
            </button>
            
            <button className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors duration-200">
              <Upload className="w-5 h-5 mr-2" />
              성경쓰기
            </button>
            
            <button className="flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 rounded-xl font-medium transition-colors duration-200">
              <Book className="w-5 h-5 mr-2" />
              원어성경
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiblicalHomepage;
