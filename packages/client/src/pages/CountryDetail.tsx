import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Country } from '../helpers/types';

function CountryDetail() {
  const { iso } = useParams(); // :iso from the route /countries/:iso
  const [country, setCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!iso) return;

    fetch(`http://localhost:3001/countries/${iso}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching country details: ${response.status}`);
        }
        return response.json();
      })
      .then((data: Country) => {
        setCountry(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [iso]);

  if (loading) {
    return <div className="container mt-4">Loading country details...</div>;
  }
  if (error) {
    return <div className="container mt-4 text-danger">{error}</div>;
  }
  if (!country) {
    return <div className="container mt-4">Country not found.</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow bg-white">
        <div className="row">
          <div className="col-md-8">
            <h2 className="fw-bold mb-0">{country.country}</h2>
            <p className="text-muted mb-3">
              ISO Code: {country.countryisocode}
            </p>

            <p className="mb-3">
              Some interesting facts about {country.country} could go here.
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam
              mattis mi a magna varius tincidunt.
            </p>
            <p>
              Additional culture, geography, or travel advice about{' '}
              {country.country}. Possibly highlight its capital city, languages,
              or attractions.
            </p>
          </div>

          <div className="col-md-4 text-center d-flex flex-column justify-content-center">
            <i className="fa fa-flag fa-5x text-primary mb-3" />
            <p className="text-muted">Flag or scenic image might go here</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CountryDetail;
