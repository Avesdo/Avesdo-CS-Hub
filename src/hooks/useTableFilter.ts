import React, { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc';

interface UseTableFilterOptions<T> {
  data: T[] | null | undefined;
  defaultSortCol: keyof T;
  defaultSortDir?: SortDirection;
  searchFields: (keyof T)[];
}

export function useTableFilter<T>({
  data,
  defaultSortCol,
  defaultSortDir = 'asc',
  searchFields,
}: UseTableFilterOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<keyof T>(defaultSortCol);
  const [sortAsc, setSortAsc] = useState<boolean>(defaultSortDir === 'asc');

  const handleSort = React.useCallback(
    (col: keyof T) => {
      if (sortCol === col) {
        if (sortAsc) {
          setSortAsc(false); // Go DESC
        } else {
          // Go DEFAULT
          setSortCol(defaultSortCol);
          setSortAsc(defaultSortDir === 'asc');
        }
      } else {
        // First click on new column: ASC
        setSortCol(col);
        setSortAsc(true);
      }
    },
    [sortCol, sortAsc, defaultSortCol, defaultSortDir]
  );

  const filteredData = useMemo(() => {
    let filtered = data || [];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter((item) =>
        searchFields.some((field) => {
          const val = item[field];
          if (typeof val === 'string') return val.toLowerCase().includes(lower);
          if (Array.isArray(val)) return val.join(' ').toLowerCase().includes(lower);
          return false;
        })
      );
    }

    return [...filtered].sort((a, b) => {
      let valA: any = a[sortCol];
      let valB: any = b[sortCol];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      // Handle nulls/undefined to ensure consistent sorting
      if (valA == null) valA = typeof valB === 'number' ? 0 : '';
      if (valB == null) valB = typeof valA === 'number' ? 0 : '';

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [data, searchTerm, sortCol, sortAsc, searchFields]);

  return {
    searchTerm,
    setSearchTerm,
    sortCol,
    sortAsc,
    handleSort,
    filteredData,
  };
}
