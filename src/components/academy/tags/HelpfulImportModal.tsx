import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { HelpfulImportItem } from '../../../types';
import { toast } from '../../../utils/toast';
import { db } from '../../../api/firebase';
import { doc, setDoc } from 'firebase/firestore';

interface HelpfulImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  importData?: HelpfulImportItem | null;
}

export function HelpfulImportModal({ isOpen, onClose, importData }: HelpfulImportModalProps) {
  const [formData, setFormData] = useState<Partial<HelpfulImportItem>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (importData) {
      setFormData(importData);
    } else {
      setFormData({
        action: '',
        project: '',
        solution: '',
      });
    }
  }, [importData, isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const id =
        formData.id || `import_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const docRef = doc(db, 'academy_helpful_imports', id);

      const payload: HelpfulImportItem = {
        id,
        action: formData.action || '',
        project: formData.project || '',
        solution: formData.solution || '',
      };

      await setDoc(docRef, payload);
      toast.success(importData ? 'Import updated successfully' : 'Import created successfully');
      onClose();
    } catch (e: any) {
      toast.error('Failed to save import: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {importData ? 'Edit Helpful Reference' : 'Add Helpful Reference'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Action</label>
            <input
              type="text"
              value={formData.action || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, action: e.target.value }))}
              placeholder="What are you trying to do?"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
            <input
              type="text"
              value={formData.project || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, project: e.target.value }))}
              placeholder="e.g. Floral Green"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Solution</label>
            <textarea
              value={formData.solution || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, solution: e.target.value }))}
              rows={4}
              placeholder="Describe the solution."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none resize-none"
            />
          </div>
        </div>

        <DialogFooter className="mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
