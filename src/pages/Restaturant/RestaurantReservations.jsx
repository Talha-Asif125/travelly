import React, { useState, useEffect } from "react";
import Datatable from "../../components/datatable/Datatable";
import jspdf from "jspdf";
import "jspdf-autotable";
import AdminBackButton from "../../components/AdminBackButton";
import axios from "../../api/axios";
import Swal from "sweetalert2";

// Add CSS for status colors
const styles = `
  .cellWithStatus {
    padding: 5px;
    border-radius: 5px;
    text-align: center;
  }
  .cellWithStatus.approved {
    background-color: #e5faf2;
    color: #3bb077;
  }
  .cellWithStatus.pending {
    background-color: #fff0f1;
    color: #d95087;
  }
  .cellWithStatus.declined {
    background-color: #fbf0f0;
    color: #d95087;
  }
`;

const restaurantReservationColumns = [
  {
    field: "id",
    headerName: "ID",
    width: 70,
  },
  {
    field: "customerName",
    headerName: "Customer Name",
    width: 150,
  },
  {
    field: "restaurantName",
    headerName: "Restaurant",
    width: 200,
  },
  {
    field: "date",
    headerName: "Date",
    width: 120,
  },
  {
    field: "time",
    headerName: "Time",
    width: 100,
  },
  {
    field: "guests",
    headerName: "Guests",
    width: 80,
  },
  {
    field: "status",
    headerName: "Status",
    width: 120,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.status === "CONFIRMED" ? "approved" : params.row.status === "PENDING" ? "pending" : "declined"}`}>
          {params.row.status}
        </div>
      );
    }
  },
];

const RestaurantReservations = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch restaurant reservation data
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        // First try the post endpoint
        try {
          const response = await axios.post("/restaurantReservation/get-reservation-request", {});
          
          // Process the data to add IDs and format for the DataGrid
          const processedData = Array.isArray(response.data) ? response.data.map((reservation, index) => ({
            id: index + 1,
            _id: reservation._id,
            customerName: reservation.customerName || "Guest",
            restaurantName: reservation.restaurantName || "Restaurant",
            date: new Date(reservation.date).toLocaleDateString(),
            time: reservation.time || "N/A",
            guests: reservation.guests || 1,
            status: reservation.status || "PENDING"
          })) : [];
          
          setData(processedData);
          setLoading(false);
        } catch (postError) {
          // If post endpoint fails, try the get endpoint as fallback
          const response = await axios.get("/restaurantReservation");
          
          // Process the data to add IDs and format for the DataGrid
          const processedData = Array.isArray(response.data) ? response.data.map((reservation, index) => ({
            id: index + 1,
            _id: reservation._id,
            customerName: reservation.customerName || "Guest",
            restaurantName: reservation.restaurantName || "Restaurant",
            date: new Date(reservation.date).toLocaleDateString(),
            time: reservation.time || "N/A",
            guests: reservation.guests || 1,
            status: reservation.status || "PENDING"
          })) : [];
          
          setData(processedData);
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || "Error fetching restaurant reservations");
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error loading reservations",
          text: err.message || "Failed to load reservation data"
        });
      }
    };

    fetchReservations();
  }, []);

  // Refresh data after operations
  const refreshData = async () => {
    try {
      setLoading(true);
      try {
        const response = await axios.post("/restaurantReservation/get-reservation-request", {});
        
        // Process the data again
        const processedData = Array.isArray(response.data) ? response.data.map((reservation, index) => ({
          id: index + 1,
          _id: reservation._id,
          customerName: reservation.customerName || "Guest",
          restaurantName: reservation.restaurantName || "Restaurant",
          date: new Date(reservation.date).toLocaleDateString(),
          time: reservation.time || "N/A",
          guests: reservation.guests || 1,
          status: reservation.status || "PENDING"
        })) : [];
        
        setData(processedData);
        setLoading(false);
      } catch (postError) {
        // If post endpoint fails, try the get endpoint as fallback
        const response = await axios.get("/restaurantReservation");
        
        // Process the data again
        const processedData = Array.isArray(response.data) ? response.data.map((reservation, index) => ({
          id: index + 1,
          _id: reservation._id,
          customerName: reservation.customerName || "Guest",
          restaurantName: reservation.restaurantName || "Restaurant",
          date: new Date(reservation.date).toLocaleDateString(),
          time: reservation.time || "N/A",
          guests: reservation.guests || 1,
          status: reservation.status || "PENDING"
        })) : [];
        
        setData(processedData);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
      setLoading(false);
    }
  };

  function generatePDF(reservations) {
    const doc = new jspdf();
    const tableColumn = [
      "No",
      "Customer",
      "Restaurant",
      "Date",
      "Time",
      "Guests",
      "Status"
    ];
    const tableRows = [];

    reservations
      .slice(0)
      .reverse()
      .map((reservation, index) => {
        const resData = [
          index + 1,
          reservation.customerName,
          reservation.restaurantName,
          reservation.date,
          reservation.time,
          reservation.guests,
          reservation.status
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
    doc.text("Traverly Restaurant Reservation Report", 14, 15).setFontSize(12);
    doc.text(`Report Generated: ${dateStr}`, 14, 23);
    doc.save(`Restaurant-Reservation-Report_${dateStr}.pdf`);
  }

  return (
    <>
      <style>{styles}</style>
      <AdminBackButton />
      <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-7 pb-2 justify-between md:items-center">
        <div className="text-3xl font-bold">Restaurant Reservations</div>
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
          columns={restaurantReservationColumns} 
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

export default RestaurantReservations; 