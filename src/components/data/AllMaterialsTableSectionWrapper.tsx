'use client';
import React from 'react';
import DataTableForm from './DataTableForm';
import { useMaterialsStore } from '@/store/materialsStore';

export default function AllMaterialsTableSectionWrapper() {
  const { materials, removeMaterial } = useMaterialsStore();

  const handleEdit = () => {};
  const handleDelete = (id: number) => removeMaterial(id);
  const handleDownload = () => {};

  return (
    <DataTableForm
      tableData={materials}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onDownload={handleDownload}
    />
  );
} 