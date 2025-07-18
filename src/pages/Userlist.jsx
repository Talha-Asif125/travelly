import Datatable from "../components/datatable/Datatable";
import { useState, useEffect, useCallback, createContext } from "react";
import { useNavigate } from "react-router-dom";
import jspdf from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import axios from "../api/axios";
import Swal from "sweetalert2";
import AdminBackButton from "../components/AdminBackButton";

// Create a context for refreshing data
export const RefreshContext = createContext();

const Userlist = ({ columns }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Create a reusable fetch function with error details
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      // Log the request being made for debugging
      console.log("Attempting to fetch users from:", axios.defaults.baseURL + "/users/all");
      
      const response = await axios.get("/users/all");
      console.log("Fetched users:", response.data);
      setData(response.data);
      setLoading(false);
    } catch (error) {
      // Enhanced error logging
      console.error("Error fetching users:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setLoading(false);
      
      // Show more detailed error
      Swal.fire({
        icon: "error",
        title: "Error Fetching Users",
        text: `Failed to load users: ${error.message}`,
        footer: error.response?.data ? `Server response: ${JSON.stringify(error.response.data)}` : "No server response"
      });
    }
  }, []);
  
  // Fetch data on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Navigate to add user without passing function
  const handleAddUser = () => {
    // Store the current timestamp in localStorage to indicate a refresh is needed when returning
    localStorage.setItem('needUserRefresh', 'true');
    navigate("/adduser");
  };

  // Function to handle editing a user directly from this page
  const handleEditUser = (user) => {
    // Store the current timestamp in localStorage to indicate a refresh is needed when returning
    localStorage.setItem('needUserRefresh', 'true');
    navigate("/update", { state: user });
  };

  // Check if we need to refresh on component mount
  useEffect(() => {
    const needRefresh = localStorage.getItem('needUserRefresh');
    if (needRefresh === 'true') {
      fetchUsers();
      localStorage.removeItem('needUserRefresh');
    }
  }, [fetchUsers]);

  function generatePDF(tickets) {
    const doc = new jspdf();
    const tableColumn = [
      "No",
      "Name",
      "Email",
      "Mobile",
      "Country",
      "Type",
      "Created at",
      "Updated at",
    ];
    const tableRows = [];

    tickets
      .slice(0)
      .reverse()
      .map((ticket, index) => {
        const ticketData = [
          index + 1,
          ticket.name,
          ticket.email,
          ticket.mobile,
          ticket.country,
          ticket.type,
          moment(ticket.createdAt).format("MM/DD/YYYY h:mm A"),
          moment(ticket.updatedAt).format("MM/DD/YYYY h:mm A"),
        ];
        tableRows.push(ticketData);
        return ticketData;
      });

    const date = Date().split(" ");
    const dateStr = date[1] + "-" + date[2] + "-" + date[3];

    doc.setFontSize(20).setTextColor(65, 164, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Traverly", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10).setTextColor(0, 0, 0);
    doc.text("User Details Report", 14, 23);
    doc.text(`Report Generated Date: ${dateStr}`, 14, 30);
    doc
      .text("Traverly.co,Whihara mavatha,Kaduwela,Pakistan", 14, 37)
      .setFontSize(10);

    doc.autoTable(tableColumn, tableRows, {
      styles: { fontSize: 7 },
      startY: 45,
      headerStyles: { fillColor: [31, 41, 55] },
    });

    doc.save(`User-Details-Report_${dateStr}.pdf`);
  }

  return (
    <>
      <AdminBackButton />
      <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-8 justify-between md:items-center ">
        <div className="text-3xl font-bold">User Management</div>
        <div className="grid md:grid-cols-3 gap-1">
          <button
            onClick={handleAddUser}
            className="bg-blue-500 flex justify-center items-center hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
          >
            Add User
          </button>
          <button
            onClick={fetchUsers}
            className="bg-green-500 flex justify-center items-center hover:bg-green-700 text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
          >
            Refresh
          </button>
          <button
            onClick={() => {
              generatePDF(data);
            }}
            className="bg-gray-800 text-center hover:bg-gray-600 text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
          >
            Generate report
          </button>
        </div>
      </div>

      <div>
        <Datatable 
          columns={columns} 
          data={data} 
          setData={setData} 
          loading={loading} 
          onEdit={handleEditUser}
          refreshData={fetchUsers}
        />
      </div>
    </>
  );
};

export default Userlist;
