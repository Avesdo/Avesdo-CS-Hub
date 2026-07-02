import React, { useState, useRef, useEffect } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { MultiSelect } from './ui/MultiSelect';
import { Select } from './ui/Select';
import { getSettingBadge } from '../utils/uiUtils';

export const ColumnFilter = ({
  options,
  selected,
  onChange,
  searchable = false,
}: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  searchable?: boolean;
}) => {
  return (
    <MultiSelect
      options={options.map((opt) => ({ label: opt, value: opt }))}
      values={selected}
      onChange={onChange}
      searchable={searchable}
      trigger={
        <button
          className={`p-1 rounded transition-opacity ${selected.length > 0 ? 'opacity-100 text-primary bg-primary/5 border border-primary/10 shadow-sm' : 'opacity-0 group-hover/th:opacity-100 text-slate-400 hover:bg-slate-200'}`}
        >
          <Filter className="w-3.5 h-3.5" />
        </button>
      }
    />
  );
};

export const StatusDropdown = ({ value, options, onChange, settings }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative inline-block"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Popover.Root open={isOpen} onOpenChange={setIsOpen} modal={true}>
        <Popover.Trigger asChild>
          <div className="cursor-pointer hover:opacity-80 transition-all active:scale-95 flex items-center">
            {getSettingBadge('serviceStatuses', value, settings)}
          </div>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={8}
            className="bg-white/95 backdrop-blur-md border border-slate-200/60 rounded-xl shadow-xl z-[var(--z-popover)] overflow-hidden flex flex-col max-h-[300px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 duration-200 min-w-[140px]"
          >
            <div className="overflow-y-auto p-1 custom-thin-scroll">
              {options.map((opt: string) => (
                <button
                  key={opt}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between text-left px-3 py-2 text-sm hover:bg-primary/5 hover:text-primary rounded-md transition-colors ${value === opt ? 'bg-primary/5 text-primary' : 'text-foreground'}`}
                >
                  <span className="font-medium">
                    {getSettingBadge('serviceStatuses', opt, settings)}
                  </span>
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
};
