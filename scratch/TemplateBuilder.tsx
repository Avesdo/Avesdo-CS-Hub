import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FormTemplate, FormField } from '../../types';
import { saveFormTemplate, deleteFormTemplate } from '../../api/dbService';
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Save, X, Eye, LayoutTemplate } from 'lucide-react';
import { toast } from '../../utils/toast';

export function TemplateBuilder() {
  const formTemplates = useAppStore(state => state.formTemplates);
  const [editingTemplate, setEditingTemplate] = useState<FormTemplate | null>(null);

  const handleCreateNew = () => {
    setEditingTemplate({
      id: `template_${Date.now()}`,
      name: 'New Form Template',
      description: '',
      fields: [],
      createdAt: Date.now(),
    });
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    if (!editingTemplate.name.trim()) {
      toast.error('Template name is required');
      return;
    }
    try {
      await saveFormTemplate(editingTemplate.id, {
        ...editingTemplate,
        updatedAt: Date.now(),
      });
      setEditingTemplate(null);
    } catch (e) {
      // toast handled in dbService
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteFormTemplate(id);
    }
  };

  const addField = () => {
    if (!editingTemplate) return;
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
    };
    setEditingTemplate({
      ...editingTemplate,
      fields: [...editingTemplate.fields, newField],
    });
  };

  const updateField = (index: number, updates: Partial<FormField>) => {
    if (!editingTemplate) return;
    const newFields = [...editingTemplate.fields];
    newFields[index] = { ...newFields[index], ...updates };
    setEditingTemplate({
      ...editingTemplate,
      fields: newFields,
    });
  };

  const removeField = (index: number) => {
    if (!editingTemplate) return;
    const newFields = [...editingTemplate.fields];
    newFields.splice(index, 1);
    setEditingTemplate({
      ...editingTemplate,
      fields: newFields,
    });
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (!editingTemplate) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === editingTemplate.fields.length - 1) return;
    
    const newFields = [...editingTemplate.fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newFields[index];
    newFields[index] = newFields[targetIndex];
    newFields[targetIndex] = temp;
    
    setEditingTemplate({
      ...editingTemplate,
      fields: newFields,
    });
  };

  if (editingTemplate) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto pb-20">
        <div className="flex items-center justify-between border-b pb-4">
          <h2 className="text-xl font-bold">Edit Template</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditingTemplate(null)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm"
            >
              <Save className="w-4 h-4" /> Save Template
            </button>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Template Name</label>
            <input
              type="text"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={editingTemplate.name}
              onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
              placeholder="e.g. Primary QA"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <input
              type="text"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={editingTemplate.description || ''}
              onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Fields</h3>
            <button
              onClick={addField}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Field
            </button>
          </div>

          {editingTemplate.fields.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-slate-500">
              No fields added yet. Click "Add Field" to start building your form.
            </div>
          ) : (
            <div className="space-y-4">
              {editingTemplate.fields.map((field, index) => (
                <div key={field.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm relative group">
                  <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => moveField(index, 'up')} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md disabled:opacity-30">
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button onClick={() => moveField(index, 'down')} disabled={index === editingTemplate.fields.length - 1} className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md disabled:opacity-30">
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeField(index)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mr-12">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Field Label</label>
                      <input
                        type="text"
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm font-medium"
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        placeholder="e.g. Project Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Field Type</label>
                      <select
                        className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                        value={field.type}
                        onChange={(e) => updateField(index, { type: e.target.value as FormField['type'] })}
                      >
                        <option value="text">Short Text</option>
                        <option value="textarea">Long Text</option>
                        <option value="rich-text">Rich Text Editor</option>
                        <option value="boolean">Yes/No Toggle</option>
                        <option value="select">Dropdown (Single)</option>
                        <option value="multiselect">Dropdown (Multi)</option>
                      </select>
                    </div>

                    {(field.type === 'select' || field.type === 'multiselect') && (
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Options (Comma separated)</label>
                        <input
                          type="text"
                          className="w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                          value={field.options?.join(', ') || ''}
                          onChange={(e) => updateField(index, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          placeholder="Option 1, Option 2, Option 3"
                        />
                      </div>
                    )}
                    
                    <div className="md:col-span-2 flex items-center gap-6 mt-2 pt-4 border-t border-slate-100">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          checked={field.required || false}
                          onChange={(e) => updateField(index, { required: e.target.checked })}
                        />
                        <span className="text-sm font-medium text-slate-700">Required Field</span>
                      </label>
                      
                      <div className="flex-1 flex items-center justify-end gap-3">
                         <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Depends On:</span>
                         <select
                           className="rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs py-1"
                           value={field.dependsOn?.fieldId || ''}
                           onChange={(e) => {
                             const val = e.target.value;
                             if (!val) {
                               updateField(index, { dependsOn: undefined });
                             } else {
                               updateField(index, { dependsOn: { fieldId: val, value: '' } });
                             }
                           }}
                         >
                           <option value="">None (Always Show)</option>
                           {editingTemplate.fields.slice(0, index).map(prevField => (
                             <option key={prevField.id} value={prevField.id}>{prevField.label}</option>
                           ))}
                         </select>
                         
                         {field.dependsOn?.fieldId && (
                           <input
                             type="text"
                             className="w-32 rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-xs py-1 placeholder:text-slate-400"
                             value={field.dependsOn.value || ''}
                             onChange={(e) => updateField(index, { dependsOn: { ...field.dependsOn!, value: e.target.value } })}
                             placeholder="Required Value"
                           />
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Form Templates</h2>
          <p className="text-slate-500 mt-1">Build and manage dynamic forms for onboarding and QA.</p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {formTemplates.map((template) => (
          <div key={template.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col h-full">
            <h3 className="font-bold text-slate-900 text-lg">{template.name}</h3>
            {template.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{template.description}</p>}
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
               <span>{template.fields?.length || 0} Fields</span>
            </div>
            
            <div className="mt-auto pt-6 flex items-center gap-3">
              <button
                onClick={() => setEditingTemplate(template)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={() => handleDelete(template.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {formTemplates.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <LayoutTemplate className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No templates yet</h3>
            <p className="text-slate-500 mb-6 max-w-md mx-auto">Create your first form template to start collecting structured data from your projects.</p>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Create Template
            </button>
          </div>
        )}
      </div>
    </div>
  );
}