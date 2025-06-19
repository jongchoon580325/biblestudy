import { create } from 'zustand';

export interface MaterialItem {
  id: number;
  title: string;
  category: string;
  book?: string;
  fileSize: string;
  uploadDate: string;
  fileType?: string;
  content?: string;
}

interface MaterialsState {
  materials: MaterialItem[];
  addMaterial: (item: MaterialItem) => void;
  removeMaterial: (id: number) => void;
  clearMaterials: () => void;
}

export const useMaterialsStore = create<MaterialsState>((set) => ({
  materials: [],
  addMaterial: (item) => set((state) => ({ materials: [item, ...state.materials] })),
  removeMaterial: (id) => set((state) => ({ materials: state.materials.filter((m) => m.id !== id) })),
  clearMaterials: () => set({ materials: [] }),
})); 