import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4 shrink-0 px-4 md:px-6 pt-4">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-base text-muted-foreground mt-1">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto mt-2 md:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
