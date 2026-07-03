import React, { useState, useEffect } from 'react';
import { FormField, FieldType } from '../TemplateDesigner';
import { FormCanvas } from './FormCanvas';
import { FormSidebar, getFieldMeta } from './FormSidebar';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

interface FormBuilderProps {
  fields: FormField[];
  setFields: React.Dispatch<React.SetStateAction<FormField[]>>;
  features: string[];
}

export function FormBuilder({ fields, setFields, features }: FormBuilderProps) {
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowX = 'auto';
    };
  }, []);

  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const handleDragStart = (event: any) => {
    setActiveDragId(event.active.id);
  };

  const handleFieldDragEnd = (event: any) => {
    setActiveDragId(null);
    const { active, over } = event;

    if (active.id.toString().startsWith('palette-')) {
      const type = active.id.toString().replace('palette-', '');
      const newField: FormField = {
        id: `field_${Date.now()}`,
        type: type as FieldType,
        label: type === 'page_break' ? 'Page Break' : '',
        required: false,
      };

      if (over) {
        if (over.id === 'form-canvas') {
          // Dropped on the empty canvas or at the bottom
          setFields([...fields, newField]);
          setSelectedFieldId(newField.id);
          return;
        }

        const overIndex = fields.findIndex((f) => f.id === over.id);
        if (overIndex !== -1) {
          // Dropped over an existing field, insert it there
          const newFields = [...fields];
          newFields.splice(overIndex, 0, newField);
          setFields(newFields);
          setSelectedFieldId(newField.id);
          return;
        }
      }

      // If we reach here, it was dropped outside valid areas (like the sidebar). Do not add it.
      return;
    }

    if (over && active.id !== over.id) {
      setFields((items) =>
        arrayMove(
          items,
          items.findIndex((i) => i.id === active.id),
          items.findIndex((i) => i.id === over.id)
        )
      );
    }
  };

  const handleUpdateField = (index: number, updates: Partial<FormField>) => {
    const u = [...fields];
    u[index] = { ...u[index], ...updates };
    setFields(u);
  };

  const handleRemoveField = (index: number) => {
    const fieldId = fields[index].id;
    const u = [...fields];
    u.splice(index, 1);
    setFields(u);
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
  };

  const handleDuplicateField = (index: number) => {
    const duplicate = { ...fields[index], id: `field_${Date.now()}` };
    const newFields = [...fields];
    newFields.splice(index + 1, 0, duplicate);
    setFields(newFields);
    setSelectedFieldId(duplicate.id);
  };

  const handleAddField = (type: FieldType = 'text') => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: type === 'page_break' ? 'Page Break' : '',
      required: false,
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  return (
    <div className="flex h-full w-full relative bg-slate-50/50">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleFieldDragEnd}
      >
        <div className="flex-1 h-full min-w-0 overflow-hidden">
          <FormCanvas
            fields={fields}
            selectedFieldId={selectedFieldId}
            setSelectedFieldId={setSelectedFieldId}
            handleUpdateField={handleUpdateField}
            handleRemoveField={handleRemoveField}
            handleDuplicateField={handleDuplicateField}
            features={features}
          />
        </div>
        <div className="w-[320px] shrink-0 border-l border-slate-200 bg-white h-full z-10 shadow-sm relative flex flex-col">
          <FormSidebar
            fields={fields}
            selectedFieldId={selectedFieldId}
            setSelectedFieldId={setSelectedFieldId}
            handleAddField={handleAddField}
            handleUpdateField={handleUpdateField}
            features={features}
          />
        </div>
        <DragOverlay dropAnimation={null}>
          {activeDragId && activeDragId.toString().startsWith('palette-')
            ? (() => {
                const type = activeDragId.toString().replace('palette-', '') as FieldType;
                const meta = getFieldMeta(type);
                const Icon = meta.icon;

                return (
                  <div className="w-[280px] flex items-center justify-between p-2.5 rounded-lg border border-primary bg-white shadow-xl opacity-90 scale-105">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="text-[13px] font-semibold text-slate-700">{meta.label}</span>
                    </div>
                  </div>
                );
              })()
            : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
