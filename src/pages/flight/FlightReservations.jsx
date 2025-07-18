import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Datatable from "../../components/datatable/Datatable";
import AdminBackButton from '../../components/AdminBackButton';
import jspdf from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from "../../api/axios";

const FlightReservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'bookingReference', headerName: 'Booking Ref', width: 130 },
    { field: 'flightNumber', headerName: 'Flight No.', width: 120 },
    { field: 'passengerName', headerName: 'Passenger', width: 150 },
    { field: 'origin', headerName: 'Origin', width: 120 },
    { field: 'destination', headerName: 'Destination', width: 120 },
    { field: 'departureDate', headerName: 'Departure Date', width: 130 },
    { field: 'totalAmount', headerName: 'Amount (PKR)', width: 130 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => {
        const statusClass = params.row.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                           params.row.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                           'bg-yellow-100 text-yellow-800';
        return (
          <div className={`px-2 py-1 rounded ${statusClass} text-xs font-semibold`}>
            {params.row.status}
          </div>
        );
      },
    }
  ];

  // Add actions column
  useEffect(() => {
    if (columns && columns.length > 0 && !columns.find(col => col.field === 'actions')) {
      columns.push({
        field: 'actions',
        headerName: 'Actions',
        width: 180,
        renderCell: (params) => {
          return (
            <div className="flex gap-2">
              <button
                onClick={() => handleViewReservation(params.row)}
                className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                View
              </button>
              <button 
                onClick={() => handleUpdateStatus(params.row, 'Confirmed')}
                className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                disabled={params.row.status === 'Confirmed'}
              >
                Confirm
              </button>
              <button
                onClick={() => handleUpdateStatus(params.row, 'Cancelled')}
                className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                disabled={params.row.status === 'Cancelled'}
              >
                Cancel
              </button>
            </div>
          );
        },
      });
    }
  }, [columns]);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // For demonstration purposes, we're using mock data
      const mockReservations = [
        { 
          id: 1, 
          bookingReference: 'TB123456', 
          flightNumber: 'PK301', 
          passengerName: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+92 300 1234567',
          origin: 'Islamabad', 
          destination: 'Karachi', 
          departureDate: '2023-12-25',
          departureTime: '09:00',
          arrivalTime: '11:00',
          passengers: 1,
          totalAmount: 12000, 
          status: 'Confirmed',
          bookingDate: '2023-11-15',
          paymentStatus: 'Paid'
        },
        { 
          id: 2, 
          bookingReference: 'TB234567', 
          flightNumber: 'PK205', 
          passengerName: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+92 300 7654321',
          origin: 'Lahore', 
          destination: 'Dubai', 
          departureDate: '2023-12-28',
          departureTime: '14:30',
          arrivalTime: '17:30',
          passengers: 2,
          totalAmount: 90000, 
          status: 'Pending',
          bookingDate: '2023-11-20',
          paymentStatus: 'Paid'
        },
        { 
          id: 3, 
          bookingReference: 'TB345678', 
          flightNumber: 'PK762', 
          passengerName: 'Ahmed Khan',
          email: 'ahmed.khan@example.com',
          phone: '+92 333 1112223',
          origin: 'Karachi', 
          destination: 'Peshawar', 
          departureDate: '2023-12-26',
          departureTime: '18:45',
          arrivalTime: '20:15',
          passengers: 3,
          totalAmount: 42000, 
          status: 'Confirmed',
          bookingDate: '2023-11-18',
          paymentStatus: 'Paid'
        },
        { 
          id: 4, 
          bookingReference: 'TB456789', 
          flightNumber: 'PK503', 
          passengerName: 'Sara Ali',
          email: 'sara.ali@example.com',
          phone: '+92 321 9876543',
          origin: 'Lahore', 
          destination: 'Islamabad', 
          departureDate: '2023-12-30',
          departureTime: '07:30',
          arrivalTime: '08:30',
          passengers: 1,
          totalAmount: 10000, 
          status: 'Cancelled',
          bookingDate: '2023-11-22',
          paymentStatus: 'Refunded'
        },
      ];
      
      setTimeout(() => {
        setReservations(mockReservations);
        setLoading(false);
      }, 500);
    } catch (err) {
      console.error("Error fetching flight reservations:", err);
      setError(err.message || "Error fetching flight reservations");
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error loading reservations",
        text: err.message || "Failed to load flight reservation data"
      });
    }
  };

  const handleViewReservation = (reservation) => {
    Swal.fire({
      title: 'Reservation Details',
      html: `
        <div class="text-left">
          <p><strong>Booking Reference:</strong> ${reservation.bookingReference}</p>
          <p><strong>Flight Number:</strong> ${reservation.flightNumber}</p>
          <p><strong>Passenger:</strong> ${reservation.passengerName}</p>
          <p><strong>Email:</strong> ${reservation.email}</p>
          <p><strong>Phone:</strong> ${reservation.phone}</p>
          <p><strong>Origin:</strong> ${reservation.origin}</p>
          <p><strong>Destination:</strong> ${reservation.destination}</p>
          <p><strong>Departure Date:</strong> ${reservation.departureDate}</p>
          <p><strong>Departure Time:</strong> ${reservation.departureTime}</p>
          <p><strong>Arrival Time:</strong> ${reservation.arrivalTime}</p>
          <p><strong>Passengers:</strong> ${reservation.passengers}</p>
          <p><strong>Total Amount:</strong> PKR ${reservation.totalAmount.toLocaleString()}</p>
          <p><strong>Status:</strong> ${reservation.status}</p>
          <p><strong>Booking Date:</strong> ${reservation.bookingDate}</p>
          <p><strong>Payment Status:</strong> ${reservation.paymentStatus}</p>
        </div>
      `,
      width: 600,
      confirmButtonText: 'Close'
    });
  };

  const handleUpdateStatus = (reservation, newStatus) => {
    Swal.fire({
      title: 'Update Reservation Status',
      text: `Are you sure you want to ${newStatus.toLowerCase()} this reservation?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'Confirmed' ? '#3085d6' : '#d33',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, ${newStatus.toLowerCase()} it!`
    }).then((result) => {
      if (result.isConfirmed) {
        // In a real app, this would be an API call
        // For now, update the reservation status in the local state
        const updatedReservations = reservations.map((item) => {
          if (item.id === reservation.id) {
            return { ...item, status: newStatus };
          }
          return item;
        });
        
        setReservations(updatedReservations);
        
        Swal.fire(
          'Updated!',
          `The reservation has been ${newStatus.toLowerCase()}.`,
          'success'
        );
      }
    });
  };

  const generatePDF = () => {
    const doc = new jspdf();
    const tableColumn = [
      "Booking Ref",
      "Flight No.",
      "Passenger",
      "Origin",
      "Destination",
      "Date",
      "Amount (PKR)",
      "Status"
    ];
    const tableRows = [];

    reservations
      .slice(0)
      .reverse()
      .map((reservation) => {
        const reservationData = [
          reservation.bookingReference,
          reservation.flightNumber,
          reservation.passengerName,
          reservation.origin,
          reservation.destination,
          reservation.departureDate,
          reservation.totalAmount.toLocaleString(),
          reservation.status
        ];
        tableRows.push(reservationData);
        return reservationData;
      });

    doc.autoTable(tableColumn, tableRows, {
      styles: { fontSize: 7 },
      startY: 35,
    });
    const date = Date().split(" ");
    const dateStr = date[1] + "-" + date[2] + "-" + date[3];
    doc.text("Travel Buddy Flight Reservations Report", 14, 15).setFontSize(12);
    doc.text(`Report Generated: ${dateStr}`, 14, 23);
    doc.save(`Flight-Reservations-Report_${dateStr}.pdf`);
  };

  return (
    <>
      <AdminBackButton />
      <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-7 pb-2 justify-between md:items-center ">
        <div className="text-3xl font-bold">Flight Reservations</div>
        <div className="grid md:grid-cols-2 gap-1">
          <Link to="/airplane-travel" className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3">
            Manage Flights
          </Link>
          <button
            onClick={generatePDF}
            className="bg-green-500 hover:bg-green-700 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3">
            Generate Report
          </button>
        </div>
      </div>
      <div>
        <Datatable
          columns={columns}
          data={reservations}
          setData={setReservations}
          loading={loading}
          refreshData={fetchReservations}
        />
      </div>
      {error && <div className="text-center text-red-500 mt-4">{error}</div>}
    </>
  );
};

export default FlightReservations; 