import React from 'react';
import GlobalSearch from './GlobalSearch';

export default function Header() {
  return (
    <header
      className="w-full bg-white/90 backdrop-blur-md shrink-0 relative z-50"
      id="global-header-bar"
    >
      <div className="h-[60px] flex items-center px-4 md:px-6 gap-2 md:gap-4">
        <GlobalSearch />
        <div className="flex-1"></div>
      </div>
    </header>
  );
}
