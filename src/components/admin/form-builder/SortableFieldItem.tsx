import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField, FieldType, FIELD_PALETTE_CATEGORIES } from '../TemplateDesigner';
import { GripVertical, GripHorizontal, Trash2, Copy, Type, GitBranch, SplitSquareHorizontal } from 'lucide-react';
import { PropertiesPanel } from './FieldPropertiesPanel';

export const getFieldMeta = (type: FieldType) => {
  for (const cat of FIELD_PALETTE_CATEGORIES) {
    const found = cat.items.find((i) => i.type === type);
    if (found) return found;
  }
  return { label: 'Unknown', icon: Type };
};

export function SortableFieldItem({
  field,
  index,
  fields,
  isSelected,
  onSelect,
  handleUpdateField,
  handleRemoveField,
  handleDuplicateField,
  features,
}: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging, isOver, active } = useSortable({
    id: field.id,
  });
  
  const isDraggingPaletteItem = active?.data?.current?.type === 'palette-item';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const meta = getFieldMeta(field.type);
  const Icon = meta.icon;

  if (field.type === 'page_break') {
    const pageNumber =
      fields.slice(0, index).filter((f: any) => f.type === 'page_break').length + 2;

    return (
      <div
        ref={setNodeRef}
        style={style}
        onClick={onSelect}
        className={`py-6 group relative cursor-pointer ${isDragging ? 'opacity-50' : ''}`}
      >
        {isOver && isDraggingPaletteItem && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-full z-50"></div>
        )}

        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className={`w-full border-t-[2px] border-dashed ${isSelected ? 'border-primary-200' : 'border-slate-200'}`} />
          </div>
          <div className={`relative flex items-center bg-white border-[2px] shadow-sm rounded-full px-2 py-1.5 transition-colors ${isSelected ? 'border-primary-400 ring-4 ring-primary-500/10' : 'border-slate-200 hover:border-slate-300'}`}>
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors p-2 flex items-center"
            >
              <GripVertical className="w-4 h-4" />
            </div>
            
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-50 text-slate-600 font-bold text-xs mx-2">
              {pageNumber}
            </div>
            
            <span className="text-[13px] font-bold text-slate-700 mr-4">
              End of Page {pageNumber - 1}
            </span>

            {/* Logic Toggle */}
            <div className="flex items-center gap-2 pr-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-8 h-[18px] rounded-full relative transition-colors ${field.logicEnabled ? 'bg-primary' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                  <div className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full transition-transform shadow-sm ${field.logicEnabled ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={field.logicEnabled || false}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      handleUpdateField(index, {
                        logicEnabled: enabled,
                        dependsOn: enabled ? { fieldId: '', condition: 'equals', value: '' } : null,
                      });
                    }}
                  />
                </div>
                <span className="text-[13px] font-semibold text-slate-700">Logic</span>
              </label>
            </div>

            <div className="h-4 w-px bg-slate-200 mx-1"></div>

            {/* Feature Logic Toggle */}
            <div className="flex items-center gap-2 px-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className={`w-8 h-[18px] rounded-full relative transition-colors ${field.featureLogicEnabled ? 'bg-primary' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                  <div className={`absolute top-[2px] left-[2px] w-[14px] h-[14px] bg-white rounded-full transition-transform shadow-sm ${field.featureLogicEnabled ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={field.featureLogicEnabled || false}
                    onChange={(e) => {
                      handleUpdateField(index, {
                        featureLogicEnabled: e.target.checked
                      } as any);
                    }}
                  />
                </div>
                <span className="text-[13px] font-semibold text-slate-700">Feature logic</span>
              </label>
            </div>

            <div className="h-4 w-px bg-slate-200 mx-1"></div>

            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveField(index);
              }}
              className="text-slate-400 hover:text-red-500 transition-colors p-2 ml-1"
            >
              <Trash2 className="w-[18px] h-[18px]" />
            </button>
          </div>
        </div>

        <div className="text-center mt-6">
          <span className="text-[11px] font-bold tracking-widest text-slate-400/80">
            Start of Page {pageNumber}
          </span>
        </div>

        {isSelected && (field.logicEnabled || field.featureLogicEnabled) && (
          <div className="mt-6">
             <PropertiesPanel
                field={field}
                index={index}
                fields={fields}
                handleUpdateField={handleUpdateField}
                features={features}
             />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {isOver && isDraggingPaletteItem && (
        <div className="absolute -top-1 left-0 right-0 h-[3px] bg-primary rounded-full z-50"></div>
      )}
      <div
        ref={setNodeRef}
        style={style}
        onClick={onSelect}
        {...attributes}
        {...listeners}
        className={`bg-white w-full rounded-xl transition-all relative group flex flex-col border cursor-pointer pt-2 ${
          isSelected 
            ? 'border-primary ring-2 ring-primary/20 shadow-md bg-white' 
            : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
        } ${isDragging ? 'shadow-lg scale-[1.01] z-50' : ''}`}
      >
        <div className="px-5 py-3.5 flex-1 flex flex-col gap-1.5 min-w-0" onClick={(e) => {
          // Prevent click from bubbling up if clicking interactive elements
          const target = e.target as HTMLElement;
          if (target.closest('button, input, textarea, select')) {
            e.stopPropagation();
          }
        }}>
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg shrink-0 transition-colors ${isSelected ? 'bg-primary-50 text-primary-500' : 'bg-slate-100 text-slate-500'}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            {isSelected ? (
              <div className="flex items-center w-full justify-between">
                 <h3 className="font-bold text-slate-800 text-[14px]">{meta.label}</h3>
                 <div className="flex items-center gap-3 border border-slate-200 bg-slate-50 rounded-lg p-1 shadow-sm">
                   {field.type !== 'page_break' && field.type !== 'header' && (
                     <>
                        <div className="flex items-center gap-2 pl-2">
                          <span className="text-[12px] font-semibold text-slate-600">Required</span>
                          <label className="flex items-center cursor-pointer group">
                            <div className={`w-8 h-[18px] rounded-full relative transition-colors ${field.required ? 'bg-primary' : 'bg-slate-300 group-hover:bg-slate-400'}`}>
                              <div className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 bg-white rounded-full transition-transform shadow-sm ${field.required ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={field.required || false}
                                onChange={(e) => handleUpdateField(index, { required: e.target.checked })}
                              />
                            </div>
                          </label>
                        </div>

                        <div className="w-px h-4 bg-slate-200"></div>

                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-slate-600">Logic</span>
                          <label className="flex items-center cursor-pointer group">
                            <div className={`w-8 h-[18px] rounded-full relative transition-colors ${field.logicEnabled ? 'bg-primary' : 'bg-slate-300 group-hover:bg-slate-400'}`}>
                              <div className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 bg-white rounded-full transition-transform shadow-sm ${field.logicEnabled ? 'translate-x-[14px]' : 'translate-x-0'}`} />
                              <input
                                type="checkbox"
                                className="hidden"
                                checked={field.logicEnabled || false}
                                onChange={(e) => {
                                  const enabled = e.target.checked;
                                  handleUpdateField(index, {
                                    logicEnabled: enabled,
                                    dependsOn: enabled ? { fieldId: '', condition: 'equals', value: '' } : null,
                                  });
                                }}
                              />
                            </div>
                          </label>
                        </div>
                        
                        <div className="w-px h-4 bg-slate-200"></div>
                     </>
                   )}

                   {/* Quick Actions (Always Visible in Edit Mode) */}
                   <div className="flex items-center gap-0.5 pr-0.5">
                     <button
                       onClick={(e) => { e.stopPropagation(); handleDuplicateField(index); }}
                       className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                       title="Duplicate"
                     >
                       <Copy className="w-4 h-4" />
                     </button>
                     <button
                       onClick={(e) => { e.stopPropagation(); handleRemoveField(index); }}
                       className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                       title="Delete"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                   </div>
                 </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 w-full justify-between pr-2">
                <div className="text-[15px] font-bold text-slate-900 truncate">
                  {field.label || `New ${meta.label} Question`}
                  {field.required && <span className="text-red-500 ml-1" title="Required">*</span>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {field.logicEnabled && (
                    <div className="flex items-center gap-1.5 text-primary bg-primary-50 px-2 py-1 rounded-md" title="Field logic enabled">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold">Logic</span>
                    </div>
                  )}
                  {field.featureLogicEnabled && (
                    <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-2 py-1 rounded-md" title="Feature logic enabled">
                      <SplitSquareHorizontal className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-semibold">Feature logic</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Minimal description display */}
        {!isSelected && field.description && field.description !== '<p></p>' && field.description.trim() !== '' && (
          <div className="pl-10 pr-4 opacity-80 pointer-events-none -mt-1">
             <div dangerouslySetInnerHTML={{ __html: field.description }} className="text-[13px] text-slate-500 prose-sm max-w-none prose-p:my-0 prose-p:leading-snug" />
          </div>
        )}

        {/* Read-only preview of options */}
        {!isSelected && ['select', 'radio', 'checkbox'].includes(field.type) && ((field.options && field.options.length > 0) || field.allowOther) && (
          <div className="pl-10 pr-4 mt-3 flex flex-col gap-2">
            {(() => {
              const displayOptions = [...(field.options || [])];
              if (field.allowOther) displayOptions.push('Other...');

              const isLongOptions = displayOptions.some((opt: string) => opt.length > 35);
              
              if (isLongOptions) {
                // Vertical stack for long options
                return (
                  <div className="flex flex-col gap-2">
                    {displayOptions.slice(0, 3).map((opt: string, i: number) => (
                      <div key={i} className="text-[13px] text-slate-600 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50/50 leading-relaxed">
                        {opt || 'Empty Option'}
                      </div>
                    ))}
                    {displayOptions.length > 3 && (
                      <div className="text-[12px] font-medium text-slate-400 pl-1">
                        +{displayOptions.length - 3} more options
                      </div>
                    )}
                  </div>
                );
              }

              // Horizontal flow for short options (like tags)
              return (
                <div className="flex flex-wrap gap-2">
                  {displayOptions.slice(0, 4).map((opt: string, i: number) => (
                    <div key={i} className="text-[12px] font-medium text-slate-700 px-3 py-1.5 rounded-md border border-slate-200 bg-white shadow-sm flex items-center">
                      {opt || 'Empty Option'}
                    </div>
                  ))}
                  {displayOptions.length > 4 && (
                    <div className="text-[12px] font-medium text-slate-400 px-2 py-1.5 flex items-center">
                      +{displayOptions.length - 4} more
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Inline Properties Editing */}
        {isSelected && (
          <>
            <div className="mt-2 pt-2 border-t border-slate-100">
              <PropertiesPanel 
                field={field} 
                index={index} 
                fields={fields} 
                handleUpdateField={handleUpdateField}
                features={features}
              />
            </div>
            
          </>
        )}
      </div>


      </div>
    </div>
  );
}
