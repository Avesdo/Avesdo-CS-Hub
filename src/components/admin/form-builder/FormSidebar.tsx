import React from 'react';
import { FormField, FieldType, FIELD_PALETTE_CATEGORIES } from '../TemplateDesigner';
import { X, Plus, Trash2, SplitSquareHorizontal, ChevronDown, Settings2, GripVertical, Blocks } from 'lucide-react';
import { Select } from '../../ui/Select';
import { MultiSelect } from '../../ui/MultiSelect';
import { RichTextEditor } from '../../ui/RichTextEditor';
import { useDraggable } from '@dnd-kit/core';

export const getFieldMeta = (type: FieldType) => {
  for (const cat of FIELD_PALETTE_CATEGORIES) {
    const found = cat.items.find((i) => i.type === type);
    if (found) return found;
  }
  return { label: 'Unknown', icon: Settings2 };
};

interface FormSidebarProps {
  fields: FormField[];
  selectedFieldId: string | null;
  setSelectedFieldId: (id: string | null) => void;
  handleAddField: (type: FieldType) => void;
  handleUpdateField: (idx: number, updates: Partial<FormField>) => void;
  features: string[];
}

function DraggablePaletteItem({ item, onClick }: { item: any, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.type}`,
    data: {
      type: 'palette-item',
      fieldType: item.type
    }
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-2.5 rounded-lg border bg-white transition-all cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-sm ${isDragging ? 'opacity-50 ring-2 ring-primary/20' : 'border-slate-200'}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <item.icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <span className="text-[13px] font-semibold text-slate-700">{item.label}</span>
      </div>
      <div className="w-5 h-5 rounded hover:bg-slate-100 flex items-center justify-center text-slate-300 transition-colors">
        <GripVertical className="w-3.5 h-3.5" />
      </div>
    </div>
  );
}

export function FormSidebar({
  fields,
  selectedFieldId,
  setSelectedFieldId,
  handleAddField,
  handleUpdateField,
  features,
}: FormSidebarProps) {
  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10 flex-shrink-0">
        <h3 className="text-sm font-bold text-slate-800">Form Elements</h3>
        <p className="text-[12px] text-slate-500 mt-1">Drag and drop to add</p>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-thin-scroll p-4 space-y-6">
        {FIELD_PALETTE_CATEGORIES.map((category) => (
          <div key={category.title}>
            <div className="text-[11px] font-bold text-slate-400 tracking-wider mb-3 px-1">
              {category.title}
            </div>
            <div className="flex flex-col gap-2">
              {category.items.map((item) => (
                <DraggablePaletteItem 
                  key={item.type} 
                  item={item} 
                  onClick={() => handleAddField(item.type as FieldType)} 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
