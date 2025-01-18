import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Hotel } from '../helpers/types';

function HotelDetail() {
  const { id } = useParams(); // :id from the route /hotels/:id
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`http://localhost:3001/hotels/${id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error fetching hotel details: ${response.status}`);
        }
        return response.json();
      })
      .then((data: Hotel) => {
        setHotel(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="container mt-4">Loading hotel details...</div>;
  }
  if (error) {
    return <div className="container mt-4 text-danger">{error}</div>;
  }
  if (!hotel) {
    return <div className="container mt-4">Hotel not found.</div>;
  }

  const renderStarRating = () => {
    const stars = [];
    for (let i = 0; i < hotel.star_rating; i++) {
      stars.push(<i key={i} className="fa fa-star text-warning me-1" />);
    }
    return stars.length ? stars : 'No star rating';
  };

  return (
    <div className="container mt-4">
      <div className="card p-4 shadow bg-white">
        <div className="row">
          <div className="col-md-8">
            <h2 className="fw-bold mb-0">{hotel.hotel_name}</h2>
            <p className="text-muted mb-3">{hotel.chain_name}</p>

            <div className="mb-3">
              <h6 className="fw-semibold">Address</h6>
              <p className="mb-1">
                <i className="fa fa-map-marker text-danger me-2" />
                {hotel.addressline1}
                {hotel.addressline2 && <span>, {hotel.addressline2}</span>}
              </p>
              <p className="mb-1">
                {hotel.city}, {hotel.state} {hotel.zipcode}
              </p>
              <p className="mb-1">
                {hotel.country} ({hotel.countryisocode})
              </p>
            </div>

            <div className="mb-3">
              <h6 className="fw-semibold">Star Rating</h6>
              {renderStarRating()}
            </div>
          </div>

          <div className="col-md-4 text-center d-flex flex-column justify-content-center">
            <div>
              <i className="fa fa-building fa-5x text-secondary mb-3" />
              <p className="text-muted">A nice photo of the hotel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelDetail;
