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
  ChevronDown,
  Eye,
  X,
  LayoutTemplate,
  Edit2,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { Select } from '../ui/Select';
import { MultiSelect } from '../ui/MultiSelect';
import { RichTextEditor } from '../ui/RichTextEditor';
import { DynamicForm } from '../ui/DynamicForm';
import { FormBuilder } from './form-builder/FormBuilder';
import { ChecklistBuilder } from './checklist-builder/ChecklistBuilder';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';

export type FieldType =
  | 'text'
  | 'long_text'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'date'
  | 'number'
  | 'header'
  | 'page_break'
  | 'nps';

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
    condition:
      | 'equals'
      | 'not_equals'
      | 'is_any_of'
      | 'is_not_any_of'
      | 'is_answered'
      | 'is_not_answered'
      | 'less_than_or_equals'
      | 'greater_than_or_equals';
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
  defaultPriority?: string;
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
    title: 'Formatting',
    items: [
      { type: 'page_break', label: 'Page', icon: FileBox },
      { type: 'header', label: 'Header', icon: Heading1 },
    ],
  },
  {
    title: 'Questions',
    items: [
      { type: 'text', label: 'Single-line text', icon: Type },
      { type: 'long_text', label: 'Multi-line text', icon: AlignLeft },
      { type: 'select', label: 'Dropdown', icon: ChevronDownSquare },
      { type: 'checkbox', label: 'Checkboxes', icon: CheckboxIcon },
      { type: 'radio', label: 'Multiple choice', icon: List },
      { type: 'date', label: 'Date', icon: Calendar },
      { type: 'number', label: 'Number', icon: Hash },
      { type: 'nps', label: 'NPS Scale (0-10)', icon: Hash },
    ],
  },
];

import { usePermissions } from '../../hooks/usePermissions';

