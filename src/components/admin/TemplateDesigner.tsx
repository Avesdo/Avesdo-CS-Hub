import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { saveSettings } from '../../api/dbService';
import { toast } from '../../utils/toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Trash2,
  GripVertical,
  Settings as SettingsIcon,
  CheckSquare,
  FileText,
  Save,
  SplitSquareHorizontal,
  FolderOpen,
  Type,
  AlignLeft,
  ChevronDownSquare,
  CheckSquare as CheckboxIcon,
  List,
  Calendar,
  Hash,
  Heading1,
  FileBox,
  Copy,
  Info,
  Link2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Select } from '../ui/Select';
import { MultiSelect } from '../ui/MultiSelect';
import { RichTextEditor } from '../ui/RichTextEditor';

export type FieldType = 'text' | 'long_text' | 'select' | 'radio' | 'checkbox' | 'date' | 'number' | 'header' | 'page_break';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  description?: string;
  required: boolean;
  options?: string[];
  allowOther?: boolean;
  logicEnabled?: boolean;
  dependsOn?: {
    fieldId: string;
    condition: 'equals' | 'not_equals' | 'is_any_of' | 'is_not_any_of' | 'is_answered' | 'is_not_answered';
    value: any;
    action?: 'show' | 'hide';
  } | null;
  dependsOnFeature?: string[];
  featureLogicEnabled?: boolean;
}

export interface DeliverableTemplateItem {
  id: string;
  taskName: string;
  defaultNote: string;
}

export interface ChecklistSection {
  id: string;
  name: string;
  description: string;
  dependsOnFeature: string[];
  logicEnabled?: boolean;
  items: DeliverableTemplateItem[];
}

export interface Template {
  id: string;
  name: string;
  type: 'form' | 'checklist';
  fields: FormField[];
  sections?: ChecklistSection[];
}

export const FIELD_PALETTE_CATEGORIES = [
  {
    title: 'FORMATTING',
    items: [
      { type: 'page_break', label: 'Page', icon: FileBox },
      { type: 'header', label: 'Header', icon: Heading1 },
    ]
  },
  {
    title: 'QUESTIONS',
    items: [
      { type: 'text', label: 'Single-line text', icon: Type },
      { type: 'long_text', label: 'Multi-line text', icon: AlignLeft },
      { type: 'select', label: 'Dropdown', icon: ChevronDownSquare },
      { type: 'checkbox', label: 'Checkboxes', icon: CheckboxIcon },
      { type: 'radio', label: 'Multiple choice', icon: List },
      { type: 'date', label: 'Date', icon: Calendar },
      { type: 'number', label: 'Number', icon: Hash },
    ]
  }
];

const getFieldMeta = (type: FieldType) => {
  for (const cat of FIELD_PALETTE_CATEGORIES) {
    const found = cat.items.find(i => i.type === type);
    if (found) return found;
  }
  return { label: 'Unknown', icon: Type };
};

