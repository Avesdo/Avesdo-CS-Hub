import React, { useState } from 'react';
import { GripVertical, Trash2, Pencil, Check, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tooltip as UITooltip } from '../../ui/Tooltip';

export interface SubCategoryItemProps {
  primary: string;
  sub: string;
  description?: string;
  tagCount: number;
  onDelete: () => void;
  onUpdate: (newName: string, newDescription: string) => boolean;
}

export function SubCategoryItem({
  primary,
  sub,
  description = '',
  tagCount,
  onDelete,
  onUpdate,
}: SubCategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(sub);
  const [editDescription, setEditDescription] = useState(description);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `sub::${primary}::${sub}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const canDelete = tagCount === 0;

  const startEditing = () => {
    setEditName(sub);
    setEditDescription(description || '');
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    const ok = onUpdate(editName, editDescription);
    if (ok) {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(sub);
    setEditDescription(description || '');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="ml-9 mr-1 my-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2"
      >
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Subcategory Name
          </label>
          <input
            type="text"
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveEdit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                handleCancelEdit();
              }
            }}
            placeholder="Subcategory name..."
            className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Description (optional)
          </label>
          <input
            type="text"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSaveEdit();
              } else if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                handleCancelEdit();
              }
            }}
            placeholder="Add an optional description..."
            className="w-full bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-colors"
          />
        </div>
        <div className="flex items-center justify-end gap-1.5 pt-0.5">
          <button
            type="button"
            onClick={handleCancelEdit}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            <X className="w-3 h-3" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveEdit}
            disabled={!editName.trim()}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-primary hover:bg-primary/90 text-white rounded-md text-xs font-medium transition-colors disabled:opacity-50 shadow-sm"
          >
            <Check className="w-3 h-3" /> Save
          </button>
        </div>
      </div>
    );
  }

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

      <div className="min-w-0 pr-2 flex-1">
        <div className="truncate text-slate-700 text-sm font-medium">{sub}</div>
        {description && <div className="truncate text-xs text-slate-400">{description}</div>}
      </div>

      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/50 shrink-0 mr-1">
        {tagCount} {tagCount === 1 ? 'tag' : 'tags'}
      </span>

      <UITooltip content={`Rename or edit description for "${sub}"`}>
        <button
          type="button"
          onClick={startEditing}
          aria-label={`Edit subcategory ${sub}`}
          className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors shrink-0 mr-0.5"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </UITooltip>

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
