import React from "react";
import { Link } from "react-router-dom";
import AdminBackButton from "../components/AdminBackButton";

const ReservationManagement = () => {
  return (
    <>
      <AdminBackButton />
      <div className="md:px-20 md:pt-10 md:pb-20 p-5 pb-10">
        <h1 className="text-center text-[#41A4FF] text-3xl font-bold mb-8">
          Reservation Management
        </h1>

        <div className="flex flex-col space-y-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/hotel-reservations"
              className="p-8 bg-white hover:bg-[#41A4FF] hover:text-white transition duration-300 ease-in-out rounded-lg font-bold shadow-lg text-center flex items-center justify-center"
            >
              <div>
                <h2 className="text-xl mb-2">Hotel Reservations</h2>
                <p className="text-sm font-normal">Manage all hotel bookings and reservations</p>
              </div>
            </Link>
            
            <Link
              to="/tourreservation/all"
              className="p-8 bg-white hover:bg-[#41A4FF] hover:text-white transition duration-300 ease-in-out rounded-lg font-bold shadow-lg text-center flex items-center justify-center"
            >
              <div>
                <h2 className="text-xl mb-2">Tour Reservations</h2>
                <p className="text-sm font-normal">Manage all tour package bookings</p>
              </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/vehiclereservation"
              className="p-8 bg-white hover:bg-[#41A4FF] hover:text-white transition duration-300 ease-in-out rounded-lg font-bold shadow-lg text-center flex items-center justify-center"
            >
              <div>
                <h2 className="text-xl mb-2">Vehicle Reservations</h2>
                <p className="text-sm font-normal">Manage all vehicle rentals and bookings</p>
              </div>
            </Link>
            
            <Link
              to="/adminTrain/reviewPanel"
              className="p-8 bg-white hover:bg-[#41A4FF] hover:text-white transition duration-300 ease-in-out rounded-lg font-bold shadow-lg text-center flex items-center justify-center"
            >
              <div>
                <h2 className="text-xl mb-2">Train Reservations</h2>
                <p className="text-sm font-normal">Manage all train ticket bookings</p>
              </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              to="/restaurant-reservations"
              className="p-8 bg-white hover:bg-[#41A4FF] hover:text-white transition duration-300 ease-in-out rounded-lg font-bold shadow-lg text-center flex items-center justify-center"
            >
              <div>
                <h2 className="text-xl mb-2">Restaurant Reservations</h2>
                <p className="text-sm font-normal">Manage all restaurant table bookings</p>
              </div>
            </Link>
            
            <Link
              to="/pending-reservations"
              className="p-8 bg-white hover:bg-[#41A4FF] hover:text-white transition duration-300 ease-in-out rounded-lg font-bold shadow-lg text-center flex items-center justify-center"
            >
              <div>
                <h2 className="text-xl mb-2">Event Reservations</h2>
                <p className="text-sm font-normal">Manage all special event bookings</p>
              </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <Link
              to="/flight-reservations"
              className="p-8 bg-white hover:bg-[#41A4FF] hover:text-white transition duration-300 ease-in-out rounded-lg font-bold shadow-lg text-center flex items-center justify-center"
            >
              <div>
                <h2 className="text-xl mb-2">Flight Reservations</h2>
                <p className="text-sm font-normal">Manage all airplane ticket bookings</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReservationManagement; 