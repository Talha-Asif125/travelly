import { DataGrid } from "@mui/x-data-grid";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import axios from "axios";
import "./datatable.scss";
import Swal from "sweetalert2";
import CircularProgress from "@mui/material/CircularProgress";

const Datatable = ({ columns, data, setData, loading: externalLoading, onEdit, refreshData }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1];

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  const navigate = useNavigate();

  const handleDelete = async (id) => {
    const confirmResult = await Swal.fire({
      title: "Are you sure you want to delete this?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "No, cancel",
      reverseButtons: true,
    });

    if (confirmResult.isConfirmed) {
      try {
        setIsLoading(true);
        console.log("Attempting to delete item with ID:", id);
        
        let deleteUrl;
        if (path === "users") {
          deleteUrl = `http://localhost:5000/api/users/delete/${id}`;
          await axios.delete(deleteUrl);
        } else if (path === "hotels") {
          deleteUrl = `http://localhost:5000/api/hotels/${id}`;
          await axios.delete(deleteUrl);
        } else if (path === "tours") {
          deleteUrl = `http://localhost:5000/api/tours/${id}`;
          await axios.delete(deleteUrl);
        } else if (path === "vehicle") {
          deleteUrl = `http://localhost:5000/api/vehicle/${id}`;
          await axios.delete(deleteUrl);
        } else if (path === "Restaurants" || path === "admin/restaurants") {
          deleteUrl = `http://localhost:5000/api/restaurant/${id}`;
          console.log("Restaurant delete URL:", deleteUrl);
          await axios.delete(deleteUrl);
        } else {
          deleteUrl = `http://localhost:5000/api/${path}/${id}`;
          await axios.delete(deleteUrl);
        }
        
        console.log("Delete URL:", deleteUrl);
        
        setIsLoading(false);
        
        // Update the local state to reflect the deletion
        if (setData) {
          setData(data.filter((item) => item._id !== id));
        }
        
        // Set flag in localStorage to trigger refresh when returning to this page
        localStorage.setItem(`need${path.charAt(0).toUpperCase() + path.slice(1)}Refresh`, 'true');
        
        // Use the refreshData function if it exists
        if (typeof refreshData === 'function') {
          await refreshData();
        }
        
        Swal.fire("Deleted!", "The item has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting item:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          stack: error.stack
        });
        
        setIsLoading(false);
        
        Swal.fire({
          icon: "error",
          title: "Error Deleting Item",
          text: `Error: ${error.message}`,
          footer: error.response?.data ? `Server response: ${JSON.stringify(error.response.data)}` : "No server response"
        });
      }
    }
  };

  // Bulk delete function
  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      Swal.fire("No Selection", "Please select items to delete", "warning");
      return;
    }

    const confirmResult = await Swal.fire({
      title: `Delete ${selectedRows.length} item(s)?`,
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, delete ${selectedRows.length} item(s)`,
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (confirmResult.isConfirmed) {
      try {
        setIsLoading(true);
        
        // Delete all selected items
        const deletePromises = selectedRows.map(async (id) => {
          let deleteUrl;
          if (path === "users") {
            deleteUrl = `http://localhost:5000/api/users/delete/${id}`;
          } else if (path === "hotels") {
            deleteUrl = `http://localhost:5000/api/hotels/${id}`;
          } else if (path === "tours") {
            deleteUrl = `http://localhost:5000/api/tours/${id}`;
          } else if (path === "vehicle") {
            deleteUrl = `http://localhost:5000/api/vehicle/${id}`;
          } else if (path === "Restaurants" || path === "admin/restaurants") {
            deleteUrl = `http://localhost:5000/api/restaurant/${id}`;
          } else {
            deleteUrl = `http://localhost:5000/api/${path}/${id}`;
          }
          return axios.delete(deleteUrl);
        });

        await Promise.all(deletePromises);
        
        setIsLoading(false);
        
        // Update the local state to reflect the deletions
        if (setData) {
          setData(data.filter((item) => !selectedRows.includes(item._id)));
        }
        
        // Clear selected rows
        setSelectedRows([]);
        
        // Set flag in localStorage to trigger refresh
        localStorage.setItem(`need${path.charAt(0).toUpperCase() + path.slice(1)}Refresh`, 'true');
        
        // Use the refreshData function if it exists
        if (typeof refreshData === 'function') {
          await refreshData();
        }
        
        Swal.fire("Deleted!", `${selectedRows.length} item(s) have been deleted.`, "success");
        
      } catch (error) {
        console.error("Error in bulk delete:", error);
        setIsLoading(false);
        
        Swal.fire({
          icon: "error",
          title: "Error Deleting Items",
          text: `Some items could not be deleted: ${error.message}`,
          footer: error.response?.data ? `Server response: ${JSON.stringify(error.response.data)}` : "No server response"
        });
      }
    }
  };

  // Select all function
  const handleSelectAll = () => {
    if (selectedRows.length === filteredList.length) {
      // If all are selected, deselect all
      setSelectedRows([]);
    } else {
      // Select all visible items
      setSelectedRows(filteredList.map(item => item._id));
    }
  };

  // Clear selection
  const handleClearSelection = () => {
    setSelectedRows([]);
  };

  const handleView = async (id) => {
    try {
      setIsLoading(true);
      console.log("Attempting to view item with ID:", id);
      
      if (path === "users") {
        console.log("View URL:", `/users/${id}`);
        const userdata = await axios.get(`http://localhost:5000/api/users/all/${id}`);
        console.log("User data received:", userdata.data);
        navigate("/userpage", { state: userdata.data });
      }
      if (path === "hotels") {
        console.log("Hotel view URL:", `http://localhost:5000/api/hotels/find/${id}`);
        const hoteldata = await axios.get(`http://localhost:5000/api/hotels/find/${id}`);
        console.log("Hotel data received:", hoteldata.data);
        navigate("/hoteladmin", { state: hoteldata.data });
      }
      if (path === "vehicle") {
        console.log("Vehicle view URL:", `http://localhost:5000/api/vehicle/${id}`);
        const vehicledata = await axios.get(`http://localhost:5000/api/vehicle/${id}`);
        navigate("/vehicle/view/", { state: vehicledata.data });
      }
      //path tour
      if (path === "tours") {
        console.log("Tour view URL:", `http://localhost:5000/api/tours/${id}`);
        const tourData = await axios.get(`http://localhost:5000/api/tours/${id}`);
        navigate("/tour/view", { state: tourData.data });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error viewing item:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack
      });
      setIsLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error Viewing Details",
        text: `Error: ${error.message}`,
        footer: error.response?.data ? `Server response: ${JSON.stringify(error.response.data)}` : "No server response"
      });
    }
  };
  
  // Function to handle edit button click
  const handleEdit = (row) => {
    if (onEdit) {
      onEdit(row);
    } else {
      // If no custom edit handler is provided, use default navigation
      if (path === "users") {
        navigate("/update", { state: row });
      } else if (path === "hotels") {
        navigate(`/hotels/update/${row._id}`);
      } else if (path === "tours") {
        navigate("/tour/update", { 
          state: { 
            data: { 
              oneTour: row 
            } 
          } 
        });
      } else if (path === "vehicle") {
        navigate(`/vehicle/edit/${row._id}`);
      } else if (path === "Restaurants" || path === "admin/restaurants") {
        console.log("Editing restaurant with data:", row);
        navigate("/addrestaurants", { state: { edit: true, data: row } });
      }
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
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded cursor-pointer mr-1"
              onClick={() => handleView(params.row._id)}
            >
              View
            </div>

            <div
              className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-4 rounded cursor-pointer mr-1"
              onClick={() => handleEdit(params.row)}
            >
              Edit
            </div>

            <div
              onClick={() => handleDelete(params.row._id)}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-4 rounded cursor-pointer"
            >
              Delete
            </div>
          </div>
        );
      },
    },
  ];

  // Use useMemo to filter the list only when the search query changes
  const filteredList = useMemo(() => {
    // Ensure data is an array before filtering
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log("Data is empty or invalid:", data);
      return [];
    }
    
    if (!searchQuery) {
      return data;
    }

    const searchRegex = new RegExp(searchQuery.trim(), "i");
    return data.filter((item) => {
      if (!item) return false;
      
      // Combine all searchable fields into a single string to search in
      const searchableString = `${item.name || ''} ${item.type || ''} ${item.email || ''} ${item.mobile || ''} ${item.country || ''} ${item.ownerName || ''} ${item.vehicleType || ''}`;

      return searchRegex.test(searchableString);
    });
  }, [data, searchQuery]);

  return (
    <>
      <div className="flex flex-col col-span-2 lg:px-32 px-8 pt-3 pb-8 gap-5">
        {/* Search and Bulk Actions Bar */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            {/* Bulk Action Buttons - Show only when items are selected */}
            {selectedRows.length > 0 && (
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600">
                  {selectedRows.length} selected
                </span>
                <button
                  onClick={handleBulkDelete}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded text-sm flex items-center gap-2"
                  disabled={isLoading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Selected
                </button>
                <button
                  onClick={handleSelectAll}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  {selectedRows.length === filteredList.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  onClick={handleClearSelection}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  Clear
                </button>
              </div>
            )}
            
            {/* Selection helper when no items selected */}
            {selectedRows.length === 0 && filteredList.length > 0 && (
              <div className="flex gap-2 items-center">
                <button
                  onClick={handleSelectAll}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm"
                >
                  Select All
                </button>
              </div>
            )}
          </div>
          
          {/* Search Input */}
          <input
            className="border-4 rounded py-2 px-4 w-full md:w-auto md:min-w-[300px]"
            placeholder="Search..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="datatable">
          <DataGrid
            className="datagrid"
            rows={filteredList || []}
            columns={location.pathname === "/admin/restaurants" ? columns : columns.concat(actionColumn)}
            loading={isLoading || externalLoading}
            loadingOverlay={
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <CircularProgress />
              </div>
            }
            pageSize={9}
            rowsPerPageOptions={[9]}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => {
              setSelectedRows(newSelection);
            }}
            rowSelectionModel={selectedRows}
            getRowId={(row) => row._id || Math.random().toString()}
          />
        </div>
      </div>
    </>
  );
};
export default Datatable;
