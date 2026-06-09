import React from 'react';

export default function Header() {
    return (
        <div className="w-full bg-white shrink-0 border-b border-border" id="global-header-bar">
            <div className="h-[60px] flex items-center px-4 md:px-6 py-4 gap-2 md:gap-4">
                <div className="relative max-w-[300px] hidden md:block flex-grow" id="global-search-container">
                    <i data-lucide="search" className="w-4 h-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2"></i>
                    <input 
                        type="text" 
                        placeholder="Search projects or clients..." 
                        className="w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-all outline-none placeholder:text-muted-foreground pl-8 h-8 focus-visible:border-ring focus-visible:ring-[3px]"
                    />
                </div>
                <div className="flex-grow flex-1"></div>
            </div>
        </div>
    );
}