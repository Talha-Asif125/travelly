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
  .cellWithStatus.upcoming {
    background-color: #e5faf2;
    color: #3bb077;
  }
  .cellWithStatus.ongoing {
    background-color: #e5f0fa;
    color: #2a7ade;
  }
  .cellWithStatus.completed {
    background-color: #f0f0f0;
    color: #555555;
  }
  .cellWithStatus.cancelled {
    background-color: #fbf0f0;
    color: #d95087;
  }
`;

const EventManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const columns = [
    { field: 'id', headerName: 'ID', width: 70 },
    { field: 'name', headerName: 'Event Name', width: 200 },
    { field: 'type', headerName: 'Type', width: 130 },
    { field: 'date', headerName: 'Date', width: 130 },
    { field: 'location', headerName: 'Location', width: 180 },
    { field: 'capacity', headerName: 'Capacity', width: 100 },
    { 
      field: 'status', 
      headerName: 'Status', 
      width: 120,
      renderCell: (params) => (
        <div className={`cellWithStatus ${params.row.status}`}>
          {params.row.status}
        </div>
      ),
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
                to={`/event-details/${params.row.id}`} 
                className="bg-blue-500 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
              >
                View
              </Link>
              <button 
                onClick={() => handleEditEvent(params.row)}
                className="bg-green-500 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteEvent(params.row.id)}
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
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // In a real scenario, this would be an API call
      // For now using mock data
      const mockEvents = [
        { id: 1, name: "Tech Conference 2023", type: "Conference", date: "2023-12-15", time: "09:00", location: "Islamabad Convention Center", description: "Annual tech conference", capacity: 500, status: "upcoming" },
        { id: 2, name: "Music Festival", type: "Entertainment", date: "2023-12-20", time: "18:00", location: "Lahore Stadium", description: "Annual music event", capacity: 2000, status: "upcoming" },
        { id: 3, name: "Business Expo", type: "Exhibition", date: "2023-11-10", time: "10:00", location: "Karachi Expo Center", description: "Business networking event", capacity: 300, status: "completed" },
        { id: 4, name: "Food Festival", type: "Entertainment", date: "2024-01-05", time: "12:00", location: "Multan Food Park", description: "Food and cultural festival", capacity: 1500, status: "upcoming" },
        { id: 5, name: "Tech Workshop", type: "Workshop", date: "2023-12-05", time: "14:00", location: "Peshawar IT Park", description: "Hands-on tech workshop", capacity: 100, status: "ongoing" },
      ];
      
      setData(mockEvents);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(err.message || "Error fetching events");
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error loading events",
        text: err.message || "Failed to load event data"
      });
    }
  };

  const handleEditEvent = (event) => {
    Swal.fire({
      title: 'Edit Event',
      html: `
        <input id="name" class="swal2-input" placeholder="Event Name" value="${event.name}">
        <select id="type" class="swal2-input">
          <option value="Conference" ${event.type === 'Conference' ? 'selected' : ''}>Conference</option>
          <option value="Workshop" ${event.type === 'Workshop' ? 'selected' : ''}>Workshop</option>
          <option value="Seminar" ${event.type === 'Seminar' ? 'selected' : ''}>Seminar</option>
          <option value="Entertainment" ${event.type === 'Entertainment' ? 'selected' : ''}>Entertainment</option>
          <option value="Exhibition" ${event.type === 'Exhibition' ? 'selected' : ''}>Exhibition</option>
        </select>
        <input id="date" type="date" class="swal2-input" value="${event.date}">
        <input id="location" class="swal2-input" placeholder="Location" value="${event.location}">
        <input id="capacity" type="number" class="swal2-input" placeholder="Capacity" value="${event.capacity}">
        <select id="status" class="swal2-input">
          <option value="upcoming" ${event.status === 'upcoming' ? 'selected' : ''}>Upcoming</option>
          <option value="ongoing" ${event.status === 'ongoing' ? 'selected' : ''}>Ongoing</option>
          <option value="completed" ${event.status === 'completed' ? 'selected' : ''}>Completed</option>
          <option value="cancelled" ${event.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Save',
      preConfirm: () => {
        const name = document.getElementById('name').value;
        const type = document.getElementById('type').value;
        const date = document.getElementById('date').value;
        const location = document.getElementById('location').value;
        const capacity = document.getElementById('capacity').value;
        const status = document.getElementById('status').value;
        
        if (!name || !type || !date || !location || !capacity) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        
        return {
          id: event.id,
          name,
          type,
          date,
          location,
          capacity: Number(capacity),
          status,
          time: event.time, // Keep existing data
          description: event.description // Keep existing data
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Update the event in the data state
        setData(data.map(e => e.id === event.id ? result.value : e));
        
        Swal.fire({
          icon: 'success',
          title: 'Event Updated',
          text: 'The event has been successfully updated'
        });
      }
    });
  };

  const handleDeleteEvent = (id) => {
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
        // Remove the event from the data state
        setData(data.filter(event => event.id !== id));
        
        Swal.fire(
          'Deleted!',
          'The event has been deleted.',
          'success'
        );
      }
    });
  };

  const handleAddEvent = () => {
    Swal.fire({
      title: 'Add New Event',
      html: `
        <input id="name" class="swal2-input" placeholder="Event Name">
        <select id="type" class="swal2-input">
          <option value="Conference">Conference</option>
          <option value="Workshop">Workshop</option>
          <option value="Seminar">Seminar</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Exhibition">Exhibition</option>
        </select>
        <input id="date" type="date" class="swal2-input">
        <input id="location" class="swal2-input" placeholder="Location">
        <input id="capacity" type="number" class="swal2-input" placeholder="Capacity" value="100">
        <select id="status" class="swal2-input">
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Add',
      preConfirm: () => {
        const name = document.getElementById('name').value;
        const type = document.getElementById('type').value;
        const date = document.getElementById('date').value;
        const location = document.getElementById('location').value;
        const capacity = document.getElementById('capacity').value;
        const status = document.getElementById('status').value;
        
        if (!name || !type || !date || !location || !capacity) {
          Swal.showValidationMessage('Please fill all fields');
          return false;
        }
        
        return {
          id: data.length > 0 ? Math.max(...data.map(e => e.id)) + 1 : 1,
          name,
          type,
          date,
          location,
          capacity: Number(capacity),
          status,
          time: "09:00", // Default value
          description: "Event description" // Default value
        };
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Add the new event to the data state
        setData([...data, result.value]);
        
        Swal.fire({
          icon: 'success',
          title: 'Event Added',
          text: 'The event has been successfully added'
        });
      }
    });
  };

  function generatePDF() {
    const doc = new jspdf();
    const tableColumn = [
      "ID",
      "Event Name",
      "Type",
      "Date",
      "Location",
      "Capacity",
      "Status"
    ];
    const tableRows = [];

    data
      .slice(0)
      .reverse()
      .map((event, index) => {
        const eventData = [
          event.id,
          event.name,
          event.type,
          event.date,
          event.location,
          event.capacity,
          event.status
        ];
        tableRows.push(eventData);
        return eventData;
      });

    doc.autoTable(tableColumn, tableRows, {
      styles: { fontSize: 7 },
      startY: 35,
    });
    const date = Date().split(" ");
    const dateStr = date[1] + "-" + date[2] + "-" + date[3];
    doc.text("Traverly Event Management Report", 14, 15).setFontSize(12);
    doc.text(`Report Generated: ${dateStr}`, 14, 23);
    doc.save(`Event-Report_${dateStr}.pdf`);
  }

  return (
    <>
      <style>{styles}</style>
      <AdminBackButton />
      <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-7 pb-2 justify-between md:items-center ">
        <div className="text-3xl font-bold">Event Management</div>
        <div className="grid md:grid-cols-2 gap-1">
          <button 
            onClick={handleAddEvent}
            className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
          >
            Add Event
          </button>
          <Link to="/event-reservations" className="bg-gray-800 hover:bg-gray-600 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3">
            Event Reservations
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
          refreshData={fetchEvents}
        />
      </div>
      {error && <div className="text-center text-red-500 mt-4">{error}</div>}
    </>
  );
};

export default EventManagement; 