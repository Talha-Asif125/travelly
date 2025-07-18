import React, { useContext, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Admin from "../pages/Admin";
import VehicleHome from "../pages/vehicle/VehicleHome";
import VehicleBook from "../pages/vehicle/VehicleBook";
import VehiclePayment from "../pages/vehicle/VehiclePayment";
import Register from "../pages/Register";
import Userlist from "../pages/Userlist";
import ToursHome from "../pages/Tour/Home";
import TourDetails from "../pages/Tour/TourDetails";
import TourView from "../pages/Tour/Admin/ViewTour";
import UpdateTour from "../pages/Tour/Admin/updateAddedTour";
import SearchResults from "../pages/Tour/SerachResults";
import AllTourCategories from "../components/Tour/AllTourCategories";
import AddTourPackage from "../pages/Tour/Admin/AddTourPackage";
import Community from "../pages/Community";
import { AuthContext } from "../context/authContext";
import {
  hotelColumns,
  tourColumns,
  tourReservationColumns,
  trainColumns,
  userColumns,
  vehicleColumns,
  vehicleReservationColumns,
  restaurantColumns
} from "../components/datatable/datatablesource";
import Vehiclelist from "../pages/Vehiclelist";
import Activity from "../pages/special_activity/Activity";
import PendingActivities from "../pages/special_activity/PendingActivities";
import FilterActivities from "../pages/special_activity/FilterActivities";
import ActivityForm from "../pages/special_activity/AddNewActivity";
import MyActivities from "../pages/special_activity/MyActivities";
import ReservationPage from "../pages/special_activity/Reservations";
import PendingReservationsPage from "../pages/special_activity/PendingReservations";
import UserpageA from "../pages/UserpageA";
import UpdateuserA from "../pages/UpdateuserA";
import Profile from "../pages/Profile";
import Profileupdate from "../pages/Profileupdate";
import Resturentslist from "../pages/Resturentslist";
import EventManagement from "../pages/event/EventManagement";
import AirplaneTravel from "../pages/airplane/AirplaneTravel";
import RestaurantList from "../pages/RestaurantList";
import RestaurantDetails from "../pages/RestaurantDetails";
import RestaurantAdminDetails from "../pages/RestaurantAdminDetails";

import TrainBook from "../pages/train/TrainBook";
import AddNewTrain from "../pages/train/AddNewTrain";
import TrainHomeAdmmin from "../pages/train/TrainHomeAdmin";
import SingleTrainView from "../pages/train/SingleTrainView";
import AddPassengerDetails from "../pages/train/AddPassengerDetails";
import DoUpdateTrain from "../pages/train/DoUpdateTrain";

import Adduser from "../pages/Adduser";
import { HotelHome } from "../pages/hotel/HotelHome";
import AddHotel from "../pages/hotel/AddHotel";
import { AddRoom } from "../pages/hotel/AddRoom";
import UpdateHotel from "../pages/hotel/UpdateHotel";
import AddVehicle from "../pages/vehicle/AddVehicle";
import EditVehicle from "../pages/vehicle/EditVehicle";
import HotelView from "../components/hotel/HotelView";
import HotelDetailsView from "../components/hotel/HotelDetailsView";
import HotelOverView from "../components/hotel/HotelOverview";
import VehicleView from "../pages/vehicle/VehicleView";
import MapPage from "../pages/MapPage";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";

import RestaurentForm from "../pages/Restaturant/RestaurantForm";
import HadminView from "../pages/hotel/HadminView";
import HotelReserve from "../components/hotel/HotelReserve";
import Hotellist from "../pages/Hotellist";
import Tourlist from "../pages/Tourlist";
import Trainlist from "../pages/Trainlist";
import ContactUs from "../pages/ContactUs";
import ContactMessages from "../pages/admin/ContactMessages";
import HotelBook from "../pages/hotel/HotelBook";
import ResetPassword from "../pages/ResetPassword";
import Tourreservations from "../pages/Tourreservations";
import Vehiclereservation from "../pages/Vehiclereservation";
import ReviewTickets from "../pages/train/ReviewTickets";
import ReviewPanel from "../pages/train/ReviewPanel";
import MyTickets from "../pages/train/MyTickets";
import MyOneTicket from "../pages/train/MyOneTicket";
import TravelerHome from "../pages/train/TravelerHome";

import { Main } from "../pages/Main";
import Refund from "../components/Refund";
import RefundReq from "../components/RefundReq";
import RefundUpdate from "../components/RefundUpdate";
import { SalaryCalculation } from "../pages/SalaryCalculation";
import { EmployeeList } from "../pages/EmployeeList";
import { SalarySheet } from "../pages/SalarySheet";
import { FinanceHealth } from "../pages/FinanceHealth";
import ReservationManagement from "../pages/ReservationManagement";
import RestaurantReservations from "../pages/Restaturant/RestaurantReservations";
import HotelReservationRoutes from '../pages/hotel-reservations/HotelReservationRoutes';

import FlightHome from "../pages/flight/FlightHome";
import FlightDetails from "../pages/flight/FlightDetails";
import FlightBooking from "../pages/flight/FlightBooking";
import FlightPayment from "../pages/flight/FlightPayment";
import FlightReservations from "../pages/flight/FlightReservations";
import FlightView from "../pages/flight/FlightView";
import MyBookings from "../pages/MyBookings";
import ServiceProviderDashboard from "../pages/OwnerDashboard";
import ServiceProviderRequest from "../pages/OwnerRequest";
import ServiceBook from "../pages/ServiceBook";
import Chat from "../pages/Chat";
import HotelServiceCreate from "../pages/HotelServiceCreate";
import ChatHub from "../pages/ChatHub";

const RouteTour = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Check session timeout (1 hour)
  useEffect(() => {
    // Only run if user is logged in and is admin
    if (user && user.isAdmin) {
      // Get the login timestamp from localStorage
      const loginTime = localStorage.getItem("adminLoginTime");
      
      if (!loginTime) {
        // Set login time if not already set
        localStorage.setItem("adminLoginTime", Date.now().toString());
      } else {
        // Check if the session has expired (1 hour = 3600000 milliseconds)
        const currentTime = Date.now();
        const sessionTime = currentTime - parseInt(loginTime);
        
        if (sessionTime > 3600000) {
          // Session expired, log out and redirect
          localStorage.removeItem("adminLoginTime");
          alert("Your admin session has expired. Please log in again.");
          navigate("/login");
        }
      }
    }
  }, [user, navigate]);

  // Regular ProtectedRoute for authenticated users
  // eslint-disable-next-line no-unused-vars
  const ProtectedRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  // AdminRoute for admin-only pages
  const AdminRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
      return <Navigate to="/login" />;
    }
    
    if (!user.isAdmin) {
      return <Navigate to="/" />;
    }
    
    // Set admin login time if not already set
    if (!localStorage.getItem("adminLoginTime")) {
      localStorage.setItem("adminLoginTime", Date.now().toString());
    }
    
    return children;
  };

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        }
      />
      <Route path="/register" element={<Register />} />

      <Route
        path="/users"
        element={
          <AdminRoute>
            <Userlist columns={userColumns} />
          </AdminRoute>
        }
      />
      <Route
        path="/hotels"
        element={
          <AdminRoute>
            <Hotellist columns={hotelColumns} />
          </AdminRoute>
        }
      />
      <Route
        path="/tours"
        element={
          <AdminRoute>
            <Tourlist columns={tourColumns} />
          </AdminRoute>
        }
      />
      <Route
        path="/tourreservation/all"
        element={
          <AdminRoute>
            <Tourreservations columns={tourReservationColumns} />
          </AdminRoute>
        }
      />
      <Route
        path="/train"
        element={
          <AdminRoute>
            <Trainlist columns={trainColumns} />
          </AdminRoute>
        }
      />
      <Route
        path="/vehicle"
        element={
          <AdminRoute>
            <Vehiclelist columns={vehicleColumns} />
          </AdminRoute>
        }
      />
      <Route
        path="/vehiclereservation"
        element={
          <AdminRoute>
            <Vehiclereservation columns={vehicleReservationColumns} />
          </AdminRoute>
        }
      />
      <Route
        path="/contact-messages"
        element={
          <AdminRoute>
            <ContactMessages />
          </AdminRoute>
        }
      />

      <Route path="/userpage" element={<UserpageA />} />
      <Route path="/update" element={<UpdateuserA />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/updateProfile" element={<Profileupdate />} />
      <Route path="/adduser" element={<Adduser />} />

      {/* Yasiru Deshan  */}
      <Route path="/vehicles" element={<VehicleHome />} />
      <Route path="/vehicle/book/:id" element={<VehicleBook />} />
      <Route path="/vehicle/payment/" element={<VehiclePayment />} />
      <Route path="/vehicle/add" element={<AddVehicle />} />
      <Route path="/vehicle/edit/:id" element={<EditVehicle />} />
      <Route path="/vehicle/view/" element={<VehicleView />} />

      {/* //ishara */}
      <Route path="/tours/home" element={<ToursHome />} />
      <Route path="/tours/:id" element={<TourDetails />} />
      <Route
        path="/tours/search/:destination/:duration/:maxsize"
        element={<SearchResults />}
      />
      <Route path="/addtour" element={<AddTourPackage />} />
      <Route path="/tour/view" element={<TourView />} />
      <Route path="/tour/update" element={<UpdateTour />} />

      <Route path="/sunandbeach" element={<AllTourCategories />} />
      <Route path="/hikingandtrekking" element={<AllTourCategories />} />
      <Route path="/wildsafari" element={<AllTourCategories />} />
      <Route path="/special" element={<AllTourCategories />} />
      <Route path="/cultural" element={<AllTourCategories />} />
      <Route path="/festival" element={<AllTourCategories />} />

      <Route path="/contactus" element={<ContactUs />} />
      <Route path="/map" element={<MapPage />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />

      {/* Hansika */}
      <Route path="/add-new-activity" element={<ActivityForm />} />
      <Route path="/add-new-activity/:id" element={<ActivityForm />} />
      <Route path="/pending-activities" element={<PendingActivities />} />
      <Route
        path="/pending-reservations"
        element={<PendingReservationsPage />}
      />
      <Route path="/events" element={<FilterActivities />} />
      <Route path="/activities/:id" element={<Activity />} />
      <Route path="/my-activities" element={<MyActivities />} />
      <Route path="/my-reservations" element={<ReservationPage />} />

      {/*sehan*/}

      <Route path="/train/book/:id" element={<TrainBook />} />
      <Route path="/train/add" element={<AddNewTrain />} />
      <Route path="/adminTrain" element={<TrainHomeAdmmin />} />
      <Route path="/adminTrain/:id" element={<SingleTrainView />} />
      <Route
        path="/train/book/passengerDet"
        element={<AddPassengerDetails />}
      />
      <Route path="/train/update/:id" element={<DoUpdateTrain />} />
      <Route path="/TrainHome" element={<TravelerHome />} />
      <Route path="/trains" element={<Trainlist />} />
      <Route path="/adminTrain/reviewTicket/:id" element={<ReviewTickets />} />
      <Route path="/adminTrain/reviewPanel" element={<ReviewPanel />} />
      <Route path="/train/MyTickets" element={<MyTickets />} />
      <Route path="/train/MyTickets/:id" element={<MyOneTicket />} />
      <Route path="/trainpassenger/:id" element={<AddPassengerDetails />} />

      {/* navindi */}
      <Route 
        path="/addrestaurants" 
        element={
          <AdminRoute>
            <RestaurentForm />
          </AdminRoute>
        } 
      />

      {/*Dinidu*/}
      <Route path="/finance" element={<Main />} />
      <Route path="/finance/salary" element={<SalaryCalculation />} />
      <Route path="/finance/employee" element={<EmployeeList />} />
      <Route path="/finance/salarySheet" element={<SalarySheet />} />
      <Route path="/finance/FinanceHealth" element={<FinanceHealth />} />
      {<Route path="/finance/refund" element={<Refund />} />}
      {<Route path="finance/addRefund" element={<RefundReq />} />}
      {<Route path="finance/updateRefund/:id" element={<RefundUpdate />} />}

      <Route 
        path="/Restaurants" 
        element={<RestaurantList />} 
      />
      
      <Route 
        path="/admin/restaurants" 
        element={
          <AdminRoute>
            <Resturentslist columns={restaurantColumns} />
          </AdminRoute>
        } 
      />
      
      <Route path="/restaurant-reservations" 
        element={
          <AdminRoute>
            <RestaurantReservations />
          </AdminRoute>
        } 
      />
      
      <Route path="/restaurant-list" element={<RestaurantList />} />
      <Route path="/restaurant-details/:id" element={<RestaurantDetails />} />
      <Route path="/restaurant-admin-details/:id" element={<RestaurantAdminDetails />} />

      <Route
        path="/reservations"
        element={
          <AdminRoute>
            <ReservationManagement />
          </AdminRoute>
        }
      />
      
      <Route path="/hotel-reservations/*" element={<HotelReservationRoutes />} />

      <Route 
        path="/event-management" 
        element={
          <AdminRoute>
            <EventManagement />
          </AdminRoute>
        } 
      />

      <Route
        path="/airplane-travel"
        element={
          <AdminRoute>
            <AirplaneTravel />
          </AdminRoute>
        }
      />
      
      {/* Airplane routes for regular users */}
      <Route path="/flights" element={<FlightHome />} />
      <Route path="/flights/:id" element={<FlightDetails />} />
      <Route path="/flight-booking/:id" element={<FlightBooking />} />
      <Route path="/flight-payment" element={<FlightPayment />} />
      <Route path="/my-bookings" element={<MyBookings />} />
      <Route path="/flight-reservations" element={<FlightReservations />} />
      <Route path="/flight-view/:id" element={<FlightView />} />

      {/* chamith */}
      <Route path="/hotelhome" element={<HotelHome />} />
      <Route path="/hotels/new" element={<AddHotel />} />
      <Route path="/rooms/new/:id" element={<AddRoom />} />
      <Route path="/hotels/update/:id" element={<UpdateHotel />} />
      <Route path="/hotel/:id" element={<HotelView />} />
      <Route path="/hoteloverview/:id" element={<HotelOverView />} />
      <Route path="/hotel-details/:id" element={<HotelDetailsView />} />
      <Route path="/hoteladmin" element={<HadminView />} />
      <Route path="/hotelreserve/:id" element={<HotelReserve />} />
      <Route path="/hotelbooking" element={<HotelBook />} />
      
      {/* Service Provider Routes */}
      <Route 
        path="/service-provider-dashboard" 
        element={
          <ProtectedRoute>
            <ServiceProviderDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/service-provider-request" 
        element={
          <ProtectedRoute>
            <ServiceProviderRequest />
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/hotel-service-create" 
        element={
          <ProtectedRoute>
            <HotelServiceCreate />
          </ProtectedRoute>
        } 
      />

      {/* Service Booking */}
      <Route path="/service/book/:id" element={<ServiceBook />} />

      {/* Community */}
      <Route path="/community" element={<Community />} />

      {/* Chat Routes */}
      <Route path="/chat-hub" element={<ChatHub />} />
      <Route path="/chat" element={<Chat />} />
    </Routes>
  );
};

export default RouteTour;
