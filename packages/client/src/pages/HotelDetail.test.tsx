import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import HotelDetail from './HotelDetail';
import * as router from 'react-router-dom';

// Mock useParams
vi.mock('react-router-dom', () => ({
  useParams: vi.fn(),
}));

describe('HotelDetail', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    global.fetch = vi.fn();
  });

  it('shows loading state', () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ id: '123' });
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<HotelDetail />);
    expect(screen.getByText('Loading hotel details...')).toBeInTheDocument();
  });

  it('shows error state if fetch rejects', async () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ id: '123' });
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    render(<HotelDetail />);
    expect(await screen.findByText(/Network error/i)).toBeInTheDocument();
  });

  it('shows "Hotel not found." if the fetched data is null', async () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ id: '123' });
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    });

    render(<HotelDetail />);
    expect(await screen.findByText('Hotel not found.')).toBeInTheDocument();
  });

  it('displays hotel details on successful fetch', async () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ id: 'abc123' });
    const mockHotel = {
      _id: 'abc123',
      hotel_name: 'Test Hotel',
      chain_name: 'Test Chain',
      addressline1: '123 Main St',
      addressline2: '',
      city: 'Test City',
      state: 'Test State',
      zipcode: '99999',
      country: 'Testland',
      countryisocode: 'TL',
      star_rating: 3,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockHotel),
    });

    render(<HotelDetail />);
    // Wait for data to appear
    expect(await screen.findByText('Test Hotel')).toBeInTheDocument();
    expect(screen.getByText('Test Chain')).toBeInTheDocument();
    expect(screen.getByText(/Star Rating/i)).toBeInTheDocument();
  });

  it('handles API error responses (e.g., 404)', async () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ id: 'deadbeef' });
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    render(<HotelDetail />);
    expect(
      await screen.findByText(/Error fetching hotel details: 404/i)
    ).toBeInTheDocument();
  });
});
