import React, { useState, useMemo, useRef, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Search, Copy, Check, ExternalLink, ChevronRight } from 'lucide-react';
import localTags from '../../../data/localTags.json';
import localImports from '../../../data/localHelpfulImports.json';

const participantPrefixes: Record<string, { label: string, value: string }[]> = {
  "Purchasers": [
    {
      "label": "Purchaser 1",
      "value": "c1"
    },
    {
      "label": "Purchaser 2",
      "value": "c2"
    },
    {
      "label": "Purchaser 3",
      "value": "c3"
    },
    {
      "label": "Purchaser 4",
      "value": "c4"
    },
    {
      "label": "Purchaser 5",
      "value": "c5"
    },
    {
      "label": "Purchaser 6",
      "value": "c6"
    }
  ],
  "Realtors": [
    {
      "label": "Realtor 1",
      "value": "r1"
    },
    {
      "label": "Realtor 2",
      "value": "r2"
    },
    {
      "label": "Realtor 3",
      "value": "r3"
    }
  ],
  "Sales Rep": [
    {
      "label": "Sales Rep 1",
      "value": "s1"
    }
  ],
  "Developers": [
    {
      "label": "Developer 1",
      "value": "d1"
    },
    {
      "label": "Developer 2",
      "value": "d2"
    },
    {
      "label": "Developer 3",
      "value": "d3"
    }
  ],
  "Assignors": [
    {
      "label": "Assignor 1 (Form Selection)",
      "value": "FromAssignor1"
    },
    {
      "label": "Assignor 2 (Form Selection)",
      "value": "FromAssignor2"
    },
    {
      "label": "Assignor 3 (Form Selection)",
      "value": "FromAssignor3"
    }
  ],
  "Assignees": [
    {
      "label": "Assignee 1 (Form Selection)",
      "value": "FromAssignee1"
    },
    {
      "label": "Assignee 2 (Form Selection)",
      "value": "FromAssignee2"
    },
    {
      "label": "Assignee 3 (Form Selection)",
      "value": "FromAssignee3"
    },
    {
      "label": "Assignee 1 (Deal Participants)",
      "value": "o1"
    },
    {
      "label": "Assignee 2 (Deal Participants)",
      "value": "o2"
    },
    {
      "label": "Assignee 3 (Deal Participants)",
      "value": "o3"
    }
  ],
  "Managing Broker": [
    {
      "label": "Managing Broker",
      "value": "ps-managing broker"
    }
  ],
  "Guarantors": [
    {
      "label": "Guarantor 1",
      "value": "ps-guarantor"
    },
    {
      "label": "Guarantor 2",
      "value": "ps-guarantor 2"
    }
  ],
  "Transferor": [
    {
      "label": "Transferor",
      "value": "ps-transferor"
    }
  ]
};

