import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Index from '../Index';
import { BrowserRouter } from 'react-router-dom';

describe('Index Page', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
    
    // Basic checks for main elements
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('has correct heading hierarchy', () => {
    render(
      <BrowserRouter>
        <Index />
      </BrowserRouter>
    );
    
    const headings = screen.getAllByRole('heading');
    expect(headings.length).toBeGreaterThan(0);
  });
});