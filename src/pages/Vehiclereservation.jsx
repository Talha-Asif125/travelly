import React, { useState, useEffect } from "react";
import Datatable from "../components/datatable/Datatable";
import jspdf from "jspdf";
import "jspdf-autotable";
import AdminBackButton from "../components/AdminBackButton";
import axios from "axios";
import Swal from "sweetalert2";

const Vehiclereservation = ({ columns }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch vehicle reservation data
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        console.log("Fetching vehicle reservations...");
        const response = await axios.get("http://localhost:5000/api/vehiclereservation");
        console.log("Reservations response:", response.data);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching reservations:", err);
        console.error("Error details:", err.response ? err.response.data : "No response data");
        console.error("Error status:", err.response ? err.response.status : "No status");
        
        setError(err.message || "Error fetching vehicle reservations");
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error loading reservations",
          text: `Error: ${err.message}`,
          footer: err.response ? JSON.stringify(err.response.data) : "No server response"
        });
      }
    };

    fetchReservations();
  }, []);

  // Refresh data after operations
  const refreshData = async () => {
    try {
      setLoading(true);
      console.log("Refreshing reservation data...");
      const response = await axios.get("http://localhost:5000/api/vehiclereservation");
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

  function generatePDF(reservations) {
    const doc = new jspdf();
    const tableColumn = [
      "No",
      "Date",
      "Vehicle No",
      "Location",
      "Pickup Date",
      "Return Date",
      "Price",
      "Driver"
    ];
    const tableRows = [];

    reservations
      .slice(0)
      .reverse()
      .map((reservation, index) => {
        const resData = [
          index + 1,
          reservation.date,
          reservation.vehicleNumber,
          reservation.location,
          reservation.pickupDate,
          reservation.returnDate,
          reservation.price,
          reservation.needDriver ? "Yes" : "No"
        ];
        tableRows.push(resData);
        return resData;
      });

    doc.autoTable(tableColumn, tableRows, {
      styles: { fontSize: 7 },
      startY: 35,
    });
    const date = Date().split(" ");
    const dateStr = date[1] + "-" + date[2] + "-" + date[3];
    doc.text("Traverly Vehicle Reservation Report", 14, 15).setFontSize(12);
    doc.text(`Report Generated: ${dateStr}`, 14, 23);
    doc.save(`Vehicle-Reservation-Report_${dateStr}.pdf`);
  }

  return (
    <>
      <AdminBackButton />
      <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-7 pb-2 justify-between md:items-center">
        <div className="text-3xl font-bold">Vehicle Reservations</div>
        <div>
          <button
            onClick={() => generatePDF(data)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
          >
            Generate Report
          </button>
        </div>
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

export default Vehiclereservation;
