import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SearchDropdown from './SearchDropdown';
import type { Hotel } from '../helpers/types';

describe('SearchDropdown Component', () => {
  it('does not render if searchTerm is empty', () => {
    render(
      <SearchDropdown
        results={{ hotels: [], countries: [], cities: [] }}
        searchTerm=""
      />
    );

    expect(screen.queryByText('Hotels')).toBeNull();
  });

  it('displays "No hotels matched" if there are no hotels', () => {
    render(
      <SearchDropdown
        results={{ hotels: [], countries: [], cities: [] }}
        searchTerm="foo"
      />
    );
    expect(screen.getByText(/No hotels matched/i)).toBeInTheDocument();
  });

  it('renders a hotel entry when provided', () => {
    const mockHotels: Hotel[] = [
      {
        _id: 'h1',
        chain_name: 'Test Chain',
        hotel_name: 'Test Hotel',
        addressline1: '',
        addressline2: '',
        zipcode: '',
        city: '',
        state: '',
        country: '',
        countryisocode: '',
        star_rating: 0,
      },
    ];

    render(
      <SearchDropdown
        results={{ hotels: mockHotels, countries: [], cities: [] }}
        searchTerm="test"
      />
    );

    expect(screen.getByText('Hotels')).toBeInTheDocument();
    expect(screen.getByText('Test Hotel')).toBeInTheDocument();
  });
});
