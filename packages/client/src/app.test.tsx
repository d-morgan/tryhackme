import { expect, test, vi, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './app';

describe('App component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  const renderApp = () => render(<App />);

  test('renders search input', () => {
    renderApp();
    const input = screen.getByPlaceholderText('Search accommodation...');
    expect(input).toBeInTheDocument();
  });

  test('does not fetch if input is empty', async () => {
    global.fetch = vi.fn();
    renderApp();

    const input = screen.getByPlaceholderText('Search accommodation...');
    fireEvent.change(input, { target: { value: '' } });

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('shows clear button and fetches data on typing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hotels: [
          {
            _id: 'abc123',
            chain_name: 'Mock Hotel Chain',
            hotel_name: 'Mock Hotel',
            addressline1: '1 Festival Square',
            addressline2: '',
            zipcode: 'EH39SR',
            city: 'Edinburgh',
            state: 'Scotland',
            country: 'United Kingdom',
            countryisocode: 'GB',
            star_rating: 5,
          },
        ],
        countries: [],
        cities: [],
      }),
    } as Response);

    renderApp();
    const input = screen.getByPlaceholderText('Search accommodation...');
    expect(screen.queryByTestId('clear-btn')).toBeNull();

    // Type => triggers fetch
    fireEvent.change(input, { target: { value: 'mock' } });

    const clearBtnIcon = screen.getByTestId('clear-btn');
    expect(clearBtnIcon).toBeInTheDocument();

    // Wait for "Mock Hotel" to appear
    const hotelItem = await screen.findByText(/Mock Hotel/i);
    expect(hotelItem).toBeInTheDocument();

    // Ensure fetch was called
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/search?q=mock')
    );
  });

  test('resets results on empty searchTerm after typing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hotels: [
          {
            _id: 'abc123',
            hotel_name: 'Mock Hotel',
          },
        ],
        countries: [],
        cities: [],
      }),
    } as Response);

    renderApp();
    const input = screen.getByPlaceholderText('Search accommodation...');

    // Type => triggers fetch
    fireEvent.change(input, { target: { value: 'mock' } });

    // Wait for results
    await screen.findByText(/Mock Hotel/i);
    expect(screen.queryByText(/Hotels/i)).toBeInTheDocument();

    // Now simulate user clearing the input
    fireEvent.change(input, { target: { value: '' } });

    // The results should be removed from the dropdown
    expect(screen.queryByText(/Mock Hotel/i)).toBeNull();
    expect(screen.queryByText(/Hotels/i)).toBeNull();
    expect(screen.queryByTestId('clear-btn')).toBeNull();
  });

  test('clears input on clear button click', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        hotels: [],
        countries: [],
        cities: [],
      }),
    } as Response);

    renderApp();
    const input = screen.getByPlaceholderText('Search accommodation...');

    // Type => clear button shows
    fireEvent.change(input, { target: { value: 'test' } });
    const clearBtnIcon = await screen.findByTestId('clear-btn');
    expect(clearBtnIcon).toBeInTheDocument();

    // Click the clear button
    fireEvent.click(clearBtnIcon);

    // Input is now empty
    expect((input as HTMLInputElement).value).toBe('');
    // The result headings are gone
    expect(screen.queryByText('Hotels')).toBeNull();
  });

  test('fetchData sets error if fetch fails', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Force rejection => triggers catch
    global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));

    renderApp();
    const input = screen.getByPlaceholderText('Search accommodation...');

    fireEvent.change(input, { target: { value: 'mock' } });

    await waitFor(() => {
      // Because fetch fails, the code sets empty results => "No hotels matched", etc.
      expect(screen.getByText('No hotels matched')).toBeInTheDocument();
      expect(screen.getByText('No countries matched')).toBeInTheDocument();
      expect(screen.getByText('No cities matched')).toBeInTheDocument();
    });

    // Confirm error log
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching search data:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
