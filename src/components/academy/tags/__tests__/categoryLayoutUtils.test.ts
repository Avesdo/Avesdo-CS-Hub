import { describe, it, expect, vi } from 'vitest';
import {
  computeCategoryHierarchy,
  buildCategoryConfig,
  handleReorderDragEnd,
  applyCategoryRenamesToTags,
} from '../categoryLayoutUtils';
import { TagItem } from '../../../../types';

describe('categoryLayoutUtils', () => {
  it('computes category hierarchy and preserves empty categories from savedConfig', () => {
    const mockTags: TagItem[] = [
      {
        id: '1',
        tag: '[[test]]',
        description: 'Test tag',
        category: 'Contracts - Purchase Agreement',
      },
      {
        id: '2',
        tag: '[[standalone]]',
        description: 'Standalone tag',
        category: 'Standalone',
      },
    ];

    const savedConfig = [
      {
        primary: 'Financial',
        description: 'All financial and deposit tags',
        subCategories: ['Mortgage', 'Deposit'],
        subCategoryDescriptions: {
          Deposit: 'Deposit schedule tags',
        },
      },
      {
        primary: 'Contracts',
        subCategories: ['Purchase Agreement', 'Addendum'],
      },
      {
        primary: 'Operations',
        subCategories: [],
      },
    ];

    const result = computeCategoryHierarchy(mockTags, savedConfig);

    // Financial has 0 tags, but must be preserved from savedConfig
    expect(result.primaryOrder).toContain('Financial');
    expect(result.primaryOrder).toContain('Contracts');
    expect(result.primaryOrder).toContain('Operations');
    expect(result.primaryOrder).toContain('Standalone');

    expect(result.subOrderMap['Financial']).toEqual(['Mortgage', 'Deposit']);
    expect(result.subOrderMap['Contracts']).toContain('Purchase Agreement');
    expect(result.subOrderMap['Contracts']).toContain('Addendum');
    // Operations has empty subcategories in savedConfig -> preserved as empty array without fallback to ['General']
    expect(result.subOrderMap['Operations']).toEqual([]);
    // Standalone tag has no subcategory -> subOrderMap has empty array without inventing unwanted subcategories
    expect(result.subOrderMap['Standalone']).toEqual([]);

    expect(result.primaryDescriptions['Financial']).toBe('All financial and deposit tags');
    expect(result.primaryDescriptions['Contracts']).toBeUndefined();
    expect(result.subDescriptionsMap['Financial']).toEqual({ Deposit: 'Deposit schedule tags' });

    expect(result.tagCountsByPrimary['Financial']).toBeUndefined();
    expect(result.tagCountsByPrimary['Contracts']).toBe(1);
    expect(result.tagCountsByPrimary['Standalone']).toBe(1);
    expect(result.tagCountsBySub['Contracts']['Purchase Agreement']).toBe(1);
    expect(result.tagCountsBySub['Standalone']).toBeUndefined();
  });

  it('buildCategoryConfig formats categories preserving empty subcategories and optional descriptions', () => {
    const primaryOrder = ['Legal', 'Sales'];
    const subOrderMap = {
      Legal: ['NDA', 'Terms'],
      Sales: [],
    };
    const primaryDescriptions = {
      Legal: '  Legal document tags  ',
      Sales: '   ',
    };
    const subDescriptionsMap = {
      Legal: {
        NDA: 'Non-disclosure tags',
        RemovedSub: 'Should be ignored',
      },
    };

    const config = buildCategoryConfig(
      primaryOrder,
      subOrderMap,
      primaryDescriptions,
      subDescriptionsMap
    );

    expect(config).toEqual([
      {
        primary: 'Legal',
        description: 'Legal document tags',
        subCategories: ['NDA', 'Terms'],
        subCategoryDescriptions: {
          NDA: 'Non-disclosure tags',
        },
      },
      { primary: 'Sales', subCategories: [] },
    ]);
  });

  it('applyCategoryRenamesToTags renames primary and subcategories across tag items', () => {
    const mockTags: TagItem[] = [
      {
        id: '1',
        tag: '_fullname_',
        description: 'Full name',
        category: ['Deal Participants - Purchasers'],
      },
      {
        id: '2',
        tag: '_witness_',
        description: 'Witness name',
        category: ['Deal Participants - Purchasers - Witnesses'],
      },
      {
        id: '3',
        tag: '_price_',
        description: 'Price',
        category: ['Financial - Pricing'],
      },
    ];

    const { updatedTags, changedTags } = applyCategoryRenamesToTags(mockTags, [
      { type: 'sub', primary: 'Deal Participants', from: 'Purchasers', to: 'Buyers' },
      { type: 'primary', from: 'Deal Participants', to: 'Participants' },
    ]);

    expect(changedTags).toHaveLength(2);
    expect(updatedTags[0].category).toEqual(['Participants - Buyers']);
    expect(updatedTags[1].category).toEqual(['Participants - Buyers - Witnesses']);
    expect(updatedTags[2].category).toEqual(['Financial - Pricing']);
  });

  it('handleReorderDragEnd correctly reorders primary categories', () => {
    let primaryOrder = ['A', 'B', 'C'];
    const setPrimaryOrder = vi.fn((updater) => {
      primaryOrder = updater(primaryOrder);
    });
    const setSubOrderMap = vi.fn();

    handleReorderDragEnd(
      {
        active: { id: 'primary::A' },
        over: { id: 'primary::C' },
      } as any,
      setPrimaryOrder,
      setSubOrderMap
    );

    expect(setPrimaryOrder).toHaveBeenCalled();
    expect(primaryOrder).toEqual(['B', 'C', 'A']);
  });

  it('handleReorderDragEnd correctly reorders subcategories within same primary', () => {
    const setPrimaryOrder = vi.fn();
    let subOrderMap: Record<string, string[]> = {
      Cat: ['Sub1', 'Sub2', 'Sub3'],
    };
    const setSubOrderMap = vi.fn((updater) => {
      subOrderMap = updater(subOrderMap);
    });

    handleReorderDragEnd(
      {
        active: { id: 'sub::Cat::Sub1' },
        over: { id: 'sub::Cat::Sub3' },
      } as any,
      setPrimaryOrder,
      setSubOrderMap
    );

    expect(setSubOrderMap).toHaveBeenCalled();
    expect(subOrderMap['Cat']).toEqual(['Sub2', 'Sub3', 'Sub1']);
  });
});
