import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ViewHotelReservations from './ViewHotelReservations';
import AddHotelReservation from './AddHotelReservation';

const HotelReservationRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ViewHotelReservations />} />
      <Route path="/add" element={<AddHotelReservation />} />
    </Routes>
  );
};

export default HotelReservationRoutes; 