import { describe, it, expect, vi } from 'vitest';
import {
  computeCategoryHierarchy,
  buildCategoryConfig,
  handleReorderDragEnd,
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
        subCategories: ['Mortgage', 'Deposit'],
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

    expect(result.tagCountsByPrimary['Financial']).toBeUndefined();
    expect(result.tagCountsByPrimary['Contracts']).toBe(1);
    expect(result.tagCountsByPrimary['Standalone']).toBe(1);
    expect(result.tagCountsBySub['Contracts']['Purchase Agreement']).toBe(1);
    expect(result.tagCountsBySub['Standalone']).toBeUndefined();
  });

  it('buildCategoryConfig formats categories preserving empty subcategories without fallback', () => {
    const primaryOrder = ['Legal', 'Sales'];
    const subOrderMap = {
      Legal: ['NDA', 'Terms'],
      Sales: [],
    };

    const config = buildCategoryConfig(primaryOrder, subOrderMap);

    expect(config).toEqual([
      { primary: 'Legal', subCategories: ['NDA', 'Terms'] },
      { primary: 'Sales', subCategories: [] },
    ]);
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
