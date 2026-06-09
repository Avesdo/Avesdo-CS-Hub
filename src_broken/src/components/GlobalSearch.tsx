"import React, { useState, useEffect, useRef } from 'react';\nimport { Search, X, Building, Box, Briefcase, SearchX } from 'lucide-react';\nimport { useAppState } from '../context/AppStateContext';\nimport { useUI } from '../context/UIContext';\nimport { getHealthBadge, getSettingBadge } from '../utils/uiUtils';\n\nexport default function GlobalSearch() {\n    const { clients, projects, services, settings } = useAppState();\n    const { openDrawer, closeDrawer, closeModal } = useUI();\n    const [query, setQuery] = useState('');\n    const [debouncedQuery, setDebouncedQuery] = useState('');\n    const [isOpen, setIsOpen] = useState(false);\n    const containerRef = useRef<HTMLDivElement>(null);\n\n    useEffect(() => {\n        const timer = setTimeout(() => {\n            setDebouncedQuery(query);\n        }, 200);\n        return () => clearTimeout(timer);\n    }, [query]);\n\n    useEffect(() => {\n        const handleClickOutside = (event: MouseEvent) => {\n            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {\n                setIsOpen(false);\n            }\n        };\n        document.addEventListener('mousedown', handleClickOutside);\n        return () => document.removeEventListener('mousedown', handleClickOutside);\n    }, []);\n\n    const formatCurrency = (val: number | string | undefined) => {\n        if (val === undefined || val === null) return '$0';\n        const num = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g,\"\")) : val;\n        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num || 0);\n    };\n\n    const handleResultClick = (type: 'client' | 'project' | 'service', id: string) => {\n        setIsOpen(false);\n        setQuery('');\n        \n        // Unfocus the input if needed\n        if (document.activeElement instanceof HTMLElement) {\n            document.activeElement.blur();\n        }\n\n        closeDrawer();\n        closeModal();\n\n        setTimeout((
<truncated 10540 bytes>
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setQuery('');
                setViewAll(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        setIsOpen(false);
                        setQuery('');
                        setViewAll(false);
                    } else if (e.key === 'ArrowDown') {
                                    <div className="px-4 py-2.5 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-border/50 flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                                    <div className="px-4 py-2.5 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-border/50 flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
                                    <div className="px-4 py-2.5 sticky top-0 bg-white/95 backdrop-blur z-10 border-b border-border/50 flex items-center gap-2 text-[11px] font-bold text-muted-foreground">