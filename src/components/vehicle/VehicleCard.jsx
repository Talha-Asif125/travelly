import React from 'react'
import { Link } from 'react-router-dom'
import {  FaStar } from "react-icons/fa";

const VehicleCard = (props) => {

  // Handle image display for both legacy vehicles and service-based vehicles
  const getImageSrc = () => {
    if (props.isService) {
      // For service-based vehicles, images might be base64 or URLs
      return props.vehicleMainImg?.startsWith('data:') 
        ? props.vehicleMainImg 
        : props.vehicleMainImg || '/images/default-vehicle.jpg';
    } else {
      // For legacy vehicles, use the existing path
      return `vehicle/images/${props.vehicleMainImg}`;
    }
  };

  const getBookingLink = () => {
    if (props.isService) {
      // For service-based vehicles, use service booking route
      return `/service/book/${props.id}`;
    } else {
      // For legacy vehicles, use existing vehicle booking route
      return `/vehicle/book/${props.id}`;
    }
  };

  return (
    <div className='flex flex-col w-[300px] md:w-[300px] items-center border shadow-lg m-auto mb-8  rounded-lg bg-white'>
        <img 
          src={getImageSrc()} 
          alt='vehicle' 
          className='rounded-lg'
          onError={(e) => {
            e.target.src = '/images/default-vehicle.jpg';
          }}
        />
        
        <h1 className='py-2 text-1xl font-bold border-b'>{props.brand + " " + props.model}</h1>
        {/* <div className='flex items-center'>
            <div className='flex'>
            <FaStar/>
            <FaStar/>
            <FaStar/>
            <FaStar/>
            <FaStar/>
            </div>
            <p className='px-2'>4.5</p>
        </div> */}
        <div className='flex '>
            <p className=''>{props.capacity} People</p>
            <p className='px-4'>{props.transmissionType}</p>
        </div>
        <p>{props.fuelType}</p>
        <div className='flex items-center justify-center'>
          <h1 className='text-2xl font-bold py-3'>Rs. {props.price}</h1>
          <h1 className=''>/per day</h1>
        </div>
        <Link to={getBookingLink()} className='w-full'>
          <button className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg text-sm w-full'>Book Now</button>
        </Link>
    </div>

    
  )
}

export default VehicleCard