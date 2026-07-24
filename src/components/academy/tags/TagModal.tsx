import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { TagItem } from '../../../types';
import { toast } from '../../../utils/toast';
import { db } from '../../../api/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useAppStore } from '../../../store/useAppStore';
import { MultiSelect } from '../../ui/MultiSelect';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tagData?: TagItem | null;
}

export function TagModal({ isOpen, onClose, tagData }: TagModalProps) {
  const [formData, setFormData] = useState<Partial<TagItem>>({});
  const tags = useAppStore((state) => state.tags || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique categories from existing tags for the dropdown
  const categories = Array.from(
    new Set(
      tags
        .flatMap((t) => (Array.isArray(t.category) ? t.category : [t.category]))
        .filter(Boolean) as string[]
    )
  ).sort();

  useEffect(() => {
    if (tagData) {
      setFormData(tagData);
    } else {
      setFormData({
        tag: '',
        description: '',
        example: '',
        category: categories.length > 0 ? [categories[0]] : ['Deal Participants - General'],
      });
    }
  }, [tagData, isOpen]);

  const handleSubmit = async () => {
    if (
      !formData.tag ||
      !formData.description ||
      !formData.category ||
      (Array.isArray(formData.category) && formData.category.length === 0)
    ) {
      toast.error('Please fill in all required fields (Tag, Description, Category)');
      return;
    }

    setIsSubmitting(true);
    try {
      const id = formData.id || `tag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const docRef = doc(db, 'academy_tags', id);

      const payload: TagItem = {
        id,
        tag: formData.tag,
        description: formData.description,
        example: formData.example || '',
        category: formData.category,
      };

      await setDoc(docRef, payload);
      toast.success(tagData ? 'Tag updated successfully' : 'Tag created successfully');
      onClose();
    } catch (e: any) {
      toast.error('Failed to save tag: ' + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{tagData ? 'Edit Tag' : 'Add New Tag'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <MultiSelect
              options={categories}
              values={
                Array.isArray(formData.category)
                  ? formData.category
                  : formData.category
                    ? [formData.category as string]
                    : []
              }
              onChange={(vals) => setFormData((prev) => ({ ...prev, category: vals }))}
              searchable
              searchPlaceholder="Search categories..."
              placeholder="Select categories"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Tag <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.tag || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, tag: e.target.value }))}
              placeholder="e.g. [c1]"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Describe what this tag represents..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Example Output (Optional)
            </label>
            <input
              type="text"
              value={formData.example || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, example: e.target.value }))}
              placeholder="e.g. ContractName"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
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
            {isSubmitting ? 'Saving...' : 'Save Tag'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
