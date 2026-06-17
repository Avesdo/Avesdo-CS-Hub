import React, { useState } from 'react';
import { X, ChevronDown, ChevronRight, Save, CheckCircle } from 'lucide-react';
import { updateProjectRecord } from '../../api/dbService';

interface SecondaryQAModalProps {
  project: any;
  onClose: () => void;
}

const QA_SECTIONS = [
  { id: 's1', title: 'Section 1: Dashboard' },
  { id: 's2', title: 'Section 2: Documents' },
  { id: 's3', title: 'Section 3: Listing Details' },
  { id: 's4', title: 'Section 4: Marketing Assets' },
  { id: 's5', title: 'Section 5: Price Model' },
  { id: 's6', title: 'Section 6: Options' },
  { id: 's7', title: 'Section 7: New Deal Setup' },
  { id: 's8', title: 'Section 8: Deal Flow' },
  { id: 's9', title: 'Section 9: Project Settings' },
  { id: 's10', title: 'Section 10: General Tagging' },
  { id: 's11', title: 'Section 11: Staff Management' },
  { id: 's12', title: 'Section 12: OffPlan' },
  { id: 's13', title: 'Section 13: Asana' },
];

export default function SecondaryQAModal({ project, onClose }: SecondaryQAModalProps) {
  const [expandedSection, setExpandedSection] = useState<string>('s1');
  const [formData, setFormData] = useState<any>(project?.onboarding?.secondaryQA || {});
  const [isSaving, setIsSaving] = useState(false);

  const toggleSection = (id: string) => {
    setExpandedSection(expandedSection === id ? '' : id);
  };

  const handleSave = async (isSubmit: boolean = false) => {
    setIsSaving(true);
    try {
      const updatedOnboarding = {
        ...project.onboarding,
        secondaryQA: formData,
      };
      await updateProjectRecord({ ...project, onboarding: updatedOnboarding }, {
        successMsg: isSubmit ? 'Secondary QA submitted successfully.' : 'Secondary QA progress saved.',
        errorMsg: 'Failed to save Secondary QA.',
      });
      if (isSubmit) onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-100 flex flex-col animate-in fade-in zoom-in-95 duration-200">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Secondary QA</h2>
          <p className="text-sm text-slate-500">Project: {project?.name || 'Unknown'}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Progress
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-sm"
          >
            <CheckCircle className="w-4 h-4" /> Submit QA
          </button>
          <div className="w-px h-6 bg-slate-200 mx-2"></div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-10">
        <div className="max-w-4xl mx-auto space-y-4">
          
          <div className="bg-purple-50 text-purple-800 p-4 rounded-xl border border-purple-200 mb-8 text-sm">
            <strong>Instructions:</strong> This is the final internal review step. Please ensure all items flagged during the Client QA have been addressed. Click "Submit QA" to record the results and move the project to Final Certification.
          </div>

          {QA_SECTIONS.map((section) => {
            const isExpanded = expandedSection === section.id;
            return (
              <div key={section.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
                >
                  <span className="font-bold text-slate-800">{section.title}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                
                {isExpanded && (
                  <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <div className="space-y-6">
                      {/* Placeholder Question UI - Will be dynamically driven in Stage 2 */}
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Has this section been fully verified?
                        </label>
                        <select 
                          className="w-full max-w-xs px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                          value={formData[`${section.id}_verified`] || ''}
                          onChange={(e) => setFormData({...formData, [`${section.id}_verified`]: e.target.value})}
                        >
                          <option value="">Select answer...</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                          <option value="N/A">N/A</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Final verification notes
                        </label>
                        <textarea 
                          rows={3}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-y"
                          placeholder="Enter final verification notes here..."
                          value={formData[`${section.id}_notes`] || ''}
                          onChange={(e) => setFormData({...formData, [`${section.id}_notes`]: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
