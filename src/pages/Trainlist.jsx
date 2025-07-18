import React, { useState, useEffect } from "react";
import Datatable from "../components/datatable/Datatable";
import { Link, useLocation } from "react-router-dom";
import jspdf from "jspdf";
import "jspdf-autotable";
import AdminBackButton from "../components/AdminBackButton";
import axios from "../api/axios";
import Swal from "sweetalert2";

const Trainlist = ({ columns }) => {
  const location = useLocation();
  const path = location.pathname.split("/")[1] || "train";
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch train data
  useEffect(() => {
    const fetchTrains = async () => {
      try {
        setLoading(true);
        console.log(`Fetching trains from API endpoint: /${path}`);
        
        const response = await axios.get(`/train`, {
          timeout: 10000 // 10 second timeout
        });
        
        console.log('Train data received:', response.data);
        setData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching trains:", err);
        console.error("Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          config: err.config?.url
        });
        
        setError(err.message || "Error fetching trains");
        setLoading(false);
        
        Swal.fire({
          icon: "error",
          title: "Error loading trains",
          text: err.message || "Failed to load train data",
          footer: "Please make sure the server is running and try again.",
          confirmButtonText: 'Try Again',
          showCancelButton: true,
          cancelButtonText: 'Cancel'
        }).then((result) => {
          if (result.isConfirmed) {
            fetchTrains(); // Retry the request
          }
        });
      }
    };

    fetchTrains();
  }, [path]);

  // Refresh data after operations
  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/train`);
      setData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Refresh Failed",
        text: err.message || "Failed to refresh train data"
      });
    }
  };

  function generatePDF(tickets) {
    const doc = new jspdf();
    const tableColumn = [
      "No",
      "Train Name",
      "From",
      "To",
      "Departure Time",
      "Arrival Time",
      "Price",
      "Seats",
      "Class Type"
    ];
    const tableRows = [];

    tickets
      .slice(0)
      .reverse()
      .map((train, index) => {
        const trainData = [
          index + 1,
          train.trainName,
          train.from,
          train.to,
          train.depatureTime,
          train.arrivalTime,
          train.price,
          train.noOfSeats,
          train.classType || "Standard"
        ];
        tableRows.push(trainData);
        return trainData;
      });

    doc.autoTable(tableColumn, tableRows, {
      styles: { fontSize: 7 },
      startY: 35,
    });
    const date = Date().split(" ");
    const dateStr = date[1] + "-" + date[2] + "-" + date[3];
    doc.text("Traverly Train Details Report", 14, 15).setFontSize(12);
    doc.text(`Report Generated: ${dateStr}`, 14, 23);
    doc.save(`Train-Report_${dateStr}.pdf`);
  }

  return (
    <>
      <AdminBackButton />
      <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-7 pb-2 justify-between md:items-center ">
        <div className="text-3xl font-bold">Train Management</div>
        <div className="grid md:grid-cols-2 gap-1">
          <Link to="/train/add" className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3">
            Add Train
          </Link>
          <Link to="/adminTrain/reviewPanel" className="bg-gray-800 hover:bg-gray-600 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3">
            Train Reservations
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

export default Trainlist;
