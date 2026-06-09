import React from 'react';
import GlobalSearch from './GlobalSearch';
import { User } from 'lucide-react';

export default function Header() {
    return (
        <header className="w-full bg-white/90 backdrop-blur-md shrink-0 relative z-50 border-b border-border" id="global-header-bar">
            <div className="h-[60px] flex items-center px-4 md:px-6 gap-2 md:gap-4">
                <GlobalSearch />
                <div className="flex-1"></div>
                <button title="User Profile" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                    <User className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
}