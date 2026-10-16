import React, { useState, useMemo, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Search, ChevronRight, Plus } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { db } from '../../../api/firebase';
import { doc, writeBatch, deleteDoc } from 'firebase/firestore';
import { toast } from '../../../utils/toast';
import { useAppStore } from '../../../store/useAppStore';
import { usePermissions } from '../../../hooks/usePermissions';
import { TagModal } from './TagModal';
import { HelpfulImportModal } from './HelpfulImportModal';
import { CategoryManagerModal } from './CategoryManagerModal';
import { Select } from '../../ui/Select';
import { TagItem, HelpfulImportItem } from '../../../types';
import { participantPrefixes, allParticipants } from './tagDictionaryConstants';
import { SortableTagRow } from './SortableTagRow';
import { SortableHelpfulImportRow } from './SortableHelpfulImportRow';

export function TagDictionaryTab() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const tags = useAppStore((state) => state.tags || []);
  const helpfulImports = useAppStore((state) => state.helpfulImports || []);
  const sortedHelpfulImports = [...helpfulImports].sort((a, b) => (a.order || 0) - (b.order || 0));
  const settings = useAppStore((state) => state.settings);
  const { hasPermission } = usePermissions();

  const canEditTags = hasPermission('edit_tags');
  const canDeleteTags = hasPermission('delete_tags');
  const canEditImports = hasPermission('edit_helpful_imports');
  const canDeleteImports = hasPermission('delete_helpful_imports');

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePrimaryCategory, setActivePrimaryCategory] = useState<string>('All');

  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingImport, setEditingImport] = useState<HelpfulImportItem | null>(null);

  const [isCategoryManagerOpen, setIsCategoryManagerOpen] = useState(false);

  const handleDeleteTag = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tag?')) return;
    try {
      await deleteDoc(doc(db, 'academy_tags', id));
      toast.success('Tag deleted');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast.error('Failed to delete tag: ' + message);
    }
  };

  const handleDeleteImport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this import?')) return;
    try {
      await deleteDoc(doc(db, 'academy_helpful_imports', id));
      toast.success('Import deleted');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast.error('Failed to delete import: ' + message);
    }
  };

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activePrimaryCategory]);
  const [activePrefixes, setActivePrefixes] = useState<Record<string, string>>({
    Purchasers: 'c1',
    Realtors: 'r1',
    'Sales Rep': 's1',
    Developers: 'd1',
    Assignors: 'FromAssignor1',
    'Assignees (Form Selection)': 'FromAssignee1',
    'Assignees (Deal Participants)': 'o1',
    'Purchaser or Assignee Swap': 'co1',
    'Managing Broker': 'ps-managing broker',
    Guarantors: 'ps-guarantor',
    Transferor: 'ps-transferor',
  });
  const [dynamicReplacements, setDynamicReplacements] = useState<Record<string, string>>({});
  const hasSeededParticipantTagsRef = useRef(false);

  useEffect(() => {
    if (hasSeededParticipantTagsRef.current || !canEditTags || tags.length === 0) return;

    const hasCat = (t: TagItem, target: string) => {
      const cats = Array.isArray(t.category) ? t.category : [t.category];
      return cats.some(
        (c) => typeof c === 'string' && c.trim().toLowerCase() === target.toLowerCase()
      );
    };

    const purchaserTags = tags
      .filter((t) => hasCat(t, 'Deal Participants - Purchasers'))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    const purchaserWitnessTags = tags
      .filter((t) => hasCat(t, 'Deal Participants - Purchasers - Witnesses'))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    if (purchaserTags.length === 0 && purchaserWitnessTags.length === 0) return;

    const existingSwapTags = tags.filter(
      (t) =>
        hasCat(t, 'Deal Participants - Purchaser or Assignee Swap') ||
        hasCat(t, 'Deal Participants - Purchaser or Assignee Swap - Witnesses')
    );

    const legacyAssigneeTags = tags.filter(
      (t) =>
        hasCat(t, 'Deal Participants - Assignees') ||
        hasCat(t, 'Deal Participants - Assignees - Witnesses')
    );

    const existingAssigneeDpTags = tags.filter(
      (t) =>
        hasCat(t, 'Deal Participants - Assignees (Deal Participants)') ||
        hasCat(t, 'Deal Participants - Assignees (Deal Participants) - Witnesses')
    );

    const dpCategoryConfig = settings?.academyCategoryOrder?.find(
      (c) => c.primary === 'Deal Participants'
    );
    const needsCategoryOrderUpdate =
      dpCategoryConfig &&
      (dpCategoryConfig.subCategories.includes('Assignees') ||
        dpCategoryConfig.subCategories.includes('Assignees (Deal participants)') ||
        !dpCategoryConfig.subCategories.includes('Assignees (Form Selection)') ||
        !dpCategoryConfig.subCategories.includes('Assignees (Deal Participants)'));

    if (
      existingSwapTags.length > 0 &&
      legacyAssigneeTags.length === 0 &&
      existingAssigneeDpTags.length > 0 &&
      !needsCategoryOrderUpdate
    ) {
      hasSeededParticipantTagsRef.current = true;
      return;
    }

    hasSeededParticipantTagsRef.current = true;

    const batch = writeBatch(db);
    const maxOrder = tags.reduce((max, t) => Math.max(max, t.order || 0), 0);
    let nextOrder = maxOrder + 1;

    // 1. Seed Purchaser or Assignee Swap if empty
    if (existingSwapTags.length === 0) {
      const clonedSwapTags: TagItem[] = [
        ...purchaserTags.map((t) => ({
          id: `tag_swap_${t.id}`,
          tag: t.tag,
          description: t.description,
          example: t.example || '',
          category: ['Deal Participants - Purchaser or Assignee Swap'],
          order: nextOrder++,
        })),
        ...purchaserWitnessTags.map((t) => ({
          id: `tag_swap_${t.id}`,
          tag: t.tag,
          description: t.description,
          example: t.example || '',
          category: ['Deal Participants - Purchaser or Assignee Swap - Witnesses'],
          order: nextOrder++,
        })),
      ];
      clonedSwapTags.forEach((newTag) => {
        batch.set(doc(db, 'academy_tags', newTag.id), newTag);
      });
    }

    // 2. Migrate legacy "Deal Participants - Assignees" -> "Deal Participants - Assignees (Form Selection)"
    if (legacyAssigneeTags.length > 0) {
      legacyAssigneeTags.forEach((t) => {
        const cats = Array.isArray(t.category) ? t.category : [t.category];
        const updatedCats = cats.map((c) => {
          const trimmed = (c || '').trim();
          if (trimmed === 'Deal Participants - Assignees') {
            return 'Deal Participants - Assignees (Form Selection)';
          }
          if (trimmed === 'Deal Participants - Assignees - Witnesses') {
            return 'Deal Participants - Assignees (Form Selection) - Witnesses';
          }
          return c;
        });
        batch.update(doc(db, 'academy_tags', t.id), { category: updatedCats });
      });
    }

    // 3. Seed "Deal Participants - Assignees (Deal Participants)" from Purchasers if empty
    if (existingAssigneeDpTags.length === 0) {
      const clonedAssigneeDpTags: TagItem[] = [
        ...purchaserTags.map((t) => ({
          id: `tag_assignee_dp_${t.id}`,
          tag: t.tag,
          description: t.description.replace(/Purchaser's/g, "Assignee's"),
          example: t.example || '',
          category: ['Deal Participants - Assignees (Deal Participants)'],
          order: nextOrder++,
        })),
        ...purchaserWitnessTags.map((t) => ({
          id: `tag_assignee_dp_${t.id}`,
          tag: t.tag,
          description: t.description.replace(/Purchaser's/g, "Assignee's"),
          example: t.example || '',
          category: ['Deal Participants - Assignees (Deal Participants) - Witnesses'],
          order: nextOrder++,
        })),
      ];
      clonedAssigneeDpTags.forEach((newTag) => {
        batch.set(doc(db, 'academy_tags', newTag.id), newTag);
      });
    }

    // 4. Update academyCategoryOrder in settings/global_config if needed
    if (needsCategoryOrderUpdate && settings?.academyCategoryOrder) {
      const updatedCategoryOrder = settings.academyCategoryOrder.map((c) => {
        if (c.primary !== 'Deal Participants') return c;
        const newSubs: string[] = [];
        const addUnique = (name: string) => {
          if (!newSubs.some((s) => s.toLowerCase() === name.toLowerCase())) {
            newSubs.push(name);
          }
        };

        c.subCategories.forEach((sub) => {
          const lower = sub.trim().toLowerCase();
          if (lower === 'assignees') {
            addUnique('Assignees (Form Selection)');
            addUnique('Assignees (Deal Participants)');
          } else if (lower === 'assignees (form selection)') {
            addUnique('Assignees (Form Selection)');
          } else if (lower === 'assignees (deal participants)') {
            addUnique('Assignees (Deal Participants)');
          } else {
            addUnique(sub);
          }
        });

        addUnique('Assignees (Form Selection)');
        addUnique('Assignees (Deal Participants)');

        return {
          ...c,
          subCategories: newSubs,
        };
      });

      batch.update(doc(db, 'settings', 'global_config'), {
        academyCategoryOrder: updatedCategoryOrder,
      });
    }

    batch.commit().catch((e: unknown) => {
      hasSeededParticipantTagsRef.current = false;
      const message = e instanceof Error ? e.message : 'Unknown error';
      toast.error('Failed to update Deal Participant subcategories: ' + message);
    });
  }, [tags, canEditTags, settings]);

  const fuse = useMemo(
    () =>
      new Fuse(tags, {
        keys: ['tag', 'description', 'category'],
        threshold: 0.3,
      }),
    [tags]
  );

  // Group tags into Primary -> Sub -> SubSub
  const allGroups = useMemo(() => {
    const map = new Map<string, Map<string, Map<string, TagItem[]>>>();
    const sortedTags = [...tags].sort((a, b) => (a.order || 0) - (b.order || 0));
    sortedTags.forEach((tag) => {
      const categories = Array.isArray(tag.category) ? tag.category : [tag.category];

      categories.forEach((cat) => {
        const parts = (cat || 'General').split(' - ');
        const primary = parts[0];
        const sub = parts[1] || 'General';
        const subSub = parts[2] || '';

        if (!map.has(primary)) map.set(primary, new Map());
        if (!map.get(primary)!.has(sub)) map.get(primary)!.set(sub, new Map());
        if (!map.get(primary)!.get(sub)!.has(subSub)) map.get(primary)!.get(sub)!.set(subSub, []);

        map.get(primary)!.get(sub)!.get(subSub)!.push(tag);
      });
    });
    return map;
  }, [tags]);

  const displayGroups = useMemo(() => {
    let result = tags;
    if (searchQuery) {
      result = fuse.search(searchQuery).map((res) => res.item);
    }

    const sortedResult = [...result].sort((a, b) => (a.order || 0) - (b.order || 0));

    const map = new Map<string, Map<string, Map<string, TagItem[]>>>();
    sortedResult.forEach((tag) => {
      const categories = Array.isArray(tag.category) ? tag.category : [tag.category];

      categories.forEach((cat) => {
        const parts = (cat || 'General').split(' - ');
        const primary = parts[0];
        const sub = parts[1] || 'General';
        const subSub = parts[2] || '';

        if (activePrimaryCategory !== 'All' && primary !== activePrimaryCategory) return;

        if (!map.has(primary)) map.set(primary, new Map());
        if (!map.get(primary)!.has(sub)) map.get(primary)!.set(sub, new Map());
        if (!map.get(primary)!.get(sub)!.has(subSub)) map.get(primary)!.get(sub)!.set(subSub, []);

        map.get(primary)!.get(sub)!.get(subSub)!.push(tag);
      });
    });
    return map;
  }, [tags, searchQuery, fuse, activePrimaryCategory]);

  const primaryCategories = useMemo(() => {
    const savedConfig = settings?.academyCategoryOrder || [];
    const savedPrimaries = savedConfig.map((c) => c.primary).filter(Boolean);
    const result = [...savedPrimaries];

    // Add any primary categories from tags that aren't in savedConfig
    Array.from(allGroups.keys()).forEach((key) => {
      if (key && !result.includes(key)) {
        result.push(key);
      }
    });

    // Append Helpful References if not present
    if (!result.includes('Helpful References')) {
      result.push('Helpful References');
    }

    return result;
  }, [allGroups, settings]);

  const handleCopy = (tag: string, id: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const scrollToSub = (primary: string, sub: string) => {
    const id = `category-${primary.replace(/\s+/g, '-')}-${sub.replace(/\s+/g, '-')}`;
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToReferences = () => {
    const el = document.getElementById('helpful-references-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const isTag = tags.some((t) => t.id === active.id);
    if (isTag) {
      const sortedTags = [...tags].sort((a, b) => (a.order || 0) - (b.order || 0));

      const activeSortedIndex = sortedTags.findIndex((t) => t.id === active.id);
      const overSortedIndex = sortedTags.findIndex((t) => t.id === over.id);

      if (activeSortedIndex !== -1 && overSortedIndex !== -1) {
        const newSortedTags = arrayMove(sortedTags, activeSortedIndex, overSortedIndex).map(
          (t, index) => ({
            ...t,
            order: index,
          })
        );

        // Eagerly update Zustand store to prevent visual snap-back
        useAppStore.setState({ tags: newSortedTags });

        const batch = writeBatch(db);
        newSortedTags.forEach((t) => {
          if (sortedTags.find((oldT) => oldT.id === t.id)?.order !== t.order) {
            const docRef = doc(db, 'academy_tags', t.id);
            batch.update(docRef, { order: t.order });
          }
        });

        try {
          await batch.commit();
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Unknown error';
          toast.error('Failed to reorder tags: ' + message);
        }
      }
      return;
    }

    const isImport = helpfulImports.some((i) => i.id === active.id);
    if (isImport) {
      const sortedImports = [...helpfulImports].sort((a, b) => (a.order || 0) - (b.order || 0));

      const activeSortedIndex = sortedImports.findIndex((t) => t.id === active.id);
      const overSortedIndex = sortedImports.findIndex((t) => t.id === over.id);

      if (activeSortedIndex !== -1 && overSortedIndex !== -1) {
        const newSortedImports = arrayMove(sortedImports, activeSortedIndex, overSortedIndex).map(
          (t, index) => ({
            ...t,
            order: index,
          })
        );

        useAppStore.setState({ helpfulImports: newSortedImports });

        const batch = writeBatch(db);
        newSortedImports.forEach((t) => {
          if (sortedImports.find((oldT) => oldT.id === t.id)?.order !== t.order) {
            const docRef = doc(db, 'academy_helpful_imports', t.id);
            batch.update(docRef, { order: t.order });
          }
        });

        try {
          await batch.commit();
        } catch (e: unknown) {
          const message = e instanceof Error ? e.message : 'Unknown error';
          toast.error('Failed to reorder helpful imports: ' + message);
        }
      }
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full bg-white w-full">
        {/* Top Navigation Bar: Glassmorphism tabs + inline search (No bottom border!) */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 py-1">
          {/* Horizontal Scrollable Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto custom-thin-scroll w-full">
            <button
              onClick={() => setActivePrimaryCategory('All')}
              className={`px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${
                activePrimaryCategory === 'All'
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              All Categories
            </button>

            {primaryCategories.map((primary) => (
              <button
                key={primary}
                onClick={() => setActivePrimaryCategory(primary)}
                className={`px-4 py-2 text-sm font-semibold whitespace-nowrap rounded-t-lg transition-colors border-b-2 ${
                  activePrimaryCategory === primary
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {primary}
              </button>
            ))}
          </div>

          {/* Inline Search & Actions */}
          <div className="flex items-center gap-2 pr-4 shrink-0">
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search tags, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full min-w-0 rounded-md border border-slate-200 bg-transparent px-3 py-1 text-xs shadow-sm transition-all outline-none placeholder:text-slate-400 pl-8 pr-8 h-8 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {canEditTags && activePrimaryCategory !== 'Helpful References' && (
              <>
                <button
                  onClick={() => setIsCategoryManagerOpen(true)}
                  className="px-3 h-8 bg-white border border-slate-200 text-slate-700 rounded-md text-xs font-medium hover:bg-slate-50 hover:border-slate-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                  title="Manage Categories"
                >
                  Manage Categories
                </button>
                <button
                  onClick={() => {
                    setEditingTag(null);
                    setIsTagModalOpen(true);
                  }}
                  className="px-3 h-8 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                  title="Create new Tag"
                >
                  <Plus className="w-3.5 h-3.5" /> New
                </button>
              </>
            )}

            {canEditImports && activePrimaryCategory === 'Helpful References' && (
              <button
                onClick={() => {
                  setEditingImport(null);
                  setIsImportModalOpen(true);
                }}
                className="px-3 h-8 bg-primary text-white rounded-md text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-sm"
                title="Create new Helpful Reference"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area: Sidebar + Tables */}
        <div className="flex flex-1 overflow-hidden pt-4">
          {/* Vertical Sidebar: Sub-Categories - Cleaner, narrower, flush layout */}
          <div className="w-56 bg-white h-full overflow-y-auto custom-thin-scroll shrink-0 hidden md:block border-r border-slate-100 pr-4">
            <div className="space-y-6">
              {primaryCategories
                .filter((p) => displayGroups.has(p))
                .map((primary) => {
                  const subMap = displayGroups.get(primary)!;
                  const savedConfig =
                    settings?.academyCategoryOrder?.find((c) => c.primary === primary)
                      ?.subCategories || [];

                  const sortedSubs = Array.from(subMap.keys()).sort((a, b) => {
                    const idxA = savedConfig.indexOf(a);
                    const idxB = savedConfig.indexOf(b);
                    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                    if (idxA !== -1) return -1;
                    if (idxB !== -1) return 1;
                    return a.localeCompare(b);
                  });

                  return (
                    <div key={primary} className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-400 mb-2 pl-2">{primary}</h4>
                      <div className="space-y-0.5">
                        {sortedSubs.map((sub) => (
                          <button
                            key={sub}
                            onClick={() => scrollToSub(primary, sub)}
                            className="w-full text-left flex items-center justify-between px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors group"
                          >
                            <span className="truncate pr-2">{sub}</span>
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-slate-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}

              {/* If Helpful References is the active primary category, show a sidebar item for it */}
              {activePrimaryCategory === 'Helpful References' && (
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-400 mb-2 pl-2">Helpful References</h4>
                  <button
                    onClick={scrollToReferences}
                    className="w-full text-left flex items-center justify-between px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 rounded-md transition-colors group"
                  >
                    <span className="truncate pr-2">All References</span>
                    <ChevronRight className="w-3 h-3 opacity-100 shrink-0" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Tables Area - Reduced spacing for higher density */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto pl-6 pr-2 md:pl-10 md:pr-6 custom-thin-scroll bg-white"
          >
            {displayGroups.size === 0 && activePrimaryCategory !== 'Helpful References' ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                <p className="text-slate-500 text-sm">
                  {searchQuery
                    ? `No tags found matching "${searchQuery}".`
                    : activePrimaryCategory !== 'All'
                      ? `No tags found in "${activePrimaryCategory}". Click "+ New" above to create the first tag.`
                      : 'No tags found in the database.'}
                </p>
                {canEditTags && !searchQuery && activePrimaryCategory !== 'All' && (
                  <button
                    onClick={() => {
                      setEditingTag(null);
                      setIsTagModalOpen(true);
                    }}
                    className="mt-3 px-3 py-1.5 bg-primary text-white text-xs font-medium rounded-md hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> New Tag
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-10 w-full pb-32">
                {primaryCategories
                  .filter((p) => displayGroups.has(p))
                  .map((primary) => {
                    const subMap = displayGroups.get(primary)!;
                    const savedConfig =
                      settings?.academyCategoryOrder?.find((c) => c.primary === primary)
                        ?.subCategories || [];

                    const sortedSubs = Array.from(subMap.entries()).sort(([a], [b]) => {
                      const idxA = savedConfig.indexOf(a);
                      const idxB = savedConfig.indexOf(b);
                      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                      if (idxA !== -1) return -1;
                      if (idxB !== -1) return 1;
                      return a.localeCompare(b);
                    });

                    return (
                      <div
                        key={primary}
                        className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500"
                      >
                        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight pb-1 border-b-2 border-slate-100">
                          {primary}
                        </h2>

                        {sortedSubs.map(([sub, subSubMap]) => {
                          const isFutureDates = sub.toLowerCase() === 'future dates';
                          const matchedParticipantKey =
                            primary === 'Deal Participants'
                              ? Object.keys(participantPrefixes).find(
                                  (k) => k.toLowerCase() === sub.trim().toLowerCase()
                                )
                              : undefined;
                          const prefixOptions =
                            primary === 'Deal Participants' && matchedParticipantKey
                              ? participantPrefixes[matchedParticipantKey]
                              : isFutureDates
                                ? allParticipants
                                : null;
                          const currentPrefix = prefixOptions
                            ? (activePrefixes[sub] ??
                              (matchedParticipantKey
                                ? activePrefixes[matchedParticipantKey]
                                : undefined) ??
                              (isFutureDates ? 'c1' : (prefixOptions[0]?.value ?? '')))
                            : '';
                          const showToggles = prefixOptions && prefixOptions.length > 1;

                          const getReplacementConfig = (subCategory: string) => {
                            if (subCategory === 'Options' || subCategory === 'Form Dates')
                              return '[Example]';
                            if (
                              subCategory === 'Parking' ||
                              subCategory === 'Storage' ||
                              subCategory === 'Bike Locker' ||
                              subCategory === 'Colour Scheme'
                            )
                              return '[Label]';
                            return null;
                          };

                          const replacementTarget = getReplacementConfig(sub);
                          const currentReplacement = dynamicReplacements[sub] || '';

                          return (
                            <div
                              key={sub}
                              id={`category-${primary.replace(/\s+/g, '-')}-${sub.replace(/\s+/g, '-')}`}
                              className="scroll-mt-20 relative flex flex-col gap-3"
                            >
                              <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md py-2 flex items-center justify-between border-b border-transparent shadow-sm">
                                <h3 className="text-lg font-bold text-slate-800">{sub}</h3>

                                <div className="flex items-center gap-3">
                                  {/* Example Replacement Input */}
                                  {replacementTarget && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-slate-500">
                                        Replace {replacementTarget}:
                                      </span>
                                      <input
                                        type="text"
                                        placeholder={
                                          replacementTarget === '[Example]'
                                            ? 'e.g. ClosingDate'
                                            : 'e.g. Small'
                                        }
                                        value={currentReplacement}
                                        onChange={(e) =>
                                          setDynamicReplacements((prev) => ({
                                            ...prev,
                                            [sub]: e.target.value,
                                          }))
                                        }
                                        className="border border-slate-200 rounded-md px-2.5 py-1 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-48 bg-white shadow-sm transition-all"
                                      />
                                    </div>
                                  )}

                                  {/* Dynamic Toggles */}
                                  {showToggles && !isFutureDates && (
                                    <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-md border border-slate-200">
                                      {prefixOptions.map((prefixOpt) => (
                                        <button
                                          key={prefixOpt.value}
                                          onClick={() =>
                                            setActivePrefixes((prev) => ({
                                              ...prev,
                                              [sub]: prefixOpt.value,
                                            }))
                                          }
                                          className={`px-2 py-1 text-xs font-semibold rounded transition-all ${
                                            currentPrefix === prefixOpt.value
                                              ? 'bg-white text-primary shadow-sm border border-slate-200'
                                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                                          }`}
                                        >
                                          {prefixOpt.label}
                                        </button>
                                      ))}
                                    </div>
                                  )}

                                  {showToggles && isFutureDates && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-slate-600">
                                        Deal Participant:
                                      </span>
                                      <div className="w-[300px]">
                                        <Select
                                          value={currentPrefix || 'c1'}
                                          onChange={(val) =>
                                            setActivePrefixes((prev) => ({ ...prev, [sub]: val }))
                                          }
                                          options={prefixOptions}
                                          dropdownWidth="w-[300px]"
                                          menuClassName="z-[100]"
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                                <table className="w-full text-left text-sm text-slate-600 table-fixed">
                                  <thead className="bg-slate-50 border-b border-slate-100">
                                    <tr>
                                      <th
                                        className={`py-2 pr-4 font-semibold text-slate-700 w-[30%] ${canEditTags ? 'pl-8' : 'pl-4'}`}
                                      >
                                        Tag
                                      </th>
                                      <th className="px-4 py-2 font-semibold text-slate-700 w-[40%]">
                                        Description
                                      </th>
                                      <th className="px-4 py-2 font-semibold text-slate-700 w-[30%]">
                                        Example
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {Array.from(subSubMap.entries()).map(([subSub, tags]) => (
                                      <React.Fragment key={subSub}>
                                        {subSub && (
                                          <tr className="bg-slate-50/50">
                                            <td
                                              colSpan={3}
                                              className="px-4 py-1.5 font-semibold text-sm text-slate-500"
                                            >
                                              <div className="flex items-center gap-2">
                                                <div className="w-1 h-3 bg-primary/40 rounded-full"></div>
                                                {subSub}
                                              </div>
                                            </td>
                                          </tr>
                                        )}
                                        <SortableContext
                                          items={tags.map((t) => t.id)}
                                          strategy={verticalListSortingStrategy}
                                        >
                                          {tags.map((item) => {
                                            let actualPrefix = currentPrefix;

                                            if (subSub === 'Witnesses' && actualPrefix) {
                                              if (actualPrefix.startsWith('co')) {
                                                actualPrefix = 'cow' + actualPrefix.slice(2);
                                              } else if (actualPrefix.startsWith('c')) {
                                                actualPrefix = 'w' + actualPrefix.slice(1);
                                              } else if (
                                                actualPrefix.startsWith('FromAssignor') ||
                                                actualPrefix.startsWith('FromAssignee')
                                              ) {
                                                actualPrefix = actualPrefix + 'W';
                                              } else if (actualPrefix.startsWith('o')) {
                                                actualPrefix = 'v' + actualPrefix.slice(1);
                                              }
                                            }

                                            let displayTag = item.tag;
                                            if (actualPrefix) {
                                              if (
                                                isFutureDates &&
                                                displayTag.startsWith('future_')
                                              ) {
                                                const parts = displayTag.split('_');
                                                if (parts.length >= 3) {
                                                  parts[1] = `${actualPrefix}s`;
                                                  displayTag = parts.join('_');
                                                }
                                              } else if (displayTag.includes('[prefix]')) {
                                                displayTag = displayTag.replace(
                                                  '[prefix]',
                                                  actualPrefix
                                                );
                                              } else {
                                                displayTag = `${actualPrefix}${displayTag}`;
                                              }
                                            }

                                            if (replacementTarget && currentReplacement) {
                                              displayTag = displayTag.replace(
                                                replacementTarget,
                                                currentReplacement
                                              );
                                            }

                                            return (
                                              <SortableTagRow
                                                key={item.id}
                                                item={item}
                                                displayTag={displayTag}
                                                canEditTags={canEditTags}
                                                canDeleteTags={canDeleteTags}
                                                handleCopy={handleCopy}
                                                copiedId={copiedId}
                                                setEditingTag={setEditingTag}
                                                setIsTagModalOpen={setIsTagModalOpen}
                                                handleDeleteTag={handleDeleteTag}
                                              />
                                            );
                                          })}
                                        </SortableContext>
                                      </React.Fragment>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                {/* Custom Helpful References Section at the bottom */}
                {(activePrimaryCategory === 'All' ||
                  activePrimaryCategory === 'Helpful References') &&
                  (!searchQuery || fuse.search(searchQuery).length === 0) && (
                    <div
                      id="helpful-references-section"
                      className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-mt-20 ${activePrimaryCategory === 'All' ? 'pt-8 border-t-2 border-dashed border-slate-200 mt-8' : ''}`}
                    >
                      <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight pb-2 border-b-2 border-slate-100">
                        Helpful References
                      </h2>

                      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <table className="w-full text-left text-sm text-slate-600 table-fixed">
                          <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                              <th
                                className={`py-2 pr-4 font-semibold text-slate-700 w-[40%] ${canEditImports ? 'pl-8' : 'pl-4'}`}
                              >
                                Action
                              </th>
                              <th className="px-4 py-2 font-semibold text-slate-700 w-[20%]">
                                Project
                              </th>
                              <th className="px-4 py-2 font-semibold text-slate-700 w-[40%]">
                                Solution / Link
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-50">
                            <SortableContext
                              items={sortedHelpfulImports.map((i) => i.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              {sortedHelpfulImports.map((item) => (
                                <SortableHelpfulImportRow
                                  key={item.id}
                                  item={item}
                                  canEditImports={canEditImports}
                                  canDeleteImports={canDeleteImports}
                                  setEditingImport={setEditingImport}
                                  setIsImportModalOpen={setIsImportModalOpen}
                                  handleDeleteImport={handleDeleteImport}
                                />
                              ))}
                            </SortableContext>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {isTagModalOpen && (
          <TagModal
            isOpen={isTagModalOpen}
            onClose={() => setIsTagModalOpen(false)}
            tagData={editingTag}
            defaultCategory={
              activePrimaryCategory !== 'All' && activePrimaryCategory !== 'Helpful References'
                ? activePrimaryCategory
                : undefined
            }
          />
        )}
        {isImportModalOpen && (
          <HelpfulImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            importData={editingImport}
          />
        )}

        {isCategoryManagerOpen && (
          <CategoryManagerModal
            isOpen={isCategoryManagerOpen}
            onClose={() => setIsCategoryManagerOpen(false)}
          />
        )}
      </div>
    </DndContext>
  );
}
