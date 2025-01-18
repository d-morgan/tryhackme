import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CountryDetail from './CountryDetail';
import * as router from 'react-router-dom';

// Mock useParams
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}));

describe('CountryDetail', () => {
  beforeEach(() => {
    // Reset fetch mock between tests
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('shows loading state', () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ iso: 'GB' });
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<CountryDetail />);
    expect(screen.getByText('Loading country details...')).toBeInTheDocument();
  });

  it('shows error state if fetch rejects', async () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ iso: 'GB' });
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    render(<CountryDetail />);
    expect(await screen.findByText(/Failed to fetch/i)).toBeInTheDocument();
  });

  it('shows "Country not found." when the response data is null', async () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ iso: 'GB' });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    });

    render(<CountryDetail />);
    expect(await screen.findByText('Country not found.')).toBeInTheDocument();
  });

  it('displays country details on successful fetch', async () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ iso: 'GB' });
    const mockCountry = {
      country: 'United Kingdom',
      countryisocode: 'GB',
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockCountry),
    });

    render(<CountryDetail />);
    // Wait for the component to render the data
    expect(await screen.findByText('United Kingdom')).toBeInTheDocument();
    expect(screen.getByText(/ISO Code: GB/i)).toBeInTheDocument();
  });

  it('handles API error responses (e.g. 404)', async () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ iso: 'ZZ' });
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    render(<CountryDetail />);
    expect(
      await screen.findByText(/Error fetching country details: 404/i)
    ).toBeInTheDocument();
  });
});
