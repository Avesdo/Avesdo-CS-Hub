import React from 'react';
import { FormField } from '../TemplateDesigner';
import { Plus, Trash2, ChevronDown, GripVertical, Blocks } from 'lucide-react';
import { Select } from '../../ui/Select';
import { MultiSelect } from '../../ui/MultiSelect';
import { RichTextEditor } from '../../ui/RichTextEditor';
import { getFieldMeta } from './FormSidebar';

export function PropertiesPanel({ field, index, fields, handleUpdateField, features }: any) {
  const [draggedOptionIdx, setDraggedOptionIdx] = React.useState<number | null>(null);
  const [dragEnabledIdx, setDragEnabledIdx] = React.useState<number | null>(null);
  const otherFields = fields.filter((f: any) => f.id !== field.id);
  const meta = getFieldMeta(field.type);

  return (
    <div className="space-y-4">
      {/* Logic Builder */}
      {field.logicEnabled && (
        <div className="bg-primary-50/50 border border-primary-100 rounded-xl p-4 space-y-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="text-[13px] font-bold text-primary-900 shrink-0">if</div>
            <div className="flex-1 min-w-0 flex gap-2">
              <div className="flex-[1.5] min-w-0">
                <Select
                  value={field.dependsOn?.fieldId || ''}
                  onChange={(val) =>
                    handleUpdateField(index, {
                      dependsOn: {
                        condition: 'equals',
                        value: '',
                        action: 'show',
                        ...field.dependsOn,
                        fieldId: val,
                      },
                    })
                  }
                  options={otherFields.map((f: any) => ({
                    label: f.label || 'Unnamed Question',
                    value: f.id,
                  }))}
                  trigger={
                    <div className="flex items-center justify-between h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:border-primary-300 transition-all w-full shadow-sm">
                      <span className="truncate">
                        {field.dependsOn?.fieldId
                          ? otherFields.find((f: any) => f.id === field.dependsOn?.fieldId)
                              ?.label || 'Unnamed'
                          : 'Question...'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
                    </div>
                  }
                />
              </div>
              <div className="flex-1 min-w-0">
                <Select
                  value={field.dependsOn?.condition || 'equals'}
                  onChange={(val) =>
                    handleUpdateField(index, {
                      dependsOn: {
                        fieldId: '',
                        value: '',
                        action: 'show',
                        ...field.dependsOn,
                        condition: val as any,
                      },
                    })
                  }
                  options={[
                    { label: 'is exactly', value: 'equals' },
                    { label: 'is not', value: 'not_equals' },
                    { label: 'is any of', value: 'is_any_of' },
                    { label: 'is not any of', value: 'is_not_any_of' },
                    { label: 'is answered', value: 'is_answered' },
                    { label: 'is not answered', value: 'is_not_answered' },
                    { label: 'is <=', value: 'less_than_or_equals' },
                    { label: 'is >=', value: 'greater_than_or_equals' },
                  ]}
                  trigger={
                    <div className="flex items-center justify-between h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:border-primary-300 shadow-sm transition-all w-full">
                      <span className="truncate">
                        {field.dependsOn?.condition?.replace(/_/g, ' ') || 'Decision...'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
                    </div>
                  }
                />
              </div>
              <div className="flex-[1.5] min-w-0">
                {(() => {
                  const depField = otherFields.find((f: any) => f.id === field.dependsOn?.fieldId);
                  if (depField && ['select', 'radio', 'checkbox'].includes(depField.type)) {
                    const isMulti =
                      field.dependsOn?.condition === 'is_any_of' ||
                      field.dependsOn?.condition === 'is_not_any_of';
                    const currentVal = field.dependsOn?.value;
                    if (isMulti) {
                      const valuesArray = Array.isArray(currentVal)
                        ? currentVal
                        : currentVal
                          ? [currentVal]
                          : [];
                      return (
                        <MultiSelect
                          values={valuesArray}
                          onChange={(vals) =>
                            handleUpdateField(index, {
                              dependsOn: { ...field.dependsOn!, value: vals },
                            })
                          }
                          options={(depField.options || []).map((opt: string) => ({
                            label: opt,
                            value: opt,
                          }))}
                          trigger={
                            <div className="flex items-center justify-between min-h-[36px] py-1 rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:border-primary-300 shadow-sm w-full">
                              <span className="truncate">
                                {valuesArray.length > 0 ? valuesArray.join(', ') : 'Answer...'}
                              </span>
                              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
                            </div>
                          }
                        />
                      );
                    }
                    return (
                      <Select
                        value={typeof currentVal === 'string' ? currentVal : ''}
                        onChange={(val) =>
                          handleUpdateField(index, {
                            dependsOn: { ...field.dependsOn!, value: val },
                          })
                        }
                        options={(depField.options || []).map((opt: string) => ({
                          label: opt,
                          value: opt,
                        }))}
                        trigger={
                          <div className="flex items-center justify-between h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-[12px] font-medium text-slate-700 hover:border-primary-300 shadow-sm w-full">
                            <span className="truncate">
                              {typeof currentVal === 'string' && currentVal
                                ? currentVal
                                : 'Answer...'}
                            </span>
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
                          </div>
                        }
                      />
                    );
                  }
                  return (
                    <input
                      type="text"
                      value={field.dependsOn?.value !== undefined ? field.dependsOn.value : ''}
                      onChange={(e) =>
                        handleUpdateField(index, {
                          dependsOn: { ...field.dependsOn!, value: e.target.value },
                        })
                      }
                      placeholder="Answer..."
                      className="w-full h-9 px-2.5 text-[12px] font-medium bg-white border border-slate-200 rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 shadow-sm transition-all"
                    />
                  );
                })()}
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center pt-2 border-t border-primary-100">
            <div className="w-10 text-[13px] font-bold text-primary-900">then</div>
            <div className="flex-1">
              <Select
                value={field.dependsOn?.action || 'show'}
                onChange={(val) =>
                  handleUpdateField(index, {
                    dependsOn: { ...field.dependsOn!, action: val as any },
                  })
                }
                options={[
                  {
                    label: field.type === 'page_break' ? 'Show this page' : 'Show this question',
                    value: 'show',
                  },
                  {
                    label: field.type === 'page_break' ? 'Skip this page' : 'Hide this question',
                    value: 'hide',
                  },
                ]}
                trigger={
                  <div className="flex items-center justify-between h-10 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-700 hover:border-primary-300 shadow-sm w-full">
                    <span className="truncate">
                      {field.dependsOn?.action === 'hide'
                        ? field.type === 'page_break'
                          ? 'Skip this page'
                          : 'Hide this question'
                        : field.type === 'page_break'
                          ? 'Show this page'
                          : 'Show this question'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                }
              />
            </div>
          </div>
        </div>
      )}

      {field.type !== 'page_break' && (
        <>
          {/* Title Input */}
          <div className="relative">
            <label className="absolute -top-2 left-3 bg-white px-1 text-[11px] font-bold text-slate-500">
              Question *
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => handleUpdateField(index, { label: e.target.value })}
              className="w-full text-sm rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 bg-white shadow-sm"
              placeholder={`Enter ${meta.label} text`}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            {field.description === undefined ? (
              <button
                onClick={() => handleUpdateField(index, { description: '' })}
                className="text-[12px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add description
              </button>
            ) : (
              <div className="bg-white border border-slate-300 rounded-lg focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 overflow-hidden shadow-sm">
                <RichTextEditor
                  content={field.description || ''}
                  onChange={(content) => handleUpdateField(index, { description: content })}
                  placeholder="Add context or instructions..."
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Options for select/radio/checkbox */}
      {['select', 'radio', 'checkbox'].includes(field.type) && (
        <div className="space-y-4 pt-2">
          <div className="space-y-1">
            {(field.options || []).map((opt: string, optIdx: number) => (
              <div
                key={optIdx}
                className={`flex items-center gap-2 group/option transition-opacity ${draggedOptionIdx === optIdx ? 'opacity-40' : ''}`}
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
                <div
                  onMouseEnter={() => setDragEnabledIdx(optIdx)}
                  onMouseLeave={() => setDragEnabledIdx(null)}
                  className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 transition-colors py-2 pr-1 opacity-0 group-hover/option:opacity-100"
                >
                  <GripVertical className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => {
                    const newOptions = [...(field.options || [])];
                    newOptions[optIdx] = e.target.value;
                    handleUpdateField(index, { options: newOptions });
                  }}
                  className="flex-1 text-[13px] font-medium bg-transparent border-0 border-b border-slate-200 px-0 py-2.5 outline-none focus:border-primary focus:ring-0 transition-all placeholder:text-slate-400"
                  placeholder={`Option ${optIdx + 1}`}
                />
                <button
                  onClick={() => {
                    const newOptions = [...(field.options || [])];
                    newOptions.splice(optIdx, 1);
                    handleUpdateField(index, { options: newOptions });
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover/option:opacity-100 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            {/* The "Other" option row if enabled */}
            {field.allowOther && (
              <div className="flex items-center gap-2 group/option transition-opacity">
                <div className="w-5 pr-1 shrink-0"></div> {/* placeholder for drag handle */}
                <input
                  type="text"
                  disabled
                  value="Other..."
                  className="flex-1 text-[13px] font-medium bg-transparent border-0 border-b border-slate-200 px-0 py-2.5 outline-none text-slate-500 cursor-not-allowed"
                />
                <button
                  onClick={() => handleUpdateField(index, { allowOther: false })}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors opacity-0 group-hover/option:opacity-100 shrink-0"
                  title="Remove 'Other' option"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}

            {(field.options || []).length === 0 && !field.allowOther && (
              <div className="text-[13px] text-slate-500 text-center py-4 border-2 border-dashed border-slate-200 rounded-xl">
                No options added yet.
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-1 ml-7 text-[13px]">
            <button
              onClick={() => handleUpdateField(index, { options: [...(field.options || []), ''] })}
              className="text-slate-600 hover:text-slate-900 transition-colors border-b border-slate-300 hover:border-slate-500 leading-tight pb-0.5"
            >
              Add option
            </button>
            {!field.allowOther && (
              <>
                <span className="text-slate-500">or</span>
                <button
                  onClick={() => handleUpdateField(index, { allowOther: true })}
                  className="text-blue-500 hover:text-blue-600 hover:underline transition-colors"
                >
                  add "Other"
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Feature Logic */}
      {field.type === 'page_break' && field.featureLogicEnabled && (
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <label className="text-[12px] font-bold text-slate-700 flex items-center gap-2">
              <Blocks className="w-4 h-4 text-primary" />
              Show these features:
            </label>
            <MultiSelect
              values={field.dependsOnFeature || []}
              onChange={(vals) => handleUpdateField(index, { dependsOnFeature: vals })}
              options={features?.map((f: string) => ({ label: f, value: f })) || []}
              trigger={
                <div className="flex items-center justify-between min-h-[36px] py-1.5 rounded-lg border border-white bg-white px-3 text-[13px] font-medium text-slate-700 hover:border-slate-300 shadow-sm w-full">
                  <span className="whitespace-normal">
                    {field.dependsOnFeature?.length
                      ? field.dependsOnFeature.join(', ')
                      : 'Select features...'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                </div>
              }
            />
            <p className="text-[11px] text-slate-500 font-medium">
              This page will only show if the project has{' '}
              <strong className="text-slate-700">any</strong> of the selected features enabled.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
