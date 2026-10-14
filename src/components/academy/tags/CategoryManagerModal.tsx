import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { toast } from '../../../utils/toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../api/firebase';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CategoryItem } from './CategoryItem';
import {
  computeCategoryHierarchy,
  handleReorderDragEnd,
  buildCategoryConfig,
} from './categoryLayoutUtils';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryManagerModal({ isOpen, onClose }: CategoryManagerModalProps) {
  const tags = useAppStore((state) => state.tags || []);
  const settings = useAppStore((state) => state.settings);

  const [primaryOrder, setPrimaryOrder] = useState<string[]>([]);
  const [subOrderMap, setSubOrderMap] = useState<Record<string, string[]>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [tagCountsByPrimary, setTagCountsByPrimary] = useState<Record<string, number>>({});
  const [tagCountsBySub, setTagCountsBySub] = useState<Record<string, Record<string, number>>>({});

  const [isAddingPrimary, setIsAddingPrimary] = useState(false);
  const [newPrimaryName, setNewPrimaryName] = useState('');
  const [newSubMap, setNewSubMap] = useState<Record<string, string>>({});
  const primaryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && settings) {
      const hierarchy = computeCategoryHierarchy(tags, settings.academyCategoryOrder);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrimaryOrder(hierarchy.primaryOrder);
      setSubOrderMap(hierarchy.subOrderMap);
      setCollapsedCategories(hierarchy.initialCollapsed);
      setTagCountsByPrimary(hierarchy.tagCountsByPrimary);
      setTagCountsBySub(hierarchy.tagCountsBySub);
      setIsAddingPrimary(false);
      setNewPrimaryName('');
      setNewSubMap({});
    }
  }, [isOpen, tags, settings]);

  const toggleCollapse = (primary: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [primary]: !prev[primary] }));
  };

  const handleDeletePrimary = (primaryToDelete: string) => {
    const count = tagCountsByPrimary[primaryToDelete] || 0;
    if (count > 0) {
      toast.error(`Cannot delete "${primaryToDelete}" because it contains ${count} tag(s).`);
      return;
    }
    setPrimaryOrder((prev) => prev.filter((p) => p !== primaryToDelete));
    setSubOrderMap((prev) => {
      const next = { ...prev };
      delete next[primaryToDelete];
      return next;
    });
    toast.success(`Removed "${primaryToDelete}"`);
  };

  const handleDeleteSub = (primary: string, subToDelete: string) => {
    const count = tagCountsBySub[primary]?.[subToDelete] || 0;
    if (count > 0) {
      toast.error(`Cannot delete "${subToDelete}" because it contains ${count} tag(s).`);
      return;
    }
    setSubOrderMap((prev) => {
      const remaining = (prev[primary] || []).filter((s) => s !== subToDelete);
      return { ...prev, [primary]: remaining };
    });
    toast.success(`Removed "${subToDelete}"`);
  };

  const handleAddPrimary = () => {
    const trimmed = newPrimaryName.trim();
    if (!trimmed) return;
    if (primaryOrder.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Category "${trimmed}" already exists.`);
      return;
    }

    setPrimaryOrder((prev) => [...prev, trimmed]);
    setSubOrderMap((prev) => ({ ...prev, [trimmed]: [] }));
    setCollapsedCategories((prev) => ({ ...prev, [trimmed]: false }));
    setNewPrimaryName('');
    setIsAddingPrimary(false);
    toast.success(`Added category "${trimmed}"`);

    setTimeout(() => {
      document.getElementById(`category-item-${trimmed}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 50);
  };

  const handleAddSub = (primary: string, newSub: string) => {
    setSubOrderMap((prev) => ({
      ...prev,
      [primary]: [...(prev[primary] || []), newSub],
    }));
    toast.success(`Added subcategory "${newSub}" to "${primary}"`);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const newConfig = buildCategoryConfig(primaryOrder, subOrderMap);

      useAppStore.setState({
        settings: { ...settings, academyCategoryOrder: newConfig },
      });

      const docRef = doc(db, 'settings', 'global_config');
      await updateDoc(docRef, { academyCategoryOrder: newConfig });

      toast.success('Category order saved successfully');
      onClose();
    } catch (e: unknown) {
      toast.error(
        'Failed to save category order: ' + (e instanceof Error ? e.message : 'Unknown error')
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 z-[130]">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Category Layout</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Drag, add, or delete categories and subcategories.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 px-6 custom-thin-scroll">
          {isAddingPrimary ? (
            <div className="flex items-center gap-2 mb-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
              <input
                ref={primaryInputRef}
                type="text"
                autoFocus
                placeholder="Category name..."
                value={newPrimaryName}
                onChange={(e) => setNewPrimaryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPrimary();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setIsAddingPrimary(false);
                    setNewPrimaryName('');
                  }
                }}
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
              />
              <button
                type="button"
                onClick={handleAddPrimary}
                disabled={!newPrimaryName.trim()}
                className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shrink-0 shadow-sm"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingPrimary(false);
                  setNewPrimaryName('');
                }}
                className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors shrink-0"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <span className="text-xs font-medium text-slate-500">
                {primaryOrder.length} {primaryOrder.length === 1 ? 'category' : 'categories'}
              </span>
              <button
                type="button"
                onClick={() => setIsAddingPrimary(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-medium rounded-lg shadow-sm transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Category
              </button>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleReorderDragEnd(event, setPrimaryOrder, setSubOrderMap)}
          >
            <SortableContext
              items={primaryOrder.map((p) => `primary::${p}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {primaryOrder.map((p) => (
                  <CategoryItem
                    key={`primary::${p}`}
                    primary={p}
                    subCategories={subOrderMap[p] || []}
                    isCollapsed={!!collapsedCategories[p]}
                    onToggleCollapse={() => toggleCollapse(p)}
                    tagCount={tagCountsByPrimary[p] || 0}
                    subTagCounts={tagCountsBySub[p] || {}}
                    onDeletePrimary={() => handleDeletePrimary(p)}
                    onDeleteSub={(s) => handleDeleteSub(p, s)}
                    onAddSub={(newSub) => handleAddSub(p, newSub)}
                    subInputValue={newSubMap[p] || ''}
                    onSubInputChange={(val) => setNewSubMap((prev) => ({ ...prev, [p]: val }))}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Layout'}
          </button>
        </div>
      </div>
    </div>
  );
}
