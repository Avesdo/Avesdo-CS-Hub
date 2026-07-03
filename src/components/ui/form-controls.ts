import { cva } from 'class-variance-authority';

export const formControlVariants = cva(
  'flex w-full items-center justify-between rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        inline: 'border-transparent bg-transparent shadow-none hover:bg-slate-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);
