import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import VehicleReserve from "./VehicleReserve";

const VehicleView = () => {

  const [data, setData] = useState([]);
  const location = useLocation();
  const date = location.state;
 
  console.log(date)
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openBook, setOpenBook] = useState(false);

  const pickupDate = new Date(date.pickupDate);
  const returnDate = new Date(date.returnDate);
  console.log(user)
 
  const miliseconds_per_day = 1000 * 60 * 60 * 24;

  function dayDifference(date1, date2) {
    const timeDifference = Math.abs(date2.getTime() - date1.getTime());
    const differenceDays = Math.ceil(timeDifference / miliseconds_per_day);
    return differenceDays;
  }

  const day_difference = (dayDifference(pickupDate, returnDate))
  console.log(day_difference)

  useEffect(() => {
    axios
      .get(`/api/vehicle/${id}`)
      .then((response) => {
        setData(response.data);
        console.log(data.vehicleMainImg);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  const handleClick = () => {
    if (user) {
      setOpenBook(true)
    }
    else {
      navigate("/login");
    }
  }

  return (
    <div className="lg:p-24">
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

          <div className="flex flex-col md:flex-row py-4 justify-between lg:items-center">
            <div className="flex items-center">
              <h1 className="font-bold text-2xl">
                Book for Rs.{data.price * day_difference}
              </h1>
              <h1 className="ml-3 md:text-1xl">/for {day_difference} days</h1>
            </div>
          </div>
          
          <button onClick={handleClick} className="bg-[#41A4FF] text-white rounded-md lg:ml-8 font-bold p-3 my-5 lg:my-0 w-full md:w-[350px] md:my-0 lg:w-[300px] ">
            Reserve now
          </button>
        </div>
      </div>
      
      <h1 className="text-center lg:text-left py-5 font-bold text-2xl ml-10">
        Images of our vehicle
      </h1>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {data.vehicleImgs &&
          data.vehicleImgs.map((image, index) => (
            <img
              src={`http://localhost:5000/api/vehicle/images/${image}`}
              alt={`Vehicle Image ${index}`}
              key={index}
              class="ml-10 w-64 h-64 rounded-lg mb-2"
            />
          ))}
      </div>
      
      {openBook && <VehicleReserve setOpen={setOpenBook} vehicleId={id} pickupDate={date.pickupDate} returnDate={date.returnDate} date_difference={day_difference} />}

    </div>
  );
};

export default VehicleView;
