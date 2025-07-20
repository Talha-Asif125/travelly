import React, {useState, useEffect} from "react";
import axios from "axios";
import {useNavigate, useParams } from "react-router-dom";



const VehicleBook = () => {

    const [data, setData] = useState([]); 
    const navigate = useNavigate();

    const today = new Date().toISOString().slice(0, 10);  
  
    const [pickupDate, setPickupDate] = useState(today);
    const [returnDate, setReturnDate] = useState(today);
    const [driver, setDriver] = useState(false);

  
    const { id } = useParams();



    useEffect(() => {
      const fetchData = async () => {
        try {
          console.log("Fetching vehicle and reservation data for ID:", id);
          const [vehicleResponse, reservationResponse] = await Promise.all([
            axios.get(`http://localhost:5000/api/vehicle/${id}`),
            axios.get(`http://localhost:5000/api/vehiclereservation/traveler/vehicles/${id}`)
          ]);
          
          // modify the reservation data format to match the input type of date fields
          const formattedReservationData = reservationResponse.data.map(reservation => ({
            ...reservation,
            pickupDate: new Date(reservation.pickupDate).toISOString().slice(0, 10),
            returnDate: new Date(reservation.returnDate).toISOString().slice(0, 10),
          }));
    
          setData(vehicleResponse.data);
          console.log("Vehicle data: ", vehicleResponse.data);
          console.log("Reservation data: ", formattedReservationData);
        } catch (error) {
          console.error("Error fetching vehicle data:", error);
          console.error("Error details:", error.response ? error.response.data : "No response data");
          console.error("Error status:", error.response ? error.response.status : "No status");
        }
      };
      fetchData();
    }, [id]);


    const handleReserveClick = () => {
      navigate("/vehicle/payment", { state: { data, pickupDate, returnDate, driver } });
    };
  
    



    
///vehiclereservation/traveler/vehicles/${id}

  return (
    <div className="lg:p-20">
      <div className="flex justify-center items-center w-full flex-col lg:flex-row pt-12 lg:pt-0">
        <img
          src={`http://localhost:5000/api/vehicle/images/${data.vehicleMainImg}`}
          alt="vehMainImg"
          className="w-[320px] md:w-[700px] lg:w-[600px] rounded-lg"
        />

        <div className="lg:px-24">
          <h1 className="text-center lg:text-left py-5 font-bold text-2xl">
            {data.brand + " " + data.model}
          </h1>
          <p className="max-w-[320px] md:max-w-[700px] lg:max-w-[600px] text-justify">
            {data.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="font-bold py-5">Location : </h1>
              <h1 className="px-4">{data.location}</h1>
            </div>
            <div>
              <h1 className="text-[#41A4FF]">Free Cancellation</h1>
            </div>
          </div>

          <form className="" onSubmit={handleReserveClick}>

          <div className="flex justify-between md:flex-row">
            <div className="flex flex-col text-left">
              <h1 className="font-bold text-left">Pickup Date :</h1>
              <input type='date' required min={today} className='border rounded-md p-3 w-full' onChange={(e) => setPickupDate(e.target.value) } />

            </div>



            <div className="flex flex-col ">
              <h1 className="font-bold text-left">Return Date :</h1>
              <input type='date' required min={pickupDate} className='border rounded-md p-3 w-full' onChange={(e) => setReturnDate(e.target.value) } />

            </div>
            
          </div>
          
          <div className="pt-4">
            <label className="block text-lg font-bold text-[#41A4FF] mb-2">
              Need Driver *
            </label>
            <select 
              value={driver ? 'Yes' : 'No'}
              onChange={(e) => setDriver(e.target.value === 'Yes')}
              className="border rounded-md p-3 w-full"
              required
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>
          </div>
         
          <div className="flex flex-col md:flex-row mt-6  py-2 justify-between lg:items-center">
            <div className="flex items-center">
              <h1 className="font-bold text-2xl">Rs.{data.price}</h1>
              <h1 className="md:text-1xl">/per day</h1>
            </div>
            
              <button className="bg-[#41A4FF] text-white rounded-md lg:ml-8 font-bold p-3 my-5 lg:my-0 w-full md:w-[350px] md:my-0 lg:w-[300px] " type="submit">
                Reserve
              </button>
            
          </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default VehicleBook;
