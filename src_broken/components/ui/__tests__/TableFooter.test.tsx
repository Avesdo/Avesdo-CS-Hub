import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TableFooter } from '../TableFooter';

describe('TableFooter', () => {
  it('renders with default label and totalItems', () => {
    render(<TableFooter totalItems={42} />);
    
    expect(screen.getByText(/Total Items Displayed:/i)).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders with custom label', () => {
    render(<TableFooter totalItems={10} label="Total Projects" />);
    
    expect(screen.getByText(/Total Projects:/i)).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('renders rightContent when provided', () => {
    render(
      <TableFooter 
        totalItems={5} 
        rightContent={<div data-testid="right-content">Extra Info</div>} 
      />
    );
    
    expect(screen.getByTestId('right-content')).toBeInTheDocument();
    expect(screen.getByText('Extra Info')).toBeInTheDocument();
  });
});
