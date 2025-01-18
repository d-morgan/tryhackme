import { expect, test, vi, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './app';

describe('App component', () => {
  beforeEach(() => {
    // Restore any mocks to their initial state before each test
    vi.restoreAllMocks();
  });

  test('renders search input', () => {
    render(<App />);
    const input = screen.getByPlaceholderText('Search accommodation...');
    expect(input).toBeInTheDocument();
  });

  test('does not fetch if input is empty', async () => {
    // Spy on fetch
    global.fetch = vi.fn();

    render(<App />);
    const input = screen.getByPlaceholderText('Search accommodation...');

    // Type an empty string
    fireEvent.change(input, { target: { value: '' } });

    // No fetch call should be made
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('shows clear button and fetches data on typing', async () => {
    global.fetch = vi.fn().mockResolvedValue({
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

    render(<App />);

    // Check initial state
    const input = screen.getByPlaceholderText('Search accommodation...');
    expect(screen.queryByTestId('clear-btn')).toBeNull();

    // Type some text to trigger a fetch
    fireEvent.change(input, { target: { value: 'mock' } });

    const clearBtnIcon = screen.getByTestId('clear-btn');
    expect(clearBtnIcon).toBeInTheDocument();

    // Wait for the mocked fetch to resolve
    const hotelItem = await screen.findByText(/Mock Hotel/i);
    expect(hotelItem).toBeInTheDocument();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/search?q=mock')
    );
  });

  test('resets results on empty searchTerm after typing', async () => {
    // Start with a successful fetch
    global.fetch = vi.fn().mockResolvedValue({
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

    render(<App />);

    // Type to trigger a fetch
    const input = screen.getByPlaceholderText('Search accommodation...');
    fireEvent.change(input, { target: { value: 'mock' } });

    // Wait for results
    await screen.findByText(/Mock Hotel/i);
    expect(screen.queryByText(/Hotels/i)).toBeInTheDocument();

    // Now simulate user clearing the input
    fireEvent.change(input, { target: { value: '' } });

    // Should remove all results
    expect(screen.queryByText(/Mock Hotel/i)).toBeNull();
    expect(screen.queryByText(/Hotels/i)).toBeNull();
    // Also hide clear button
    expect(screen.queryByTestId('clear-btn')).toBeNull();
  });

  test('clears input on clear button click', async () => {
    // same fetch mock as above
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        hotels: [],
        countries: [],
        cities: [],
      }),
    } as Response);

    render(<App />);
    const input = screen.getByPlaceholderText('Search accommodation...');

    // Type some text so the clear button shows up
    fireEvent.change(input, { target: { value: 'test' } });
    const clearBtnIcon = await screen.findByTestId('clear-btn');
    expect(clearBtnIcon).toBeInTheDocument();

    // Click the clear button
    fireEvent.click(clearBtnIcon);

    // Input should now be empty
    expect((input as HTMLInputElement).value).toBe('');
    // The results div / headings should not be present
    expect(screen.queryByText('Hotels')).toBeNull();
  });

  test('fetchData sets error if fetch fails', async () => {
    // Mock console.error so we can assert it was called
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    // Force fetch to reject
    global.fetch = vi.fn().mockRejectedValue(new Error('Network Error'));

    render(<App />);
    const input = screen.getByPlaceholderText('Search accommodation...');

    // Type some text to trigger a fetch
    fireEvent.change(input, { target: { value: 'mock' } });

    // Wait for the fetch to fail
    await waitFor(() => {
      // Check that we show "no results" messages
      expect(screen.getByText('No hotels matched')).toBeInTheDocument();
      expect(screen.getByText('No countries matched')).toBeInTheDocument();
      expect(screen.getByText('No cities matched')).toBeInTheDocument();
    });

    // Check console.error called
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error fetching search data:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});
