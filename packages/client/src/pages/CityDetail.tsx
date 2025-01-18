import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { City } from '../helpers/types';

function CityDetail() {
  const { name } = useParams(); // :name from the route /cities/:name
  const [city, setCity] = useState<City | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) return;

    fetch(`http://localhost:3001/cities/${encodeURIComponent(name)}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching city details: ${response.status}`);
        }
        return response.json();
      })
      .then((data: City) => {
        setCity(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [name]);

  if (loading) {
    return <div className="container mt-4">Loading city details...</div>;
  }
  if (error) {
    return <div className="container mt-4 text-danger">{error}</div>;
  }
  if (!city) {
    return <div className="container mt-4">City not found.</div>;
  }

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow bg-white">
        <div className="row">
          <div className="col-md-8">
            <h2 className="fw-bold mb-0">{city.name}</h2>
            <p className="text-muted mb-3">
              Explore the vibrant atmosphere of {city.name}.
            </p>

            <p className="mb-3">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris in
              semper nulla. Integer sit amet metus enim. Proin metus sapien,
              hendrerit eget diam id, mollis tempor metus.
            </p>

            <p>
              More real-world details about {city.name} could be placed here.
              Potentially interesting facts or key attractions.
            </p>
          </div>

          <div className="col-md-4 text-center d-flex flex-column justify-content-center">
            <i className="fa fa-map-marker fa-5x text-warning mb-3" />
            <p className="text-muted">A scenic skyline, perhaps</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CityDetail;
