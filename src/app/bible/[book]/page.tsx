"use client";
import { notFound, useRouter } from "next/navigation";
import { File, Search, Eye, Edit, Download, Trash2 } from "lucide-react";
import React, { useState } from "react";

// 성경 66권 목록(간단 검증용)
const BOOK_NAMES = [
  "창세기","출애굽기","레위기","민수기","신명기","여호수아","사사기","룻기","사무엘상","사무엘하","열왕기상","열왕기하","역대상","역대하","에스라","느헤미야","에스더","욥기","시편","잠언","전도서","아가","이사야","예레미야","예레미야애가","에스겔","다니엘","호세아","요엘","아모스","오바댜","요나","미가","나훔","하박국","스바냐","학개","스가랴","말라기",
  "마태복음","마가복음","누가복음","요한복음","사도행전","로마서","고린도전서","고린도후서","갈라디아서","에베소서","빌립보서","골로새서","데살로니가전서","데살로니가후서","디모데전서","디모데후서","디도서","빌레몬서","히브리서","야고보서","베드로전서","베드로후서","요한1서","요한2서","요한3서","유다서","요한계시록"
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function Page({ params }: any) {
  const unwrappedParams = React.use(params) as { book: string };
  const bookName = decodeURIComponent(unwrappedParams.book);
  // Hook은 무조건 최상단에서 호출
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    file: null as File | null,
  });
  interface Material {
    id: number;
    title: string;
    description: string;
    tags: string[];
    fileName: string;
    fileSize: number;
    fileType: string;
    book: string;
    file: File;
  }
  const [materials, setMaterials] = useState<Material[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", tags: "" });
  const [modal, setModal] = useState<{ type: null | "edit" | "download" | "delete"; mat?: Material }>({ type: null });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [downloadFileName, setDownloadFileName] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // BOOK_NAMES에 없는 경우 notFound 렌더링
  if (!BOOK_NAMES.includes(bookName)) return notFound();

  // 폼 입력 핸들러
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  // 파일 선택 핸들러
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, file }));
  };
  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.file) return;
    const file = form.file;
    setMaterials((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: form.title,
        description: form.description,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        book: bookName,
        file,
      },
    ]);
    setForm({ title: "", description: "", tags: "", file: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 인라인 에디트 진입
  const handleEdit = (mat: Material) => {
    setEditId(mat.id);
    setEditForm({ title: mat.title, description: mat.description, tags: mat.tags.join(", ") });
  };
  // 인라인 에디트 저장
  const handleEditSave = (id: number) => {
    setMaterials((prev) => prev.map((m) => m.id === id ? { ...m, title: editForm.title, description: editForm.description, tags: editForm.tags.split(",").map(t => t.trim()).filter(Boolean) } : m));
    setEditId(null);
  };
  // 인라인 에디트 취소
  const handleEditCancel = () => {
    setEditId(null);
  };
  // 인라인 에디트 엔터키 저장
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: number) => {
    if (e.key === "Enter") handleEditSave(id);
  };
  // 다운로드
  const handleDownload = (mat: Material) => {
    setDownloadFileName(mat.fileName);
    setModal({ type: "download", mat });
  };
  // 삭제
  const handleDelete = (mat: Material) => {
    setModal({ type: "delete", mat });
  };
  // 모달 확인
  const handleModalConfirm = () => {
    if (modal.type === "delete" && modal.mat) {
      setMaterials((prev) => prev.filter((m) => m.id !== modal.mat!.id));
    } else if (modal.type === "download" && modal.mat) {
      // 실제 파일 다운로드
      const file = modal.mat.file;
      const blob = new Blob([file], { type: file.type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadFileName || file.name;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }
    setModal({ type: null });
  };
  // 모달 취소
  const handleModalCancel = () => setModal({ type: null });

  // 필터링된 자료목록
  const filteredMaterials = materials.filter((mat) => {
    const q = search.trim().toLowerCase();
    const match =
      mat.title.toLowerCase().includes(q) ||
      mat.description.toLowerCase().includes(q) ||
      mat.tags.some((t) => t.toLowerCase().includes(q));
    // 파일형식 그룹핑
    const ext = mat.fileName.split('.').pop()?.toLowerCase() || "";
    let typeOk = true;
    if (typeFilter !== "all") {
      if (typeFilter === "HTML") typeOk = ["html", "htm"].includes(ext);
      else if (typeFilter === "TEXT") typeOk = ["txt"].includes(ext);
      else if (typeFilter === "MD") typeOk = ["md", "markdown"].includes(ext);
      else if (typeFilter === "PDF") typeOk = ["pdf"].includes(ext);
      else if (typeFilter === "CSV") typeOk = ["csv"].includes(ext);
      else if (typeFilter === "이미지") typeOk = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);
      else if (typeFilter === "음악") typeOk = ["mp3", "wav", "ogg", "flac", "aac"].includes(ext);
      else if (typeFilter === "기타") typeOk = !["html","htm","txt","md","markdown","pdf","csv","jpg","jpeg","png","gif","bmp","webp","mp3","wav","ogg","flac","aac"].includes(ext);
    }
    return match && typeOk;
  });
  const totalPages = Math.max(1, Math.ceil(filteredMaterials.length / pageSize));
  const pagedMaterials = filteredMaterials.slice((page - 1) * pageSize, page * pageSize);

  return (
    <section className="flex flex-col gap-4 w-full max-w-[1024px] mx-auto py-8 min-h-[70vh]">
      {/* 상단: 목록으로 가기 버튼 */}
      <div className="mb-2 flex justify-end">
        <button
          onClick={() => router.push("/bible")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-400 to-emerald-400 text-white font-semibold shadow hover:from-indigo-500 hover:to-emerald-500 transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          목록으로 가기
        </button>
      </div>
      <div className="flex flex-row gap-8">
        {/* 좌측: 자료등록 (3) */}
        <div className="w-1/3 min-w-[280px] max-w-[340px] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col shadow-md">
          <h2 className="text-xl font-bold text-indigo-500 mb-2">{bookName} 자료 등록</h2>
          <p className="text-sm text-gray-500 mb-4">{bookName} 자료를 업로드하고 메타데이터를 입력하세요.</p>
          {/* 자료등록 폼 */}
          <form className="flex flex-col gap-4 flex-1" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium mb-1">제목</label>
              <input type="text" name="title" value={form.title} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="자료 제목을 입력하세요" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">구분</label>
              <input type="text" value={bookName} disabled className="w-full px-3 py-2 rounded border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-700 text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">설명</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="자료에 대한 설명을 입력하세요" rows={2} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">태그</label>
              <input type="text" name="tags" value={form.tags} onChange={handleChange} className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400" placeholder="태그를 입력하세요 (쉼표로 구분)" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="block text-sm font-medium mb-1">파일 업로드</label>
              <input ref={fileInputRef} type="file" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" required />
            </div>
            <button type="submit" className="mt-4 w-full py-2 rounded bg-indigo-500 hover:bg-indigo-600 text-white font-semibold shadow transition-all">자료 등록</button>
          </form>
        </div>
        {/* 우측: 자료목록 (6) */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-md flex flex-col">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
            <div className="flex flex-col items-center w-full">
              <h2 className="text-xl font-bold text-emerald-500 mb-1 text-center w-full">{bookName} 자료 목록</h2>
              <p className="text-sm text-gray-500 text-center w-full">총 {materials.length}개</p>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="자료 검색..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>
              <select
                className="px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
              >
                <option value="all">모든 형식</option>
                <option value="HTML">HTML</option>
                <option value="TEXT">TEXT</option>
                <option value="MD">MD</option>
                <option value="PDF">PDF</option>
                <option value="CSV">CSV</option>
                <option value="이미지">이미지</option>
                <option value="음악">음악</option>
                <option value="기타">기타</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 px-3 font-medium text-gray-400 w-[28%]">제목</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 w-[13%]">구분</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 w-[15%]">미리보기</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 w-[24%]">파일명</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-400 w-[20%]">관리</th>
                </tr>
              </thead>
              <tbody>
                {pagedMaterials.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <File className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <div className="text-gray-400">등록된 자료가 없습니다.</div>
                    </td>
                  </tr>
                ) : (
                  pagedMaterials.map((mat) => (
                    editId === mat.id ? (
                      <tr key={mat.id} className="border-b border-gray-100 dark:border-gray-800 bg-emerald-50/30 dark:bg-gray-800 transition-all">
                        <td className="py-2 px-3 font-medium text-gray-700 dark:text-gray-200">
                          <input
                            type="text"
                            value={editForm.title}
                            onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                            onKeyDown={e => handleEditKeyDown(e, mat.id)}
                            className="w-full px-2 py-1 rounded border border-emerald-300"
                            autoFocus
                          />
                        </td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{mat.book}</td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400 flex items-center justify-center"><Eye className="w-5 h-5 text-emerald-400" /></td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400 max-w-[160px] truncate" title={mat.fileName}>{mat.fileName}</td>
                        <td className="py-2 px-3 text-gray-400 flex gap-2">
                          <button onClick={() => handleEditSave(mat.id)} className="px-2 py-1 rounded bg-emerald-500 text-white font-semibold hover:bg-emerald-600">저장</button>
                          <button onClick={handleEditCancel} className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">취소</button>
                        </td>
                      </tr>
                    ) : (
                      <tr key={mat.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                        <td className="py-2 px-3 font-medium text-gray-700 dark:text-gray-200">{mat.title}</td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{mat.book}</td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400 flex items-center justify-center"><Eye className="w-5 h-5 text-emerald-400 hover:text-emerald-600 cursor-pointer" /></td>
                        <td className="py-2 px-3 text-gray-500 dark:text-gray-400 max-w-[160px] truncate" title={mat.fileName}>{mat.fileName}</td>
                        <td className="py-2 px-3 text-gray-400 flex gap-2">
                          <button onClick={() => handleEdit(mat)} title="수정" className="p-1 rounded hover:bg-emerald-50 group">
                            <Edit className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition-colors" />
                          </button>
                          <button onClick={() => handleDownload(mat)} title="다운로드" className="p-1 rounded hover:bg-blue-50 group">
                            <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                          </button>
                          <button onClick={() => handleDelete(mat)} title="삭제" className="p-1 rounded hover:bg-red-50 group">
                            <Trash2 className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors" />
                          </button>
                        </td>
                      </tr>
                    )
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* 페이지네이션 + 수량 선택 */}
          <div className="flex justify-between items-center mt-4">
            <div />
            <div className="flex items-center gap-2 ml-auto">
              <nav className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-2 py-1 rounded ${page === i + 1 ? "bg-emerald-500 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"} font-semibold text-sm hover:bg-emerald-400 hover:text-white transition-all`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
              <select
                className="ml-4 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              >
                <option value={10}>10개</option>
                <option value={20}>20개</option>
                <option value={30}>30개</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* 모달 */}
      {modal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8 min-w-[320px] flex flex-col items-center">
            <div className="mb-4 w-full">
              {modal.type === "delete" && <Trash2 className="w-8 h-8 text-red-500 mb-2 mx-auto" />}
              {modal.type === "download" && <Download className="w-8 h-8 text-blue-500 mb-2 mx-auto" />}
              <div className="text-lg font-bold mb-2 text-center">
                {modal.type === "delete" && "정말 삭제하시겠습니까?"}
                {modal.type === "download" && "다운로드 하시겠습니까?"}
              </div>
              <div className="text-gray-500 text-sm text-center mb-2">{modal.mat?.title} ({modal.mat?.fileName})</div>
              {modal.type === "download" && (
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded border border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
                  value={downloadFileName}
                  onChange={e => setDownloadFileName(e.target.value)}
                  placeholder="저장할 파일명을 입력하세요"
                />
              )}
            </div>
            <div className="flex gap-4 mt-2">
              <button onClick={handleModalConfirm} className="px-4 py-2 rounded bg-emerald-500 text-white font-semibold hover:bg-emerald-600 shadow">확인</button>
              <button onClick={handleModalCancel} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 shadow">취소</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
} 