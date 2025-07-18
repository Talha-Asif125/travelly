import React from "react";
import { FaHotel } from "react-icons/fa";
import { MdTour } from "react-icons/md";
import { AiFillCar } from "react-icons/ai";
import { BiRestaurant } from "react-icons/bi";
import { BsCalendarEvent } from "react-icons/bs";
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Hotel Reservation",
    icon: <FaHotel />,
    link: "/hotelhome"
  },
  {
    name: "Tour Package Reservation",
    icon: <MdTour />,
    link: "/tours/home"
  },
  {
    name: "Vehicle Reservation",
    icon: <AiFillCar />,
    link: "/vehicles"
  },
  {
    name: "Restaurant Reservation",
    icon: <BiRestaurant />,
    link: "/restaurant-list" // This will need a new endpoint/view
  },
  {
    name: "Event Reservation",
    icon: <BsCalendarEvent />,
    link: "/events"
  },
];
const Services = () => {
  return (
    <>
      <div className="lg:px-36 lg:pt-5 lg:pb-[90px]">
        <div className="container mx-auto">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="mx-auto mb-12 max-w-[510px] text-center lg:mb-20">
                <span className="text-primary mb-2 block text-lg font-semibold">
                  Our Services
                </span>
                <h2 className="text-dark mb-4 text-3xl font-bold sm:text-4xl md:text-[40px]">
                  What We Offer
                </h2>
                <p className="text-body-color text-base">
                We craft seamless travel experiences from start to finish. Discover handpicked destinations, book vetted accommodations, and unlock exclusive local experiences—all in one place. Whether you need a meticulously planned itinerary or spontaneous adventure ideas, we've got you covered with real-time support, insider knowledge, and personalized recommendations.
                From mountain escapes to cultural immersions, we don't just arrange trips—we create unforgettable journeys.
                </p>
              </div>
            </div>
          </div>
          <div className="-mx-4 grid lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link to={category.link} key={index} className="no-underline text-black">
                <div className="mb-8 rounded-[20px] bg-white p-2 shadow-md hover:shadow-lg md:px-7 grid grid-cols-2 justify-center transition duration-300 transform hover:scale-105">
                  <div className="text-black text-3xl mb-8 flex h-[70px] w-[70px] items-center justify-center rounded-2xl">
                    {category.icon}
                  </div>
                  <h4 className="text-dark mb-3 mt-5 text-lg font-semibold">
                    {category.name}
                  </h4>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Services;
