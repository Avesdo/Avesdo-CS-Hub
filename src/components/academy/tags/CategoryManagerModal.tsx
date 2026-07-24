import React, { useState, useEffect } from 'react';
import { X, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';
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
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SortableItemProps {
  id: string;
  label: string;
  isPrimary?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  children?: React.ReactNode;
}

function SortableItem({
  id,
  label,
  isPrimary,
  isCollapsed,
  onToggleCollapse,
  children,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? 'z-50 opacity-50' : 'z-10'}`}
    >
      <div
        className={`group flex items-center py-2 border-b border-transparent hover:bg-slate-50 transition-colors ${
          isPrimary
            ? 'text-slate-800 border-slate-100 font-semibold'
            : 'text-slate-600 pl-[40px] text-sm'
        }`}
      >
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 mr-2 rounded text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-600 hover:bg-slate-200 cursor-grab active:cursor-grabbing transition-opacity shrink-0"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {isPrimary && (
          <button
            onClick={onToggleCollapse}
            className="p-1 mr-1 rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors shrink-0"
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        )}

        <span className="truncate pr-4 flex-1">{label}</span>
      </div>
      {children && !isCollapsed && <div className="pl-4">{children}</div>}
    </div>
  );
}

export function CategoryManagerModal({ isOpen, onClose }: CategoryManagerModalProps) {
  const tags = useAppStore((state) => state.tags || []);
  const settings = useAppStore((state) => state.settings);

  const [primaryOrder, setPrimaryOrder] = useState<string[]>([]);
  const [subOrderMap, setSubOrderMap] = useState<Record<string, string[]>>({});
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && settings) {
      const rawPrimaries = new Set<string>();
      const rawSubs: Record<string, Set<string>> = {};

      tags.forEach((tag) => {
        const categories = Array.isArray(tag.category) ? tag.category : [tag.category];
        categories.forEach((cat) => {
          const parts = (cat || 'General').split(' - ');
          const p = parts[0];
          const s = parts[1] || 'General';

          rawPrimaries.add(p);
          if (!rawSubs[p]) rawSubs[p] = new Set();
          rawSubs[p].add(s);
        });
      });

      const savedConfig = settings.academyCategoryOrder || [];
      const savedPrimaries = savedConfig.map((c) => c.primary);

      const finalPrimaries = [...savedPrimaries.filter((p) => rawPrimaries.has(p))];
      Array.from(rawPrimaries).forEach((p) => {
        if (!finalPrimaries.includes(p)) finalPrimaries.push(p);
      });

      const finalSubOrderMap: Record<string, string[]> = {};
      const initialCollapsedState: Record<string, boolean> = {};

      finalPrimaries.forEach((p) => {
        const savedSubConfig = savedConfig.find((c) => c.primary === p)?.subCategories || [];
        const rawS = rawSubs[p] ? Array.from(rawSubs[p]) : [];

        const finalSubs = [...savedSubConfig.filter((s) => rawS.includes(s))];
        rawS.forEach((s) => {
          if (!finalSubs.includes(s)) finalSubs.push(s);
        });

        finalSubOrderMap[p] = finalSubs;
        initialCollapsedState[p] = true;
      });

      setPrimaryOrder(finalPrimaries);
      setSubOrderMap(finalSubOrderMap);
      setCollapsedCategories(initialCollapsedState);
    }
  }, [isOpen, tags, settings]);

  const toggleCollapse = (primary: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [primary]: !prev[primary],
    }));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId.startsWith('primary::') && overId.startsWith('primary::')) {
      const activePrimary = activeId.replace('primary::', '');
      const overPrimary = overId.replace('primary::', '');

      setPrimaryOrder((items) => {
        const oldIndex = items.indexOf(activePrimary);
        const newIndex = items.indexOf(overPrimary);
        return arrayMove(items, oldIndex, newIndex);
      });
      return;
    }

    if (activeId.startsWith('sub::') && overId.startsWith('sub::')) {
      const activeParts = activeId.replace('sub::', '').split('::');
      const overParts = overId.replace('sub::', '').split('::');

      const activePrimary = activeParts[0];
      const activeSub = activeParts[1];
      const overPrimary = overParts[0];
      const overSub = overParts[1];

      if (activePrimary === overPrimary) {
        setSubOrderMap((prev) => {
          const items = prev[activePrimary] || [];
          const oldIndex = items.indexOf(activeSub);
          const newIndex = items.indexOf(overSub);
          return {
            ...prev,
            [activePrimary]: arrayMove(items, oldIndex, newIndex),
          };
        });
      }
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    setIsSaving(true);

    try {
      const newConfig = primaryOrder.map((p) => ({
        primary: p,
        subCategories: subOrderMap[p] || [],
      }));

      const docRef = doc(db, 'settings', 'global_config');
      await updateDoc(docRef, { academyCategoryOrder: newConfig });

      toast.success('Category order saved successfully');
      onClose();
    } catch (e: any) {
      toast.error('Failed to save category order: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Manage Category Layout</h2>
            <p className="text-sm text-slate-500 mt-1">
              Drag and drop to reorganize the categories.
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={primaryOrder.map((p) => `primary::${p}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {primaryOrder.map((p) => (
                  <SortableItem
                    key={`primary::${p}`}
                    id={`primary::${p}`}
                    label={p}
                    isPrimary
                    isCollapsed={collapsedCategories[p]}
                    onToggleCollapse={() => toggleCollapse(p)}
                  >
                    <SortableContext
                      items={(subOrderMap[p] || []).map((s) => `sub::${p}::${s}`)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-0.5 mt-1">
                        {(subOrderMap[p] || []).map((s) => (
                          <SortableItem key={`sub::${p}::${s}`} id={`sub::${p}::${s}`} label={s} />
                        ))}
                      </div>
                    </SortableContext>
                  </SortableItem>
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
