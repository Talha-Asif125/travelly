import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Datatable from "../../components/datatable/Datatable";
import AdminBackButton from '../../components/AdminBackButton';
import jspdf from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';
import axios from "../../api/axios";

// Add CSS for status colors
const styles = `
  .cellWithStatus {
    padding: 5px;
    border-radius: 5px;
    text-align: center;
  }
  .cellWithStatus.on-time {
    background-color: #e5faf2;
    color: #3bb077;
  }
  .cellWithStatus.delayed {
    background-color: #fff0f1;
    color: #d95087;
  }
  .cellWithStatus.cancelled {
    background-color: #fbf0f0;
    color: #d95087;
  }
`;

const AirplaneTravel = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'flightNumber', headerName: 'Flight No.', width: 130 },
    { field: 'airline', headerName: 'Airline', width: 130 },
    { field: 'origin', headerName: 'Origin', width: 130 },
    { field: 'destination', headerName: 'Destination', width: 130 },
    { field: 'departureTime', headerName: 'Departure', width: 130 },
    { field: 'arrivalTime', headerName: 'Arrival', width: 130 },
    { field: 'price', headerName: 'Price (PKR)', width: 130 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => {
        const statusClass = params.row.status.toLowerCase().replace(' ', '-');
        return (
          <div className={`cellWithStatus ${statusClass}`}>
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
              <Link 
                to={`/flight-view/${params.row.id}`} 
                className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                View
              </Link>
              <button 
                onClick={() => handleEditFlight(params.row)}
                className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteFlight(params.row.id)}
                className="bg-red-500 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
              >
                Delete
              </button>
            </div>
          );
        },
      });
    }
  }, [columns]);

  useEffect(() => {
    fetchFlights();
  }, []);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      // Flight services are no longer supported
      setData([]);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching flights:", err);
      setError("Flight services unavailable");
      setData([]);
      setLoading(false);
    }
  };

  const handleEditFlight = (flight) => {
    Swal.fire({
      title: 'Edit Flight',
      html: `
        <input id="flightNumber" class="swal2-input" placeholder="Flight Number" value="${flight.flightNumber}">
        <input id="airline" class="swal2-input" placeholder="Airline" value="${flight.airline}">
        <input id="origin" class="swal2-input" placeholder="Origin" value="${flight.origin}">
        <input id="destination" class="swal2-input" placeholder="Destination" value="${flight.destination}">
        <input id="departureTime" class="swal2-input" placeholder="Departure Time (HH:MM)" value="${flight.departureTime}">
        <input id="arrivalTime" class="swal2-input" placeholder="Arrival Time (HH:MM)" value="${flight.arrivalTime}">
        <input id="price" class="swal2-input" placeholder="Price (PKR)" value="${flight.price}">
        <select id="status" class="swal2-input">
          <option value="On Time" ${flight.status === 'On Time' ? 'selected' : ''}>On Time</option>
          <option value="Delayed" ${flight.status === 'Delayed' ? 'selected' : ''}>Delayed</option>
          <option value="Cancelled" ${flight.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save',
      preConfirm: () => {
        const flightNumber = document.getElementById('flightNumber').value;
        const airline = document.getElementById('airline').value;
        const origin = document.getElementById('origin').value;
        const destination = document.getElementById('destination').value;
        const departureTime = document.getElementById('departureTime').value;
        const arrivalTime = document.getElementById('arrivalTime').value;
        const price = document.getElementById('price').value;
        const status = document.getElementById('status').value;
        
        if (!flightNumber || !airline || !origin || !destination || !departureTime || !arrivalTime || !price) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        
        return {
          id: flight.id,
          flightNumber,
          airline,
          origin,
          destination,
          departureTime,
          arrivalTime,
          price: Number(price),
          status
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Update the flight in the data state
        setData(data.map(f => f.id === flight.id ? result.value : f));
        
        Swal.fire({
          icon: 'success',
          title: 'Flight Updated',
          text: 'The flight has been successfully updated'
        });
      }
    });
  };

  const handleDeleteFlight = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        // Remove the flight from the data state
        setData(data.filter(flight => flight.id !== id));
        
        Swal.fire(
          'Deleted!',
          'The flight has been deleted.',
          'success'
        );
      }
    });
  };

  const handleAddFlight = () => {
    Swal.fire({
      title: 'Add New Flight',
      html: `
        <input id="flightNumber" class="swal2-input" placeholder="Flight Number">
        <input id="airline" class="swal2-input" placeholder="Airline">
        <input id="origin" class="swal2-input" placeholder="Origin">
        <input id="destination" class="swal2-input" placeholder="Destination">
        <input id="departureTime" class="swal2-input" placeholder="Departure Time (HH:MM)">
        <input id="arrivalTime" class="swal2-input" placeholder="Arrival Time (HH:MM)">
        <input id="price" class="swal2-input" placeholder="Price (PKR)">
        <select id="status" class="swal2-input">
          <option value="On Time">On Time</option>
          <option value="Delayed">Delayed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Add',
      preConfirm: () => {
        const flightNumber = document.getElementById('flightNumber').value;
        const airline = document.getElementById('airline').value;
        const origin = document.getElementById('origin').value;
        const destination = document.getElementById('destination').value;
        const departureTime = document.getElementById('departureTime').value;
        const arrivalTime = document.getElementById('arrivalTime').value;
        const price = document.getElementById('price').value;
        const status = document.getElementById('status').value;
        
        if (!flightNumber || !airline || !origin || !destination || !departureTime || !arrivalTime || !price) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        
        return {
          id: data.length > 0 ? Math.max(...data.map(f => f.id)) + 1 : 1,
          flightNumber,
          airline,
          origin,
          destination,
          departureTime,
          arrivalTime,
          price: Number(price),
          status
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Add the new flight to the data state
        setData([...data, result.value]);
        
        Swal.fire({
          icon: 'success',
          title: 'Flight Added',
          text: 'The flight has been successfully added'
        });
      }
    });
  };

  function generatePDF() {
    const doc = new jspdf();
    const tableColumn = [
      "ID",
      "Flight No.",
      "Airline",
      "Origin",
      "Destination",
      "Departure",
      "Arrival", 
      "Price (PKR)",
      "Status"
    ];
    const tableRows = [];

    data
      .slice(0)
      .reverse()
      .map((flight, index) => {
        const flightData = [
          flight.id,
          flight.flightNumber,
          flight.airline,
          flight.origin,
          flight.destination,
          flight.departureTime,
          flight.arrivalTime,
          flight.price,
          flight.status
        ];
        tableRows.push(flightData);
        return flightData;
      });

    doc.autoTable(tableColumn, tableRows, {
      styles: { fontSize: 7 },
      startY: 35,
    });
    const date = Date().split(" ");
    const dateStr = date[1] + "-" + date[2] + "-" + date[3];
    doc.text("Traverly Flight Management Report", 14, 15).setFontSize(12);
    doc.text(`Report Generated: ${dateStr}`, 14, 23);
    doc.save(`Flight-Report_${dateStr}.pdf`);
  }

  return (
    <>
      <style>{styles}</style>
      <AdminBackButton />
      <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-7 pb-2 justify-between md:items-center ">
        <div className="text-3xl font-bold">Flight Management</div>
        <div className="grid md:grid-cols-2 gap-1">
          <button 
            onClick={handleAddFlight}
            className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
          >
            Add Flight
          </button>
          <Link to="/flight-reservations" className="bg-gray-800 hover:bg-gray-600 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3">
            Flight Reservations
          </Link>
        </div>
      </div>
      <div className="lg:px-32 px-8 flex md:justify-end mb-5">
        <button
          onClick={generatePDF}
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
          refreshData={fetchFlights}
        />
      </div>
      {error && <div className="text-center text-red-500 mt-4">{error}</div>}
    </>
  );
};

export default AirplaneTravel; 