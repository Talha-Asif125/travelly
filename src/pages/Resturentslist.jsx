import React, { useState, useEffect } from "react";
import Datatable from "../components/datatable/Datatable";
import { Link } from "react-router-dom";
import jspdf from "jspdf";
import "jspdf-autotable";
import AdminBackButton from "../components/AdminBackButton";
import axios from "../api/axios";
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

const Resturentslist = ({ columns }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Let the Datatable component handle CRUD operations automatically

  // Remove status column if it exists
  useEffect(() => {
    if (columns && columns.length > 0) {
      const statusColumnIndex = columns.findIndex(col => col.field === 'status');
      if (statusColumnIndex !== -1) {
        columns.splice(statusColumnIndex, 1);
      }
    }
  }, [columns]);

  // Deletion is handled automatically by the Datatable component

  // Fetch restaurant data
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const response = await axios.post("/restaurant/find-first-five-resturents", {});
        
        // Check if response.data is an array before mapping
        if (Array.isArray(response.data)) {
          // Process data if it's an array
          const processedData = response.data.map((restaurant, index) => ({
            id: index + 1,
            _id: restaurant._id,
            name: restaurant.name || "",
            staffAmount: restaurant.staffAmount || "",
            capacity: restaurant.capacity || "",
            city: restaurant.city || "",
            address: restaurant.address || "",
            contactNo: restaurant.contactNo || "",
            uploadResimage: restaurant.resturentImages?.[0] || "",
          }));
          
          setData(processedData);
        } else if (response.data && typeof response.data === 'object') {
          // If response.data is an object (possibly containing restaurants array)
          const restaurantsArray = response.data.restaurants || response.data.data || [];
          
          if (Array.isArray(restaurantsArray)) {
            const processedData = restaurantsArray.map((restaurant, index) => ({
              id: index + 1,
              _id: restaurant._id,
              name: restaurant.name || "",
              staffAmount: restaurant.staffAmount || "",
              capacity: restaurant.capacity || "",
              city: restaurant.city || "",
              address: restaurant.address || "",
              contactNo: restaurant.contactNo || "",
              uploadResimage: restaurant.resturentImages?.[0] || "",
            }));
            
            setData(processedData);
          } else {
            // If we can't find an array, set an empty array
            setData([]);
            console.error("No restaurant array found in response:", response.data);
          }
        } else {
          // If response.data is neither array nor object
          setData([]);
          console.error("Unexpected response format:", response.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching restaurants:", err);
        setError(err.message || "Error fetching restaurants");
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error loading restaurants",
          text: err.message || "Failed to load restaurant data"
        });
      }
    };

    fetchRestaurants();
  }, []);

  // Refresh data after operations
  const refreshData = async () => {
    try {
      setLoading(true);
      console.log("Refreshing restaurant data...");
      
      const response = await axios.post("/restaurant/find-first-five-resturents", {});
      console.log("Refresh response:", response);
      
      // Check if response.data is an array before mapping
      if (Array.isArray(response.data)) {
        // Process data if it's an array
        const processedData = response.data.map((restaurant, index) => ({
          id: index + 1,
          _id: restaurant._id,
          name: restaurant.name || "",
          staffAmount: restaurant.staffAmount || "",
          capacity: restaurant.capacity || "",
          city: restaurant.city || "",
          address: restaurant.address || "",
          contactNo: restaurant.contactNo || "",
          uploadResimage: restaurant.resturentImages?.[0] || "",
        }));
        
        setData(processedData);
        console.log("Data refreshed successfully:", processedData.length, "restaurants");
      } else if (response.data && typeof response.data === 'object') {
        // If response.data is an object (possibly containing restaurants array)
        const restaurantsArray = response.data.restaurants || response.data.data || [];
        
        if (Array.isArray(restaurantsArray)) {
          const processedData = restaurantsArray.map((restaurant, index) => ({
            id: index + 1,
            _id: restaurant._id,
            name: restaurant.name || "",
            staffAmount: restaurant.staffAmount || "",
            capacity: restaurant.capacity || "",
            city: restaurant.city || "",
            address: restaurant.address || "",
            contactNo: restaurant.contactNo || "",
            uploadResimage: restaurant.resturentImages?.[0] || "",
          }));
          
          setData(processedData);
          console.log("Data refreshed successfully from object:", processedData.length, "restaurants");
        } else {
          // If we can't find an array, set an empty array
          setData([]);
          console.warn("No restaurant array found during refresh");
        }
      } else {
        // If response.data is neither array nor object
        setData([]);
        console.warn("Unexpected response format during refresh");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing data:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        stack: err.stack
      });
      setLoading(false);
      
      // Show error to user
      Swal.fire({
        icon: "error",
        title: "Error Refreshing Data",
        text: err.message || "Failed to refresh restaurant data"
      });
    }
  };

  function generatePDF(restaurants) {
    const doc = new jspdf();
    const tableColumn = [
      "No",
      "Restaurant Name",
      "Address",
      "City",
      "Capacity",
      "Staff Amount",
      "Contact"
    ];
    const tableRows = [];

    restaurants
      .slice(0)
      .reverse()
      .map((restaurant, index) => {
        const restaurantData = [
          index + 1,
          restaurant.name,
          restaurant.address,
          restaurant.city,
          restaurant.capacity,
          restaurant.staffAmount,
          restaurant.contactNo
        ];
        tableRows.push(restaurantData);
        return restaurantData;
      });

    doc.autoTable(tableColumn, tableRows, {
      styles: { fontSize: 7 },
      startY: 35,
    });
    const date = Date().split(" ");
    const dateStr = date[1] + "-" + date[2] + "-" + date[3];
    doc.text("Traverly Restaurant Details Report", 14, 15).setFontSize(12);
    doc.text(`Report Generated: ${dateStr}`, 14, 23);
    doc.save(`Restaurant-Report_${dateStr}.pdf`);
  }

  return (
    <>
      <style>{styles}</style>
      
      <AdminBackButton />
      <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-7 pb-2 justify-between md:items-center ">
        <div className="text-3xl font-bold">Restaurant Management</div>
        <div className="grid md:grid-cols-2 gap-1">
          <Link to="/addrestaurants" className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3">
            Add Restaurant
          </Link>
          <Link to="/restaurant-reservations" className="bg-gray-800 hover:bg-gray-600 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3">
            Restaurant Reservations
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
      <div className="lg:px-32 px-8">
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

export default Resturentslist;
