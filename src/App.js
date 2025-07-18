import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React from "react";
import Layout from "./components/Layout/Layout";
import "./App.css";
import HotelReservations from "./pages/hotel-reservations/HotelReservations";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/AdminDashboard";
import ServiceProviderDashboard from "./pages/OwnerDashboard";
import ServiceProviderRequest from "./pages/OwnerRequest";
import ServiceDetails from "./components/ServiceDetails";
import { AuthContextProvider } from "./context/authContext";
import { ChatContextProvider } from './context/ChatContext';

export default function App() {
  return (
    <AuthContextProvider>
      <ChatContextProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/*" element={<Layout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/service-provider-dashboard" element={<ServiceProviderDashboard />} />
            <Route path="/service-provider-request" element={<ServiceProviderRequest />} />
            <Route path="/services/:type/:id" element={<ServiceDetails />} />
            <Route path="/hotel-reservations" element={<HotelReservations />} />
          </Routes>
        </BrowserRouter>
      </ChatContextProvider>
    </AuthContextProvider>
  );
}
