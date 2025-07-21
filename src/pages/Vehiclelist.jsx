import React, { useState, useEffect } from "react";
import Datatable from "../components/datatable/Datatable";
import { Link } from "react-router-dom";
import jspdf from "jspdf";
import "jspdf-autotable";
import AdminBackButton from "../components/AdminBackButton";
import axios from "../api/axios";
import Swal from "sweetalert2";

const Vehiclelist = ({ columns }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch vehicle data
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        console.log("Fetching vehicles...");
        
        let allVehicles = [];
        
        // Fetch traditional vehicles from /api/vehicle
        try {
          const vehiclesResponse = await axios.get("/vehicle");
          console.log("Traditional vehicles response:", vehiclesResponse.data);
          const traditionalVehicles = vehiclesResponse.data || [];
          allVehicles = [...traditionalVehicles];
        } catch (vehicleErr) {
          console.warn("Error fetching traditional vehicles:", vehicleErr);
        }
        
        // Fetch new vehicle services from /api/provider/services
        try {
          const servicesResponse = await axios.get("https://travelly-backend-27bn.onrender.com/api/provider/services?type=vehicle");
          console.log("Vehicle services response:", servicesResponse.data);
          
          if (servicesResponse.data.success) {
            const vehicleServices = (servicesResponse.data.data || []).map(service => ({
              _id: service._id,
              vehicleBrand: service.vehicleBrand || service.name?.split(' ')[0] || 'Unknown',
              vehicleModel: service.vehicleModel || service.name?.split(' ')[1] || 'Model',
              vehicleYear: service.vehicleYear || 'N/A',
              vehicleType: service.vehicleType || service.category || 'Vehicle',
              vehicleNumber: service.vehicleNumber || 'N/A',
              seatingCapacity: service.seatingCapacity || service.capacity || service.maxGroupSize || 'N/A',
              pricePerDay: service.price || 0,
              location: service.location || 'N/A',
              description: service.description || 'No description',
              vehicleImage: service.images?.[0] || '',
              providerId: service.providerId,
              status: service.status || 'active',
              isNewService: true, // Flag to distinguish new services
              createdAt: service.createdAt
            }));
            allVehicles = [...allVehicles, ...vehicleServices];
          }
        } catch (servicesErr) {
          console.warn("Error fetching vehicle services:", servicesErr);
        }
        
        console.log("All vehicles combined:", allVehicles);
        setData(allVehicles);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching vehicles:", err);
        console.error("Error details:", err.response ? err.response.data : "No response data");
        console.error("Error status:", err.response ? err.response.status : "No status");
        
        setError(err.message || "Error fetching vehicles");
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error loading vehicles",
          text: `Error: ${err.message}`,
          footer: err.response ? JSON.stringify(err.response.data) : "No server response"
        });
      }
    };

    fetchVehicles();
  }, []);

  // Refresh data after operations
  const refreshData = async () => {
    try {
      setLoading(true);
      console.log("Refreshing vehicle data...");
      
      let allVehicles = [];
      
      // Fetch traditional vehicles
      try {
        const vehiclesResponse = await axios.get("/vehicle");
        console.log("Traditional vehicles refresh:", vehiclesResponse.data);
        allVehicles = [...(vehiclesResponse.data || [])];
      } catch (vehicleErr) {
        console.warn("Error refreshing traditional vehicles:", vehicleErr);
      }
      
      // Fetch vehicle services
      try {
        const servicesResponse = await axios.get("https://travelly-backend-27bn.onrender.com/api/provider/services?type=vehicle");
        console.log("Vehicle services refresh:", servicesResponse.data);
        
        if (servicesResponse.data.success) {
          const vehicleServices = (servicesResponse.data.data || []).map(service => ({
            _id: service._id,
            vehicleBrand: service.vehicleBrand || service.name?.split(' ')[0] || 'Unknown',
            vehicleModel: service.vehicleModel || service.name?.split(' ')[1] || 'Model',
            vehicleYear: service.vehicleYear || 'N/A',
            vehicleType: service.vehicleType || service.category || 'Vehicle',
            vehicleNumber: service.vehicleNumber || 'N/A',
            seatingCapacity: service.seatingCapacity || service.capacity || service.maxGroupSize || 'N/A',
            pricePerDay: service.price || 0,
            location: service.location || 'N/A',
            description: service.description || 'No description',
            vehicleImage: service.images?.[0] || '',
            providerId: service.providerId,
            status: service.status || 'active',
            isNewService: true,
            createdAt: service.createdAt
          }));
          allVehicles = [...allVehicles, ...vehicleServices];
        }
      } catch (servicesErr) {
        console.warn("Error refreshing vehicle services:", servicesErr);
      }
      
      console.log("All vehicles refreshed:", allVehicles);
      setData(allVehicles);
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing data:", err);
      console.error("Error details:", err.response ? err.response.data : "No response data");
      console.error("Error status:", err.response ? err.response.status : "No status");
      setLoading(false);
    }
  };

  function generatePDF(vehicles) {
    const doc = new jspdf();
    const tableColumn = [
      "No",
      "Owner",
      "Brand",
      "Model",
      "Type",
      "Vehicle Number",
      "Location",
    ];
    const tableRows = [];

    vehicles
      .slice(0)
      .reverse()
      .map((vehicle, index) => {
        const vehicleData = [
          index + 1,
          vehicle.ownerName,
          vehicle.brand,
          vehicle.model,
          vehicle.vehicleType,
          vehicle.vehicleNumber,
          vehicle.location,
        ];
        tableRows.push(vehicleData);
        return vehicleData;
      });

    doc.autoTable(tableColumn, tableRows, {
      styles: { fontSize: 7 },
      startY: 35,
    });
    const date = Date().split(" ");
    const dateStr = date[1] + "-" + date[2] + "-" + date[3];
    doc.text("Traverly Vehicle Details Report", 14, 15).setFontSize(12);
    doc.text(`Report Generated: ${dateStr}`, 14, 23);
    doc.save(`Vehicle-Details-Report_${dateStr}.pdf`);
  }

  return (
    <>
      <AdminBackButton />
      <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-7 pb-2 justify-between md:items-center ">
        <div className="text-3xl font-bold">Vehicle Management</div>
        <div className="grid md:grid-cols-2 gap-1">
          <Link
            to="/vehicle/add"
            className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
          >
            Add Vehicle
          </Link>
          <Link
            to="/vehiclereservation"
            className="bg-gray-800 hover:bg-gray-600 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
          >
            Vehicle Reservations
          </Link>
        </div>
      </div>
      <div className="lg:px-32 px-8 flex md:justify-end mb-5">
        <button
          onClick={() => generatePDF(data)}
          className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3">
          Generate Report
        </button>
      </div>
      <div>
        <Datatable 
          columns={columns} 
          data={data}
          setData={setData}
          loading={loading}
          refreshData={refreshData}
        />
      </div>
      {error && <div className="text-center text-red-500 mt-4">{error}</div>}
    </>
  );
};

export default Vehiclelist;