function renderLogicUI(field: any, index: number, otherFields: any[], handleUpdateField: (idx: number, updates: any) => void) {
  if (!field.logicEnabled) return null;
  return (
           <div className="bg-[#fcfcff] border border-primary/10 rounded-xl p-4 mt-0 space-y-4">
             <div className="flex flex-wrap items-center gap-2.5">
               <span className="text-[14px] font-semibold text-slate-800">if</span>
               <Select
                 value={field.dependsOn?.fieldId || ''}
                 onChange={(val) => handleUpdateField(index, { dependsOn: { condition: 'equals', value: '', action: 'show', ...field.dependsOn, fieldId: val }})}
                 options={otherFields.map((f: any) => ({ label: f.label || 'Unnamed Question', value: f.id }))}
                 trigger={
                   <div className="flex items-center justify-between h-9 rounded-md border border-slate-200 bg-white px-3 text-[14px] font-medium text-slate-700 hover:border-slate-300 transition-colors shadow-sm min-w-[160px] max-w-[220px]">
                     <span className="truncate text-slate-700">{field.dependsOn?.fieldId ? (otherFields.find((f: any) => f.id === field.dependsOn?.fieldId)?.label || 'Unnamed') : <span className="text-slate-400 font-normal">Question...</span>}</span>
                     <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                   </div>
                 }
               />
               
               <Select
                 value={field.dependsOn?.condition || 'equals'}
                 onChange={(val) => handleUpdateField(index, { dependsOn: { fieldId: '', value: '', action: 'show', ...field.dependsOn, condition: val as any }})}
                 options={[
                   { label: 'is exactly', value: 'equals' },
                   { label: 'is not', value: 'not_equals' },
                   { label: 'is any of', value: 'is_any_of' },
                   { label: 'is not any of', value: 'is_not_any_of' },
                   { label: 'is answered', value: 'is_answered' },
                   { label: 'is not answered', value: 'is_not_answered' },
                 ]}
                 trigger={
                   <div className="flex items-center justify-between h-9 rounded-md border border-slate-200 bg-white px-3 text-[14px] font-medium text-slate-700 hover:border-slate-300 transition-colors shadow-sm min-w-[120px]">
                     <span className="truncate">
                       {field.dependsOn?.condition === 'not_equals' ? 'is not' :
                        field.dependsOn?.condition === 'is_any_of' ? 'is any of' :
                        field.dependsOn?.condition === 'is_not_any_of' ? 'is not any of' :
                        field.dependsOn?.condition === 'is_answered' ? 'is answered' :
                        field.dependsOn?.condition === 'is_not_answered' ? 'is not answered' :
                        'is exactly'}
                     </span>
                     <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                   </div>
                 }
               />
               
               {(() => {
                 if (field.dependsOn?.condition === 'is_answered' || field.dependsOn?.condition === 'is_not_answered') {
                   return null;
                 }

                 const depField = otherFields.find((f: any) => f.id === field.dependsOn?.fieldId);
                 if (depField && ['select', 'radio', 'checkbox'].includes(depField.type)) {
                   const isMulti = field.dependsOn?.condition === 'is_any_of' || field.dependsOn?.condition === 'is_not_any_of';
                   const currentVal = field.dependsOn?.value;
                   
                   if (isMulti) {
                     const valuesArray = Array.isArray(currentVal) ? currentVal : (currentVal ? [currentVal] : []);
                     return (
                       <MultiSelect
                         values={valuesArray}
                         onChange={(vals) => handleUpdateField(index, { dependsOn: { fieldId: '', condition: 'equals', action: 'show', ...field.dependsOn!, value: vals }})}
                         options={(depField.options || []).map((opt: string) => ({ label: opt, value: opt }))}
                         trigger={
                           <div className="flex items-center justify-between h-9 rounded-md border border-slate-200 bg-white px-3 text-[14px] font-medium text-slate-700 hover:border-slate-300 transition-colors shadow-sm min-w-[140px] max-w-[300px]">
                             <span className="truncate">{valuesArray.length > 0 ? valuesArray.join(', ') : <span className="text-slate-400 font-normal">Select values...</span>}</span>
                             <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                           </div>
                         }
                       />
                     );
                   }

                   return (
                     <Select
                       value={typeof currentVal === 'string' ? currentVal : ''}
                       onChange={(val) => handleUpdateField(index, { dependsOn: { fieldId: '', condition: 'equals', action: 'show', ...field.dependsOn!, value: val }})}
                       options={(depField.options || []).map((opt: string) => ({ label: opt, value: opt }))}
                       trigger={
                         <div className="flex items-center justify-between h-9 rounded-md border border-slate-200 bg-white px-3 text-[14px] font-medium text-slate-700 hover:border-slate-300 transition-colors shadow-sm min-w-[140px]">
                           <span className="truncate">{typeof currentVal === 'string' && currentVal ? currentVal : <span className="text-slate-400 font-normal">Value...</span>}</span>
                           <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                         </div>
                       }
                     />
                   );
                 }
                 return (
                   <input type="text" value={typeof field.dependsOn?.value === 'string' ? field.dependsOn.value : ''} onChange={(e) => handleUpdateField(index, { dependsOn: { fieldId: '', condition: 'equals', action: 'show', ...field.dependsOn!, value: e.target.value }})} className="h-9 rounded-md border border-slate-200 bg-white px-3 text-[14px] font-medium text-slate-700 outline-none focus:border-primary shadow-sm flex-1 min-w-[120px] placeholder:text-slate-400 placeholder:font-normal" placeholder="Answer..." />
                 );
               })()}
               
               <button onClick={() => handleUpdateField(index, { dependsOn: null, logicEnabled: false })} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors ml-auto"><Trash2 className="w-[18px] h-[18px]" /></button>
             </div>
             <div className="flex items-center gap-2 pl-6">
               <button className="text-[13px] font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5">
                 <Plus className="w-4 h-4" /> Add condition group
               </button>
               <Info className="w-[14px] h-[14px] text-slate-400" />
             </div>
             <div className="flex flex-wrap items-center gap-2.5 pt-2">
               <span className="text-[14px] font-semibold text-slate-800">then</span>
               <Select
                 value={field.dependsOn?.action || 'show'}
                 onChange={(val) => handleUpdateField(index, { dependsOn: { fieldId: '', condition: 'equals', value: '', ...field.dependsOn, action: val as any }})}
                 options={[
                   { label: field.type === 'page_break' ? 'Show this page' : 'Show this question', value: 'show' },
                   { label: field.type === 'page_break' ? 'Skip this page' : 'Hide this question', value: 'hide' },
                 ]}
                 trigger={
                   <div className="flex items-center justify-between h-9 rounded-md border border-slate-200 bg-white px-3 text-[14px] font-medium text-slate-700 hover:border-slate-300 transition-colors shadow-sm min-w-[180px]">
                     <span className="truncate">{field.dependsOn?.action === 'hide' ? field.type === 'page_break' ? 'Skip this page' : 'Hide this question' : field.type === 'page_break' ? 'Show this page' : 'Show this question'}</span>
                     <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                   </div>
                 }
               />
               <Info className="w-[14px] h-[14px] text-slate-400 ml-1" />
             </div>
           </div>
  );
}

