import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import CityDetail from './CityDetail';
import * as router from 'react-router-dom';

// Mock useParams
vi.mock('react-router-dom', () => ({
useParams: vi.fn(),
}));

describe('CityDetail', () => {
beforeEach(() => {
    // Reset fetch mock between tests
    vi.restoreAllMocks();
    global.fetch = vi.fn();
});

it('shows loading state', () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ name: 'London' });
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<CityDetail />);
    expect(screen.getByText('Loading city details...')).toBeDefined();
});

it('shows error state', async () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ name: 'London' });
    global.fetch = vi.fn().mockRejectedValue(new Error('Failed to fetch'));

    render(<CityDetail />);
    expect(await screen.findByText(/Failed to fetch/)).toBeDefined();
});

it('shows city not found when data is null', async () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ name: 'London' });
    global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(null),
    });

    render(<CityDetail />);
    expect(await screen.findByText('City not found.')).toBeDefined();
});

it('displays city details on successful fetch', async () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ name: 'London' });
    const mockCity = {
    name: 'London',
    };

    global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve(mockCity),
    });

    render(<CityDetail />);
    expect(await screen.findByText('London')).toBeDefined();
    expect(screen.getByText(/Explore the vibrant atmosphere of London/)).toBeDefined();
});

it('handles API error responses', async () => {
    vi.spyOn(router, 'useParams').mockReturnValue({ name: 'NonexistentCity' });
    global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 404,
    });

    render(<CityDetail />);
    expect(await screen.findByText(/Error fetching city details: 404/)).toBeDefined();
});
});

