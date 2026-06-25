import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileText, Edit2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import DeliverablesGrid from '../ui/DeliverablesGrid';
import { updateProjectRecord } from '../../api/dbService';
import { exportFormToCSV } from '../../utils/exportUtils';

interface DeliverablesModalProps {
  project: any;
  template: any;
  onClose: () => void;
}

export default function DeliverablesModal({ project, template, onClose }: DeliverablesModalProps) {
  const [deliverablesState, setDeliverablesState] = useState<Record<string, any>>(
    project?.deliverables || {}
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleFieldChange = (itemId: string, field: string, value: any) => {
    if (field === 'replace') {
      setDeliverablesState(prev => ({
        ...prev,
        [itemId]: value
      }));
      return;
    }

    setDeliverablesState(prev => ({
      ...prev,
      [itemId]: {
        ...(prev[itemId] || {}),
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProjectRecord({ ...project, deliverables: deliverablesState }, {
        successMsg: 'Deliverables saved successfully!',
        errorMsg: 'Failed to save deliverables.'
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 sm:p-6">
      {/* Subtle backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[95vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
               <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold text-slate-900 tracking-tight">Deliverables Checklist</h2>
              <p className="text-[13px] text-slate-500 mt-0.5 font-medium">{project.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 custom-thin-scroll">
           <DeliverablesGrid
              template={template}
              project={project}
              values={deliverablesState}
              onChange={handleFieldChange}
           />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            {Object.keys(deliverablesState).length > 0 && (
              <button
                onClick={() => exportFormToCSV('Deliverables Checklist', project, deliverablesState)}
                className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
              >
                <FileText className="w-4 h-4" />
                Download CSV
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-lg text-[13px] font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
