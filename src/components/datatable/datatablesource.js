import React from 'react';
import ProviderBadge from '../ui/ProviderBadge';

//columns for the user table
export const userColumns = [
  // { field: "_id", headerName: "ID", width: 250 },
  {
    field: "Image",
    headerName: "Image",
    width: 70,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img
            className="cellImg"
            src={params.row.img || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
            alt="avatar"
          />
        </div>
      );
    },
  },
  {
    field: "name",
    headerName: "Name",
    width: 200,
    renderCell: (params) => {
      return (
        <div className="flex items-center space-x-2">
          <span>{params.row.name}</span>
          <ProviderBadge user={params.row} size="sm" showText={false} />
        </div>
      );
    },
  },
  {
    field: "email",
    headerName: "Email",
    width: 300,
  },

  {
    field: "mobile",
    headerName: "Mobile",
    width: 150,
  },
  {
    field: "country",
    headerName: "Country",
    width: 150,
  },
  {
    field: "type",
    headerName: "Type",
    width: 150,
  },
];

//columns for the vehicle table
export const vehicleColumns = [
  //{ field: "_id", headerName: "ID", width: 220 },
  {
    field: "Image",
    headerName: "Image",
    width: 70,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img
            className="cellImg"
            src={
              `vehicle/images/${params.row.vehicleMainImg}` ||
              "https://i.ibb.co/MBtjqXQ/no-avatar.gif"
            }
            alt="avatar"
          />
        </div>
      );
    },
  },
  {
    field: "brand",
    headerName: "Brand",
    width: 100,
  },
  {
    field: "model",
    headerName: "Model",
    width: 100,
  },
  {
    field: "ownerName",
    headerName: "Owner Name",
    width: 230,
  },
  {
    field: "vehicleType",
    headerName: "Vehicle Type",
    width: 150,
  },
  {
    field: "vehicleNumber",
    headerName: "vehicle Number",
    width: 150,
  },
  {
    field: "capacity",
    headerName: "Capacity",
    width: 100,
  },
  {
    field: "location",
    headerName: "Location",
    width: 150,
  },
];

export const vehicleReservationColumns = [
  //{ field: "_id", headerName: "ID", width: 220 },
  {
    field: "date",
    headerName: "Date",
    width: 110,
  },
  {
    field: "vehicleNumber",
    headerName: "Vehicle Number",
    width: 100,
  },
  {
    field: "location",
    headerName: "Location",
    width: 150,
  },

  {
    field: "vehicleNumber",
    headerName: "Vehicle Number",
    width: 150,
  },
  {
    field: "pickupDate",
    headerName: "Pickup Date",
    width: 110,
  },
  {
    field: "returnDate",
    headerName: "Return Date",
    width: 110,
  },
  {
    field: "price",
    headerName: "Price",
    width: 110,
  },
  {
    field: "needDriver",
    headerName: "Need Driver",
    width: 110,
  },
];

export const hotelColumns = [
  {
    field: "Image",
    headerName: "Image",
    width: 70,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img
            className="cellImg"
            src={
              `hotels/images/${params.row.HotelImg}` ||
              "https://i.ibb.co/MBtjqXQ/no-avatar.gif"
            }
            alt="avatar"
          />
        </div>
      );
    },
  },
  {
    field: "name",
    headerName: "Name",
    width: 160,
  },
  {
    field: "type",
    headerName: "Type",
    width: 100,
  },
  {
    field: "city",
    headerName: "City",
    width: 100,
  },
  {
    field: "province",
    headerName: "Province",
    width: 120,
  },
  {
    field: "contactName",
    headerName: "Contact Name",
    width: 130,
  },
  {
    field: "contactNo",
    headerName: "Contact No",
    width: 110,
  },
  {
    field: "cheapestPrice",
    headerName: "Price",
    width: 90,
  },
  {
    field: "rating",
    headerName: "Rating",
    width: 80,
  },
  {
    field: "isApproved",
    headerName: "Approved",
    width: 90,
    renderCell: (params) => {
      return (
        <div className={`cellWithStatus ${params.row.isApproved ? "approved" : "pending"}`}>
          {params.row.isApproved ? "Yes" : "No"}
        </div>
      );
    }
  },
];

export const tourColumns = [
  //{ field: "_id", headerName: "ID", width: 220 },
  {
    field: "Image",
    headerName: "Image",
    width: 70,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img
            className="cellImg"
            src={params.row.img || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
            alt="avatar"
          />
        </div>
      );
    },
  },
  {
    field: "name",
    headerName: "Name of Tour Package",
    width: 200,
  },
  {
    field: "category",
    headerName: "Tour Category",
    width: 150,
  },
  {
    field: "duration",
    headerName: "No of Days",
    width: 100,
  },
  {
    field: "groupCount",
    headerName: "Max Group Count",
    width: 150,
  },
  {
    field: "currentUser",
    headerName: "Added by",
    width: 150,
  },
  {
    field: "price",
    headerName: "Price",
    width: 100,
  },
];

export const tourReservationColumns = [
  {
    field: "_id",
    headerName: "Reservation ID",
    width: 220,
  },
  {
    field: "currentUser",
    headerName: "Customer Email",
    width: 200,
  },
  {
    field: "firstName",
    headerName: "First Name",
    width: 120,
  },
  {
    field: "lastName",
    headerName: "Last Name",
    width: 120,
  },
  {
    field: "date",
    headerName: "Tour Date",
    width: 120,
    renderCell: (params) => {
      return new Date(params.row.date).toLocaleDateString();
    },
  },
  {
    field: "phone",
    headerName: "Phone Number",
    width: 150,
  },
  {
    field: "guestCount",
    headerName: "Guests",
    width: 100,
  }
];

//columns for the tour table
export const trainColumns = [
  //{ field: "_id", headerName: "ID", width: 220 },
  {
    field: "Image",
    headerName: "Image",
    width: 70,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img
            className="cellImg"
            src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Class_M10.jpg"
            alt="avatar"
          />
        </div>
      );
    },
  },
  {
    field: "trainName",
    headerName: "Name of the Train",
    width: 200,
  },
  {
    field: "from",
    headerName: "From",
    width: 150,
  },
  {
    field: "to",
    headerName: "To",
    width: 150,
  },
  {
    field: "noOfSeats",
    headerName: "No of seats",
    width: 100,
  },
  {
    field: "arrivalTime",
    headerName: "Arrival Time",
    width: 100,
  },
  {
    field: "depatureTime",
    headerName: "Departure Time",
    width: 100,
  },
  {
    field: "price",
    headerName: "Price",
    width: 100,
  },
];

export const restaurantColumns = [
  {
    field: "Image",
    headerName: "Image",
    width: 70,
    renderCell: (params) => {
      return (
        <div className="cellWithImg">
          <img
            className="cellImg"
            src={params.row.uploadResimage || "https://i.ibb.co/MBtjqXQ/no-avatar.gif"}
            alt="avatar"
          />
        </div>
      );
    },
  },
  {
    field: "name",
    headerName: "Restaurant Name",
    width: 180,
  },
  {
    field: "address",
    headerName: "Address",
    width: 200,
  },
  {
    field: "city",
    headerName: "City",
    width: 100,
  },
  {
    field: "capacity",
    headerName: "Capacity",
    width: 100,
  },
  {
    field: "staffAmount",
    headerName: "Staff",
    width: 100,
  },
  {
    field: "contactNo",
    headerName: "Contact",
    width: 120,
  }
];
