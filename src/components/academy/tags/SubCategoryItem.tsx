import React from 'react';
import { GripVertical, Trash2 } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip as UITooltip } from '../../ui/Tooltip';

export interface SubCategoryItemProps {
  primary: string;
  sub: string;
  tagCount: number;
  onDelete: () => void;
}

export function SubCategoryItem({ primary, sub, tagCount, onDelete }: SubCategoryItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `sub::${primary}::${sub}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const canDelete = tagCount === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-center py-1.5 px-2 rounded-lg hover:bg-slate-50 transition-colors pl-9 ${
        isDragging ? 'z-50 opacity-50 bg-slate-100' : 'z-10'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="p-1 mr-1.5 rounded text-slate-300 opacity-0 group-hover:opacity-100 hover:text-slate-600 hover:bg-slate-200 cursor-grab active:cursor-grabbing transition-opacity shrink-0"
        title="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      <span className="truncate pr-2 flex-1 text-slate-600 text-sm font-normal">{sub}</span>

      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/50 shrink-0 mr-1.5">
        {tagCount} {tagCount === 1 ? 'tag' : 'tags'}
      </span>

      <UITooltip
        content={
          canDelete
            ? `Delete "${sub}" (no tags)`
            : `Cannot delete: subcategory contains ${tagCount} ${tagCount === 1 ? 'tag' : 'tags'}`
        }
      >
        <button
          type="button"
          onClick={canDelete ? onDelete : undefined}
          disabled={!canDelete}
          aria-label={`Delete subcategory ${sub}`}
          className={`p-1.5 rounded-lg transition-colors shrink-0 ${
            canDelete
              ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
              : 'text-slate-200 cursor-not-allowed'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </UITooltip>
    </div>
  );
}