// ---- Main Template Designer ----
export default function TemplateDesigner() {
  const settings = useAppStore((state) => state.settings);
  const features = settings?.features || [];
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission('edit_form_templates');
  const [activeTemplateId, setActiveTemplateId] = useState<string | null>(null);

  const defaultTemplates: Record<string, Template> = {
    deliverables: {
      id: 'deliverables',
      name: 'Deliverables Checklist',
      type: 'checklist',
      fields: [],
      sections: [],
    },
    onboardingSurvey: {
      id: 'onboardingSurvey',
      name: 'Onboarding Survey',
      type: 'form',
      fields: [],
    },
    primaryQA: { id: 'primaryQA', name: 'Primary QA', type: 'form', fields: [] },
    clientQA: { id: 'clientQA', name: 'Client QA', type: 'form', fields: [] },
    secondaryQA: { id: 'secondaryQA', name: 'Secondary QA', type: 'form', fields: [] },
    certification: { id: 'certification', name: 'Project Certification', type: 'form', fields: [] },
    onboardingCsat: { id: 'onboardingCsat', name: 'Onboarding CSAT', type: 'form', fields: [] },
  };

  const templates: Record<string, Template> = settings?.templates || defaultTemplates;
  const templateOrder = [
    'deliverables',
    'onboardingSurvey',
    'primaryQA',
    'clientQA',
    'secondaryQA',
    'certification',
    'onboardingCsat',
  ];
  const sortedTemplates = templateOrder
    .map((id) => templates[id] || defaultTemplates[id])
    .filter(Boolean);

  const activeTemplate = activeTemplateId
    ? templates[activeTemplateId] || defaultTemplates[activeTemplateId]
    : null;
  const [fields, setFields] = useState<FormField[]>(activeTemplate?.fields || []);
  const [sections, setSections] = useState<ChecklistSection[]>(activeTemplate?.sections || []);
  const [showPreview, setShowPreview] = useState(false);

  const hasUnsavedChanges = React.useMemo(() => {
    if (!activeTemplate) return false;
    return (
      JSON.stringify(fields) !== JSON.stringify(activeTemplate.fields || []) ||
      JSON.stringify(sections) !== JSON.stringify(activeTemplate.sections || [])
    );
  }, [fields, sections, activeTemplate]);

  const hasLoadedSettingsRef = React.useRef(false);
  const currentTabRef = React.useRef(activeTemplateId);

  React.useEffect(() => {
    if (currentTabRef.current !== activeTemplateId) {
      if (activeTemplateId) {
        setFields(
          templates[activeTemplateId]?.fields || defaultTemplates[activeTemplateId]?.fields || []
        );
        setSections(
          templates[activeTemplateId]?.sections ||
            defaultTemplates[activeTemplateId]?.sections ||
            []
        );
      }
      currentTabRef.current = activeTemplateId;
    } else if (!hasLoadedSettingsRef.current && settings?.templates) {
      if (activeTemplateId) {
        setFields(
          templates[activeTemplateId]?.fields || defaultTemplates[activeTemplateId]?.fields || []
        );
        setSections(
          templates[activeTemplateId]?.sections ||
            defaultTemplates[activeTemplateId]?.sections ||
            []
        );
      }
      hasLoadedSettingsRef.current = true;
    }
  }, [activeTemplateId, settings?.templates, templates]);

  const handleSave = async () => {
    if (!activeTemplateId || !activeTemplate) return;
    try {
      await saveSettings(
        {
          ...settings,
          templates: { ...templates, [activeTemplateId]: { ...activeTemplate, fields, sections } },
        } as any,
        { silent: true }
      );
      toast.success(`${activeTemplate.name} template saved successfully`);
    } catch (e) {
      toast.error('Failed to save template');
    }
  };

  if (activeTemplateId === null) {
    return (
      <div className="flex flex-col h-full w-full bg-white overflow-hidden min-h-0">
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-10 pt-8 pb-6 border-b border-transparent shrink-0">
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight mb-1">
            Form Templates
          </h1>
          <p className="text-slate-500 text-[15px]">
            Build and manage all dynamic checklist and form templates used across projects.
          </p>
        </div>
        <div className="px-10 pb-10 flex-1 overflow-y-auto custom-thin-scroll">
          <div className="max-w-4xl space-y-12 animate-in fade-in duration-300">
            <div className="mb-10 max-w-3xl pt-2">
              <div className="bg-white border border-border rounded-xl shadow-sm">
                <div className="divide-y divide-border relative list-none m-0 p-0">
                  {sortedTemplates.map((tpl, i) => (
                    <div
                      key={tpl.id}
                      onClick={() => setActiveTemplateId(tpl.id)}
                      className={`p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer group relative z-10 ${i === 0 ? 'rounded-t-xl' : ''} ${i === sortedTemplates.length - 1 ? 'rounded-b-xl' : ''}`}
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                          {tpl.type === 'checklist' ? (
                            <CheckSquare className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          {tpl.name}
                        </div>
                      </div>
                      {canEdit && (
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1.5 h-7 px-3 text-xs shadow-sm"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activeTemplate) return null;

  return (
    <div className="flex flex-col h-full w-full bg-white animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
      {/* Top Header - Glassmorphic Toolbar */}
      <div className="shrink-0 px-8 py-4 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl z-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTemplateId(null)}
            className="rounded-full text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${activeTemplate.type === 'checklist' ? 'bg-cyan-100/50 text-cyan-600' : 'bg-indigo-100/50 text-indigo-600'}`}
            >
              {activeTemplate.type === 'checklist' ? (
                <CheckSquare className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">
              {activeTemplate.name}
            </h3>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {hasUnsavedChanges && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md border bg-amber-50 text-amber-600 border-amber-200/50 hidden sm:flex">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-xs font-semibold">Unsaved changes</span>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => setShowPreview(true)}
            className="flex items-center gap-2 shadow-sm"
          >
            <Eye className="w-4 h-4" /> Preview
          </Button>
          {canEdit && (
            <Button
              onClick={handleSave}
              className="flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Save className="w-4 h-4" /> Save
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden bg-white">
        {activeTemplate.type === 'checklist' ? (
          <ChecklistBuilder sections={sections} setSections={setSections} features={features} />
        ) : (
          <FormBuilder fields={fields} setFields={setFields} features={features} />
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-50 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-white border-b border-slate-200 px-5 py-3 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Preview: {activeTemplate?.name}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(false)}
                className="rounded-full text-slate-400"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto custom-thin-scroll p-6 flex justify-center bg-[#fcfcff]">
              {activeTemplate?.type === 'form' ? (
                <div className="w-full max-w-3xl bg-white md:rounded-2xl md:shadow-lg md:border border-slate-200/60 overflow-hidden flex flex-col min-h-full">
                  <DynamicForm
                    template={{ ...activeTemplate, fields } as any}
                    initialValues={{}}
                    onSubmit={() => {
                      toast.success('Preview submitted successfully');
                      setShowPreview(false);
                    }}
                    onCancel={() => setShowPreview(false)}
                    submitLabel="Submit Preview"
                    projectFeatures={['CRM', 'Inventory', 'Contracts']}
                  />
                </div>
              ) : (
                <div className="w-full max-w-3xl bg-white md:rounded-2xl md:shadow-lg md:border border-slate-200/60 p-8 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <CheckSquare className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">Checklist Preview</h3>
                  <p className="text-slate-500 max-w-md">
                    Checklist preview is currently handled in the Deliverables grid of a project.
                    Please preview your dynamic checklist templates from a live project.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
