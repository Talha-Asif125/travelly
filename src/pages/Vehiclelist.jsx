import React, { useState, useEffect } from "react";
import Datatable from "../components/datatable/Datatable";
import { Link } from "react-router-dom";
import jspdf from "jspdf";
import "jspdf-autotable";
import AdminBackButton from "../components/AdminBackButton";
import axios from "axios";
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
        const response = await axios.get("http://localhost:5000/api/vehicle");
        console.log("Vehicles response:", response.data);
        setData(response.data);
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
      const response = await axios.get("http://localhost:5000/api/vehicle");
      console.log("Refresh response:", response.data);
      setData(response.data);
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
