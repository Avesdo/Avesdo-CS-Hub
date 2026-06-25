import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { FormField, Template } from '../admin/TemplateDesigner';
import { Select } from './Select';
import { DatePicker } from './DatePicker';
import { ChevronDown, Calendar, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DynamicFormProps {
  template: Template;
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  submitLabel?: string;
  readOnly?: boolean;
}

export function DynamicForm({ template, initialValues = {}, onSubmit, onCancel, submitLabel = 'Submit', readOnly = false }: DynamicFormProps) {
  const { register, handleSubmit, control, formState: { errors }, trigger } = useForm({
    defaultValues: initialValues
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const pages = useMemo(() => {
    const result: FormField[][] = [];
    let current: FormField[] = [];
    
    template.fields.forEach((field) => {
      if (field.type === 'page_break') {
        result.push(current);
        current = [];
      } else {
        current.push(field);
      }
    });
    if (current.length > 0 || result.length === 0) {
      result.push(current);
    }
    return result;
  }, [template.fields]);

  const formValues = useWatch({ control });

  // Function to determine if a field should be shown based on logic
  const isFieldVisible = (field: FormField) => {
    // 1. Feature Logic
    if (field.featureLogicEnabled && field.dependsOnFeature && field.dependsOnFeature.length > 0) {
      const hasFeature = field.dependsOnFeature.some(f => projectFeatures.includes(f));
      if (!hasFeature) return false;
    }

    // 2. Field Dependency Logic
    if (!field.logicEnabled || !field.dependsOn) return true;
    
    const { fieldId, condition, value, action = 'show' } = field.dependsOn;
    if (!fieldId) return true;

    const dependentValue = formValues[fieldId];
    let conditionMet = false;

    if (condition === 'equals') {
      conditionMet = dependentValue === value;
    } else if (condition === 'not_equals') {
      conditionMet = dependentValue !== value;
    } else if (condition === 'is_any_of') {
      const targetValues = Array.isArray(value) ? value : (value ? [value] : []);
      if (Array.isArray(dependentValue)) {
        conditionMet = dependentValue.some(val => targetValues.includes(val));
      } else {
        conditionMet = targetValues.includes(dependentValue);
      }
    } else if (condition === 'is_not_any_of') {
      const targetValues = Array.isArray(value) ? value : (value ? [value] : []);
      if (Array.isArray(dependentValue)) {
        conditionMet = !dependentValue.some(val => targetValues.includes(val));
      } else {
        conditionMet = !targetValues.includes(dependentValue);
      }
    } else if (condition === 'is_answered') {
      conditionMet = dependentValue !== undefined && dependentValue !== null && dependentValue !== '' && (!Array.isArray(dependentValue) || dependentValue.length > 0);
    } else if (condition === 'is_not_answered') {
      conditionMet = dependentValue === undefined || dependentValue === null || dependentValue === '' || (Array.isArray(dependentValue) && dependentValue.length === 0);
    }

    return action === 'show' ? conditionMet : !conditionMet;
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <input
            {...register(field.id, { required: field.required })}
            className="w-full h-10 px-3 rounded-md border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm"
            placeholder={field.type === 'text' ? '' : undefined}
          />
        );
      case 'long_text':
        return (
          <textarea
            {...register(field.id, { required: field.required })}
            className="w-full h-24 p-3 rounded-md border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm resize-y"
            placeholder=""
          />
        );
      case 'select':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{ required: field.required }}
            render={({ field: { onChange, value } }) => (
              <Select
                value={value || ''}
                onChange={onChange}
                options={(field.options || []).map(opt => ({ label: opt, value: opt }))}
                trigger={
                  <div className={`flex items-center justify-between w-full h-10 px-3 rounded-md border bg-white text-sm transition-all shadow-sm ${
                    errors[field.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary/20'
                  }`}>
                    <span className="truncate">{value || <span className="text-slate-400 font-normal">Select an option...</span>}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                }
                dropdownWidth="w-full"
              />
            )}
          />
        );
      case 'radio':
        return (
          <div className="space-y-2 mt-2">
            {field.options?.map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  value={opt}
                  {...register(field.id, { required: field.required })}
                  className="w-4 h-4 text-primary focus:ring-primary border-slate-300 shrink-0"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors leading-tight">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2 mt-2">
            {field.options?.map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  value={opt}
                  {...register(field.id)}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary shrink-0"
                />
                <span className="text-sm text-slate-700 group-hover:text-slate-900 transition-colors leading-tight">{opt}</span>
              </label>
            ))}
          </div>
        );
      case 'date':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{ required: field.required }}
            render={({ field: { onChange, value } }) => (
              <DatePicker
                value={value ? new Date(value).getTime() : null}
                onChange={(val) => onChange(val ? new Date(val).toISOString().split('T')[0] : '')}
                placeholder="Select Date"
                trigger={
                  <div className={`flex items-center justify-between w-full h-10 px-3 rounded-md border bg-white text-sm transition-all shadow-sm cursor-pointer ${
                    errors[field.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}>
                    <span className="truncate">{value ? new Date(value).toLocaleDateString() : <span className="text-slate-400 font-normal">Select Date...</span>}</span>
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                }
              />
            )}
          />
        );
      case 'number':
        return (
          <input
            type="number"
            {...register(field.id, { required: field.required })}
            className="w-full h-10 px-3 rounded-md border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm"
          />
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {template.fields.map(field => {
        if (!isFieldVisible(field)) return null;

        if (field.type === 'header') {
          return (
            <div key={field.id} className="pt-6 pb-2">
              <h3 className="text-xl font-bold text-slate-900">{field.label}</h3>
              {field.description && <p className="text-sm text-slate-500 mt-1">{field.description}</p>}
            </div>
          );
        }

        if (field.type === 'page_break') {
          return (
            <div key={field.id} className="my-8 border-t border-slate-200" />
          );
        }

        return (
          <div key={field.id} className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.description && <p className="text-xs text-slate-500 mb-2">{field.description}</p>}
            
            {renderField(field)}
            
            {errors[field.id] && (
              <p className="text-xs text-red-500 mt-1">This field is required</p>
            )}
          </div>
        );
      })}

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
