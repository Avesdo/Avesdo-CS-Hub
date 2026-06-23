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
  projectFeatures?: string[];
  onSaveProgress?: (data: Record<string, any>) => void | Promise<void>;
}

export function DynamicForm({ template, initialValues = {}, onSubmit, onCancel, onSaveProgress, submitLabel = 'Submit', readOnly = false, projectFeatures = [] }: DynamicFormProps) {
  const { register, handleSubmit, control, getValues, formState: { errors }, trigger } = useForm({
    defaultValues: initialValues
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

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

  useEffect(() => {
    if (saveStatus === 'saved') {
      setSaveStatus('idle');
    }
  }, [formValues]);

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
    } else if (condition === 'less_than_or_equals') {
      conditionMet = typeof dependentValue === 'number' && dependentValue <= Number(value);
    } else if (condition === 'greater_than_or_equals') {
      conditionMet = typeof dependentValue === 'number' && dependentValue >= Number(value);
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

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

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
            <ul className="list-disc list-inside space-y-1 mt-1.5">
              {value.map(v => (
                <li key={v} className="text-slate-900 text-[15px]">
                  {v === '__other__' ? `Other: ${otherValue || ''}` : v}
                </li>
              ))}
            </ul>
          );
        } else if (field.type === 'date') {
          displayValue = <span className="text-slate-900 text-[15px]">{new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>;
        } else if (value === '__other__') {
          displayValue = <span className="text-slate-900 text-[15px]">Other: {otherValue || ''}</span>;
        } else {
          displayValue = <span className="text-slate-900 text-[15px] break-words whitespace-pre-wrap">{value}</span>;
        }
      }

      return (
        <div className="mt-1.5 pl-1 border-l-2 border-primary/20">
          <div className="pl-3">
            {displayValue}
          </div>
        </div>
      );
    }

    switch (field.type) {
      case 'text':
        return (
          <input
            {...register(field.id, { required: field.required })}
            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-[15px] text-slate-900 placeholder:text-slate-400 shadow-sm"
            placeholder="Type your answer..."
          />
        );
      case 'long_text':
        return (
          <textarea
            {...register(field.id, { required: field.required })}
            className="w-full h-28 p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all text-[15px] text-slate-900 placeholder:text-slate-400 shadow-sm resize-y custom-thin-scroll"
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
          <div className="grid grid-cols-1 gap-2.5 mt-2">
            {(field.options || []).filter(opt => opt && opt.trim() !== '').map(opt => {
              const isSelected = formValues[field.id] === opt;
              return (
                <label key={opt} className={`relative flex items-center p-3.5 cursor-pointer rounded-xl border transition-all duration-200 group ${isSelected ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/10' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                  <input
                    type="radio"
                    value={opt}
                    {...register(field.id, { required: field.required })}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mr-3.5 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-slate-400 bg-white'}`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white animate-in zoom-in" />}
                  </div>
                  <span className={`text-[15px] leading-tight ${isSelected ? 'font-semibold text-primary' : 'font-medium text-slate-700'}`}>{opt}</span>
                </label>
              );
            })}
            {field.allowOther && (
              <label className={`relative flex items-center p-3.5 cursor-pointer rounded-xl border transition-all duration-200 group ${formValues[field.id] === '__other__' ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/10' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                <input
                  type="radio"
                  value="__other__"
                  {...register(field.id, { required: field.required })}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mr-3.5 transition-colors ${formValues[field.id] === '__other__' ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-slate-400 bg-white'}`}>
                  {formValues[field.id] === '__other__' && <div className="w-2 h-2 rounded-full bg-white animate-in zoom-in" />}
                </div>
                <span className={`text-[15px] whitespace-nowrap ${formValues[field.id] === '__other__' ? 'font-semibold text-primary' : 'font-medium text-slate-700'}`}>Other:</span>
                <input
                  type="text"
                  {...register(`${field.id}_other`, { required: field.required && formValues[field.id] === '__other__' })}
                  className={`flex-1 ml-3 bg-transparent outline-none text-[15px] font-medium placeholder:font-normal placeholder:text-slate-400 transition-colors border-b ${
                    formValues[field.id] === '__other__' ? 'border-primary text-slate-900' : 'border-slate-200 text-slate-500'
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
          <div className="grid grid-cols-1 gap-2.5 mt-2">
            {(field.options || []).filter(opt => opt && opt.trim() !== '').map(opt => {
              const isSelected = (formValues[field.id] || []).includes(opt);
              return (
                <label key={opt} className={`relative flex items-center p-3.5 cursor-pointer rounded-xl border transition-all duration-200 group ${isSelected ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/10' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                  <input
                    type="checkbox"
                    value={opt}
                    {...register(field.id, { required: field.required })}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mr-3.5 transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-slate-400 bg-white'}`}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white animate-in zoom-in" />}
                  </div>
                  <span className={`text-[15px] leading-tight ${isSelected ? 'font-semibold text-primary' : 'font-medium text-slate-700'}`}>{opt}</span>
                </label>
              );
            })}
            {field.allowOther && (
              <label className={`relative flex items-center p-3.5 cursor-pointer rounded-xl border transition-all duration-200 group ${(formValues[field.id] || []).includes('__other__') ? 'bg-primary/5 border-primary shadow-sm ring-1 ring-primary/10' : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}>
                <input
                  type="checkbox"
                  value="__other__"
                  {...register(field.id, { required: field.required })}
                  className="sr-only"
                />
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 mr-3.5 transition-colors ${(formValues[field.id] || []).includes('__other__') ? 'border-primary bg-primary' : 'border-slate-300 group-hover:border-slate-400 bg-white'}`}>
                  {(formValues[field.id] || []).includes('__other__') && <Check className="w-3.5 h-3.5 text-white animate-in zoom-in" />}
                </div>
                <span className={`text-[15px] whitespace-nowrap pt-0.5 ${(formValues[field.id] || []).includes('__other__') ? 'font-semibold text-primary' : 'font-medium text-slate-700'}`}>Other:</span>
                <input
                  type="text"
                  {...register(`${field.id}_other`, { required: field.required && (formValues[field.id] || []).includes('__other__') })}
                  className={`flex-1 ml-3 bg-transparent outline-none text-[15px] font-medium placeholder:font-normal placeholder:text-slate-400 transition-colors border-b ${
                    (formValues[field.id] || []).includes('__other__') ? 'border-primary text-slate-900' : 'border-slate-200 text-slate-500'
                  } disabled:opacity-50`}
                  placeholder="Please specify"
                  disabled={!(formValues[field.id] || []).includes('__other__')}
                />
              </label>
            )}
          </div>
        );
      case 'nps':
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            <Controller
              name={field.id}
              control={control}
              rules={{ required: field.required }}
              render={({ field: { onChange, value } }) => (
                <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-inner w-fit">
                  {[0,1,2,3,4,5,6,7,8,9,10].map((num) => {
                    const isSelected = value === num;
                    const isPast = value !== undefined && value !== null && num <= value;
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => onChange(num)}
                        className={`w-10 h-10 rounded-lg text-[15px] font-bold transition-all relative z-10 ${
                          isSelected 
                            ? 'bg-white shadow-[0_2px_10px_rgba(0,0,0,0.1)] text-primary border border-slate-200/50 scale-110 z-20' 
                            : isPast 
                              ? 'text-primary/70 hover:bg-slate-200/50 hover:text-primary'
                              : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
                        }`}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              )}
            />
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
    
    setCurrentPage(prev => Math.min(prev + 1, visiblePages.length - 1));
    setTimeout(() => setIsTransitioning(false), 300);
  };

  const handlePrev = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  const handleSaveProgressClick = async () => {
    if (!onSaveProgress) return;
    setSaveStatus('saving');
    try {
      await onSaveProgress(getValues());
      setSaveStatus('saved');
    } catch (e) {
      setSaveStatus('idle');
    }
  };

  const handleFinalSubmit = (data: any) => {
    const missingFields = template.fields.filter(field => {
       if (!isFieldVisible(field)) return false;
       if (field.required) {
         const val = data[field.id];
         return val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0);
       }
       return false;
    });

    if (missingFields.length > 0) {
       const firstMissingFieldId = missingFields[0].id;
       let pageIndex = 0;
       for (let i = 0; i < visiblePages.length; i++) {
         if (visiblePages[i].fields.some(f => f.id === firstMissingFieldId)) {
           pageIndex = i;
           break;
         }
       }
       
       if (pageIndex !== currentPage) {
         setCurrentPage(pageIndex);
         setTimeout(() => trigger(), 100); // Highlight errors on the new page
       } else {
         trigger(); // Highlight on current page just in case
       }
       
       return;
    }
    
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFinalSubmit)} className="flex flex-col h-full bg-white relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 custom-thin-scroll space-y-6">
      {visiblePages.length > 1 && (
        <div className="flex items-center gap-1.5 mb-8">
          {visiblePages.map((_, idx) => (
            <div key={idx} className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner">
              <motion.div 
                initial={false}
                animate={{ width: idx <= safeCurrentPage ? '100%' : '0%' }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="h-full bg-primary"
              />
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={safeCurrentPage}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-8"
        >
          {currentFields.map(field => {
            if (!isFieldVisible(field)) return null;

            if (field.type === 'header') {
              return (
                <div key={field.id} className="pt-2 pb-4">
                  <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{field.label}</h3>
                  {field.description && (
                    <div 
                      className="mt-3 text-[15px] leading-relaxed text-slate-500 prose prose-slate max-w-none"
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
              <div key={field.id} className="space-y-2.5">
                <label className="block text-[15px] font-bold text-slate-800 tracking-tight">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.description && (
                  <div 
                    className="mb-4 text-sm text-slate-500 prose prose-sm prose-slate max-w-none"
                    dangerouslySetInnerHTML={{ __html: field.description }}
                  />
                )}
                
                {renderField(field)}
                
                {errors[field.id] && (
                  <p className="text-[13px] font-medium text-red-500 mt-2 flex items-center gap-1.5 animate-in slide-in-from-top-1">
                    This field is required
                  </p>
                )}
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>
      </div>

      <div className="shrink-0 flex items-center justify-between p-5 sm:px-8 border-t border-slate-100 bg-white/95 backdrop-blur-md shadow-[0_-8px_30px_-15px_rgba(0,0,0,0.05)] z-10 rounded-b-2xl">
        <div>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-[14px] font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
            >
              Cancel
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onSaveProgress && !readOnly && (
            <button
              type="button"
              onClick={handleSaveProgressClick}
              disabled={isTransitioning || saveStatus === 'saving' || saveStatus === 'saved'}
              className={`flex items-center gap-2 px-5 py-2.5 text-[14px] font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50 ${
                saveStatus === 'saved'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'text-primary hover:text-primary/90 bg-primary/5 hover:bg-primary/10'
              }`}
            >
              {saveStatus === 'saving' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Progress'
              )}
            </button>
          )}
          {safeCurrentPage > 0 && (
            <button
              type="button"
              onClick={handlePrev}
              className="px-5 py-2.5 text-[14px] font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all shadow-sm hover:-translate-y-0.5"
            >
              Previous
            </button>
          )}
          {safeCurrentPage < visiblePages.length - 1 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={isTransitioning}
              className="px-6 py-2.5 text-[14px] font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(14,165,233,0.2)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              Next
            </button>
          ) : !readOnly ? (
            <div className="flex items-center gap-3">
              {Object.keys(errors).length > 0 && (
                <span className="text-red-500 text-[13px] font-semibold bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                  Please complete required fields
                </span>
              )}
              <button
              type="submit"
              disabled={isTransitioning}
              className="px-6 py-2.5 text-[14px] font-bold text-white bg-primary hover:bg-primary/90 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(14,165,233,0.2)] hover:shadow-[0_6px_20px_rgba(14,165,233,0.3)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {submitLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </form>
  );
}
