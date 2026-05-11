import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../app/page';

describe('Home page', () => {
  it('renders the title with Tailwind classes applied', () => {
    render(<Home />);
    const heading = screen.getByRole('heading', { name: /kingdom come/i });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toContain('text-4xl');
  });
});
