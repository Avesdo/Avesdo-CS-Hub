import React, { useState } from 'react';
import { GripVertical, ChevronDown, ChevronRight, Trash2, Plus } from 'lucide-react';
import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip as UITooltip } from '../../ui/Tooltip';
import { toast } from '../../../utils/toast';
import { SubCategoryItem } from './SubCategoryItem';

export interface CategoryItemProps {
  primary: string;
  subCategories: string[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  tagCount: number;
  subTagCounts: Record<string, number>;
  onDeletePrimary: () => void;
  onDeleteSub: (sub: string) => void;
  onAddSub: (newSub: string) => void;
  subInputValue: string;
  onSubInputChange: (val: string) => void;
}

export function CategoryItem({
  primary,
  subCategories,
  isCollapsed,
  onToggleCollapse,
  tagCount,
  subTagCounts,
  onDeletePrimary,
  onDeleteSub,
  onAddSub,
  subInputValue,
  onSubInputChange,
}: CategoryItemProps) {
  const [isAdding, setIsAdding] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `primary::${primary}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const canDeletePrimary = tagCount === 0;

  const handleSubmitSub = () => {
    const trimmed = subInputValue.trim();
    if (!trimmed) return;

    if (subCategories.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error(`Subcategory "${trimmed}" already exists in "${primary}".`);
      return;
    }

    onAddSub(trimmed);
    onSubInputChange('');
    setIsAdding(false);
  };

  const handleCancelSub = () => {
    onSubInputChange('');
    setIsAdding(false);
  };

  return (
    <div
      id={`category-item-${primary}`}
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl border border-slate-200/80 bg-white p-2.5 transition-all ${
        isDragging
          ? 'z-50 opacity-50 shadow-md ring-2 ring-primary/20'
          : 'z-10 shadow-sm hover:border-slate-300'
      }`}
    >
      {/* Primary Category Row */}
      <div className="group flex items-center py-1 px-1">
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 mr-1 rounded text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-600 hover:bg-slate-100 cursor-grab active:cursor-grabbing transition-opacity shrink-0"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1 mr-1.5 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors shrink-0"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <span className="font-semibold text-slate-800 text-sm truncate flex-1">{primary}</span>

        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/50 shrink-0 mr-2">
          {tagCount} {tagCount === 1 ? 'tag' : 'tags'}
        </span>

        <UITooltip
          content={
            canDeletePrimary
              ? `Delete "${primary}" (no tags)`
              : `Cannot delete: category contains ${tagCount} ${tagCount === 1 ? 'tag' : 'tags'}`
          }
        >
          <button
            type="button"
            onClick={canDeletePrimary ? onDeletePrimary : undefined}
            disabled={!canDeletePrimary}
            aria-label={`Delete category ${primary}`}
            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
              canDeletePrimary
                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                : 'text-slate-200 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </UITooltip>
      </div>

      {/* Subcategories Container */}
      {!isCollapsed && (
        <div className="pt-2 pb-1 border-t border-slate-100 mt-1.5 space-y-1">
          {subCategories.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-1 pl-9">
              No subcategories yet. Click "Add Subcategory" below to create one.
            </p>
          ) : (
            <SortableContext
              items={subCategories.map((s) => `sub::${primary}::${s}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-0.5">
                {subCategories.map((s) => (
                  <SubCategoryItem
                    key={`sub::${primary}::${s}`}
                    primary={primary}
                    sub={s}
                    tagCount={subTagCounts[s] || 0}
                    onDelete={() => onDeleteSub(s)}
                  />
                ))}
              </div>
            </SortableContext>
          )}

          {/* Add Subcategory Form */}
          {isAdding || subInputValue.length > 0 ? (
            <div className="flex items-center gap-1.5 mt-2 ml-9 pr-1">
              <input
                type="text"
                autoFocus
                placeholder="Subcategory name..."
                value={subInputValue}
                onChange={(e) => onSubInputChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmitSub();
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancelSub();
                  }
                }}
                className="flex-1 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
              />
              <button
                type="button"
                onClick={handleSubmitSub}
                disabled={!subInputValue.trim()}
                className="px-2.5 py-1 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 shrink-0 shadow-sm"
              >
                Add
              </button>
              <button
                type="button"
                onClick={handleCancelSub}
                className="px-2 py-1 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-medium transition-colors shrink-0"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-slate-50 ml-9 mt-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Subcategory
            </button>
          )}
        </div>
      )}
    </div>
  );
}
