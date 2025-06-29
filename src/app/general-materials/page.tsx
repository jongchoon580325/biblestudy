"use client";
import { useState, useRef, useEffect } from "react";
import { File as FileIcon, Search, Eye, Edit, Download, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { HybridStorageService } from "@/utils/storage-utils";
import { MaterialRecord } from "@/types/storage.types";

export default function GeneralMaterialsPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    file: null as File | null,
  });
  const [materials, setMaterials] = useState<MaterialRecord[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: "", description: "", tags: "" });
  const [modal, setModal] = useState<{ type: null | "edit" | "download" | "delete"; mat?: MaterialRecord }>({ type: null });
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [downloadFileName, setDownloadFileName] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 마운트 시 IndexedDB에서 자료 불러오기 (일반자료실 전용)
  useEffect(() => {
    HybridStorageService.getAllMaterials().then((all) => {
      setMaterials(all.filter((mat) => mat.category_type === 'general'));
    });
  }, []);

  // 자료 등록
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.file) return;
    const file = form.file;
    // 파일 바이너리 읽기
    let fileData: ArrayBuffer | undefined = undefined;
    try {
      fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = () => reject(reader.error);
        reader.readAsArrayBuffer(file);
      });
    } catch {}
    // IndexedDB용 자료 타입 생성
    const newMaterial: MaterialRecord = {
      local_id: crypto.randomUUID(),
      title: form.title,
      description: form.description,
      category_type: "general",
      file_name: file.name ?? '',
      file_size: file.size,
      file_type: file.type,
      file_data: fileData,
      file_url: undefined,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      metadata: {},
      created_at: new Date(),
      updated_at: new Date(),
      sync_status: "pending",
      sync_version: 1,
      is_deleted: false,
      storage_location: "local",
      last_sync: undefined,
      bible_book: undefined,
    };
    await HybridStorageService.addMaterial(newMaterial);
    const all = await HybridStorageService.getAllMaterials();
    setMaterials(all.filter((mat) => mat.category_type === 'general'));
    setForm({ title: "", description: "", tags: "", file: null });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // 인라인 에디트
  const handleEdit = (mat: MaterialRecord) => {
    setEditId(mat.local_id);
    setEditForm({ title: mat.title, description: mat.description ?? '', tags: mat.tags.join(", ") });
  };
  const handleEditSave = (id: string) => {
    setMaterials((prev) => prev.map((m) => m.local_id === id ? { ...m, title: editForm.title, description: editForm.description, tags: editForm.tags.split(",").map(t => t.trim()).filter(Boolean) } : m));
    setEditId(null);
  };
  const handleEditCancel = () => setEditId(null);
  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id: string) => {
    if (e.key === "Enter") handleEditSave(id);
  };

  // 다운로드
  const handleDownload = (mat: MaterialRecord) => {
    setDownloadFileName(mat.file_name);
    setModal({ type: "download", mat });
  };

  // 삭제
  const handleDelete = (mat: MaterialRecord) => {
    setModal({ type: "delete", mat });
  };

  // 모달 확인
  const handleModalConfirm = async () => {
    if (modal.type === "delete" && modal.mat) {
      await HybridStorageService.deleteMaterial(modal.mat.local_id);
      const all = await HybridStorageService.getAllMaterials();
      setMaterials(all.filter((mat) => mat.category_type === 'general'));
    } else if (modal.type === "download") {
      if (!modal.mat) return;
      // file_data가 없으면 빈 ArrayBuffer로 대체
      const file = modal.mat.file_data ?? new ArrayBuffer(0);
      const blob = new Blob([file], { type: modal.mat.file_type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName = typeof modal.mat.file_name === 'string' ? modal.mat.file_name : 'download';
      a.download = String(downloadFileName && downloadFileName.length > 0 ? downloadFileName : fileName);
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    }
    setModal({ type: null });
  };
  const handleModalCancel = () => setModal({ type: null });

  // 미리보기 상세페이지 이동 핸들러
  const handlePreview = (mat: MaterialRecord) => {
    router.push(`/general-materials/preview/${mat.local_id}`);
  };

  // 필터링
  const filteredMaterials = materials.filter((mat) => {
    const q = search.trim().toLowerCase();
    const match =
      mat.title.toLowerCase().includes(q) ||
      (mat.description || "").toLowerCase().includes(q) ||
      mat.tags.some((t) => t.toLowerCase().includes(q));
    const ext = mat.file_name.split('.').pop()?.toLowerCase() || "";
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
      {/* 상단: 제목 */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-white mb-1 text-left w-full">일반자료실</h2>
      </div>
      <div className="flex flex-row gap-8 mb-8">
        {/* 좌: 자료등록 (60%) */}
        <div className="w-[60%] bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col shadow-md">
          <h2 className="text-xl font-bold text-indigo-500 mb-2">일반자료 등록</h2>
          <p className="text-sm text-gray-500 mb-4">일반자료를 업로드하고 메타데이터를 입력하세요.</p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* 1단: 제목(좌), 구분(우) */}
            <div className="flex flex-row gap-4">
              <div className="w-1/2 flex items-center gap-2">
                <label className="text-sm font-semibold whitespace-nowrap">제목 :</label>
                <input
                  type="text"
                  className="input w-full border border-[#6e6c6b] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-gray-900"
                  placeholder="제목"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div className="w-1/2 flex items-center gap-2">
                <label className="text-sm font-semibold whitespace-nowrap">구분 :</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="구분"
                  value="일반자료"
                  disabled
                />
              </div>
            </div>
            {/* 2단: 설명(좌), 태그(우) */}
            <div className="flex flex-row gap-4">
              <div className="w-1/2 flex items-center gap-2">
                <label className="text-sm font-semibold whitespace-nowrap">설명 :</label>
                <input
                  type="text"
                  className="input w-full border border-[#6e6c6b] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-gray-900"
                  placeholder="설명"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="w-1/2 flex items-center gap-2">
                <label className="text-sm font-semibold whitespace-nowrap">태그 :</label>
                <input
                  type="text"
                  className="input w-full border border-[#6e6c6b] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-gray-900"
                  placeholder="태그(쉼표로 구분)"
                  value={form.tags}
                  onChange={e => setForm({ ...form, tags: e.target.value })}
                />
              </div>
            </div>
            {/* 3단: 파일선택(좌), 자료등록(버튼)(우) */}
            <div className="flex flex-row gap-4 items-center">
              <div className="w-1/2 flex items-center gap-2">
                <label className="text-sm font-semibold whitespace-nowrap px-3 py-1 border-2 border-green-500 rounded-full text-green-700">파일선택</label>
                <input
                  type="file"
                  className="file-input w-full border border-[#6e6c6b] rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-gray-900"
                  onChange={e => setForm({ ...form, file: e.target.files?.[0] ?? null })}
                  required
                />
                {form.file && <span className="ml-2 text-xs text-gray-500">{form.file.name}</span>}
              </div>
              <div className="w-1/2 flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white font-semibold rounded-full border border-green-700 shadow hover:bg-green-700 transition-colors"
                >
                  자료등록
                </button>
              </div>
            </div>
          </form>
        </div>
        {/* 우: blank box (40%) */}
        <div className="w-[40%] min-h-[220px] bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center text-gray-400 text-lg">
          (추후 구현)
        </div>
      </div>
      {/* 하단: 자료목록 테이블 */}
      <div className="w-full bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-md flex flex-col mt-4">
        <div className="flex flex-row items-center justify-between mb-4">
          <div className="flex flex-row items-center gap-3">
            <span className="text-xl font-bold text-emerald-400">일반자료 목록</span>
            <span className="text-gray-400 text-base">총 {materials.length}개</span>
          </div>
          <div className="flex flex-row items-center gap-2">
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
                <th className="text-left py-2 px-3 font-medium text-gray-400 w-[22%]">제목</th>
                <th className="text-left py-2 px-3 font-medium text-gray-400 w-[13%]">구분</th>
                <th className="text-left py-2 px-3 font-medium text-gray-400 w-[13%] whitespace-nowrap">미리보기</th>
                <th className="text-left py-2 px-3 font-medium text-gray-400 w-[22%]">파일명</th>
                <th className="text-left py-2 px-3 font-medium text-gray-400 w-[15%]">상태</th>
                <th className="text-left py-2 px-3 font-medium text-gray-400 w-[100px]">관리</th>
              </tr>
            </thead>
            <tbody>
              {pagedMaterials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <FileIcon className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <div className="text-gray-400">등록된 자료가 없습니다.</div>
                  </td>
                </tr>
              ) : (
                pagedMaterials.map((mat) => (
                  editId === mat.local_id ? (
                    <tr key={mat.local_id} className="border-b border-gray-100 dark:border-gray-800 bg-emerald-50/30 dark:bg-gray-800 transition-all">
                      <td className="py-2 px-3 font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap truncate max-w-[200px]" title={mat.title}>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                          onKeyDown={e => handleEditKeyDown(e, mat.local_id)}
                          className="w-full px-2 py-1 rounded border border-emerald-300"
                          autoFocus
                        />
                      </td>
                      <td className="py-2 px-3 text-gray-500 dark:text-gray-400 whitespace-nowrap truncate max-w-[100px]" title={mat.category_type}>{mat.category_type}</td>
                      <td className="py-2 px-3 text-gray-500 dark:text-gray-400 flex items-center justify-center">
                        <Eye
                          className="w-5 h-5 text-emerald-400 hover:text-emerald-600 cursor-pointer"
                          aria-label="미리보기"
                          role="button"
                          tabIndex={0}
                          onClick={() => handlePreview(mat)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handlePreview(mat); }}
                        />
                      </td>
                      <td className="py-2 px-3 text-gray-500 dark:text-gray-400 whitespace-nowrap truncate max-w-[180px]" title={mat.file_name}>{mat.file_name}</td>
                      <td className="py-2 px-3"><span className="text-xs text-green-700">동기화됨</span></td>
                      <td className="py-2 px-3 text-gray-400 flex gap-2">
                        <button onClick={() => handleEditSave(mat.local_id)} className="px-2 py-1 rounded bg-emerald-500 text-white font-semibold hover:bg-emerald-600">저장</button>
                        <button onClick={handleEditCancel} className="px-2 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300">취소</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={mat.local_id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                      <td className="py-2 px-3 font-medium text-gray-700 dark:text-gray-200 whitespace-nowrap truncate max-w-[200px]" title={mat.title}>{mat.title}</td>
                      <td className="py-2 px-3 text-gray-500 dark:text-gray-400 whitespace-nowrap truncate max-w-[100px]" title={mat.category_type}>{mat.category_type}</td>
                      <td className="py-2 px-3 text-gray-500 dark:text-gray-400 flex items-center justify-center">
                        <Eye
                          className="w-5 h-5 text-emerald-400 hover:text-emerald-600 cursor-pointer"
                          aria-label="미리보기"
                          role="button"
                          tabIndex={0}
                          onClick={() => handlePreview(mat)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handlePreview(mat); }}
                        />
                      </td>
                      <td className="py-2 px-3 text-gray-500 dark:text-gray-400 whitespace-nowrap truncate max-w-[180px]" title={mat.file_name}>{mat.file_name}</td>
                      <td className="py-2 px-3"><span className="text-xs text-green-700">동기화됨</span></td>
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
              <div className="text-gray-500 text-sm text-center mb-2">{modal.mat?.title} ({modal.mat?.file_name})</div>
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