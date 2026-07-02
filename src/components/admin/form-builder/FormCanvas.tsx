import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { FormField } from '../TemplateDesigner';
import { SortableFieldItem } from './SortableFieldItem';
import { LayoutTemplate } from 'lucide-react';

interface FormCanvasProps {
  fields: FormField[];
  selectedFieldId: string | null;
  setSelectedFieldId: (id: string | null) => void;
  handleUpdateField: (idx: number, updates: Partial<FormField>) => void;
  handleRemoveField: (idx: number) => void;
  handleDuplicateField: (idx: number) => void;
  features: string[];
}

export function FormCanvas({
  fields,
  selectedFieldId,
  setSelectedFieldId,
  handleUpdateField,
  handleRemoveField,
  handleDuplicateField,
  features,
}: FormCanvasProps) {
  const { setNodeRef } = useDroppable({
    id: 'form-canvas',
  });

  if (fields.length === 0) {
    return (
      <div ref={setNodeRef} className="h-full flex items-center justify-center p-12 overflow-y-auto">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-12 text-center flex flex-col items-center justify-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-5">
            <LayoutTemplate className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="text-lg font-bold text-slate-800">Start your form</h4>
          <p className="text-slate-500 mt-2 max-w-sm">
            Click on any field type in the right sidebar palette to add your first question.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={setNodeRef}
      className="h-full overflow-y-auto overflow-x-hidden custom-thin-scroll px-10 py-10 pb-32"
      onClick={() => setSelectedFieldId(null)}
    >
      <div className="max-w-3xl mx-auto space-y-3">
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <div key={field.id} onClick={(e) => e.stopPropagation()}>
              <SortableFieldItem
                field={field}
                index={index}
                fields={fields}
                isSelected={selectedFieldId === field.id}
                onSelect={() => setSelectedFieldId(field.id)}
                handleUpdateField={handleUpdateField}
                handleRemoveField={handleRemoveField}
                handleDuplicateField={handleDuplicateField}
                features={features}
              />
            </div>
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
