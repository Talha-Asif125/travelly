import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import jspdf from "jspdf";
import "jspdf-autotable";
import AdminBackButton from "../../components/AdminBackButton";
import axios from "../../api/axios";
import Swal from "sweetalert2";
import CircularProgress from "@mui/material/CircularProgress";

const hotelReservationColumns = [
  {
    field: "id",
    headerName: "ID",
    width: 70,
  },
  {
    field: "hotelName",
    headerName: "Hotel",
    width: 200,
  },
  {
    field: "customerName",
    headerName: "Customer",
    width: 150,
  },
  {
    field: "checkIn",
    headerName: "Check In",
    width: 120,
  },
  {
    field: "checkOut",
    headerName: "Check Out",
    width: 120,
  },
  {
    field: "guests",
    headerName: "Guests",
    width: 100,
  },
  {
    field: "amount",
    headerName: "Amount",
    width: 100,
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

const ViewHotelReservations = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/hotelReservation");
        
        // Process the data to add IDs and format for the DataGrid
        const processedData = response.data.map((reservation, index) => ({
          id: index + 1,
          _id: reservation._id,
          hotelName: reservation.hotelName || "Unknown Hotel",
          customerName: reservation.name || "Guest",
          checkIn: new Date(reservation.checkIn).toLocaleDateString(),
          checkOut: new Date(reservation.checkOut).toLocaleDateString(),
          guests: reservation.guests || 1,
          amount: `$${reservation.amount || 0}`,
          status: reservation.status || "PENDING"
        }));
        
        setData(processedData);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Error fetching hotel reservations");
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

  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure you want to delete this reservation?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    });

    if (confirmResult.isConfirmed) {
      try {
        setLoading(true);
        await axios.delete(`/hotelReservation/${id}`);
        
        setData(data.filter(item => item._id !== id));
        setLoading(false);
        
        Swal.fire("Deleted!", "The reservation has been deleted.", "success");
      } catch (error) {
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error Deleting Reservation",
          text: `Error: ${error.message}`,
        });
      }
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      setLoading(true);
      await axios.put(`/hotelReservation/${id}`, { status: newStatus });
      
      // Update local state to reflect the change
      setData(data.map(item => 
        item._id === id ? { ...item, status: newStatus } : item
      ));
      
      setLoading(false);
      Swal.fire("Updated!", `Reservation status changed to ${newStatus}`, "success");
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error Updating Status",
        text: `Error: ${error.message}`,
      });
    }
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Action",
      width: 300,
      renderCell: (params) => {
        return (
          <div className="cellAction">
            <div
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-3 rounded cursor-pointer mr-1"
              onClick={() => handleUpdateStatus(params.row._id, "CONFIRMED")}
            >
              Confirm
            </div>

            <div
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded cursor-pointer mr-1"
              onClick={() => handleUpdateStatus(params.row._id, "PENDING")}
            >
              Pending
            </div>

            <div
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded cursor-pointer mr-1"
              onClick={() => handleUpdateStatus(params.row._id, "CANCELLED")}
            >
              Cancel
            </div>

            <div
              onClick={() => handleDelete(params.row._id)}
              className="bg-gray-800 hover:bg-gray-600 text-white font-bold py-1 px-3 rounded cursor-pointer"
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  function generatePDF(reservations) {
    const doc = new jspdf();
    const tableColumn = [
      "No",
      "Hotel",
      "Customer",
      "Check In",
      "Check Out",
      "Guests",
      "Amount",
      "Status"
    ];
    const tableRows = [];

    reservations
      .slice(0)
      .reverse()
      .map((reservation, index) => {
        const resData = [
          index + 1,
          reservation.hotelName,
          reservation.customerName,
          reservation.checkIn,
          reservation.checkOut,
          reservation.guests,
          reservation.amount,
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
    doc.text("Traverly Hotel Reservation Report", 14, 15).setFontSize(12);
    doc.text(`Report Generated: ${dateStr}`, 14, 23);
    doc.save(`Hotel-Reservation-Report_${dateStr}.pdf`);
  }

  // Filter the list based on search query
  const filteredList = React.useMemo(() => {
    if (!searchQuery) return data;

    return data.filter(item => {
      const searchString = `${item.hotelName} ${item.customerName} ${item.status}`.toLowerCase();
      return searchString.includes(searchQuery.toLowerCase());
    });
  }, [data, searchQuery]);

  return (
    <>
      <AdminBackButton />
      <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-7 pb-2 justify-between md:items-center">
        <div className="text-3xl font-bold">Hotel Reservations</div>
        <div>
          <button
            onClick={() => generatePDF(data)}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
          >
            Generate Report
          </button>
        </div>
      </div>
      
      <div className="flex flex-col col-span-2 lg:px-32 px-8 pt-3 pb-8 gap-5">
        <div className="flex md:justify-end">
          <input
            className="border-4 rounded py-2 px-4 lg:mt-0 mt-3 w-full"
            placeholder="Search by hotel, customer, or status..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredList}
            columns={hotelReservationColumns.concat(actionColumn)}
            pageSize={9}
            rowsPerPageOptions={[9]}
            loading={loading}
            components={{
              LoadingOverlay: () => (
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CircularProgress />
                </div>
              )
            }}
            checkboxSelection
            getRowId={(row) => row.id}
          />
        </div>
      </div>
      
      {error && <div className="text-center text-red-500 mt-4">{error}</div>}
    </>
  );
};

export default ViewHotelReservations; 