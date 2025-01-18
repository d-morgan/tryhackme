import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './app';
import HotelDetail from './pages/HotelDetail.tsx';
import CityDetail from './pages/CityDetail.tsx';
import CountryDetail from './pages/CountryDetail.tsx';
import './index.css'; // or wherever your global styles are

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />

        <Route path="/hotels/:id" element={<HotelDetail />} />
        <Route path="/cities/:name" element={<CityDetail />} />
        <Route path="/countries/:iso" element={<CountryDetail />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
