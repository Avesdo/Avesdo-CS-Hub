import React, { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { FormField, Template } from '../admin/TemplateDesigner';
import { Select } from './Select';
import { DatePicker } from './DatePicker';
import { ChevronDown, Calendar } from 'lucide-react';

interface DynamicFormProps {
  template: Template;
  initialValues?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
  onCancel?: () => void;
  submitLabel?: string;
  readOnly?: boolean;
  projectFeatures?: string[];
}

export function DynamicForm({ template, initialValues = {}, onSubmit, onCancel, submitLabel = 'Submit', readOnly = false, projectFeatures = [] }: DynamicFormProps) {
  const { register, handleSubmit, control, formState: { errors }, trigger } = useForm({
    defaultValues: initialValues
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const pagesData = useMemo(() => {
    const result: { fields: FormField[], pageBreak?: FormField, originalIndex: number }[] = [];
    let current: FormField[] = [];
    let currentPageBreak: FormField | undefined = undefined;
    
    template.fields.forEach((field) => {
      if (field.type === 'page_break') {
        result.push({ fields: current, pageBreak: currentPageBreak, originalIndex: result.length });
        current = [];
        currentPageBreak = field;
      } else {
        current.push(field);
      }
    });
    result.push({ fields: current, pageBreak: currentPageBreak, originalIndex: result.length });
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

  const visiblePages = pagesData.filter(page => {
    if (!page.pageBreak) return true;
    return isFieldVisible(page.pageBreak);
  });

  // Ensure currentPage is within bounds if pages shrink
  useEffect(() => {
    if (currentPage >= visiblePages.length) {
      setCurrentPage(Math.max(0, visiblePages.length - 1));
    }
  }, [visiblePages.length, currentPage]);

  const safeCurrentPage = Math.min(currentPage, visiblePages.length - 1);
  const currentFields = visiblePages[safeCurrentPage]?.fields || [];

  const renderField = (field: FormField) => {
    if (readOnly) {
      let displayValue: React.ReactNode = <span className="text-slate-400 italic text-[13px]">Unanswered</span>;
      const value = formValues[field.id];
      const otherValue = formValues[`${field.id}_other`];

      if (value !== undefined && value !== null && value !== '' && (!Array.isArray(value) || value.length > 0)) {
        if (Array.isArray(value)) {
          displayValue = (
            <ul className="list-disc list-inside space-y-1">
              {value.map(v => (
                <li key={v} className="text-slate-800 text-sm">
                  {v === '__other__' ? `Other: ${otherValue || ''}` : v}
                </li>
              ))}
            </ul>
          );
        } else if (field.type === 'date') {
          displayValue = <span className="text-slate-800 text-sm">{new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>;
        } else if (value === '__other__') {
          displayValue = <span className="text-slate-800 text-sm">Other: {otherValue || ''}</span>;
        } else {
          displayValue = <span className="text-slate-800 text-sm break-words whitespace-pre-wrap">{value}</span>;
        }
      }

      return (
        <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-100 mt-2">
          {displayValue}
        </div>
      );
    }

    switch (field.type) {
      case 'text':
        return (
          <input
            {...register(field.id, { required: field.required })}
            className="w-full h-10 px-3 rounded-md border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm"
            placeholder="Type your answer..."
          />
        );
      case 'long_text':
        return (
          <textarea
            {...register(field.id, { required: field.required })}
            className="w-full h-24 p-3 rounded-md border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm resize-y"
            placeholder="Type your answer here..."
          />
        );
      case 'select':
        return (
          <Controller
            name={field.id}
            control={control}
            rules={{ required: field.required }}
            render={({ field: { onChange, value } }) => (
              <div>
                <Select
                value={value || ''}
                onChange={onChange}
                options={[
                  ...(field.options || []).filter(opt => opt && opt.trim() !== '').map(opt => ({ label: opt, value: opt })),
                  ...(field.allowOther ? [{ label: 'Other...', value: '__other__' }] : [])
                ]}
                trigger={
                  <div className={`flex items-center justify-between w-full h-10 px-3 rounded-md border bg-white text-sm transition-all shadow-sm ${
                    errors[field.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary/20'
                  }`}>
                    <span className="truncate">{value === '__other__' ? 'Other...' : (value || <span className="text-slate-400 font-normal">Select an option...</span>)}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  </div>
                }
                dropdownWidth="w-full"
              />
              {value === '__other__' && (
                <div className="mt-2 pl-1 animate-in fade-in slide-in-from-top-1">
                  <input
                    type="text"
                    {...register(`${field.id}_other`, { required: field.required })}
                    className="w-full h-10 px-3 rounded-md border border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all text-sm"
                    placeholder="Please specify"
                  />
                </div>
              )}
            </div>
            )}
          />
        );
      case 'radio':
        return (
          <div className="space-y-2 mt-2">
            {(field.options || []).filter(opt => opt && opt.trim() !== '').map(opt => (
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
            {field.allowOther && (
              <label className="flex items-center gap-2 cursor-pointer group mt-1">
                <input
                  type="radio"
                  value="__other__"
                  {...register(field.id, { required: field.required })}
                  className="w-4 h-4 text-primary focus:ring-primary border-slate-300 shrink-0 mt-0.5"
                />
                <span className="text-sm text-slate-700 whitespace-nowrap">Other:</span>
                <input
                  type="text"
                  {...register(`${field.id}_other`, { required: field.required && formValues[field.id] === '__other__' })}
                  className={`flex-1 ml-2 border-b outline-none bg-transparent text-sm pb-1 text-slate-900 placeholder:text-slate-400 transition-colors ${
                    formValues[field.id] === '__other__' ? 'border-primary' : 'border-slate-300'
                  } disabled:opacity-50`}
                  placeholder="Please specify"
                  disabled={formValues[field.id] !== '__other__'}
                />
              </label>
            )}
          </div>
        );
      case 'checkbox':
        return (
          <div className="space-y-2 mt-2">
            {(field.options || []).filter(opt => opt && opt.trim() !== '').map(opt => (
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
            {field.allowOther && (
              <label className="flex items-start gap-2 cursor-pointer group mt-1">
                <input
                  type="checkbox"
                  value="__other__"
                  {...register(field.id)}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary shrink-0 mt-0.5"
                />
                <span className="text-sm text-slate-700 whitespace-nowrap pt-0.5">Other:</span>
                <input
                  type="text"
                  {...register(`${field.id}_other`, { required: field.required && (formValues[field.id] || []).includes('__other__') })}
                  className={`flex-1 ml-2 border-b outline-none bg-transparent text-sm pb-1 text-slate-900 placeholder:text-slate-400 transition-colors ${
                    (formValues[field.id] || []).includes('__other__') ? 'border-primary' : 'border-slate-300'
                  } disabled:opacity-50`}
                  placeholder="Please specify"
                  disabled={!(formValues[field.id] || []).includes('__other__')}
                />
              </label>
            )}
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
                onChange={(val, str) => onChange(str)}
                placeholder="Select Date"
                trigger={
                  <div className={`flex items-center w-full h-10 px-3 gap-2 rounded-md border bg-white text-sm transition-all shadow-sm cursor-pointer ${
                    errors[field.id] ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-1 focus:ring-primary/20'
                  }`}>
                    <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className={value ? "text-slate-900" : "text-slate-400 font-normal"}>
                      {value ? new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "Select Date"}
                    </span>
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

  const handleNext = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isTransitioning) return;
    setIsTransitioning(true);
    
    const visibleFieldIds = currentFields.filter(isFieldVisible).map(f => f.id);
    const isValid = await trigger(visibleFieldIds);
    if (isValid) {
      setCurrentPage(prev => Math.min(prev + 1, visiblePages.length - 1));
      setTimeout(() => setIsTransitioning(false), 300);
    } else {
      setIsTransitioning(false);
    }
  };

  const handlePrev = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {visiblePages.length > 1 && (
        <div className="flex items-center gap-2 mb-6">
          {visiblePages.map((_, idx) => (
            <div key={idx} className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${idx <= safeCurrentPage ? 'bg-primary' : 'bg-transparent'}`}
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
      {currentFields.map(field => {
        if (!isFieldVisible(field)) return null;

        if (field.type === 'header') {
          return (
            <div key={field.id} className="pt-6 pb-2">
              <h3 className="text-xl font-bold text-slate-900">{field.label}</h3>
              {field.description && (
                <div 
                  className="mt-2 text-sm text-slate-600 prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                  dangerouslySetInnerHTML={{ __html: field.description }}
                />
              )}
            </div>
          );
        }

        if (field.type === 'page_break') {
          return null; // Page breaks are handled by pagination logic now
        }

        return (
          <div key={field.id} className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {field.description && (
              <div 
                className="mb-3 text-xs text-slate-500 prose prose-sm prose-slate max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0"
                dangerouslySetInnerHTML={{ __html: field.description }}
              />
            )}
            
            {renderField(field)}
            
            {errors[field.id] && (
              <p className="text-xs text-red-500 mt-1">This field is required</p>
            )}
          </div>
        );
      })}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-8">
        <div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {safeCurrentPage > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors"
            >
              Previous
            </button>
          )}
          {safeCurrentPage < visiblePages.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isTransitioning}
              className="px-6 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md transition-colors shadow-sm disabled:opacity-50"
            >
              Next
            </button>
          ) : !readOnly ? (
            <button
              type="submit"
              disabled={isTransitioning}
              className="px-6 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors shadow-sm disabled:opacity-50"
            >
              {submitLabel}
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}
