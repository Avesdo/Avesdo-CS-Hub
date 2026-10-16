import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { TagItem } from '../../../types';
import { toast } from '../../../utils/toast';
import { db } from '../../../api/firebase';
import { doc, setDoc, writeBatch } from 'firebase/firestore';
import { useAppStore } from '../../../store/useAppStore';
import { MultiSelect } from '../../ui/MultiSelect';

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tagData?: TagItem | null;
  defaultCategory?: string;
}

export function TagModal({ isOpen, onClose, tagData }: TagModalProps) {
  const [formData, setFormData] = useState<Partial<TagItem>>({});
  const tags = useAppStore((state) => state.tags || []);
  const settings = useAppStore((state) => state.settings);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract unique categories from both existing tags and settings.academyCategoryOrder
  const categories = useMemo(() => {
    const categorySet = new Set<string>();

    // 1. All categories from existing tags
    tags.forEach((t) => {
      const catList = Array.isArray(t.category) ? t.category : [t.category];
      catList.forEach((c) => {
        if (c && typeof c === 'string') {
          const trimmed = c.trim();
          if (trimmed) categorySet.add(trimmed);
        }
      });
    });

    // 2. All combinations from settings.academyCategoryOrder
    const configuredCategories = settings?.academyCategoryOrder || [];
    configuredCategories.forEach((cfg) => {
      const primary = cfg.primary?.trim();
      if (!primary) return;

      const subCategories = cfg.subCategories || [];
      if (subCategories.length === 0) {
        categorySet.add(`${primary} - General`);
      } else {
        subCategories.forEach((sub) => {
          const subTrimmed = sub?.trim() || 'General';
          categorySet.add(`${primary} - ${subTrimmed}`);
        });
      }
    });

    return Array.from(categorySet).sort();
  }, [tags, settings]);

  useEffect(() => {
    if (tagData) {
      setFormData(tagData);
    } else {
      setFormData({
        tag: '',
        description: '',
        example: '',
        category: [],
        isUnavailable: false,
        unavailableReason: '',
      });
    }
  }, [tagData, isOpen]);

  const handleSubmit = async () => {
    const selectedCategories = (
      Array.isArray(formData.category)
        ? formData.category
        : formData.category
          ? [formData.category]
          : []
    )
      .map((c) => (typeof c === 'string' ? c.trim() : ''))
      .filter(Boolean);

    if (!formData.tag || !formData.description || selectedCategories.length === 0) {
      toast.error('Please fill in all required fields (Tag, Description, Category)');
      return;
    }

    setIsSubmitting(true);
    try {
      const sortedTags = [...tags].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const maxOrder = sortedTags.reduce(
        (max, t, idx) => Math.max(max, typeof t.order === 'number' ? t.order : idx),
        -1
      );
      let nextOrder = maxOrder + 1;

      const existingId = tagData?.id || formData.id;
      const existingSortedIdx = existingId ? sortedTags.findIndex((t) => t.id === existingId) : -1;
      const preservedOrder =
        typeof tagData?.order === 'number'
          ? tagData.order
          : typeof formData.order === 'number'
            ? formData.order
            : existingSortedIdx !== -1
              ? existingSortedIdx
              : undefined;

      if (selectedCategories.length === 1) {
        const id = existingId || `tag_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const docRef = doc(db, 'academy_tags', id);

        const payload: TagItem = {
          id,
          tag: formData.tag,
          description: formData.description,
          example: formData.example || '',
          category: [selectedCategories[0]],
          order: existingId && typeof preservedOrder === 'number' ? preservedOrder : nextOrder++,
          isUnavailable: Boolean(formData.isUnavailable),
          unavailableReason: formData.isUnavailable
            ? (formData.unavailableReason || '').trim()
            : '',
        };

        await setDoc(docRef, payload);
        toast.success(tagData ? 'Tag updated successfully' : 'Tag created successfully');
      } else {
        const batch = writeBatch(db);

        selectedCategories.forEach((cat, idx) => {
          const isPrimaryExisting = idx === 0 && Boolean(existingId);
          const id = isPrimaryExisting
            ? (existingId as string)
            : `tag_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 9)}`;

          const payload: TagItem = {
            id,
            tag: formData.tag!,
            description: formData.description!,
            example: formData.example || '',
            category: [cat],
            order:
              isPrimaryExisting && typeof preservedOrder === 'number'
                ? preservedOrder
                : nextOrder++,
            isUnavailable: Boolean(formData.isUnavailable),
            unavailableReason: formData.isUnavailable
              ? (formData.unavailableReason || '').trim()
              : '',
          };

          batch.set(doc(db, 'academy_tags', id), payload);
        });

        await batch.commit();
        toast.success(
          tagData
            ? `Tag updated and duplicated into ${selectedCategories.length} independent categories`
            : `Created ${selectedCategories.length} independent tags across selected categories`
        );
      }

      onClose();
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast.error('Failed to save tag: ' + message);
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

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(formData.isUnavailable)}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isUnavailable: e.target.checked }))
                }
                className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500/20 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700">
                Mark as Unavailable (Do Not Use)
              </span>
            </label>

            {formData.isUnavailable && (
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Warning Note / Reason (Optional)
                </label>
                <input
                  type="text"
                  value={formData.unavailableReason || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, unavailableReason: e.target.value }))
                  }
                  placeholder="e.g. Not working as intended — use [other_tag] instead"
                  className="w-full border border-red-200 bg-red-50/30 rounded-lg px-3 py-2 text-sm focus:border-red-400 outline-none"
                />
              </div>
            )}
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
