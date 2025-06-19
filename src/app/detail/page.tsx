'use client';
import React from 'react';
import BibleFileDetail, { BibleFileDetailData } from '../../components/data/BibleFileDetail';

// 샘플 파일 데이터 (실제 데이터는 props, fetch 등으로 대체 가능)
const sampleFileData: BibleFileDetailData = {
  title: "창세기 1장 주석 자료.pdf",
  category: "주석",
  fileSize: "2.5 MB",
  uploadDate: "2024-06-01",
  fileType: "pdf",
  content: `창세기 1장 주석\n\n1. 태초에 하나님이 천지를 창조하시니라 (창 1:1)\n\n이 구절은 성경 전체의 기초가 되는 말씀으로, 하나님께서 만물의 창조주이심을 선언합니다.\n\n주요 해석 포인트:\n• \"태초에\" - 시간의 시작을 의미\n• \"하나님이\" - 엘로힘(복수형이지만 단수 동사와 함께 사용)\n• \"창조하시니라\" - 바라(무에서 유를 창조)\n\n2. 땅이 혼돈하고 공허하며 흑암이 깊음 위에 있고 하나님의 영은 수면 위에 운행하시니라 (창 1:2)\n\n이 구절은 창조 이전의 상태를 묘사합니다:\n• \"혼돈\" - 토후(무질서, 혼란)\n• \"공허\" - 보후(빈 공간, 공허함)\n• \"하나님의 영\" - 루아흐 엘로힘(성령의 활동)\n\n3. 하나님이 이르시되 빛이 있으라 하시니 빛이 있었고 (창 1:3)\n\n첫 번째 창조 명령:\n• 말씀으로 창조하시는 하나님의 능력\n• 빛과 어둠의 분리\n• 질서 있는 창조의 시작\n\n해석학적 고찰:\n이 장은 과학적 보고서가 아닌 신학적 선언입니다. 하나님께서 만물의 창조주이시며, 모든 창조물이 하나님의 뜻에 따라 \"보시기에 좋았더라\"는 평가를 받았음을 강조합니다.\n\n적용점:\n1. 하나님을 창조주로 인정하는 믿음\n2. 창조 질서에 대한 경외심\n3. 인간의 책임과 사명에 대한 이해`
};

export default function BibleFileDetailPage() {
  return <BibleFileDetail fileData={sampleFileData} />;
}
