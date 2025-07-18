import React, { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import HeroTour from "../../components/Tour/HeroTour";
import TourNav from "../../components/Tour/TourNav";
import { AiFillStar } from "react-icons/ai";
import { Stepper, initTE, Ripple, Input, Datepicker } from "tw-elements";
import DaysShow from "../../components/Tour/DaysShow";
import InclusionExclusion from "../../components/Tour/InclusionExclusion";
import { AuthContext } from "../../context/authContext";
import Swal from "sweetalert2";
import axios from "axios";

const TourDetails = () => {
  const { id } = useParams();

  const [firstName, setFname] = useState("");
  const [lastName, setLname] = useState("");
  const [date, setDate] = useState("");
  const [phone, setPhone] = useState(0);
  const [guestCount, setGuests] = useState("");

  const [allTours, setTour] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const getTours = async () => {
      try {
        setLoading(true);
        console.log("Fetching tour details for ID:", id);
        const response = await axios.get(`/api/tours/${id}`);
        console.log("Tour details response:", response.data);
        
        if (response.data.status === "Success") {
          setTour(response.data.data.oneTour);
        } else {
          setError("Tour not found");
        }
      } catch (err) {
        console.error("Error fetching tour details:", err);
        setError(err.response?.data?.message || err.message || "Failed to load tour details");
      } finally {
        setLoading(false);
      }
    };
    getTours();
    initTE({ Stepper, initTE, Ripple, Input, Datepicker });
  }, [id]);
  //get email of current user
  const { user } = useContext(AuthContext);
  const currentUser = user?.email;

  const inputHandler = async (e) => {
    e.preventDefault();
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Please Login",
        text: "You need to login first to book a tour",
        confirmButtonText: "OK",
        confirmButtonColor: "#41A4FF",
      });
      return;
    }

    if (!firstName || !lastName || !date || !phone || !guestCount) {
      Swal.fire({
        icon: "warning",
        title: "Missing Information",
        text: "Please fill in all the required fields",
        confirmButtonText: "OK",
        confirmButtonColor: "#41A4FF",
      });
      return;
    }

    try {
      const bookingData = {
        tourId: id,
        tourOwnerId: allTours.currentUser,
        customerName: `${firstName} ${lastName}`,
        customerEmail: currentUser,
        customerPhone: phone,
        tourDate: date,
        guests: parseInt(guestCount),
        tourName: allTours.name,
        tourPrice: allTours.price,
        totalAmount: allTours.price * parseInt(guestCount),
        specialRequests: "" // Can be added to form later if needed
      };

      console.log("Booking data:", bookingData);

      const response = await axios.post("/api/tours/reservations", bookingData);

      if (response.data.status === "Success") {
        Swal.fire({
          icon: "success",
          title: "Booking Successful!",
          text: "Your tour has been booked successfully. Please wait for confirmation from the tour provider.",
          confirmButtonText: "OK",
          confirmButtonColor: "#41A4FF",
        });

        // Reset form
        setFname("");
        setLname("");
        setDate("");
        setPhone("");
        setGuests("");
      }
    } catch (err) {
      console.error("Booking error:", err);
      Swal.fire({
        icon: "error",
        title: "Booking Failed",
        text: err.response?.data?.message || "Something went wrong with your booking",
        confirmButtonText: "OK",
        confirmButtonColor: "#41A4FF",
      });
    }
  };

  if (loading) {
    return (
      <div>
        <HeroTour />
        <TourNav />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"></div>
            <p className="mt-4 text-xl">Loading tour details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <HeroTour />
        <TourNav />
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <p className="text-red-500 text-xl mb-4">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <HeroTour />
      <TourNav />
      {/* Nav bar */}
      <nav className="bg-grey-light w-full rounded-md pl-20 pt-10">
        <ol className="list-reset flex">
          <li>
            <Link
              to="/"
              className="text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
            >
              Home
            </Link>
          </li>
          <li>
            <span className="mx-2 text-neutral-500 dark:text-neutral-400">/</span>
          </li>
          <li>
            <Link
              to="/tours"
              className="text-primary transition duration-150 ease-in-out hover:text-primary-600 focus:text-primary-600 active:text-primary-700 dark:text-primary-400 dark:hover:text-primary-500 dark:focus:text-primary-500 dark:active:text-primary-600"
            >
              Tours
            </Link>
          </li>
          <li>
            <span className="mx-2 text-neutral-500 dark:text-neutral-400">/</span>
          </li>
          <li className="text-neutral-500 dark:text-neutral-400">
            {allTours.name || "Tour Details"}
          </li>
        </ol>
      </nav>

      {/* tour name */}
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-4 sm:py-15 lg:max-w-7xl lg:px-8">
        <h1 className="text-6xl font-bold">{allTours.name}</h1>
      </div>

      {/* body section */}
      <div className="grid grid-cols-4">
        {/* tour details left */}
        <div className="col-span-3">
          <div className="mx-auto max-w-2xl px-4 py-10 sm:px-4 sm:py-15 lg:max-w-7xl lg:px-8">
            <img
              src={allTours.img}
              alt={allTours.name}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/800x400?text=Tour+Image";
              }}
            />
          </div>

          {/* tour details short info */}
          <div className="mx-auto max-w-2xl px-4 py-10 sm:px-4 sm:py-15 lg:max-w-7xl lg:px-8">
            <div className="my-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-5 xl:gap-x-8">
              <div>
                <p className="text-3xl font-bold mb-6 text-gray-500">Category</p>
                <p className="text-2xl mb-6">{allTours.category}</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-6 text-gray-500">Duration</p>
                <p className="text-2xl mb-6">{allTours.duration}</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-6 text-gray-500">Ranking</p>
                <div className="flex flex-row mr-2 space-x-2">
                  <p className="text-2xl mb-6">4.5</p>
                  <AiFillStar className="text-3xl text-yellow-500" />
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold mb-6 text-gray-500">Group Size</p>
                <p className="text-2xl mb-6">{allTours.groupCount}</p>
              </div>
              <div>
                <p className="text-3xl font-bold mb-6 text-gray-500">Languages</p>
                <p className="text-2xl mb-6">{allTours.languages}</p>
              </div>
            </div>
          </div>
        </div>

        {/* tour details right */}
        <div className="col-span-1">
          <div className="shadow-2xl rounded-xl border-dotted border-2 border-sky-500 grid grid-cols-1 px-4">
            <div>
              {/* first row */}
              <div className="grid grid-cols-2">
                {/* left col */}
                <div>
                  <p className="text-lg p-2 font-bold ">Starting From</p>
                  <p className="p-3 ml-10 text-blue-600  text-5xl">
                    <span className="font-semibold">${allTours.price}</span>
                    <span className="text-sm text-black">/Per Person</span>
                  </p>
                </div>
                {/* right col */}
                <div className="flex flex-row-reverse space-x-2 float-right pt-3 ">
                  {/* <p className="text-lg">({reviews.length} Reviews)</p> */}
                  <AiFillStar className="text-2xl text-yellow-500 " />
                  <p className="text-lg mb-6">{}</p>
                </div>
              </div>

              {/* second row */}
              <div className="flex flex-row pl-10 pt-2 pr-2 space-x-3 mb-4">
                <p className="text-xl font-bold">Cities:</p>
                <p className="text-xl  mb-0   text-blue-500">
                  {allTours.cities}
                </p>
              </div>

              {/* third row */}
              <div className="text-xl p-2 grid grid-cols-2">
                <div>
                  <span className="font-bold">Tour ID :</span> T0027
                </div>
                <div>
                  <button
                    type="button"
                    class=" w-full rounded-xl bg-[#FE4D42] px-6 pb-2 pt-2.5 text-sm font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] dark:shadow-[0_4px_9px_-4px_rgba(59,113,202,0.5)] dark:hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)] dark:active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.2),0_4px_18px_0_rgba(59,113,202,0.1)]"
                  >
                    Customize Your Tour
                  </button>
                </div>
              </div>
            </div>
            {/* booking form */}
            <div className="px-4 mb-6 mt-2">
              <p className="text-3xl mb-10 text-center">Booking Details</p>
              <div className="flex justify-center items-center">
                <div class=" block max-w-md rounded-lg bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] ">
                  <form>
                    <div class="grid grid-cols-2 gap-4">
                      <div class="relative mb-6" data-te-input-wrapper-init>
                        <input
                          type="text"
                          class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-black dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                          id="firstName"
                          aria-describedby="emailHelp123"
                          placeholder="First name"
                          onChange={(e) => {
                            setFname(e.target.value);
                          }}
                        />
                        <label
                          for="firstName"
                          class="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                        >
                          First name
                        </label>
                      </div>
                      <div class="relative mb-6" data-te-input-wrapper-init>
                        <input
                          type="text"
                          class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-black dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                          id="lastName"
                          aria-describedby="emailHelp124"
                          placeholder="Last name"
                          onChange={(e) => {
                            setLname(e.target.value);
                          }}
                        />
                        <label
                          for="lastName"
                          class="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                        >
                          Last name
                        </label>
                      </div>
                    </div>
                    {/* date */}
                    <div
                      class="relative mb-3"
                      id="datepicker-disable-past"
                      data-te-input-wrapper-init
                    >
                      <input
                        type="date"
                        id="date"
                        min={new Date().toISOString().split("T")[0]}
                        class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 peer-focus:text-primary data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-black dark:placeholder:text-neutral-200 dark:peer-focus:text-primary [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                        placeholder="Select a date"
                        onChange={(e) => {
                          setDate(e.target.value);
                        }}
                      />
                      <label
                        for="date"
                        class="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                      >
                        Select a date
                      </label>
                    </div>

                    {/* phone number */}
                    <div class="grid grid-cols-2 gap-4">
                      <div class="relative mb-6" data-te-input-wrapper-init>
                        <input
                          type="tel"
                          class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-black dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                          id="phone"
                          placeholder="First name"
                          onChange={(e) => {
                            setPhone(e.target.value);
                          }}
                        />
                        <label
                          for="phone"
                          class="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                        >
                          Phone Number
                        </label>
                      </div>
                      <div class="relative mb-6" data-te-input-wrapper-init>
                        <input
                          type="number"
                          class="peer block min-h-[auto] w-full rounded border-0 bg-transparent px-3 py-[0.32rem] leading-[1.6] outline-none transition-all duration-200 ease-linear focus:placeholder:opacity-100 data-[te-input-state-active]:placeholder:opacity-100 motion-reduce:transition-none dark:text-black dark:placeholder:text-neutral-200 [&:not([data-te-input-placeholder-active])]:placeholder:opacity-0"
                          id="countGuest"
                          placeholder="Last name"
                          onChange={(e) => {
                            setGuests(e.target.value);
                          }}
                        />
                        <label
                          for="countGuest"
                          class="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                        >
                          No of Guests
                        </label>
                      </div>
                    </div>
                    <button
                      type="submit"
                      class="inline-block w-full rounded-xl bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)]"
                      data-te-ripple-init
                      data-te-ripple-color="light"
                      onClick={inputHandler}
                    >
                      Book Now
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-4 sm:py-15 lg:max-w-7xl lg:px-8">
        <h1 className="text-5xl  mb-11">Description</h1>
        <p className="text-2xl">{allTours.description}</p>
      </div>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-4 sm:py-15 lg:max-w-7xl lg:px-8">
        <h1 className="text-5xl  mb-11">Introduction</h1>
        <p className="text-2xl">{allTours.introduction}</p>
      </div>
      {/* stepper */}
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-4 sm:py-15 lg:max-w-7xl lg:px-8">
        <DaysShow />
      </div>
      {/* inclustion exclution */}
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-4 sm:py-15 lg:max-w-7xl lg:px-8">
        <InclusionExclusion tourData={allTours} />
      </div>
    </div>
  );
};

export default TourDetails;
