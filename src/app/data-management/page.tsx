'use client';
import React, { useState } from 'react';
import { 
  RefreshCw, 
  Download, 
  Upload, 
  Database, 
  Book, 
  Grid3X3, 
  AlertTriangle 
} from 'lucide-react';
import { HybridStorageService } from '@/utils/storage-utils';
import { supabase } from '@/utils/supabaseClient';
import JSZip from 'jszip';
import { syncPendingMaterials } from '@/utils/sync-engine';
import { Category, CategoryType } from '@/types/category.types';
import { CategoryService } from '@/utils/category-service';
import type { AdminRecord } from '@/types/storage.types';

// 데이터관리 페이지 본문 UI
export default function DataManagement() {
  // 상태: 초기화 모달, 진행중, 결과
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetResult, setResetResult] = useState<string|null>(null);
  const [exportModal, setExportModal] = useState<null | 'bible' | 'general'>(null);
  // 동기화 버튼 상태
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<string|null>(null);
  // --- 카테고리 관리 상태 ---
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catModal, setCatModal] = useState<null | { type: 'add'|'edit'|'delete'|'clear', target?: Category, parentId?: string }> (null);
  const [catInput, setCatInput] = useState('');
  const [catType, setCatType] = useState<CategoryType>('group');
  const [expanded, setExpanded] = useState<string[]>([]); // 펼침 그룹 id 목록
  // --- 관리자 계정 관리 상태 ---
  const DEFAULT_ADMIN: AdminRecord = { email: 'najongchoon@gmail.com', name: '나종춘', role: 'super', password: '1111' };
  const [admins, setAdmins] = useState([DEFAULT_ADMIN]);
  const [addAdminModal, setAddAdminModal] = useState(false);
  const [adminInput, setAdminInput] = useState<AdminRecord>({ email: '', name: '', role: 'super', password: '' });
  const [editAdminModal, setEditAdminModal] = useState<{ open: boolean, idx: number | null }>({ open: false, idx: null });
  const [deleteAdminModal, setDeleteAdminModal] = useState<{ open: boolean, idx: number | null }>({ open: false, idx: null });
  const [editInput, setEditInput] = useState<AdminRecord>({ email: '', name: '', role: 'super', password: '' });

  // 관리자 목록 불러오기 (최초 1회, 새로고침 시)
  React.useEffect(() => {
    (async () => {
      let all = await HybridStorageService.getAllAdmins();
      // 기본 최고관리자 없으면 IndexedDB에 추가
      if (!all.find(a => a.email === DEFAULT_ADMIN.email)) {
        await HybridStorageService.addAdmin(DEFAULT_ADMIN);
        all = await HybridStorageService.getAllAdmins();
      }
      // supabase에도 기본 최고관리자 존재 보장
      const { data: supaAdmins } = await supabase.from('admins').select('email').eq('email', DEFAULT_ADMIN.email);
      if (!supaAdmins || supaAdmins.length === 0) {
        await supabase.from('admins').upsert([DEFAULT_ADMIN], { onConflict: 'email' });
      }
      setAdmins([DEFAULT_ADMIN, ...all.filter(a => a.email !== DEFAULT_ADMIN.email)]);
    })();
  }, []);

  // 관리자 동기화 트리거
  React.useEffect(() => {
    const syncAdmins = async () => {
      const all = await HybridStorageService.getAllAdmins();
      const pendings = all.filter(a => a.sync_status === 'pending');
      if (pendings.length === 0) return;
      for (const admin of pendings) {
        if (admin.to_delete) {
          await supabase.from('admins').delete().eq('email', admin.email);
          await HybridStorageService.deleteAdmin(admin.email);
        } else {
          await supabase.from('admins').upsert([{ ...admin, sync_status: undefined }], { onConflict: 'email' });
          await HybridStorageService.updateAdmin(admin.email, { sync_status: 'synced' });
        }
      }
      const updated = await HybridStorageService.getAllAdmins();
      setAdmins([DEFAULT_ADMIN, ...updated.filter(a => a.email !== DEFAULT_ADMIN.email)]);
    };
    const interval = setInterval(syncAdmins, 2000);
    return () => clearInterval(interval);
  }, []);

  // 데이터 초기화 실행
  async function handleReset() {
    setResetLoading(true);
    setResetResult(null);
    try {
      // 1. IndexedDB 전체 삭제
      await HybridStorageService.clearAllMaterials();
      await HybridStorageService.clearAllSyncQueue();
      await HybridStorageService.clearAllAppMetadata();
      // 2. Supabase materials 테이블 전체 삭제 (id 목록 조회 후 in 조건)
      const { data: allRows, error: fetchErr } = await supabase.from('materials').select('local_id');
      if (fetchErr) throw fetchErr;
      if (allRows && allRows.length > 0) {
        const ids = allRows.map((row: { local_id: string }) => row.local_id).filter(Boolean);
        if (ids.length > 0) {
          const { error: delErr } = await supabase.from('materials').delete().in('local_id', ids);
          if (delErr) throw delErr;
        }
      }
      // 3. Supabase materials 스토리지 버킷 전체 삭제 (bible, general 폴더별)
      for (const folder of ['bible', 'general']) {
        const { data: files, error: listErr } = await supabase.storage.from('materials').list(folder, { limit: 1000 });
        if (listErr) throw listErr;
        if (files && files.length > 0) {
          const fileNames = files.map(f => f.name ? `${folder}/${f.name}` : null).filter(Boolean) as string[];
          if (fileNames.length > 0) {
            const { error: fileDelErr } = await supabase.storage.from('materials').remove(fileNames);
            if (fileDelErr) throw fileDelErr;
          }
        }
      }
      setResetResult('데이터 초기화가 완료되었습니다.');
    } catch (e) {
      let msg = '알 수 없는 오류';
      if (e instanceof Error) msg = e.message;
      setResetResult('초기화 실패: ' + msg);
    } finally {
      setResetLoading(false);
    }
  }

  // 내보내기(백업) - 자료실별
  async function handleExport(categoryType: 'bible' | 'general') {
    const all = await HybridStorageService.getAllMaterials();
    const filtered = all.filter(m => m.category_type === categoryType);
    const meta = filtered.map(mat => Object.assign({}, mat, { file_data: undefined }));
    const zip = new JSZip();
    zip.file('meta.json', JSON.stringify(meta, null, 2));
    for (const mat of filtered) {
      if (mat.file_data && mat.file_name) {
        zip.file(`files/${mat.file_name}`, mat.file_data);
      }
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const kor = categoryType === 'bible' ? '성경자료실' : '일반자료실';
    const fileName = `${yyyy}-${mm}-${dd}-${kor}-databackup.zip`;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // 가져오기(복구) - 자료실별
  async function handleImport(categoryType: 'bible' | 'general', file: File) {
    const zip = await JSZip.loadAsync(file);
    const metaText = await zip.file('meta.json')?.async('string');
    if (!metaText) return;
    const meta = JSON.parse(metaText);
    for (const m of meta) {
      let fileDataValue = undefined;
      if (m.file_name && zip.file(`files/${m.file_name}`)) {
        fileDataValue = await zip.file(`files/${m.file_name}`)?.async('uint8array');
      }
      // 필수 필드 보완
      const now = new Date();
      const material = {
        ...m,
        local_id: m.local_id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
        created_at: m.created_at || now,
        updated_at: now,
        sync_status: 'pending',
        file_data: fileDataValue,
        category_type: categoryType,
      };
      await HybridStorageService.addMaterial(material);
    }
  }

  // 수동 동기화 실행 (Supabase 동기화 실행 버튼)
  async function handleManualSync() {
    setSyncLoading(true);
    setSyncResult(null);
    try {
      await syncPendingMaterials();
      setSyncResult('동기화가 완료되었습니다.');
    } catch (e) {
      let msg = '알 수 없는 오류';
      if (e instanceof Error) msg = e.message;
      setSyncResult('동기화 실패: ' + msg);
    } finally {
      setSyncLoading(false);
      // 3초 후 메시지 자동 사라짐
      setTimeout(() => setSyncResult(null), 3000);
    }
  }

  // 카테고리 목록 fetch
  async function fetchCategories() {
    setCatLoading(true);
    const all = await CategoryService.getAll();
    setCategories(all);
    setCatLoading(false);
  }
  React.useEffect(() => { fetchCategories(); }, []);
  // 그룹/하위카테고리 분리
  const groupCategories = categories.filter(cat => cat.type === 'group').sort((a, b) => a.order - b.order);
  const getSubCategories = (groupId: string) =>
    categories.filter(cat => cat.type === 'item' && cat.parentId === groupId).sort((a, b) => a.order - b.order);
  // 추가/수정/삭제/초기화 핸들러
  async function handleAddCategory() {
    const name = catInput.trim();
    if (!name) return;
    // 중복 방지
    if (categories.some(cat => cat.name === name && cat.type === catType && (catType === 'group' || cat.parentId === catModal?.parentId))) return;
    const now = new Date().toISOString();
    const newCat: Category = {
      id: crypto.randomUUID(),
      name,
      type: catType,
      parentId: catType === 'item' ? catModal?.parentId : undefined,
      order: (catType === 'group'
        ? groupCategories.length
        : getSubCategories(catModal?.parentId || '').length) + 1,
      created_at: now,
      updated_at: now,
      sync_status: 'pending',
    };
    await CategoryService.add(newCat);
    setCatModal(null); setCatInput('');
    fetchCategories();
  }
  async function handleEditCategory() {
    if (!catInput.trim() || !catModal?.target) return;
    const target = catModal.target;
    if (!target) return;
    if (categories.some(cat => cat.name === catInput.trim() && cat.id !== target.id && cat.type === target.type && (target.type === 'group' || cat.parentId === target.parentId))) return;
    await CategoryService.update(target.id, { name: catInput.trim(), updated_at: new Date().toISOString(), sync_status: 'pending' });
    setCatModal(null); setCatInput('');
    fetchCategories();
  }
  async function handleDeleteCategory() {
    if (!catModal?.target) return;
    await CategoryService.delete(catModal.target.id);
    setCatModal(null);
    fetchCategories();
  }
  async function handleClearCategories() {
    await CategoryService.clear();
    setCatModal(null);
    fetchCategories();
  }
  // Accordion 펼침/접힘
  function toggleExpand(id: string) {
    setExpanded(expanded => expanded.includes(id) ? expanded.filter(e => e !== id) : [...expanded, id]);
  }

  // 관리자 추가 핸들러
  async function handleAddAdmin() {
    if (!adminInput.email.trim() || !adminInput.name.trim() || !adminInput.password.trim()) return;
    if (admins.some(a => a.email === adminInput.email)) return;
    await HybridStorageService.addAdmin({ ...adminInput, sync_status: 'pending' });
    const all = await HybridStorageService.getAllAdmins();
    setAdmins([DEFAULT_ADMIN, ...all.filter(a => a.email !== DEFAULT_ADMIN.email)]);
    setAddAdminModal(false);
    setAdminInput({ email: '', name: '', role: 'super', password: '' });
  }

  // 관리자 수정 핸들러
  async function handleEditAdmin() {
    if (editAdminModal.idx == null) return;
    if (!editInput.email.trim() || !editInput.name.trim() || !editInput.password.trim()) return;
    await HybridStorageService.updateAdmin(editInput.email, { ...editInput, sync_status: 'pending' });
    const all = await HybridStorageService.getAllAdmins();
    setAdmins([DEFAULT_ADMIN, ...all.filter(a => a.email !== DEFAULT_ADMIN.email)]);
    setEditAdminModal({ open: false, idx: null });
  }

  // 삭제 핸들러
  async function handleDeleteAdmin() {
    if (deleteAdminModal.idx == null) return;
    const target = admins[deleteAdminModal.idx];
    if (!target || target.email === DEFAULT_ADMIN.email) return;
    // 삭제 플래그만 지정 (실제 삭제는 동기화 후)
    await HybridStorageService.updateAdmin(target.email, { ...target, sync_status: 'pending', to_delete: true });
    const all = await HybridStorageService.getAllAdmins();
    setAdmins([DEFAULT_ADMIN, ...all.filter(a => a.email !== DEFAULT_ADMIN.email)]);
    setDeleteAdminModal({ open: false, idx: null });
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-8">
        {/* 타이틀 섹션 - 전체자료실과 동일한 스타일 */}
        <div className="flex flex-col items-center text-center mb-8 w-full">
          <h1 className="text-2xl font-bold text-white mb-2">데이터 관리 시스템</h1>
          <p className="text-base text-gray-400 mb-4">카테고리 및 데이터 통합 관리 플랫폼</p>
          {/* 구분선: gradient 스타일 */}
          <div className="h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent mb-8 w-full" />
        </div>

        {/* 데이터 관리/카테고리 관리 그리드 */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
          {/* 좌측 영역 (4 columns) - 카테고리 관리 */}
          <div className="lg:col-span-4">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center mb-6">
                <Grid3X3 className="w-6 h-6 mr-3 text-blue-400" />
                <h2 className="text-xl font-semibold">카테고리 관리</h2>
              </div>
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex justify-between mb-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs" onClick={() => { setCatType('group'); setCatModal({ type: 'add' }); setCatInput(''); }}>+ 그룹 추가</button>
                </div>
                {catLoading ? (
                  <div className="text-gray-400 text-sm py-8 text-center">로딩 중...</div>
                ) : groupCategories.length === 0 ? (
                  <div className="text-gray-400 text-sm py-8 text-center">카테고리가 없습니다.</div>
                ) : (
                  <ul>
                    {groupCategories.map(group => (
                      <li key={group.id} className="mb-2">
                        <div className="flex items-center justify-between bg-gray-700 rounded px-2 py-1">
                          <div className="flex items-center cursor-pointer" onClick={() => toggleExpand(group.id)}>
                            <span className="mr-2">{expanded.includes(group.id) ? '▼' : '▶'}</span>
                            <span className="font-semibold text-white text-[10px]">{group.name}</span>
                          </div>
                          <div className="flex gap-1">
                            <button className="text-[10px] text-blue-400 hover:underline" onClick={() => { setCatType('item'); setCatModal({ type: 'add', parentId: group.id }); setCatInput(''); }}>하위 추가</button>
                            <button className="text-[10px] text-yellow-400 hover:underline" onClick={() => { setCatModal({ type: 'edit', target: group }); setCatInput(group.name); }}>수정</button>
                            <button className="text-[10px] text-red-400 hover:underline" onClick={() => setCatModal({ type: 'delete', target: group })}>삭제</button>
                          </div>
                        </div>
                        {/* 하위카테고리 */}
                        {expanded.includes(group.id) && (
                          <ul className="ml-6 mt-1">
                            {getSubCategories(group.id).map(item => (
                              <li key={item.id} className="flex items-center justify-between bg-gray-600 rounded px-2 py-1 mb-1">
                                <span className="text-white text-[10px]">{item.name}</span>
                                <div className="flex gap-1">
                                  <button className="text-[10px] text-yellow-400 hover:underline" onClick={() => { setCatModal({ type: 'edit', target: item }); setCatInput(item.name); }}>수정</button>
                                  <button className="text-[10px] text-red-400 hover:underline" onClick={() => setCatModal({ type: 'delete', target: item })}>삭제</button>
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* 우측 영역 (6 columns) - 데이터 관리 + 관리자 계정 관리 */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            {/* 데이터 관리 (1단) */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center mb-6">
                <Database className="w-6 h-6 mr-3 text-green-400" />
                <h2 className="text-xl font-semibold">데이터 관리</h2>
              </div>

              <div className="space-y-6">
                {/* 첫 번째 행 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 자료동기화 */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      자료동기화
                    </h3>
                    <button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center text-sm lg:whitespace-nowrap lg:min-w-0 lg:overflow-hidden lg:text-ellipsis disabled:opacity-60"
                      onClick={handleManualSync}
                      disabled={syncLoading}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {syncLoading ? '동기화 중...' : 'Supabase 동기화 실행'}
                    </button>
                    {/* 동기화 결과 메시지 */}
                    {syncResult && (
                      <div className="mt-4 text-center text-sm text-emerald-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">{syncResult}</div>
                    )}
                  </div>

                  {/* 카테고리항목 */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                      <Grid3X3 className="w-4 h-4 mr-2" />
                      카테고리항목
                    </h3>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center text-xs lg:whitespace-nowrap lg:min-w-0 lg:overflow-hidden lg:text-ellipsis" onClick={() => setExportModal('bible')}>
                        <Download className="w-4 h-4 mr-1" />
                        내보내기
                      </button>
                      <input type="file" accept=".zip" style={{ display: 'none' }} id="bible-import" onChange={e => { if (e.target.files?.[0]) handleImport('bible', e.target.files[0]); }} />
                      <label htmlFor="bible-import" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center text-xs lg:whitespace-nowrap lg:min-w-0 lg:overflow-hidden lg:text-ellipsis cursor-pointer">
                        <Upload className="w-4 h-4 mr-1" />
                        가져오기
                      </label>
                    </div>
                  </div>
                </div>

                {/* 두 번째 행 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 성경데이터 */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                      <Book className="w-4 h-4 mr-2" />
                      성경데이터
                    </h3>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center text-xs lg:whitespace-nowrap lg:min-w-0 lg:overflow-hidden lg:text-ellipsis" onClick={() => setExportModal('bible')}>
                        <Download className="w-4 h-4 mr-1" />
                        내보내기
                      </button>
                      <input type="file" accept=".zip" style={{ display: 'none' }} id="bible-import" onChange={e => { if (e.target.files?.[0]) handleImport('bible', e.target.files[0]); }} />
                      <label htmlFor="bible-import" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center text-xs lg:whitespace-nowrap lg:min-w-0 lg:overflow-hidden lg:text-ellipsis cursor-pointer">
                        <Upload className="w-4 h-4 mr-1" />
                        가져오기
                      </label>
                    </div>
                  </div>

                  {/* 일반데이터 */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                      <Database className="w-4 h-4 mr-2" />
                      일반데이터
                    </h3>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center text-xs lg:whitespace-nowrap lg:min-w-0 lg:overflow-hidden lg:text-ellipsis" onClick={() => setExportModal('general')}>
                        <Download className="w-4 h-4 mr-1" />
                        내보내기
                      </button>
                      <input type="file" accept=".zip" style={{ display: 'none' }} id="general-import" onChange={e => { if (e.target.files?.[0]) handleImport('general', e.target.files[0]); }} />
                      <label htmlFor="general-import" className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-3 rounded-md transition-colors duration-200 flex items-center justify-center text-xs lg:whitespace-nowrap lg:min-w-0 lg:overflow-hidden lg:text-ellipsis cursor-pointer">
                        <Upload className="w-4 h-4 mr-1" />
                        가져오기
                      </label>
                    </div>
                  </div>
                </div>

                {/* 세 번째 행 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 데이터 초기화 */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      데이터 초기화
                    </h3>
                    <button
                      className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center text-sm lg:whitespace-nowrap lg:min-w-0 lg:overflow-hidden lg:text-ellipsis"
                      onClick={() => setShowResetModal(true)}
                      disabled={resetLoading}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      {resetLoading ? '초기화 중...' : '초기화'}
                    </button>
                    {/* 확인 모달 */}
                    {showResetModal && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 min-w-[320px] max-w-md w-full flex flex-col items-center">
                          <div className="text-lg font-bold mb-4 text-center text-red-600">정말 모든 데이터를 초기화하시겠습니까?</div>
                          <div className="mb-6 text-center text-gray-800 dark:text-gray-200 text-sm">
                            이 작업은 되돌릴 수 없습니다.<br/>IndexedDB와 Supabase의 모든 자료가 삭제됩니다.
                          </div>
                          <div className="flex gap-4">
                            <button
                              onClick={async () => { setShowResetModal(false); await handleReset(); }}
                              className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-60"
                              disabled={resetLoading}
                            >확인</button>
                            <button
                              onClick={() => setShowResetModal(false)}
                              className="px-4 py-2 bg-gray-400 text-white rounded"
                              disabled={resetLoading}
                            >취소</button>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* 결과 메시지 */}
                    {resetResult && (
                      <div className="mt-4 text-center text-sm text-emerald-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-full">{resetResult}</div>
                    )}
                  </div>

                  {/* 카테고리 초기화 */}
                  <div className="bg-gray-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      카테고리 초기화
                    </h3>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center text-sm lg:whitespace-nowrap lg:min-w-0 lg:overflow-hidden lg:text-ellipsis">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      초기화
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* 관리자 계정 관리 (2단) */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
              <div className="flex items-center mb-6">
                <span className="text-2xl mr-3">👤</span>
                <h2 className="text-xl font-semibold">관리자 계정 관리</h2>
              </div>
              {/* 관리자 계정 테이블 */}
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs text-left text-gray-400">
                  <thead className="bg-gray-800 text-gray-300">
                    <tr>
                      <th className="px-3 py-2">이메일</th>
                      <th className="px-3 py-2">이름</th>
                      <th className="px-3 py-2">권한</th>
                      <th className="px-3 py-2">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* 기본 최고관리자 계정 */}
                    <tr className="bg-gray-700">
                      <td className="px-3 py-2 font-mono">najongchoon@gmail.com</td>
                      <td className="px-3 py-2">나종춘</td>
                      <td className="px-3 py-2 text-amber-400 font-bold">최고관리자</td>
                      <td className="px-3 py-2 text-xs text-gray-400">(기본)</td>
                    </tr>
                    {/* 추가된 관리자 계정 렌더링 */}
                    {admins.slice(1).map((admin, idx) => (
                      <tr key={admin.email} className="bg-gray-800">
                        <td className="px-3 py-2 font-mono">{admin.email}</td>
                        <td className="px-3 py-2">{admin.name}</td>
                        <td className="px-3 py-2">{admin.role === 'super' ? '최고관리자' : '일반관리자'}</td>
                        <td className="px-3 py-2">
                          <button className="text-xs text-yellow-400 hover:underline mr-2" onClick={() => { setEditInput(admin); setEditAdminModal({ open: true, idx: idx + 1 }); }}>수정</button>
                          <button className="text-xs text-red-400 hover:underline" onClick={() => setDeleteAdminModal({ open: true, idx: idx + 1 })}>삭제</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* 관리자 추가 버튼 및 모달 */}
              <div className="mt-4 flex justify-end">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-xs" onClick={() => setAddAdminModal(true)}>
                  + 관리자 추가
                </button>
              </div>
              {/* 관리자 추가 모달 */}
              {addAdminModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white dark:bg-gray-900 rounded-[20px] shadow-lg p-6 min-w-[320px] max-w-md w-full flex flex-col items-center border border-white" style={{ border: '1px solid #fff', borderRadius: 20 }}>
                    <div className="text-lg font-bold mb-4 text-center text-blue-600">관리자 추가</div>
                    <form className="w-full flex flex-col gap-3" onSubmit={e => { e.preventDefault(); handleAddAdmin(); }}>
                      <input className="border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-black" placeholder="이메일" type="email" value={adminInput.email} onChange={e => setAdminInput({ ...adminInput, email: e.target.value })} required />
                      <input className="border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-black" placeholder="이름" value={adminInput.name} onChange={e => setAdminInput({ ...adminInput, name: e.target.value })} required />
                      <select className="border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-black" value={adminInput.role} onChange={e => setAdminInput({ ...adminInput, role: e.target.value as 'super' | 'normal' })}>
                        <option value="super">최고관리자</option>
                        <option value="normal">일반관리자</option>
                      </select>
                      <input className="border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-black" placeholder="비밀번호" type="password" value={adminInput.password} onChange={e => setAdminInput({ ...adminInput, password: e.target.value })} required />
                      <div className="flex gap-4 mt-2 justify-end">
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">추가</button>
                        <button type="button" onClick={() => setAddAdminModal(false)} className="px-4 py-2 bg-gray-400 text-white rounded">취소</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {/* 관리자 수정 모달 */}
              {editAdminModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white dark:bg-gray-900 rounded-[20px] shadow-lg p-6 min-w-[320px] max-w-md w-full flex flex-col items-center border border-white" style={{ border: '1px solid #fff', borderRadius: 20 }}>
                    <div className="text-lg font-bold mb-4 text-center text-yellow-600">관리자 정보 수정</div>
                    <form className="w-full flex flex-col gap-3" onSubmit={e => { e.preventDefault(); handleEditAdmin(); }}>
                      <input className="border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-black" placeholder="이메일" type="email" value={editInput.email} onChange={e => setEditInput({ ...editInput, email: e.target.value })} required />
                      <input className="border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-black" placeholder="이름" value={editInput.name} onChange={e => setEditInput({ ...editInput, name: e.target.value })} required />
                      <select className="border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-black" value={editInput.role} onChange={e => setEditInput({ ...editInput, role: e.target.value as 'super' | 'normal' })}>
                        <option value="super">최고관리자</option>
                        <option value="normal">일반관리자</option>
                      </select>
                      <input className="border rounded px-3 py-2 text-black dark:text-white bg-white dark:bg-black" placeholder="비밀번호" type="password" value={editInput.password} onChange={e => setEditInput({ ...editInput, password: e.target.value })} required />
                      <div className="flex gap-4 mt-2 justify-end">
                        <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded">저장</button>
                        <button type="button" onClick={() => setEditAdminModal({ open: false, idx: null })} className="px-4 py-2 bg-gray-400 text-white rounded">취소</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {/* 관리자 삭제 확인 모달 */}
              {deleteAdminModal.open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-white dark:bg-gray-900 rounded-[20px] shadow-lg p-6 min-w-[320px] max-w-md w-full flex flex-col items-center border border-white" style={{ border: '1px solid #fff', borderRadius: 20 }}>
                    <div className="text-lg font-bold mb-4 text-center text-red-600">정말 삭제하시겠습니까?</div>
                    <div className="mb-6 text-center text-gray-800 dark:text-gray-200 text-sm">이 작업은 되돌릴 수 없습니다.</div>
                    <div className="flex gap-4 mt-2 justify-end">
                      <button onClick={handleDeleteAdmin} className="px-4 py-2 bg-red-600 text-white rounded">삭제</button>
                      <button onClick={() => setDeleteAdminModal({ open: false, idx: null })} className="px-4 py-2 bg-gray-400 text-white rounded">취소</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 내보내기 확인 모달 */}
        {exportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-6 min-w-[320px] max-w-md w-full flex flex-col items-center">
              <div className="text-lg font-bold mb-4 text-center text-blue-600">정말 내보내기 파일을 생성하시겠습니까?</div>
              <div className="mb-6 text-center text-gray-800 dark:text-gray-200 text-sm">
                현재 자료를 zip 파일로 백업합니다.<br/>진행하시겠습니까?
              </div>
              <div className="flex gap-4">
                <button
                  onClick={async () => { await handleExport(exportModal); setExportModal(null); }}
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >확인</button>
                <button
                  onClick={() => setExportModal(null)}
                  className="px-4 py-2 bg-gray-400 text-white rounded"
                >취소</button>
              </div>
            </div>
          </div>
        )}

        {/* 카테고리 추가/수정/삭제/초기화 모달 */}
        {catModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-900 flex flex-col items-center shadow-lg p-4 border border-white rounded-[20px]" style={{ minWidth: '160px', maxWidth: '200px', width: '50%' }}>
              {catModal.type === 'add' && (
                <form
                  onSubmit={e => { e.preventDefault(); handleAddCategory(); }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="text-lg font-bold mb-4 text-center text-blue-600">{catType === 'group' ? '그룹 추가' : '하위카테고리 추가'}</div>
                  <input
                    autoFocus
                    className="w-full border rounded px-3 py-2 mb-4 text-white bg-black focus:outline-blue-500"
                    placeholder="카테고리명"
                    value={catInput}
                    onChange={e => setCatInput(e.target.value)}
                    disabled={false}
                    readOnly={false}
                    style={{ pointerEvents: 'auto' }}
                  />
                  <div className="flex gap-4">
                    <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">추가</button>
                    <button type="button" onClick={() => setCatModal(null)} className="px-4 py-2 bg-gray-400 text-white rounded">취소</button>
                  </div>
                </form>
              )}
              {catModal.type === 'edit' && (
                <>
                  <div className="text-lg font-bold mb-4 text-center text-yellow-600">카테고리명 수정</div>
                  <input
                    autoFocus
                    className="w-full border rounded px-3 py-2 mb-4 text-white bg-black focus:outline-yellow-500"
                    placeholder="카테고리명"
                    value={catInput}
                    onChange={e => setCatInput(e.target.value)}
                    disabled={false}
                    readOnly={false}
                    style={{ pointerEvents: 'auto' }}
                  />
                  <div className="flex gap-4">
                    <button onClick={handleEditCategory} className="px-4 py-2 bg-yellow-600 text-white rounded">저장</button>
                    <button onClick={() => setCatModal(null)} className="px-4 py-2 bg-gray-400 text-white rounded">취소</button>
                  </div>
                </>
              )}
              {catModal.type === 'delete' && (
                <>
                  <div className="text-lg font-bold mb-4 text-center text-red-600">정말 삭제하시겠습니까?</div>
                  <div className="mb-6 text-center text-gray-800 dark:text-gray-200 text-sm">이 작업은 되돌릴 수 없습니다.</div>
                  <div className="flex gap-4">
                    <button onClick={handleDeleteCategory} className="px-4 py-2 bg-red-600 text-white rounded">삭제</button>
                    <button onClick={() => setCatModal(null)} className="px-4 py-2 bg-gray-400 text-white rounded">취소</button>
                  </div>
                </>
              )}
              {catModal.type === 'clear' && (
                <>
                  <div className="text-lg font-bold mb-4 text-center text-red-600">정말 모든 카테고리를 초기화하시겠습니까?</div>
                  <div className="mb-6 text-center text-gray-800 dark:text-gray-200 text-sm">이 작업은 되돌릴 수 없습니다.</div>
                  <div className="flex gap-4">
                    <button onClick={handleClearCategories} className="px-4 py-2 bg-red-600 text-white rounded">초기화</button>
                    <button onClick={() => setCatModal(null)} className="px-4 py-2 bg-gray-400 text-white rounded">취소</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 