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
  searchFields
}: UseTableFilterOptions<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCol, setSortCol] = useState<keyof T>(defaultSortCol);
  const [sortAsc, setSortAsc] = useState<boolean>(defaultSortDir === 'asc');

  const handleSort = React.useCallback((col: keyof T) => {
    setSortCol(prevSortCol => {
      if (prevSortCol === col) {
        setSortAsc(prevAsc => !prevAsc);
        return prevSortCol;
      } else {
        setSortAsc(defaultSortDir === 'asc');
        return col;
      }
    });
  }, [defaultSortDir]);

  const filteredData = useMemo(() => {
    let filtered = data || [];
    
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        searchFields.some(field => {
          const val = item[field];
          if (typeof val === 'string') return val.toLowerCase().includes(lower);
          if (Array.isArray(val)) return val.join(' ').toLowerCase().includes(lower);
          return false;
        })
      );
    }

    return filtered.sort((a, b) => {
      let valA = a[sortCol];
      let valB = b[sortCol];

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
    filteredData
  };
}
