import React from 'react';
import * as lucide from 'lucide-react';

interface SubmitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isSubmitting: boolean;
  loadingText?: string;
  icon?: keyof typeof lucide;
}

export function SubmitButton({
  isSubmitting,
  loadingText = 'Processing...',
  children,
  className = '',
  icon,
  ...props
}: SubmitButtonProps) {
  const IconComponent = icon ? (lucide[icon] as React.ElementType) : null;

  return (
    <button
      {...props}
      disabled={isSubmitting || props.disabled}
      className={`relative inline-flex items-center justify-center gap-2 px-4 py-2 font-medium text-white transition-all duration-200 rounded-md ${isSubmitting ? 'bg-primary/70 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 active:scale-[0.98] hover:-translate-y-[1px] hover:shadow-md shadow-sm'} ${className}`}
    >
      {isSubmitting ? (
        <>
          <lucide.Loader2 className="w-4 h-4 animate-spin text-white/90" />
          <span className="animate-in fade-in duration-300">{loadingText}</span>
        </>
      ) : (
        <>
          {IconComponent && <IconComponent className="w-4 h-4 animate-in fade-in duration-300" />}
          <span className="animate-in fade-in duration-300">{children}</span>
        </>
      )}
    </button>
  );
}
