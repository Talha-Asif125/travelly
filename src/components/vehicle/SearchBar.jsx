import React, {useState, useEffect} from 'react'
import { } from "react-icons/fa";
import useFetch from '../../hooks/useFetch';
import { useNavigate } from 'react-router-dom';


const Searchbar = () => {

    const today = new Date().toISOString().slice(0, 10);  

    const [vehicleType, setVehicleType] = useState("");
    const [pickupLocation, setPickupLocation] = useState("");

    const [pickupDate, setPickupDate] = useState(today);
    const [returnDate, setReturnDate] = useState(today);
    const [combinedData, setCombinedData] = useState(null);

    const url =
      pickupLocation && vehicleType === "" ? `vehicle/location/get/${pickupLocation}`  
      : pickupLocation && vehicleType ? `vehicle/get/${vehicleType}/${pickupLocation}` 
      : vehicleType === "" ? "vehicle/"  
      : `vehicle/type/get/${vehicleType}`; 

    const { data: legacyVehicles } = useFetch(url);

    // Fetch new vehicle services
    const serviceUrl = 'services/vehicle';
    
    const { data: vehicleServices } = useFetch(serviceUrl);

    // Combine legacy vehicles and new vehicle services
    useEffect(() => {
      if (legacyVehicles || vehicleServices) {
        const legacy = legacyVehicles || [];
        const services = vehicleServices?.data || [];
        
        // Convert service format to match legacy vehicle format
        const convertedServices = services.map(service => ({
          _id: service._id,
          brand: service.name.split(' ')[0] || 'Vehicle', // Use first word as brand
          model: service.name.split(' ').slice(1).join(' ') || service.vehicleType || 'Service',
          vehicleType: service.vehicleType || 'Car',
          price: service.price,
          capacity: service.capacity || 4,
          transmissionType: service.features?.includes('Manual') ? 'Manual' : 'Automatic',
          fuelType: service.features?.includes('Diesel') ? 'Diesel' : 'Petrol',
          location: service.location,
          description: service.description,
          vehicleMainImg: service.images?.[0] || 'default-vehicle.jpg',
          isService: true // Flag to identify service-based vehicles
        }));

        const combined = [...legacy, ...convertedServices];
        setCombinedData(combined);
        console.log('Combined vehicle data:', combined);
      }
    }, [legacyVehicles, vehicleServices]);

    const navigate = useNavigate();

    useEffect(() => {
      if (combinedData) {
        navigate('/vehicles', {state: combinedData});
      }
    }, [combinedData, navigate]);

  return (
    <div className='bg-white mt-4 lg:mt-[-52px] px-8 shadow-lg max-w-[750px]  p-4 lg:text-left text-center h-full  items-center   mx-auto rounded-lg'>
        <form className='flex flex-col lg:flex-row justify-between  px-4'>
          <div className='flex flex-col'>
          <label for ='vehicleType' className='py-3'>Vehicle Type</label>
          <select className='p-3 border rounded-md w-full' value={vehicleType} onChange={(e) => setVehicleType(e.target.value) }> 
            <option value='' >All</option>
            <option >EV-Vehicles</option>
            <option>Car</option>
            <option>SUV</option>
            <option>Van</option>
            <option>Bus</option>
          </select>
          </div>

          <div className='flex flex-col pl-16'>
            <label for = 'pickupLocation' className='py-3'>Pick-up Location</label>
            <input type='text' list='city' className='border rounded-md  p-3 lg:w-[300px] w-full' placeholder='Islamabad' value={pickupLocation} onChange={(e) => setPickupLocation(e.target.value) }></input>

            <datalist id='city'>
              <option value='Rawalpindi'/>
              <option value = 'Lahore'/>
              <option value = 'Karachi'/>
              <option value = 'Islamabad'/>
              <option value = 'Peshawar'/>
              </datalist>
          </div>

          {/* <div className='flex flex-col'>
            <label for = 'pickupDate' className='py-3'>Pick-up Date</label>
            <input type='date' min={today} className='border rounded-md p-3 w-full' onChange={(e) => setPickupDate(e.target.value) }/>
          </div>

          <div className='flex flex-col'>
            <label for = 'returnDate' className='py-3'>Return Date</label>
            <input type='date' min={pickupDate} className='border rounded-md p-3 w-full' onChange={(e) => setReturnDate(e.target.value) }/>
          </div> */}

          <div className='lg:w-24  items-center w-full hidden'>
            <button type='submit' className='font-bold  text-white bg-[#41A4FF]  rounded-md p-3 text-center mt-4 w-full' >
            Search
            </button>
    
  </div>

        </form>
        
    </div>
  )
}

export default Searchbar