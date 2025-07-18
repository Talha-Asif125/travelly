import React, { useState, useEffect } from "react";
import Datatable from "../components/datatable/Datatable";
import { Link } from "react-router-dom";
import jspdf from "jspdf";
import "jspdf-autotable";
import AdminBackButton from "../components/AdminBackButton";
import axios from "../api/axios";
import Swal from "sweetalert2";

const Tourlist = ({ columns }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch tour data
  useEffect(() => {
    const fetchTours = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/tours");
        setData(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || "Error fetching tours");
        setLoading(false);
        Swal.fire({
          icon: "error",
          title: "Error loading tours",
          text: err.message || "Failed to load tour data"
        });
      }
    };

    fetchTours();
  }, []);

  // Refresh data after operations
  const refreshData = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/tours");
      setData(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setLoading(false);
    }
  };

  function generatePDF(tickets) {
    const doc = new jspdf();
    const tableColumn = [
      "No",
      "Name Of Package",
      "Tour Category",
      "Duration",
      "Price",
      "Maximum Group Count",
      "Added By",
    ];
    const tableRows = [];

    tickets
      .slice(0)
      .reverse()
      .map((tour, index) => {
        const ticketData = [
          index + 1,
          tour.name,
          tour.category,
          tour.duration,
          tour.price,
          tour.groupCount,
          tour.currentUser,
        ];
        tableRows.push(ticketData);
        return ticketData;
      });

    const date = Date().split(" ");
    const dateStr = date[1] + "-" + date[2] + "-" + date[3];

    doc.text("Traverly", 14, 15).setFontSize(16); // add heading
    doc.text("Tour Details Report", 14, 23).setFontSize(10);
    doc.text(`Report Generated Date: ${dateStr}`, 14, 30).setFontSize(10);
    doc
      .text("Traverly.co,Islamabad,Pakistan", 14, 37)
      .setFontSize(10);

    doc.autoTable(tableColumn, tableRows, {
      styles: { fontSize: 7 },
      startY: 42,
    });

    doc.save(`Tour-Details-Report_${dateStr}.pdf`);
  }

  return (
    <>
      <AdminBackButton />
      <div className="flex flex-row col-span-2 lg:px-32 px-8 pt-7 pb-2 justify-between md:items-center ">
        <div className="text-3xl font-bold">Tour Package Management</div>
        <div className="grid md:grid-cols-2 gap-1">
          <Link
            to={"/addtour"}
            className="bg-blue-500 hover:bg-blue-700 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
          >
            Add Tour Package
          </Link>
          <Link
            to="/tourreservation/all"
            className="bg-gray-800 hover:bg-gray-600 text-center text-white font-bold py-2 px-4 rounded cursor-pointer lg:mt-0 mt-3"
          >
            View Reservations
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

export default Tourlist;
