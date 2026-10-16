import React from 'react';
import { TagItem } from '../../../types';
import { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

export interface CategoryLayoutState {
  primaryOrder: string[];
  subOrderMap: Record<string, string[]>;
  primaryDescriptions: Record<string, string>;
  subDescriptionsMap: Record<string, Record<string, string>>;
  initialCollapsed: Record<string, boolean>;
  tagCountsByPrimary: Record<string, number>;
  tagCountsBySub: Record<string, Record<string, number>>;
}

export type CategoryRenameOp =
  | { type: 'primary'; from: string; to: string }
  | { type: 'sub'; primary: string; from: string; to: string };

export function computeCategoryHierarchy(
  tags: TagItem[],
  savedConfig?: {
    primary: string;
    description?: string;
    subCategories: string[];
    subCategoryDescriptions?: Record<string, string>;
  }[]
): CategoryLayoutState {
  const tagCountsByPrimary: Record<string, number> = {};
  const tagCountsBySub: Record<string, Record<string, number>> = {};
  const rawPrimaries = new Set<string>();
  const rawSubs: Record<string, Set<string>> = {};

  tags.forEach((tag) => {
    const categories = Array.isArray(tag.category) ? tag.category : [tag.category];
    const tagPrimarySet = new Set<string>();
    const tagSubSet = new Set<string>();

    categories.forEach((cat) => {
      if (!cat || !cat.trim()) return;
      const parts = cat.split(' - ').map((part) => part.trim());
      const p = parts[0] || 'General';
      const s = parts[1] && parts[1].trim() ? parts[1].trim() : undefined;
      rawPrimaries.add(p);
      tagPrimarySet.add(p);

      if (s) {
        if (!rawSubs[p]) rawSubs[p] = new Set();
        rawSubs[p].add(s);
        tagSubSet.add(`${p}:::${s}`);
      }
    });

    tagPrimarySet.forEach((p) => {
      tagCountsByPrimary[p] = (tagCountsByPrimary[p] || 0) + 1;
    });

    tagSubSet.forEach((combo) => {
      const [p, s] = combo.split(':::');
      if (!tagCountsBySub[p]) tagCountsBySub[p] = {};
      tagCountsBySub[p][s] = (tagCountsBySub[p][s] || 0) + 1;
    });
  });

  const config = savedConfig || [];
  const savedPrimaries = config.map((c) => c.primary).filter(Boolean);
  const primaryOrder = Array.from(new Set([...savedPrimaries, ...rawPrimaries]));
  const subOrderMap: Record<string, string[]> = {};
  const primaryDescriptions: Record<string, string> = {};
  const subDescriptionsMap: Record<string, Record<string, string>> = {};
  const initialCollapsed: Record<string, boolean> = {};

  primaryOrder.forEach((p) => {
    const entry = config.find((c) => c.primary === p);
    const savedSubs = entry?.subCategories || [];
    const rawS = rawSubs[p] ? Array.from(rawSubs[p]) : [];
    const finalSubs = Array.from(new Set([...savedSubs, ...rawS]));
    subOrderMap[p] = finalSubs;
    if (entry?.description?.trim()) {
      primaryDescriptions[p] = entry.description.trim();
    }
    if (entry?.subCategoryDescriptions) {
      const subDescs: Record<string, string> = {};
      Object.entries(entry.subCategoryDescriptions).forEach(([k, v]) => {
        if (v && v.trim()) {
          subDescs[k] = v.trim();
        }
      });
      if (Object.keys(subDescs).length > 0) {
        subDescriptionsMap[p] = subDescs;
      }
    }
    initialCollapsed[p] = true;
  });

  return {
    primaryOrder,
    subOrderMap,
    primaryDescriptions,
    subDescriptionsMap,
    initialCollapsed,
    tagCountsByPrimary,
    tagCountsBySub,
  };
}

export function handleReorderDragEnd(
  event: DragEndEvent,
  setPrimaryOrder: React.Dispatch<React.SetStateAction<string[]>>,
  setSubOrderMap: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
) {
  const { active, over } = event;
  if (!over || active.id === over.id) return;
  const activeId = active.id as string;
  const overId = over.id as string;

  if (activeId.startsWith('primary::') && overId.startsWith('primary::')) {
    const from = activeId.replace('primary::', '');
    const to = overId.replace('primary::', '');
    setPrimaryOrder((items) => arrayMove(items, items.indexOf(from), items.indexOf(to)));
    return;
  }

  if (activeId.startsWith('sub::') && overId.startsWith('sub::')) {
    const [, fromP, fromS] = activeId.split('::');
    const [, toP, toS] = overId.split('::');
    if (fromP === toP) {
      setSubOrderMap((prev) => ({
        ...prev,
        [fromP]: arrayMove(
          prev[fromP] || [],
          (prev[fromP] || []).indexOf(fromS),
          (prev[fromP] || []).indexOf(toS)
        ),
      }));
    }
  }
}

export function buildCategoryConfig(
  primaryOrder: string[],
  subOrderMap: Record<string, string[]>,
  primaryDescriptions?: Record<string, string>,
  subDescriptionsMap?: Record<string, Record<string, string>>
) {
  return primaryOrder.map((p) => {
    const primaryDesc = primaryDescriptions?.[p]?.trim();
    const rawSubDescs = subDescriptionsMap?.[p] || {};
    const validSubs = new Set(subOrderMap[p] || []);
    const cleanedSubDescs: Record<string, string> = {};
    Object.entries(rawSubDescs).forEach(([subKey, desc]) => {
      if (validSubs.has(subKey) && desc && desc.trim()) {
        cleanedSubDescs[subKey] = desc.trim();
      }
    });

    return {
      primary: p,
      ...(primaryDesc ? { description: primaryDesc } : {}),
      subCategories: subOrderMap[p] || [],
      ...(Object.keys(cleanedSubDescs).length > 0
        ? { subCategoryDescriptions: cleanedSubDescs }
        : {}),
    };
  });
}

export function applyCategoryRenamesToTags(
  tags: TagItem[],
  renames: CategoryRenameOp[]
): { updatedTags: TagItem[]; changedTags: TagItem[] } {
  if (renames.length === 0) {
    return { updatedTags: tags, changedTags: [] };
  }

  const changedTags: TagItem[] = [];
  const updatedTags = tags.map((tag) => {
    const originalCats = Array.isArray(tag.category) ? tag.category : [tag.category];
    let currentCats = [...originalCats];

    renames.forEach((op) => {
      currentCats = currentCats.map((cat) => {
        if (!cat || typeof cat !== 'string') return cat;
        const parts = cat.split(' - ').map((part) => part.trim());
        if (op.type === 'primary') {
          if (parts[0] === op.from) {
            parts[0] = op.to;
            return parts.join(' - ');
          }
        } else if (op.type === 'sub') {
          if (parts[0] === op.primary && parts[1] === op.from) {
            parts[1] = op.to;
            return parts.join(' - ');
          }
        }
        return cat;
      });
    });

    const hasChanged = currentCats.some((c, idx) => c !== originalCats[idx]);
    if (hasChanged) {
      const updatedTag: TagItem = {
        ...tag,
        category: Array.isArray(tag.category) ? currentCats : currentCats[0],
      };
      changedTags.push(updatedTag);
      return updatedTag;
    }

    return tag;
  });

  return { updatedTags, changedTags };
}
