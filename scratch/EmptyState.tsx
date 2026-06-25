import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  className?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  subtitle,
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className={`flex flex-col items-center justify-center h-full min-h-[300px] text-center px-6 ${className}`}
    >
      <div className="relative mb-5 group">
        <div className="absolute inset-0 bg-primary/5 rounded-full blur-xl transform group-hover:scale-110 transition-transform duration-500" />
        <div className="relative w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 ring-1 ring-black/5 rotate-3 group-hover:rotate-6 transition-transform duration-300">
          <Icon className="w-8 h-8 text-primary/60 -rotate-3 group-hover:-rotate-6 transition-transform duration-300" />
        </div>
      </div>
      <h3 className="text-base font-semibold text-slate-800 tracking-tight">{title}</h3>
      {subtitle && (
        <p className="text-sm text-slate-500 mt-2 max-w-sm leading-relaxed">{subtitle}</p>
      )}
    </motion.div>
  );
}