export default function TagDictionaryTab() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activePrimaryCategory, setActivePrimaryCategory] = useState<string>('All');

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [activePrimaryCategory]);
  const [activePrefixes, setActivePrefixes] = useState<Record<string, string>>({
    'Purchasers': 'c1',
    'Realtors': 'r1',
    'Sales Rep': 's1',
    'Developers': 'd1',
    'Assignors': 'FromAssignor1',
    'Assignees': 'FromAssignee1',
    'Managing Broker': 'ps-managing broker',
    'Guarantors': 'ps-guarantor',
    'Transferor': 'ps-transferor'
  });
  const [dynamicReplacements, setDynamicReplacements] = useState<Record<string, string>>({});

  const fuse = useMemo(
    () =>
      new Fuse(localTags, {
        keys: ['tag', 'description', 'category'],
        threshold: 0.3,
      }),
    []
  );

  // Group tags into Primary -> Sub -> SubSub
  const allGroups = useMemo(() => {
    const map = new Map<string, Map<string, Map<string, typeof localTags>>>();
    localTags.forEach((tag) => {
      const parts = tag.category.split(' - ');
      const primary = parts[0];
      const sub = parts[1] || 'General';
      const subSub = parts[2] || '';
      
      if (!map.has(primary)) map.set(primary, new Map());
      if (!map.get(primary)!.has(sub)) map.get(primary)!.set(sub, new Map());
      if (!map.get(primary)!.get(sub)!.has(subSub)) map.get(primary)!.get(sub)!.set(subSub, []);
      
      map.get(primary)!.get(sub)!.get(subSub)!.push(tag);
    });
    return map;
  }, []);

  const displayGroups = useMemo(() => {
    let result = localTags;
    if (searchQuery) {
      result = fuse.search(searchQuery).map((res) => res.item);
    }
    
    const map = new Map<string, Map<string, Map<string, typeof localTags>>>();
    result.forEach((tag) => {
      const parts = tag.category.split(' - ');
      const primary = parts[0];
      const sub = parts[1] || 'General';
      const subSub = parts[2] || '';
      
      if (activePrimaryCategory !== 'All' && primary !== activePrimaryCategory) return;
      
      if (!map.has(primary)) map.set(primary, new Map());
      if (!map.get(primary)!.has(sub)) map.get(primary)!.set(sub, new Map());
      if (!map.get(primary)!.get(sub)!.has(subSub)) map.get(primary)!.get(sub)!.set(subSub, []);
      
      map.get(primary)!.get(sub)!.get(subSub)!.push(tag);
    });
    return map;
  }, [searchQuery, fuse, activePrimaryCategory]);

  const primaryCategories = [...Array.from(allGroups.keys()), 'Helpful Imports'];

  const handleCopy = (tag: string, id: string) => {
    navigator.clipboard.writeText(`<<${tag}>>`);
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

  const scrollToImports = () => {
    const el = document.getElementById('helpful-imports-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
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
          
          {primaryCategories.map(primary => (
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

        {/* Inline Search */}
        <div className="relative w-full md:w-80 shrink-0 pr-4">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search tags, categories, or descriptions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-w-0 rounded-md border border-slate-200 bg-transparent px-3 py-1 text-sm shadow-sm transition-all outline-none placeholder:text-slate-400 pl-8 pr-8 h-9 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Main Content Area: Sidebar + Tables */}
      <div className="flex flex-1 overflow-hidden pt-4">
        
        {/* Vertical Sidebar: Sub-Categories - Cleaner, narrower, flush layout */}
        <div className="w-56 bg-white h-full overflow-y-auto custom-thin-scroll shrink-0 hidden md:block border-r border-slate-100 pr-4">
          <div className="space-y-6">
            {Array.from(displayGroups.entries()).map(([primary, subMap]) => (
              <div key={primary} className="space-y-1">
                <h4 className="text-sm font-bold text-slate-400 mb-2 pl-2">
                  {primary}
                </h4>
                <div className="space-y-0.5">
                  {Array.from(subMap.keys()).map((sub) => (
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
            ))}

            {/* If Helpful Imports is the active primary category, show a sidebar item for it */}
            {activePrimaryCategory === 'Helpful Imports' && (
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-400 mb-2 pl-2">
                  Helpful Imports
                </h4>
                <button
                  onClick={scrollToImports}
                  className="w-full text-left flex items-center justify-between px-3 py-1.5 text-sm font-medium text-slate-700 bg-slate-50 rounded-md transition-colors group"
                >
                  <span className="truncate pr-2">All Imports</span>
                  <ChevronRight className="w-3 h-3 opacity-100 shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tables Area - Reduced spacing for higher density */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto pl-6 pr-2 md:pl-10 md:pr-6 custom-thin-scroll bg-white">
          {displayGroups.size === 0 && !searchQuery && activePrimaryCategory !== 'Helpful Imports' ? (
            <div className="flex items-center justify-center h-full text-slate-500">
              No tags found in the database.
            </div>
          ) : (
            <div className="space-y-10 w-full pb-32">
              {Array.from(displayGroups.entries()).map(([primary, subMap]) => (
                <div key={primary} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight pb-1 border-b-2 border-slate-100">
                    {primary}
                  </h2>
                  
                  {Array.from(subMap.entries()).map(([sub, subSubMap]) => {
                    const prefixOptions = primary === 'Deal Participants' ? participantPrefixes[sub] : null;
                    const currentPrefix = prefixOptions ? activePrefixes[sub] : '';
                    const showToggles = prefixOptions && prefixOptions.length > 1;
                    
                    const getReplacementConfig = (subCategory: string) => {
                      if (subCategory === 'Options' || subCategory === 'Form Dates') return '[Example]';
                      if (subCategory === 'Parking' || subCategory === 'Storage' || subCategory === 'Bike Locker' || subCategory === 'Colour Scheme') return '[Label]';
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
                                <span className="text-sm font-medium text-slate-500">Replace {replacementTarget}:</span>
                                <input 
                                  type="text" 
                                  placeholder={replacementTarget === '[Example]' ? 'e.g. ClosingDate' : 'e.g. Small'}
                                  value={currentReplacement}
                                  onChange={(e) => setDynamicReplacements(prev => ({ ...prev, [sub]: e.target.value }))}
                                  className="border border-slate-200 rounded-md px-2.5 py-1 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 w-48 bg-white shadow-sm transition-all"
                                />
                              </div>
                            )}

                            {/* Dynamic Toggles */}
                            {showToggles && (
                              <div className="flex flex-wrap items-center gap-1 bg-slate-50 p-1 rounded-md border border-slate-200">
                                {prefixOptions.map(prefixOpt => (
                                  <button
                                    key={prefixOpt.value}
                                    onClick={() => setActivePrefixes(prev => ({ ...prev, [sub]: prefixOpt.value }))}
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
                          </div>
                        </div>
                        
                        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                          <table className="w-full text-left text-sm text-slate-600 table-fixed">
                            <thead className="bg-slate-50 border-b border-slate-100">
                              <tr>
                                <th className="px-4 py-2 font-semibold text-slate-700 w-[25%]">Tag</th>
                                <th className="px-4 py-2 font-semibold text-slate-700 w-[40%]">Description</th>
                                <th className="px-4 py-2 font-semibold text-slate-700 w-[35%]">Example</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {Array.from(subSubMap.entries()).map(([subSub, tags]) => (
                                <React.Fragment key={subSub}>
                                  {subSub && (
                                    <tr className="bg-slate-50/50">
                                      <td colSpan={3} className="px-4 py-1.5 font-semibold text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                          <div className="w-1 h-3 bg-primary/40 rounded-full"></div>
                                          {subSub}
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                  {tags.map((item) => {
                                    // Apply dynamic prefix if applicable
                                    let actualPrefix = currentPrefix;
                                    
                                    // Transform the prefix if this is the Witnesses sub-group
                                    if (subSub === 'Witnesses' && actualPrefix) {
                                      if (actualPrefix.startsWith('c')) {
                                        actualPrefix = 'w' + actualPrefix.slice(1);
                                      } else if (actualPrefix.startsWith('FromAssignor') || actualPrefix.startsWith('FromAssignee')) {
                                        actualPrefix = actualPrefix + 'W';
                                      } else if (actualPrefix.startsWith('o')) {
                                        actualPrefix = 'v' + actualPrefix.slice(1);
                                      }
                                    }
                                    
                                    let displayTag = item.tag;
                                    if (actualPrefix) {
                                      if (displayTag.includes('[prefix]')) {
                                        displayTag = displayTag.replace('[prefix]', actualPrefix);
                                      } else {
                                        displayTag = `${actualPrefix}${displayTag}`;
                                      }
                                    }
                                    
                                    // Apply example replacement if applicable
                                    if (replacementTarget && currentReplacement) {
                                      displayTag = displayTag.replace(replacementTarget, currentReplacement);
                                    }
                                    
                                    return (
                                      <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-4 py-2 align-top">
                                          <div className="flex items-center justify-between gap-2">
                                            <span className="font-mono text-primary font-medium bg-primary/5 px-2 py-0.5 rounded break-all border border-primary/10">
                                              {displayTag}
                                            </span>
                                            <button
                                              onClick={() => handleCopy(displayTag, item.id)}
                                              className="p-1 shrink-0 rounded text-slate-400 hover:text-primary hover:bg-slate-100 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none"
                                              title="Copy with << >>"
                                            >
                                              {copiedId === item.id ? (
                                                <Check className="w-3.5 h-3.5 text-green-500" />
                                              ) : (
                                                <Copy className="w-3.5 h-3.5" />
                                              )}
                                            </button>
                                          </div>
                                        </td>
                                        <td className="px-4 py-2 align-top text-slate-700 pr-4 leading-relaxed">{item.description}</td>
                                        <td className="px-4 py-2 align-top text-slate-500 italic truncate">{item.example}</td>
                                      </tr>
                                    );
                                  })}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Custom Helpful Imports Section at the bottom */}
              {(activePrimaryCategory === 'All' || activePrimaryCategory === 'Helpful Imports') && (!searchQuery || fuse.search(searchQuery).length === 0) && (
                <div id="helpful-imports-section" className={`space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 scroll-mt-20 ${activePrimaryCategory === 'All' ? 'pt-8 border-t-2 border-dashed border-slate-200 mt-8' : ''}`}>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight pb-1 border-b-2 border-slate-100">
                    Helpful Imports
                  </h2>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <table className="w-full text-left text-sm text-slate-600 table-fixed">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-4 py-2 font-semibold text-slate-700 w-[40%]">Action</th>
                          <th className="px-4 py-2 font-semibold text-slate-700 w-[20%]">Project</th>
                          <th className="px-4 py-2 font-semibold text-slate-700 w-[40%]">Solution / Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {localImports.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-4 py-3 align-top text-slate-800 font-medium pr-4 leading-relaxed">{item.action}</td>
                            <td className="px-4 py-3 align-top">
                              {item.project ? (
                                <span className="text-slate-700 font-medium">
                                  {item.project}
                                </span>
                              ) : (
                                <span className="text-slate-400 italic text-sm">General</span>
                              )}
                            </td>
                            <td className="px-4 py-3 align-top text-slate-700">
                              {item.solution ? (
                                item.solution.startsWith('http') ? (
                                  <a
                                    href={item.solution}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 text-primary hover:underline group break-all"
                                  >
                                    <span className="group-hover:underline">
                                      {item.solution}
                                    </span>
                                    <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                ) : (
                                  <span className="whitespace-pre-wrap leading-relaxed">{item.solution}</span>
                                )
                              ) : (
                                <span className="text-slate-400 italic">No solution recorded</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
