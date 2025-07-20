import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaWindowClose } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/authContext';

const VehicleReserve = ({ setOpen, vehicleId, pickupDate, returnDate, date_difference }) => {
  const [vehicleData, setVehicleData] = useState(null);
  const [needDriver, setNeedDriver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    // Fetch vehicle data
    axios.get(`/api/vehicle/${vehicleId}`)
      .then(response => {
        setVehicleData(response.data);
      })
      .catch(err => {
        console.error('Error fetching vehicle data:', err);
      });
  }, [vehicleId]);

  const calculateTotalPrice = () => {
    if (!vehicleData) return 0;
    
    const vehicleFee = vehicleData.price * date_difference;
    const driverFee = needDriver ? 700000 * date_difference : 0;
    return vehicleFee + driverFee;
  };

  const sendData = () => {
    const reservationData = {
      userId: user._id,
      vehicleId,
      pickupDate,
      returnDate,
      needDriver,
    };

    console.log("Submitting vehicle reservation:", reservationData);

    const token = localStorage.getItem('token');

    axios
      .post(`/api/vehiclereservation`, reservationData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Vehicle reserved successfully! Please wait for owner confirmation.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#1976d2',
          position: 'center'
        }).then(() => {
          setOpen(false);
          navigate("/my-bookings");
        });
      })
      .catch((err) => {
        console.error('Vehicle reservation error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Reservation Failed',
          text: err.response?.data?.message || err.message || 'Something went wrong with your reservation',
          confirmButtonText: 'OK',
          confirmButtonColor: '#1976d2',
          position: 'center'
        });
      });
  };

  const handleReserve = () => {
    if (!needDriver && needDriver !== false) {
      Swal.fire({
        icon: 'warning',
        title: 'Please select',
        text: 'Please specify if you need a driver',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2',
      });
      return;
    }

    setIsLoading(true);
    sendData();
  };

  if (!vehicleData) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  const vehicleFee = vehicleData.price * date_difference;
  const driverFee = needDriver ? 2500 * date_difference : 0;
  const totalPrice = vehicleFee + driverFee;

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end mb-4">
          <FaWindowClose
            className="text-gray-600 text-2xl cursor-pointer hover:text-red-500 transition-all duration-200"
            onClick={() => setOpen(false)}
          />
        </div>

        <div className="text-center mb-6">
          <h2 className="font-bold text-xl mb-2">Reserve Vehicle</h2>
          <h3 className="font-semibold text-lg text-gray-700">
            {vehicleData.brand} {vehicleData.model}
          </h3>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between">
            <span className="font-medium">Location:</span>
            <span>{vehicleData.location}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Pickup Date:</span>
            <span>{new Date(pickupDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Return Date:</span>
            <span>{new Date(returnDate).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Duration:</span>
            <span>{date_difference} day{date_difference > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="mb-6">
          <label className="block font-semibold text-blue-600 mb-2">
            Need Driver *
          </label>
          <select
            value={needDriver ? 'Yes' : 'No'}
            onChange={(e) => setNeedDriver(e.target.value === 'Yes')}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        <div className="border-t pt-4 mb-6">
          <h4 className="font-semibold mb-2">Price Breakdown:</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Vehicle fee ({date_difference} day{date_difference > 1 ? 's' : ''})</span>
              <span>Rs. {vehicleFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Driver fee</span>
              <span>Rs. {driverFee.toLocaleString()}</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>Rs. {totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleReserve}
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 transition-all duration-200 font-semibold disabled:opacity-50"
        >
          {isLoading ? 'Processing...' : 'Reserve Now'}
        </button>
      </div>
    </div>
  );
};

export default VehicleReserve; 