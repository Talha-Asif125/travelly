import React, { useContext, useEffect, useState } from 'react'
import { FaFontAwesome, FaMinusCircle, FaWind, FaWindowClose } from 'react-icons/fa'
import { useLocation, useNavigate } from 'react-router-dom';
import axios from '../../api/axios';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/authContext';
import ProviderBadge from '../ui/ProviderBadge';


const HotelReserve = ({setOpen,hotelId,checkInDate,checkOutDate,date_difference}) => {

  const { user } = useContext(AuthContext);
  console.log(user.name);

  const navigate = useNavigate();
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hotelData, setHotelData] = useState(null);
  const [isServiceHotel, setIsServiceHotel] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const hotelName = hotelData?.name;
  const userName = user?.name;
  const totalDays = date_difference;

  // Fetch hotel data from either old hotel API or new service API
  useEffect(() => {
    const fetchHotelData = async () => {
      setLoading(true);
      setError(false);
      
      try {
        // First try old hotel API
        console.log(`Fetching hotel room data from /hotels/room/${hotelId}`);
        const roomResponse = await axios.get(`/hotels/room/${hotelId}`);
        
        if (roomResponse.data && roomResponse.data.length > 0) {
          console.log('Found rooms in old hotel system:', roomResponse.data);
          setData(roomResponse.data);
          
          // Get hotel details for name
          try {
            const hotelResponse = await axios.get(`/hotels/find/${hotelId}`);
            setHotelData(hotelResponse.data);
          } catch (err) {
            console.log('Could not fetch hotel details from old system');
          }
          
          setIsServiceHotel(false);
        } else {
          throw new Error('No rooms found in old system');
        }
      } catch (oldApiError) {
        console.log('Old hotel API failed, trying new service API:', oldApiError.message);
        
        try {
          // Try new service API - use hotel-specific endpoint first
          console.log(`Trying hotel service API: /services/hotel/${hotelId}`);
          let serviceResponse;
          try {
            serviceResponse = await axios.get(`/services/hotel/${hotelId}`);
            console.log('Hotel service endpoint worked:', serviceResponse.data);
          } catch (hotelEndpointError) {
            console.log('Hotel endpoint failed, trying general endpoint:', hotelEndpointError.message);
            // Fallback to general service endpoint
            serviceResponse = await axios.get(`/services/details/${hotelId}`);
            console.log('General service endpoint worked:', serviceResponse.data);
          }
          
          if (serviceResponse.data.success && serviceResponse.data.data) {
            const serviceData = serviceResponse.data.data;
            console.log('Found hotel in new service system:', serviceData);
            
            setHotelData(serviceData);
            setIsServiceHotel(true);
            
            // Convert roomTypes to old room format for compatibility
            if (serviceData.roomTypes && serviceData.roomTypes.length > 0) {
              const convertedRooms = serviceData.roomTypes.map((roomType, index) => ({
                _id: `${hotelId}_room_${index}`,
                title: roomType.name,
                description: `Sleeps ${roomType.sleeps}, ${roomType.beds}`,
                maxPeople: roomType.sleeps,
                price: roomType.pricePerNight,
                roomNumbers: Array.from({ length: roomType.availableRooms || 1 }, (_, i) => ({
                  _id: `${hotelId}_room_${index}_number_${i}`,
                  number: `${roomType.name} ${i + 1}`,
                  unavailableDates: [] // No availability system for new services yet
                }))
              }));
              
              console.log('Converted room data:', convertedRooms);
              setData(convertedRooms);
            } else {
              // Create a default room if no roomTypes
              const defaultRoom = [{
                _id: `${hotelId}_default_room`,
                title: 'Standard Room',
                description: serviceData.description || 'Comfortable accommodation',
                maxPeople: 2,
                price: serviceData.price,
                roomNumbers: [{
                  _id: `${hotelId}_default_room_1`,
                  number: 'Room 1',
                  unavailableDates: []
                }]
              }];
              
              console.log('Created default room:', defaultRoom);
              setData(defaultRoom);
            }
          } else {
            throw new Error('Hotel not found in service system');
          }
        } catch (serviceApiError) {
          console.error('Both APIs failed:', {
            oldApiError: oldApiError.message,
            serviceApiError: serviceApiError.message,
            hotelId,
            serviceResponse: serviceApiError.response?.data
          });
          setError(`Hotel not found or no rooms available. Hotel ID: ${hotelId}`);
        }
      }
      
      setLoading(false);
    };

    if (hotelId) {
      fetchHotelData();
    }
  }, [hotelId]);

  useEffect(() => {
    console.log("Calculating total price", { selectedRooms, data, date_difference });
    if (data.length > 0 && selectedRooms.length > 0) {
      let price = 0;
      data.forEach((item) => {
        item.roomNumbers.forEach((roomNumber) => {
          if (selectedRooms.includes(roomNumber._id)) {
            console.log('Adding price:', item.price);
            price += item.price;
          }
        });
      });
      setTotalPrice(price * date_difference);
      console.log('Total price calculated:', price * date_difference);
    } else {
      setTotalPrice(0);
    }
  }, [selectedRooms, data, date_difference]);

  const getDatesInRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const date = new Date(start.getTime());

    const dates = [];

    while (date <= end) {
      dates.push(new Date(date).getTime());
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const alldates = getDatesInRange(checkInDate,checkOutDate );

  const isAvailable = (roomNumber) => {
    // For new service hotels, all rooms are available since we don't have availability system yet
    if (isServiceHotel) {
      return true;
    }
    
    // For old hotels, check unavailable dates
    const isFound = roomNumber.unavailableDates.some((date) =>
      alldates.includes(new Date(date).getTime())
    );

    return !isFound;
  };

  const handleSelect = (e) => {
    const checked = e.target.checked;
    const value = e.target.value;
    setSelectedRooms(
      checked
        ? [...selectedRooms, value]
        : selectedRooms.filter((item) => item !== value)
    );
  };
  console.log(selectedRooms)

  function sendData() {
    const newReservation = {
      hotelName,
      checkInDate,
      checkOutDate,
      userName,
      totalPrice,
      totalDays,
      hotelId,
      isServiceHotel,
      selectedRooms: selectedRooms.length
    };

    console.log('Sending reservation data:', newReservation);

    axios
      .post(`/hotelreservation/reservation`, newReservation)
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'Rooms reserved successfully',
          confirmButtonText: 'OK',
          confirmButtonColor: '#1976d2',
          position: 'center'
        }).then(() => {
          setOpen(false);
          navigate("/hotelhome");
        });
      })
      .catch((err) => {
        console.error('Reservation error:', err);
        Swal.fire({
          icon: 'error',
          title: 'Reservation Failed',
          text: err.response?.data?.message || err.message || 'Something went wrong with your reservation',
          confirmButtonText: 'OK',
          confirmButtonColor: '#1976d2',
          position: 'center'
        })
      });
  }

  const handleClick = async () => {
    if (selectedRooms.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'No Rooms Selected',
        text: 'Please select at least one room to reserve',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2',
      });
      return;
    }

    try {
      // Only update availability for old hotel system
      if (!isServiceHotel) {
        await Promise.all(
          selectedRooms.map((roomId) => {
            const res = axios.put(`/rooms/availability/${roomId}`, {
              dates: alldates,
            });
            return res.data;
          })
        );
      }

      sendData();
    } catch (err) {
      console.error('Availability update error:', err);
      Swal.fire({
        icon: 'error',
        title: 'Reservation Failed',
        text: err.response?.data?.message || err.message || 'Something went wrong with your reservation',
        confirmButtonText: 'OK',
        confirmButtonColor: '#1976d2',
        position: 'center'
      });
    }
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-md p-8">
          <div className="text-center">Loading rooms...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-md p-8 max-w-md w-full">
          <div className="flex justify-end mb-4">
            <FaWindowClose
              className="text-gray-600 text-2xl cursor-pointer hover:text-red-500 transition-all duration-200"
              onClick={() => setOpen(false)}
            />
          </div>
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-gray-800 bg-opacity-50 z-50 flex justify-center items-center">
      <div className="bg-white rounded-md p-8 max-w-md w-full h-[600px] overflow-y-auto">
        <div className="flex justify-end">
          <FaWindowClose
            className="text-gray-600 text-2xl cursor-pointer hover:text-red-500 transition-all duration-200"
            onClick={() => setOpen(false)}
          />
        </div>
        <div className="font-bold text-xl mb-4">Select your rooms:</div>
        
        {/* User Information with Provider Badge */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <span className="text-gray-700 mr-2">Booking for:</span>
            <span className="font-semibold text-gray-900">{userName}</span>
            <ProviderBadge user={user} className="ml-2" />
          </div>
        </div>
        
        {data && data.length > 0 ? (
          data.map((item) => (
            <div className="mb-6" key={item._id}>
              <div className="font-bold mb-2">{item.title}</div>
              <div className="text-gray-600 mb-4">{item.description}</div>
              <div className="flex items-center mb-4">
                <div className="font-semibold mr-2">Max people:</div>
                <div className="text-gray-600">{item.maxPeople}</div>
              </div>

              <div className="flex items-center mb-4">
                <div className="font-semibold mr-2">Price per day:</div>
                <div className="text-gray-600">Rs. {item.price}</div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {item.roomNumbers.map((roomNumber) => (
                  <div className="flex flex-col items-center" key={roomNumber.number}>
                    <div className="font-bold mb-2">{roomNumber.number}</div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        value={roomNumber._id}
                        onChange={handleSelect}
                        disabled={!isAvailable(roomNumber)}
                        className="mr-2 cursor-pointer"
                      />
                      <div className={isAvailable(roomNumber) ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {isAvailable(roomNumber) ? "Available" : "Unavailable"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-600">No rooms available</div>
        )}
        
        <div className="flex justify-between items-center mt-6">
          <div className="font-bold text-lg">Total Payment: Rs.{totalPrice}</div>
          <div className="text-xl font-bold text-green-600"></div>
        </div>
        <button
          onClick={handleClick}
          className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-all duration-200 mt-6 w-full"
          disabled={selectedRooms.length === 0}
        >
          Reserve now
        </button>
      </div>
    </div>
  );
};

export default HotelReserve