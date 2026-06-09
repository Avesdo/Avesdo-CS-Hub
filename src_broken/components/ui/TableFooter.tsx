import React from 'react';

interface TableFooterProps {
  totalItems: number;
  label?: string;
  rightContent?: React.ReactNode;
}

export function TableFooter({ totalItems, label = "Total Items Displayed", rightContent }: TableFooterProps) {
  return (
    <div className="flex justify-between items-center px-[128px] py-3 bg-slate-50 border-t border-border shrink-0 z-[60]">
      <span className="text-[11px] capitalize tracking-wider text-muted-foreground font-bold">
        {label}: <span className="text-foreground text-[13px] ml-1">{totalItems.toLocaleString()}</span>
      </span>
      {rightContent}
    </div>
  );
}
