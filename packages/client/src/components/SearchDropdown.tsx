import React from 'react';
import type { Hotel, Country, City } from '../helpers/types';

interface SearchDropdownProps {
  results: {
    hotels: Hotel[];
    countries: Country[];
    cities: City[];
  };
  searchTerm: string;
}

function SearchDropdown({ results, searchTerm }: SearchDropdownProps) {
  if (!searchTerm) {
    return null;
  }

  return (
    <div className="search-dropdown-menu dropdown-menu w-100 show p-2">
      <h2>Hotels</h2>
      {results.hotels.length ? (
        results.hotels.map((hotel) => (
          <li key={hotel._id}>
            <a href={`/hotels/${hotel._id}`} className="dropdown-item">
              <i className="fa fa-building mr-2"></i>
              {hotel.hotel_name}
            </a>
            <hr className="divider" />
          </li>
        ))
      ) : (
        <p>No hotels matched</p>
      )}

      <h2>Countries</h2>
      {results.countries.length ? (
        results.countries.map((country) => (
          <li key={country._id}>
            <a
              href={`/countries/${country.countryisocode}`}
              className="dropdown-item"
            >
              <i className="fa fa-flag mr-2"></i>
              {country.country}
            </a>
            <hr className="divider" />
          </li>
        ))
      ) : (
        <p>No countries matched</p>
      )}

      <h2>Cities</h2>
      {results.cities.length ? (
        results.cities.map((city) => (
          <li key={city._id}>
            <a href={`/cities/${city.name}`} className="dropdown-item">
              <i className="fa fa-map-marker mr-2"></i>
              {city.name}
            </a>
            <hr className="divider" />
          </li>
        ))
      ) : (
        <p>No cities matched</p>
      )}
    </div>
  );
}

export default SearchDropdown;
