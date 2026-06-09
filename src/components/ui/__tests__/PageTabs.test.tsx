import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PageTabs } from '../PageTabs';
import { Activity, Users } from 'lucide-react';

describe('PageTabs', () => {
  const mockTabs = [
    { label: 'All Clients', icon: Users },
    { label: 'Active', icon: Activity },
  ];

  it('renders all tabs correctly', () => {
    render(<PageTabs tabs={mockTabs} activeTab="All Clients" onTabChange={() => {}} />);
    
    expect(screen.getByText('All Clients')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('highlights the active tab', () => {
    render(<PageTabs tabs={mockTabs} activeTab="All Clients" onTabChange={() => {}} />);
    
    const activeTabButton = screen.getByText('All Clients').closest('button');
    const inactiveTabButton = screen.getByText('Active').closest('button');
    
    expect(activeTabButton).toHaveClass('bg-white');
    expect(inactiveTabButton).toHaveClass('bg-muted');
  });

  it('calls onTabChange with the correct label when clicked', () => {
    const handleTabChange = vi.fn();
    render(<PageTabs tabs={mockTabs} activeTab="All Clients" onTabChange={handleTabChange} />);
    
    fireEvent.click(screen.getByText('Active'));
    
    expect(handleTabChange).toHaveBeenCalledTimes(1);
    expect(handleTabChange).toHaveBeenCalledWith('Active');
  });
});
