import React, { useState, useEffect, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { toast } from '../../../utils/toast';
import { doc, writeBatch } from 'firebase/firestore';
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
  applyCategoryRenamesToTags,
  CategoryRenameOp,
} from './categoryLayoutUtils';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrimaryRenamed?: (oldName: string, newName: string) => void;
}

export function CategoryManagerModal({
  isOpen,
  onClose,
  onPrimaryRenamed,
}: CategoryManagerModalProps) {
  const tags = useAppStore((state) => state.tags || []);
  const settings = useAppStore((state) => state.settings);

  const [primaryOrder, setPrimaryOrder] = useState<string[]>([]);
  const [subOrderMap, setSubOrderMap] = useState<Record<string, string[]>>({});
  const [primaryDescriptions, setPrimaryDescriptions] = useState<Record<string, string>>({});
  const [subDescriptionsMap, setSubDescriptionsMap] = useState<
    Record<string, Record<string, string>>
  >({});
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [tagCountsByPrimary, setTagCountsByPrimary] = useState<Record<string, number>>({});
  const [tagCountsBySub, setTagCountsBySub] = useState<Record<string, Record<string, number>>>({});
  const [pendingRenames, setPendingRenames] = useState<CategoryRenameOp[]>([]);

  const [isAddingPrimary, setIsAddingPrimary] = useState(false);
  const [newPrimaryName, setNewPrimaryName] = useState('');
  const [newPrimaryDescription, setNewPrimaryDescription] = useState('');
  const [newSubMap, setNewSubMap] = useState<Record<string, string>>({});
  const primaryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && settings) {
      const hierarchy = computeCategoryHierarchy(tags, settings.academyCategoryOrder);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPrimaryOrder(hierarchy.primaryOrder);
      setSubOrderMap(hierarchy.subOrderMap);
      setPrimaryDescriptions(hierarchy.primaryDescriptions);
      setSubDescriptionsMap(hierarchy.subDescriptionsMap);
      setCollapsedCategories(hierarchy.initialCollapsed);
      setTagCountsByPrimary(hierarchy.tagCountsByPrimary);
      setTagCountsBySub(hierarchy.tagCountsBySub);
      setPendingRenames([]);
      setIsAddingPrimary(false);
      setNewPrimaryName('');
      setNewPrimaryDescription('');
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
    setPrimaryDescriptions((prev) => {
      const next = { ...prev };
      delete next[primaryToDelete];
      return next;
    });
    setSubDescriptionsMap((prev) => {
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
    setSubDescriptionsMap((prev) => {
      const pDescs = { ...(prev[primary] || {}) };
      delete pDescs[subToDelete];
      return { ...prev, [primary]: pDescs };
    });
    toast.success(`Removed "${subToDelete}"`);
  };

  const handleAddPrimary = () => {
    const trimmed = newPrimaryName.trim();
    const trimmedDesc = newPrimaryDescription.trim();
    if (!trimmed) return;
    if (primaryOrder.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Category "${trimmed}" already exists.`);
      return;
    }

    setPrimaryOrder((prev) => [...prev, trimmed]);
    setSubOrderMap((prev) => ({ ...prev, [trimmed]: [] }));
    if (trimmedDesc) {
      setPrimaryDescriptions((prev) => ({ ...prev, [trimmed]: trimmedDesc }));
    }
    setCollapsedCategories((prev) => ({ ...prev, [trimmed]: false }));
    setNewPrimaryName('');
    setNewPrimaryDescription('');
    setIsAddingPrimary(false);
    toast.success(`Added category "${trimmed}"`);

    setTimeout(() => {
      document.getElementById(`category-item-${trimmed}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }, 50);
  };

  const handleAddSub = (primary: string, newSub: string, newSubDescription?: string) => {
    setSubOrderMap((prev) => ({
      ...prev,
      [primary]: [...(prev[primary] || []), newSub],
    }));
    if (newSubDescription?.trim()) {
      setSubDescriptionsMap((prev) => ({
        ...prev,
        [primary]: {
          ...(prev[primary] || {}),
          [newSub]: newSubDescription.trim(),
        },
      }));
    }
    toast.success(`Added subcategory "${newSub}" to "${primary}"`);
  };

  const handleUpdatePrimary = (
    oldPrimary: string,
    rawNewName: string,
    rawNewDescription: string
  ): boolean => {
    const newName = rawNewName.trim();
    const newDescription = rawNewDescription.trim();
    if (!newName) return false;

    if (newName !== oldPrimary) {
      if (primaryOrder.some((p) => p !== oldPrimary && p.toLowerCase() === newName.toLowerCase())) {
        toast.error(`Category "${newName}" already exists.`);
        return false;
      }

      setPrimaryOrder((prev) => prev.map((p) => (p === oldPrimary ? newName : p)));
      setSubOrderMap((prev) => {
        const next = { ...prev, [newName]: prev[oldPrimary] || [] };
        delete next[oldPrimary];
        return next;
      });
      setSubDescriptionsMap((prev) => {
        const next = { ...prev };
        if (prev[oldPrimary]) {
          next[newName] = prev[oldPrimary];
        }
        delete next[oldPrimary];
        return next;
      });
      setCollapsedCategories((prev) => {
        const next = { ...prev, [newName]: prev[oldPrimary] ?? false };
        delete next[oldPrimary];
        return next;
      });
      setTagCountsByPrimary((prev) => {
        const next = { ...prev };
        if (oldPrimary in next) {
          next[newName] = next[oldPrimary];
          delete next[oldPrimary];
        }
        return next;
      });
      setTagCountsBySub((prev) => {
        const next = { ...prev };
        if (oldPrimary in next) {
          next[newName] = next[oldPrimary];
          delete next[oldPrimary];
        }
        return next;
      });
      setNewSubMap((prev) => {
        const next = { ...prev };
        if (oldPrimary in next) {
          next[newName] = next[oldPrimary];
          delete next[oldPrimary];
        }
        return next;
      });
      setPendingRenames((prev) => [...prev, { type: 'primary', from: oldPrimary, to: newName }]);
    }

    setPrimaryDescriptions((prev) => {
      const next = { ...prev };
      if (newName !== oldPrimary) {
        delete next[oldPrimary];
      }
      if (newDescription) {
        next[newName] = newDescription;
      } else {
        delete next[newName];
      }
      return next;
    });

    return true;
  };

  const handleUpdateSub = (
    primary: string,
    oldSub: string,
    rawNewName: string,
    rawNewDescription: string
  ): boolean => {
    const newName = rawNewName.trim();
    const newDescription = rawNewDescription.trim();
    if (!newName) return false;

    const currentSubs = subOrderMap[primary] || [];
    if (newName !== oldSub) {
      if (currentSubs.some((s) => s !== oldSub && s.toLowerCase() === newName.toLowerCase())) {
        toast.error(`Subcategory "${newName}" already exists in "${primary}".`);
        return false;
      }

      setSubOrderMap((prev) => ({
        ...prev,
        [primary]: (prev[primary] || []).map((s) => (s === oldSub ? newName : s)),
      }));

      setTagCountsBySub((prev) => {
        const pCounts = { ...(prev[primary] || {}) };
        if (oldSub in pCounts) {
          pCounts[newName] = pCounts[oldSub];
          delete pCounts[oldSub];
        }
        return { ...prev, [primary]: pCounts };
      });

      setPendingRenames((prev) => [...prev, { type: 'sub', primary, from: oldSub, to: newName }]);
    }

    setSubDescriptionsMap((prev) => {
      const pDescs = { ...(prev[primary] || {}) };
      if (newName !== oldSub) {
        delete pDescs[oldSub];
      }
      if (newDescription) {
        pDescs[newName] = newDescription;
      } else {
        delete pDescs[newName];
      }
      return { ...prev, [primary]: pDescs };
    });

    return true;
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);
    try {
      const newConfig = buildCategoryConfig(
        primaryOrder,
        subOrderMap,
        primaryDescriptions,
        subDescriptionsMap
      );
      const { updatedTags, changedTags } = applyCategoryRenamesToTags(tags, pendingRenames);

      useAppStore.setState({
        settings: { ...settings, academyCategoryOrder: newConfig },
        ...(changedTags.length > 0 ? { tags: updatedTags } : {}),
      });

      pendingRenames.forEach((op) => {
        if (op.type === 'primary') {
          onPrimaryRenamed?.(op.from, op.to);
        }
      });

      const batch = writeBatch(db);
      batch.update(doc(db, 'settings', 'global_config'), { academyCategoryOrder: newConfig });
      changedTags.forEach((t) => {
        batch.update(doc(db, 'academy_tags', t.id), { category: t.category });
      });
      await batch.commit();

      toast.success('Category layout saved successfully');
      onClose();
    } catch (e: unknown) {
      toast.error(
        'Failed to save category layout: ' + (e instanceof Error ? e.message : 'Unknown error')
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
              Drag, rename, describe, add, or delete categories and subcategories.
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
            <div className="mb-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-2">
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
                    setNewPrimaryDescription('');
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
              />
              <input
                type="text"
                placeholder="Optional description..."
                value={newPrimaryDescription}
                onChange={(e) => setNewPrimaryDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddPrimary();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    setIsAddingPrimary(false);
                    setNewPrimaryName('');
                    setNewPrimaryDescription('');
                  }
                }}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingPrimary(false);
                    setNewPrimaryName('');
                    setNewPrimaryDescription('');
                  }}
                  className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors shrink-0"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddPrimary}
                  disabled={!newPrimaryName.trim()}
                  className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 shrink-0 shadow-sm"
                >
                  Add
                </button>
              </div>
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
                    description={primaryDescriptions[p]}
                    subCategories={subOrderMap[p] || []}
                    subDescriptions={subDescriptionsMap[p] || {}}
                    isCollapsed={!!collapsedCategories[p]}
                    onToggleCollapse={() => toggleCollapse(p)}
                    tagCount={tagCountsByPrimary[p] || 0}
                    subTagCounts={tagCountsBySub[p] || {}}
                    onDeletePrimary={() => handleDeletePrimary(p)}
                    onDeleteSub={(s) => handleDeleteSub(p, s)}
                    onAddSub={(newSub, newSubDesc) => handleAddSub(p, newSub, newSubDesc)}
                    onUpdatePrimary={(newName, newDesc) => handleUpdatePrimary(p, newName, newDesc)}
                    onUpdateSub={(oldSub, newName, newDesc) =>
                      handleUpdateSub(p, oldSub, newName, newDesc)
                    }
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
