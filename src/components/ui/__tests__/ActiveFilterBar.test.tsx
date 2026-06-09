import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActiveFilterBar } from '../ActiveFilterBar';

describe('ActiveFilterBar', () => {
  it('does not render when there are no active items', () => {
    const { container } = render(<ActiveFilterBar filters={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders filter pills correctly', () => {
    const mockFilters = [{ label: 'Status', values: ['Active'], onRemove: () => {} }];

    render(<ActiveFilterBar filters={mockFilters} />);

    expect(screen.getByText('Active Filters:')).toBeInTheDocument();
    expect(screen.getByText(/Status:/i)).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('calls onRemove with correct value when a pill is closed', () => {
    const handleRemove = vi.fn();
    const mockFilters = [{ label: 'Manager', values: ['Jason H'], onRemove: handleRemove }];

    render(<ActiveFilterBar filters={mockFilters} />);

    // Find the button inside the pill
    const closeButton = screen.getByText('Jason H').nextElementSibling;
    fireEvent.click(closeButton!);

    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleRemove).toHaveBeenCalledWith('Jason H');
  });

  it('shows Clear All button when there is more than 1 filter and onClearAll is provided', () => {
    const handleClearAll = vi.fn();
    const mockFilters = [{ label: 'Status', values: ['Active', 'Onboarding'], onRemove: () => {} }];

    render(<ActiveFilterBar filters={mockFilters} onClearAll={handleClearAll} />);

    const clearAllButton = screen.getByText('Clear All');
    expect(clearAllButton).toBeInTheDocument();

    fireEvent.click(clearAllButton);
    expect(handleClearAll).toHaveBeenCalledTimes(1);
  });

  it('does not show Clear All button when there is only 1 filter', () => {
    const mockFilters = [{ label: 'Status', values: ['Active'], onRemove: () => {} }];

    render(<ActiveFilterBar filters={mockFilters} onClearAll={() => {}} />);

    expect(screen.queryByText('Clear All')).not.toBeInTheDocument();
  });
});
