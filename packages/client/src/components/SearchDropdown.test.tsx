import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SearchDropdown from './SearchDropdown';
import type { Country, City } from '../helpers/types';

describe('SearchDropdown Component', () => {
  it('does not render if searchTerm is whitespace', () => {
    render(
      <SearchDropdown
        results={{ hotels: [], countries: [], cities: [] }}
        searchTerm="   "
      />
    );

    // Because it trims the searchTerm, it returns null
    expect(screen.queryByText('Hotels')).toBeNull();
    expect(screen.queryByText('Countries')).toBeNull();
    expect(screen.queryByText('Cities')).toBeNull();
  });

  it('displays countries when provided', () => {
    const mockCountries: Country[] = [
      {
        _id: 'c1',
        country: 'United Kingdom',
        countryisocode: 'GB',
      },
    ];

    render(
      <SearchDropdown
        results={{
          hotels: [],
          countries: mockCountries,
          cities: [],
        }}
        searchTerm="UK"
      />
    );

    expect(screen.getByText('Countries')).toBeInTheDocument();
    expect(screen.queryByText('No countries matched')).toBeNull();
    expect(screen.getByText('United Kingdom')).toBeInTheDocument();
  });

  it('displays cities when provided', () => {
    const mockCities: City[] = [
      {
        _id: 'ct1',
        name: 'London',
      },
      {
        _id: 'ct2',
        name: 'Manchester',
      },
    ];

    render(
      <SearchDropdown
        results={{
          hotels: [],
          countries: [],
          cities: mockCities,
        }}
        searchTerm="Lon"
      />
    );

    expect(screen.getByText('Cities')).toBeInTheDocument();
    expect(screen.queryByText('No cities matched')).toBeNull();

    expect(screen.getByText('London')).toBeInTheDocument();
    expect(screen.getByText('Manchester')).toBeInTheDocument();
  });

  it('displays hotels when provided', () => {
    const mockHotels = [
      {
        _id: 'h1',
        hotel_name: 'Mock Hotel',
        chain_name: 'Mock Chain',
        addressline1: '123 Mock St',
        addressline2: 'Apt 1',
        zipcode: '12345',
        city: 'Mock City',
        state: 'Mock State',
        country: 'United States',
        countryisocode: 'US',
        star_rating: 5,
      },
    ];

    render(
      <SearchDropdown
        results={{
          hotels: mockHotels,
          countries: [],
          cities: [],
        }}
        searchTerm="Mock"
      />
    );

    expect(screen.getByText('Hotels')).toBeInTheDocument();
    expect(screen.queryByText('No hotels matched')).toBeNull();
    expect(screen.getByText('Mock Hotel')).toBeInTheDocument();
  });
});