function SortableFieldItem({ field, index, fields, handleUpdateField, handleRemoveField, handleDuplicateField, features }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, opacity: isDragging ? 0.8 : 1 };
  
  const [draggedOptionIdx, setDraggedOptionIdx] = useState<number | null>(null);
  const [dragEnabledIdx, setDragEnabledIdx] = useState<number | null>(null);
  const otherFields = fields.filter((f: any) => f.id !== field.id);
  
  const meta = getFieldMeta(field.type);
  const Icon = meta.icon;

  if (field.type === 'page_break') {
    const pageNumber = fields.slice(0, index).filter((f: any) => f.type === 'page_break').length + 2;

    return (
      <div ref={setNodeRef} style={style} className={`py-8 group relative ${isDragging ? 'opacity-50' : ''}`}>
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t-[2px] border-dashed border-slate-300" />
          </div>
          <div className="relative flex items-center gap-3 bg-white border-[2px] border-slate-300 shadow-sm rounded-full px-5 py-2">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors">
              <GripVertical className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-xs">
              {pageNumber}
            </div>
            <span className="text-sm font-bold tracking-widest text-slate-600">End of Page {pageNumber - 1}</span>

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-8 h-[18px] rounded-full relative transition-colors ${field.logicEnabled ? 'bg-primary' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-[14px] h-[14px] bg-white rounded-full transition-transform shadow-sm ${field.logicEnabled ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                <input type="checkbox" className="hidden" checked={field.logicEnabled || false} onChange={e => {
                   const enabled = e.target.checked;
                   handleUpdateField(index, { logicEnabled: enabled, dependsOn: enabled ? { fieldId: '', condition: 'equals', value: '' } : null });
                }} />
              </div>
              <span className="text-[13px] font-semibold text-slate-700">Logic</span>
            </label>
            <div className="w-px h-5 bg-slate-300 mx-2" />
            <div className="w-px h-5 bg-slate-300 mx-2" />

            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-8 h-[18px] rounded-full relative transition-colors ${field.featureLogicEnabled ? 'bg-primary' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-[14px] h-[14px] bg-white rounded-full transition-transform shadow-sm ${field.featureLogicEnabled ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                <input type="checkbox" className="hidden" checked={field.featureLogicEnabled || false} onChange={e => {
                   const enabled = e.target.checked;
                   handleUpdateField(index, { featureLogicEnabled: enabled, dependsOnFeature: enabled ? [] : [] });
                }} />
              </div>
              <span className="text-[13px] font-semibold text-slate-700">Feature logic</span>
            </label>

            <div className="w-px h-5 bg-slate-300 mx-2" />
            <button onClick={() => handleRemoveField(index)} className="text-slate-400 hover:text-red-500 transition-colors" title="Delete Page Break">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="mt-8 text-center text-xs font-semibold text-slate-400 tracking-widest">
          Start of Page {pageNumber}
        </div>
        <div className="px-8 mt-2">
           {renderLogicUI(field, index, otherFields, handleUpdateField)}
           {field.featureLogicEnabled && (
              <div className="bg-slate-50 border-t border-slate-200 p-4 relative">
                 <div className="absolute left-6 -top-2 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45" />
                 <div className="flex flex-col gap-3">
                   <div className="flex items-center gap-2 text-slate-700">
                     <SplitSquareHorizontal className="w-[18px] h-[18px]" />
                     <span className="text-[13px] font-semibold">Show this page if</span>
                   </div>
                   <div className="flex items-center gap-3 pl-6">
                     <span className="text-[14px] font-medium text-slate-700">Project uses any of:</span>
                     <MultiSelect
                       values={field.dependsOnFeature || []}
                       onChange={(vals) => handleUpdateField(index, { dependsOnFeature: vals })}
                       options={features?.map((f: string) => ({ label: f, value: f })) || []}
                       trigger={
                         <div className="flex items-center justify-between h-9 rounded-md border border-slate-200 bg-white px-3 text-[14px] font-medium text-slate-700 hover:border-slate-300 transition-colors shadow-sm min-w-[200px] max-w-[400px]">
                           <span className="truncate">{field.dependsOnFeature?.length ? field.dependsOnFeature.join(', ') : <span className="text-slate-400 font-normal">Select features...</span>}</span>
                           <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                         </div>
                       }
                     />
                     <button onClick={() => handleUpdateField(index, { dependsOnFeature: [], featureLogicEnabled: false })} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors ml-auto">
                       <Trash2 className="w-[18px] h-[18px]" />
                     </button>
                   </div>
                 </div>
              </div>
           )}
        </div>
      </div>
    );
  }

  if (field.type === 'header') {
    return (
      <div ref={setNodeRef} style={style} className={`bg-slate-50 border border-slate-200 rounded-xl p-5 flex gap-4 group transition-all relative mt-4 ${isDragging ? 'opacity-50 border-primary ring-2 ring-primary/20 shadow-lg' : ''}`}>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors pt-1">
          <GripVertical className="w-[18px] h-[18px]" />
        </div>
        <div className="flex-1">
          <input type="text" value={field.label} onChange={(e) => handleUpdateField(index, { label: e.target.value })} className="w-full text-[18px] font-bold text-slate-900 outline-none bg-transparent placeholder:text-slate-400" placeholder="Section Header" />
          {field.description !== undefined ? (
             <div className="mt-3 bg-white border border-slate-200 rounded-md focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 overflow-hidden transition-all">
               <RichTextEditor 
                 content={field.description} 
                 onChange={(content) => handleUpdateField(index, { description: content })} 
                 placeholder="Add a description..." 
               />
             </div>
          ) : (
             <button onClick={() => handleUpdateField(index, { description: '' })} className="text-[12px] font-semibold text-slate-500 hover:text-primary transition-colors mt-2 flex items-center gap-1.5">
               <Plus className="w-3.5 h-3.5" /> Add description
             </button>
          )}
        </div>
        <button onClick={() => handleRemoveField(index)} className="p-1 text-slate-400 hover:text-red-500 transition-colors h-max"><Trash2 className="w-[18px] h-[18px]" /></button>
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all relative ${isDragging ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'border-slate-200 hover:border-slate-300'}`}>
      
      <div className="p-5 flex flex-col gap-4 relative group/card">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <Icon className="w-[18px] h-[18px] opacity-80" />
            <span className="text-[13px] font-bold text-slate-800">{meta.label}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Grip Icon */}
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
              <GripVertical className="w-[18px] h-[18px]" />
            </div>
            {/* Logic Toggle */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-8 h-[18px] rounded-full relative transition-colors ${field.logicEnabled ? 'bg-primary' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-[14px] h-[14px] bg-white rounded-full transition-transform shadow-sm ${field.logicEnabled ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                <input type="checkbox" className="hidden" checked={field.logicEnabled || false} onChange={e => {
                   const enabled = e.target.checked;
                   handleUpdateField(index, { logicEnabled: enabled, dependsOn: enabled ? { fieldId: '', condition: 'equals', value: '' } : null });
                }} />
              </div>
              <span className="text-[13px] font-semibold text-slate-700">Logic</span>
            </label>
          </div>
        </div>

        {renderLogicUI(field, index, otherFields, handleUpdateField)}

        {/* Main Inputs */}
        <div className="bg-white border border-slate-200 rounded-md px-3 pb-2 pt-5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all relative">
          <label className="absolute top-1.5 left-3 text-[10px] font-bold text-slate-500">Question {field.required ? '*' : ''}</label>
          <input type="text" value={field.label} onChange={(e) => handleUpdateField(index, { label: e.target.value })} className="w-full text-[14px] font-medium text-slate-900 outline-none bg-transparent placeholder:text-slate-400 placeholder:font-normal" placeholder={field.type === 'header' ? 'Section Header' : `New ${meta.label}`} />
        </div>

        {/* Description (Optional) */}
        {field.description !== undefined ? (
           <div className="bg-white border border-slate-200 rounded-md focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 overflow-hidden transition-all">
             <div className="px-3 py-1.5 bg-slate-50 border-b border-slate-100">
               <span className="text-[10px] font-bold text-slate-500 tracking-wider">Description</span>
             </div>
             <RichTextEditor 
               content={field.description} 
               onChange={(content) => handleUpdateField(index, { description: content })} 
               placeholder="Add a description..." 
             />
           </div>
        ) : (
           <button onClick={() => handleUpdateField(index, { description: '' })} className="text-[12px] font-semibold text-slate-500 hover:text-primary transition-colors text-left flex items-center gap-1.5 w-max">
             <Plus className="w-3.5 h-3.5" /> Add description
           </button>
        )}

        {/* Options for select/radio/checkbox */}
        {['select', 'radio', 'checkbox'].includes(field.type) && (
           <div className="mt-4 space-y-3 pl-1">
             {(field.options || []).map((opt, optIdx) => (
               <div 
                 key={optIdx} 
                 className={`flex items-center gap-3 transition-opacity ${draggedOptionIdx === optIdx ? 'opacity-40' : ''}`}
                 draggable={dragEnabledIdx === optIdx}
                 onDragStart={(e) => {
                   e.stopPropagation();
                   setDraggedOptionIdx(optIdx);
                   e.dataTransfer.effectAllowed = 'move';
                 }}
                 onDragOver={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                 }}
                 onDrop={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   if (draggedOptionIdx !== null && draggedOptionIdx !== optIdx) {
                     const newOptions = [...(field.options || [])];
                     const [moved] = newOptions.splice(draggedOptionIdx, 1);
                     newOptions.splice(optIdx, 0, moved);
                     handleUpdateField(index, { options: newOptions });
                   }
                   setDraggedOptionIdx(null);
                   setDragEnabledIdx(null);
                 }}
                 onDragEnd={() => {
                   setDraggedOptionIdx(null);
                   setDragEnabledIdx(null);
                 }}
               >
                 <div className="flex items-center gap-0.5 w-full">
                   <div 
                     onMouseEnter={() => setDragEnabledIdx(optIdx)}
                     onMouseLeave={() => setDragEnabledIdx(null)}
                     className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors p-1"
                   >
                     <GripVertical className="w-4 h-4" />
                   </div>
                   <input type="text" value={opt} onChange={(e) => {
                     const newOptions = [...(field.options || [])];
                     newOptions[optIdx] = e.target.value;
                     handleUpdateField(index, { options: newOptions });
                   }} className="w-full text-[14px] font-medium text-slate-700 outline-none bg-transparent border-b border-slate-200 focus:border-primary pb-1.5" placeholder={`Option ${optIdx + 1}`} />
                 </div>
                 <button onClick={() => {
                   const newOptions = [...(field.options || [])];
                   newOptions.splice(optIdx, 1);
                   handleUpdateField(index, { options: newOptions });
                 }} className="p-1 text-slate-400 hover:text-red-500 transition-colors ml-1"><Trash2 className="w-[18px] h-[18px]" /></button>
               </div>
             ))}
             {field.allowOther && (
                <div className="flex items-center gap-0.5 w-full mt-2 opacity-70">
                   <div className="p-1 w-6" />
                   <span className="text-[14px] font-medium text-slate-700 pb-1.5 pt-1">Other:</span>
                   <div className="flex-1 border-b border-dotted border-slate-400 mx-3 pb-1.5" />
                   <button onClick={() => handleUpdateField(index, { allowOther: false })} className="p-1 text-slate-400 hover:text-red-500 transition-colors ml-1" title="Remove 'Other'"><Trash2 className="w-[18px] h-[18px]" /></button>
                </div>
             )}
             <div className="flex items-center gap-2 pt-3">
               <button onClick={() => handleUpdateField(index, { options: [...(field.options || []), ''] })} className="text-[13px] font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5 w-max">
                 <Plus className="w-4 h-4" /> Add option
               </button>
               {!field.allowOther && (
                 <>
                   <span className="text-[13px] text-slate-400 mx-1">or</span>
                   <button onClick={() => handleUpdateField(index, { allowOther: true })} className="text-[13px] font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5 w-max">
                     <Plus className="w-4 h-4" /> Add "Other"
                   </button>
                 </>
               )}
               <div className="flex-1" />
               <button className="text-[13px] font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5 w-max ml-auto hidden">
                 <Plus className="w-4 h-4" /> Add default value
               </button>
             </div>
           </div>
        )}


        {/* Bottom Actions Row */}
        <div className="flex items-center justify-between pt-5 mt-1 border-t border-slate-100">
           <label className="flex items-center gap-2.5 cursor-pointer group">
             <div className={`w-8 h-[18px] rounded-full relative transition-colors ${field.required ? 'bg-primary' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
               <div className={`absolute top-0.5 left-0.5 w-[14px] h-[14px] bg-white rounded-full transition-transform shadow-sm ${field.required ? 'translate-x-[14px]' : 'translate-x-0'}`} />
               <input type="checkbox" className="hidden" checked={field.required} onChange={e => handleUpdateField(index, { required: e.target.checked })} />
             </div>
             <span className="text-[13px] font-semibold text-slate-700">Required</span>
           </label>
           
           <div className="flex items-center gap-4">
             <button onClick={() => handleDuplicateField && handleDuplicateField(index)} className="p-1 text-slate-400 hover:text-slate-700 transition-colors" title="Duplicate">
               <Copy className="w-[18px] h-[18px]" />
             </button>
             <button onClick={() => handleRemoveField(index)} className="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Delete">
               <Trash2 className="w-[18px] h-[18px]" />
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}

// ---- Sortable Deliverable Item ----
function SortableChecklistItem({ item, itemIdx, handleUpdateItem, handleRemoveItem }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, opacity: isDragging ? 0.8 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 transition-opacity ${isDragging ? 'opacity-40' : ''}`}>
      <div className="flex items-start gap-0.5 w-full">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors p-1 mt-1">
          <GripVertical className="w-4 h-4" />
        </div>
        <div className="flex-1 space-y-2">
           <input type="text" value={item.taskName} onChange={(e) => handleUpdateItem(itemIdx, { taskName: e.target.value })} className="w-full text-[14px] font-medium text-slate-700 outline-none bg-transparent border-b border-slate-200 focus:border-primary pb-1.5" placeholder={`Deliverable ${itemIdx + 1}`} />
           <input type="text" value={item.defaultNote || ''} onChange={(e) => handleUpdateItem(itemIdx, { defaultNote: e.target.value })} className="w-full text-[12px] text-slate-500 outline-none bg-transparent border-b border-slate-200 focus:border-primary pb-1.5" placeholder="Default note or instructions (optional)" />
        </div>
      </div>
      <button onClick={() => handleRemoveItem(itemIdx)} className="p-1 text-slate-400 hover:text-red-500 transition-colors ml-1"><Trash2 className="w-[18px] h-[18px]" /></button>
    </div>
  );
}

// ---- Sortable Checklist Section ----
function SortableChecklistSection({ section, index, handleUpdateSection, handleRemoveSection, features }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1, opacity: isDragging ? 0.8 : 1 };

  const handleAddItem = () => { handleUpdateSection(index, { items: [...section.items, { id: `item_${Date.now()}`, taskName: '', defaultNote: '' }] }); };
  const handleUpdateItem = (itemIndex: number, itemUpdates: any) => { const newItems = [...section.items]; newItems[itemIndex] = { ...newItems[itemIndex], ...itemUpdates }; handleUpdateSection(index, { items: newItems }); };
  const handleRemoveItem = (itemIndex: number) => { const newItems = [...section.items]; newItems.splice(itemIndex, 1); handleUpdateSection(index, { items: newItems }); };

  // Nested DndContext for items
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const handleItemDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = section.items.findIndex((i: any) => i.id === active.id);
      const newIndex = section.items.findIndex((i: any) => i.id === over.id);
      handleUpdateSection(index, { items: arrayMove(section.items, oldIndex, newIndex) });
    }
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-all relative ${isDragging ? 'border-primary ring-2 ring-primary/20 shadow-lg' : 'border-slate-200 hover:border-slate-300'}`}>
      <div className="p-5 flex flex-col gap-4 relative group/card">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-primary">
            <CheckSquare className="w-[18px] h-[18px] opacity-80" />
            <span className="text-[13px] font-bold text-slate-800">Checklist Section</span>
          </div>
          <div className="flex items-center gap-4">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors">
              <GripVertical className="w-[18px] h-[18px]" />
            </div>
            {/* Logic Toggle */}
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-8 h-[18px] rounded-full relative transition-colors ${section.logicEnabled ? 'bg-primary' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-[14px] h-[14px] bg-white rounded-full transition-transform shadow-sm ${section.logicEnabled ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                <input type="checkbox" className="hidden" checked={section.logicEnabled || false} onChange={e => {
                   const enabled = e.target.checked;
                   handleUpdateSection(index, { logicEnabled: enabled, dependsOnFeature: enabled ? [] : [] });
                }} />
              </div>
              <span className="text-[13px] font-semibold text-slate-700">Feature logic</span>
            </label>
          </div>
        </div>

        {/* Feature Logic Row */}
        {section.logicEnabled && (
          <div className="bg-slate-50 border-t border-slate-200 p-4 relative">
             <div className="absolute left-6 -top-2 w-3 h-3 bg-white border-t border-l border-slate-200 rotate-45" />
             <div className="flex flex-col gap-3">
               <div className="flex items-center gap-2 text-slate-700">
                 <SplitSquareHorizontal className="w-[18px] h-[18px]" />
                 <span className="text-[13px] font-semibold">Show this section if</span>
               </div>
               <div className="flex items-center gap-3 pl-6">
                 <span className="text-[14px] font-medium text-slate-700">Project uses any of:</span>
                 <MultiSelect
                   values={section.dependsOnFeature || []}
                   onChange={(vals) => handleUpdateSection(index, { dependsOnFeature: vals })}
                   options={features?.map((f: string) => ({ label: f, value: f })) || []}
                   trigger={
                     <div className="flex items-center justify-between h-9 rounded-md border border-slate-200 bg-white px-3 text-[14px] font-medium text-slate-700 hover:border-slate-300 transition-colors shadow-sm min-w-[200px] max-w-[400px]">
                       <span className="truncate">{section.dependsOnFeature?.length ? section.dependsOnFeature.join(', ') : <span className="text-slate-400 font-normal">Select features...</span>}</span>
                       <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                     </div>
                   }
                 />
                 <button onClick={() => handleUpdateSection(index, { dependsOnFeature: [], logicEnabled: false })} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors ml-auto">
                   <Trash2 className="w-[18px] h-[18px]" />
                 </button>
               </div>
             </div>
          </div>
        )}

        {/* Section Inputs */}
        <div className="space-y-3">
          <div className="bg-white border border-slate-200 rounded-md px-3 pb-2 pt-5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all relative">
            <label className="absolute top-1.5 left-3 text-[10px] font-bold text-slate-500">Section Name</label>
            <input type="text" value={section.name} onChange={(e) => handleUpdateSection(index, { name: e.target.value })} className="w-full text-[14px] font-medium text-slate-900 outline-none bg-transparent placeholder:text-slate-400 placeholder:font-normal" placeholder="e.g. Credit Card Setup" />
          </div>

          <div className="bg-white border border-slate-200 rounded-md px-3 pb-2 pt-5 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all relative">
            <label className="absolute top-1.5 left-3 text-[10px] font-bold text-slate-500">Description (Optional)</label>
            <input type="text" value={section.description || ''} onChange={(e) => handleUpdateSection(index, { description: e.target.value })} className="w-full text-[14px] font-medium text-slate-900 outline-none bg-transparent placeholder:text-slate-400 placeholder:font-normal" placeholder="Add some context about this section..." />
          </div>
        </div>

        {/* Items */}
        <div className="mt-4 space-y-4 pl-4 pr-2 py-5 bg-slate-50 rounded-lg border border-slate-100">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
            <SortableContext items={section.items.map((i: any) => i.id)} strategy={verticalListSortingStrategy}>
              {section.items.map((item: any, itemIdx: number) => (
                <SortableChecklistItem key={item.id} item={item} itemIdx={itemIdx} handleUpdateItem={handleUpdateItem} handleRemoveItem={handleRemoveItem} />
              ))}
            </SortableContext>
          </DndContext>
          <div className="flex items-center gap-2 pt-1 pl-1">
            <button onClick={handleAddItem} className="text-[13px] font-semibold text-slate-500 hover:text-primary transition-colors flex items-center gap-1.5 w-max">
              <Plus className="w-4 h-4" /> Add deliverable
            </button>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-end pt-5 mt-1 border-t border-slate-100">
          <button onClick={() => handleRemoveSection(index)} className="p-1 text-slate-400 hover:text-red-500 transition-colors" title="Delete Section">
            <Trash2 className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Main Template Designer ----
export default function TemplateDesigner() {
  const settings = useAppStore(state => state.settings);
  const features = settings?.features || [];
  const [activeTemplateId, setActiveTemplateId] = useState<string>('deliverables');
  
  const defaultTemplates: Record<string, Template> = {
    deliverables: { id: 'deliverables', name: 'Deliverables Checklist', type: 'checklist', fields: [], sections: [] },
    onboardingSurvey: { id: 'onboardingSurvey', name: 'Onboarding Survey', type: 'form', fields: [] },
    primaryQA: { id: 'primaryQA', name: 'Primary QA', type: 'form', fields: [] },
    clientQA: { id: 'clientQA', name: 'Client QA', type: 'form', fields: [] },
    secondaryQA: { id: 'secondaryQA', name: 'Secondary QA', type: 'form', fields: [] },
    certification: { id: 'certification', name: 'Project Certification', type: 'form', fields: [] },
  };

  const templates: Record<string, Template> = settings?.templates || defaultTemplates;
  const templateOrder = ['deliverables', 'onboardingSurvey', 'primaryQA', 'clientQA', 'secondaryQA', 'certification'];
  const sortedTemplates = templateOrder.map(id => templates[id] || defaultTemplates[id]).filter(Boolean);

  const activeTemplate = templates[activeTemplateId] || defaultTemplates[activeTemplateId];
  const [fields, setFields] = useState<FormField[]>(activeTemplate?.fields || []);
  const [sections, setSections] = useState<ChecklistSection[]>(activeTemplate?.sections || []);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  React.useEffect(() => {
    setFields(templates[activeTemplateId]?.fields || []);
    setSections(templates[activeTemplateId]?.sections || []);
  }, [activeTemplateId, settings?.templates]);

  const handleAddField = (type: FieldType = 'text') => {
    const meta = getFieldMeta(type);
    setFields([...fields, { id: `field_${Date.now()}`, type, label: type === 'page_break' ? 'Page Break' : '', required: false }]);
  };
  const handleUpdateField = (index: number, updates: Partial<FormField>) => { const u = [...fields]; u[index] = { ...u[index], ...updates }; setFields(u); };
  const handleRemoveField = (index: number) => { const u = [...fields]; u.splice(index, 1); setFields(u); };
  const handleDuplicateField = (index: number) => {
    const duplicate = { ...fields[index], id: `field_${Date.now()}` };
    const newFields = [...fields];
    newFields.splice(index + 1, 0, duplicate);
    setFields(newFields);
  };
  const handleFieldDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setFields((items) => arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id)));
    }
  };

  const handleAddSection = () => setSections([...sections, { id: `sec_${Date.now()}`, name: 'New Section', description: '', dependsOnFeature: [], items: [] }]);
  const handleUpdateSection = (index: number, updates: Partial<ChecklistSection>) => { const u = [...sections]; u[index] = { ...u[index], ...updates }; setSections(u); };
  const handleRemoveSection = (index: number) => { const u = [...sections]; u.splice(index, 1); setSections(u); };
  const handleSectionDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setSections((items) => arrayMove(items, items.findIndex(i => i.id === active.id), items.findIndex(i => i.id === over.id)));
    }
  };

  const handleSave = async () => {
    try {
      await saveSettings(
        { ...settings, templates: { ...templates, [activeTemplateId]: { ...activeTemplate, fields, sections } } },
        { silent: true }
      );
      toast.success(`${activeTemplate.name} template saved successfully!`);
    } catch (e) {
      toast.error('Failed to save template');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-border shadow-sm overflow-hidden animate-in fade-in duration-300">
      <div className="p-4 border-b border-border bg-slate-50 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-semibold text-slate-800">Template Designer</h2>
        <button onClick={handleSave} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md text-sm font-medium transition-colors">
          <Save className="w-4 h-4" /> Save Template
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row min-h-0">
        {/* Left Sidebar: Templates */}
        <div className="w-full md:w-64 border-r border-border bg-slate-50/50 overflow-y-auto shrink-0 custom-thin-scroll">
          <div className="p-4 space-y-1">
            {sortedTemplates.map((tpl) => (
              <button key={tpl.id} onClick={() => setActiveTemplateId(tpl.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-[13px] font-medium transition-colors text-left outline-none ${activeTemplateId === tpl.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-slate-200/50 hover:text-foreground'}`}>
                {tpl.type === 'form' ? <FileText className="w-4 h-4 opacity-70" /> : <CheckSquare className="w-4 h-4 opacity-70" />}
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        {/* Center: Builder Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#fcfcff] custom-thin-scroll">
          <div className="max-w-3xl space-y-6 mx-auto">
            <div className="flex flex-wrap gap-4 items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground tracking-tight">{activeTemplate.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTemplate.type === 'form' ? 'Define the questions and conditional logic for this form.' : 'Group deliverables into sections conditionally based on project features.'}
                </p>
              </div>
            </div>

            {/* Checklist Builder */}
            {activeTemplate.type === 'checklist' && (
              sections.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"><FolderOpen className="w-6 h-6 text-primary" /></div>
                  <h4 className="text-base font-medium text-foreground">No sections yet</h4>
                  <button onClick={handleAddSection} className="mt-4 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-md text-sm font-medium transition-colors">Add First Section</button>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
                  <div className="space-y-6">
                    <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                      {sections.map((section, index) => (
                        <SortableChecklistSection key={section.id} section={section} index={index} handleUpdateSection={handleUpdateSection} handleRemoveSection={handleRemoveSection} features={features} />
                      ))}
                    </SortableContext>
                  </div>
                </DndContext>
              )
            )}

            {/* Form Builder */}
            {activeTemplate.type === 'form' && (
              fields.length === 0 ? (
                <div className="bg-slate-50 border border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"><SettingsIcon className="w-6 h-6 text-primary" /></div>
                  <h4 className="text-base font-medium text-foreground">No fields yet</h4>
                  <button onClick={() => handleAddField('text')} className="mt-4 bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-md text-sm font-medium transition-colors">Add First Field</button>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFieldDragEnd}>
                  <div className="space-y-4">
                    <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                      {fields.map((field, index) => (
                        <SortableFieldItem key={field.id} field={field} index={index} fields={fields} handleUpdateField={handleUpdateField} handleRemoveField={handleRemoveField} handleDuplicateField={handleDuplicateField} features={features} />
                      ))}
                    </SortableContext>
                  </div>
                </DndContext>
              )
            )}
            
            {/* Add buttons at the bottom */}
            {activeTemplate.type === 'checklist' && sections.length > 0 && (
              <div className="pt-4 pb-12">
                <button onClick={handleAddSection} className="flex items-center justify-center gap-2 text-slate-500 hover:text-primary hover:bg-slate-50 px-6 py-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/30 transition-all font-medium text-sm w-full">
                  <FolderOpen className="w-4 h-4" /> Add Another Section
                </button>
              </div>
            )}
            
            {activeTemplate.type === 'form' && fields.length > 0 && (
              <div className="pt-4 pb-12 flex gap-4">
                <button onClick={() => handleAddField('text')} className="flex-1 flex items-center justify-center gap-2 text-slate-500 hover:text-primary hover:bg-slate-50 px-6 py-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/30 transition-all font-medium text-sm">
                  <Plus className="w-4 h-4" /> Add Question
                </button>
                <button onClick={() => handleAddField('page_break')} className="flex-1 flex items-center justify-center gap-2 text-slate-500 hover:text-primary hover:bg-slate-50 px-6 py-3.5 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/30 transition-all font-medium text-sm">
                  <FileBox className="w-4 h-4" /> Add Page
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar: Field Palette (Only for Forms) */}
        {activeTemplate.type === 'form' && (
          <div className="w-full md:w-64 border-l border-border bg-white overflow-y-auto shrink-0 custom-thin-scroll">
            <div className="p-5 space-y-6">
              {FIELD_PALETTE_CATEGORIES.map((category) => (
                <div key={category.title} className="space-y-2.5">
                  <h4 className="text-[12px] font-bold tracking-wide text-slate-400">{category.title}</h4>
                  <div className="space-y-1">
                    {category.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.type}
                          onClick={() => handleAddField(item.type as FieldType)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors group text-left"
                        >
                          <div className="p-1.5 rounded-md bg-slate-100 group-hover:bg-white border border-transparent group-hover:border-slate-200 group-hover:shadow-sm transition-all text-slate-500 group-hover:text-primary">
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[13px] font-semibold">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
