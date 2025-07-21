import React, { useState, useEffect, useContext } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../../context/authContext';
import ProviderBadge from '../../components/ui/ProviderBadge';
import AdminBackButton from '../../components/AdminBackButton';
import axios from "../../api/axios";
import moment from "moment";
import jspdf from "jspdf";
import "jspdf-autotable";

const HotelReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch hotel reservations data
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/hotelreservation/getAll");
        // Add id field to each reservation for DataGrid
        const reservationsWithId = response.data.map((reservation, index) => ({
          ...reservation,
          id: reservation._id || index.toString(),
          formattedStartDate: moment(reservation.checkInDate).format("YYYY-MM-DD"),
          formattedEndDate: moment(reservation.checkOutDate).format("YYYY-MM-DD"),
          totalNights: calculateNights(reservation.checkInDate, reservation.checkOutDate),
          totalAmount: calculateTotalAmount(reservation)
        }));
        setReservations(reservationsWithId);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Error fetching hotel reservations");
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error loading reservations",
          text: err.message || "Failed to load hotel reservation data"
        });
      }
    };

    fetchReservations();
  }, []);

  const calculateNights = (startDate, endDate) => {
    const start = moment(startDate);
    const end = moment(endDate);
    return end.diff(start, 'days');
  };

  const calculateTotalAmount = (reservation) => {
    // Return the total price directly from the reservation
    return parseInt(reservation.totalPrice || 0);
  };

  // Generate PDF report
  const generatePDF = () => {
    const doc = new jspdf();
    const tableColumn = [
      "Reservation ID",
      "Hotel",
      "Guest Name",
      "Check In",
      "Check Out",
      "Days",
      "Total Price",
      "Status"
    ];
    const tableRows = reservations.map((reservation, index) => [
      reservation._id?.substring(0, 8) || index,
      reservation.hotelName || "N/A",
      reservation.userName || "N/A",
      moment(reservation.checkInDate).format("YYYY-MM-DD"),
      moment(reservation.checkOutDate).format("YYYY-MM-DD"),
      reservation.totalDays || calculateNights(reservation.checkInDate, reservation.checkOutDate),
      `Rs.${reservation.totalPrice || 0}`,
      reservation.status || "Pending"
    ]);

    doc.autoTable(tableColumn, tableRows, {
      styles: { fontSize: 7 },
      startY: 35,
      theme: 'grid'
    });
    const date = Date().split(" ");
    const dateStr = date[1] + "-" + date[2] + "-" + date[3];
    doc.text("Traverly Hotel Reservations Report", 14, 15).setFontSize(12);
    doc.text(`Report Generated: ${dateStr}`, 14, 23);
    doc.save(`Hotel-Reservations-Report_${dateStr}.pdf`);
  };

  // Handle reservation status change
  const handleStatusChange = async (id, newStatus) => {
    // Convert UI status to match backend enum values
    let statusValue = newStatus.toLowerCase();
    
    try {
      await axios.patch(`/hotelreservation/${id}`, { status: statusValue });
      setReservations(prevReservations => 
        prevReservations.map(reservation => 
          reservation._id === id ? { ...reservation, status: newStatus } : reservation
        )
      );
      Swal.fire({
        icon: "success",
        title: "Status Updated",
        text: `Reservation status changed to ${newStatus}`,
        timer: 1500
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: err.message || "Failed to update reservation status"
      });
    }
  };

  // Define columns for DataGrid
  const columns = [
    {
      field: "hotelName",
      headerName: "Hotel",
      width: 160,
      renderCell: (params) => (
        <div className="flex items-center">
          {params.row.hotelImage ? (
            <img 
              src={`https://travelly-backend-27bn.onrender.com/api/hotels/images/${params.row.hotelImage}`}
              alt="Hotel"
              className="w-8 h-8 rounded-full mr-2"
            />
          ) : null}
          <span>{params.row.hotelName}</span>
        </div>
      )
    },
    {
      field: "userName",
      headerName: "Guest Name",
      width: 160
    },
    {
      field: "formattedStartDate",
      headerName: "Check In",
      width: 120
    },
    {
      field: "formattedEndDate",
      headerName: "Check Out",
      width: 120
    },
    {
      field: "totalDays",
      headerName: "Days",
      width: 80,
      valueGetter: (params) => params.row.totalDays || params.row.totalNights
    },
    {
      field: "totalPrice",
      headerName: "Total Price",
      width: 120,
      renderCell: (params) => `Rs.${params.row.totalPrice || 0}`
    },
    {
      field: "status",
      headerName: "Status",
      width: 130,
      renderCell: (params) => (
        <div className={`px-3 py-1 rounded-full text-white ${
          params.row.status === 'confirmed' ? 'bg-green-500' :
          params.row.status === 'cancelled' ? 'bg-red-500' :
          params.row.status === 'completed' ? 'bg-blue-500' :
          'bg-yellow-500'
        }`}>
          {params.row.status ? params.row.status.charAt(0).toUpperCase() + params.row.status.slice(1) : "Pending"}
        </div>
      )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 240,
      renderCell: (params) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleStatusChange(params.row._id, "confirmed")}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            Confirm
          </button>
          <button
            onClick={() => handleStatusChange(params.row._id, "cancelled")}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            Cancel
          </button>
          <button
            onClick={() => handleStatusChange(params.row._id, "completed")}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            Complete
          </button>
          <button
            onClick={() => {
              Swal.fire({
                title: "Reservation Details",
                html: `
                  <div class="text-left">
                    <p><strong>Hotel:</strong> ${params.row.hotelName || "N/A"}</p>
                    <p><strong>Guest:</strong> ${params.row.userName || "N/A"}</p>
                    <p><strong>Email:</strong> ${params.row.email || "N/A"}</p>
                    <p><strong>Phone:</strong> ${params.row.phone || "N/A"}</p>
                    <p><strong>Check In:</strong> ${params.row.formattedStartDate}</p>
                    <p><strong>Check Out:</strong> ${params.row.formattedEndDate}</p>
                    <p><strong>Total Nights:</strong> ${params.row.totalNights}</p>
                    <p><strong>Price Per Night:</strong> Rs.${params.row.price || 0}</p>
                    <p><strong>Total Amount:</strong> Rs.${params.row.totalAmount}</p>
                    <p><strong>Status:</strong> ${params.row.status ? params.row.status.charAt(0).toUpperCase() + params.row.status.slice(1) : "Pending"}</p>
                    <p><strong>Special Requests:</strong> ${params.row.specialRequests || "None"}</p>
                  </div>
                `,
                width: 600,
                confirmButtonText: "Close"
              });
            }}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded text-xs"
          >
            View
          </button>
        </div>
      )
    }
  ];

  // Filter reservations based on search query
  const filteredReservations = searchQuery
    ? reservations.filter(reservation => 
        (reservation.hotelName && reservation.hotelName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (reservation.userName && reservation.userName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (reservation._id && reservation._id.includes(searchQuery))
      )
    : reservations;

  return (
    <div className="container mx-auto px-4 py-8">
      <AdminBackButton />
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Hotel Reservations</h1>
        <div className="flex flex-col md:flex-row gap-2">
          <Link to="/hotel-reservations/add" className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded">
            Add Reservation
          </Link>
          <Link to="/hotels" className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded">
            Manage Hotels
          </Link>
          <button 
            onClick={generatePDF}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Generate Report
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <input
              type="text"
              placeholder="Search by hotel name, guest name or reservation ID"
              className="w-full p-2 border border-gray-300 rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-1"></div>
              <span className="text-sm">Confirmed</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-1"></div>
              <span className="text-sm">Pending</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-1"></div>
              <span className="text-sm">Cancelled</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">
            {error}
          </div>
        ) : filteredReservations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No hotel reservations found</p>
            <p className="text-sm text-gray-400">
              {searchQuery ? "Try adjusting your search" : "When customers make hotel reservations, they will appear here"}
            </p>
          </div>
        ) : (
          <div style={{ height: 500, width: '100%' }}>
            <DataGrid
              rows={filteredReservations}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10, 25, 50]}
              checkboxSelection
              disableSelectionOnClick
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelReservations; 