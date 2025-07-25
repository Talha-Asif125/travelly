import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import ProviderBadge from "../components/ui/ProviderBadge";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const getUser = async () => {
    navigate("/updateProfile");
  };

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-8 md:px-24 p-4 sm:py-8">
        <div className="flex flex-col justify-center items-center lg:py-24 py-10 gap-5 md:m-20 m-5 rounded-lg bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)]">
          <div>
            <img
              className="w-48 h-48 rounded-full shadow-lg border-4 border-blue-500 object-cover"
              src={`${user.img}`}
              alt="User profile"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center items-start gap-5 rounded-lg bg-white p-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <h3 className="text-blue-500 text-xl font-bold">{user.type}</h3>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 mt-8">
            <div className="">
              <h1 className="text-lg font-bold">Name:</h1>
              <div className="flex items-center space-x-2">
                <p className="text-xl">{user.name}</p>
                <ProviderBadge user={user} size="md" />
              </div>
              <h1 className="text-lg font-bold mt-4">Email:</h1>
              <p className="text-xl">{user.email}</p>
            </div>
            <div>
              <h1 className="text-lg font-bold">Country:</h1>
              <p className="text-xl">{user.country}</p>
              <h1 className="text-lg font-bold mt-4">Mobile:</h1>
              <p className="text-xl">{user.mobile}</p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-5 mt-14">
            <button
              className="bg-blue-500 py-3 px-6 rounded-lg text-white font-bold hover:bg-blue-600 transition duration-200 ease-in-out"
              onClick={getUser}
            >
              Update Profile
            </button>
            {user.type === "eventOrganizer" && (
              <>
                <Link to="/pending-reservations">
                  <button className="bg-blue-500 py-3 px-6 rounded-lg text-white font-bold hover:bg-blue-600 transition duration-200 ease-in-out">
                    Customer Pending Reservations
                  </button>
                </Link>
                <Link to="/my-activities">
                  <button className="bg-blue-500 py-3 px-6 rounded-lg text-white font-bold hover:bg-blue-600 transition duration-200 ease-in-out">
                    My Listed Activities
                  </button>
                </Link>
              </>
            )}
            {user.type === "traveler" && (
              <>
                <Link to="/my-reservations">
                  <button className="bg-blue-500 py-3 px-6 rounded-lg text-white font-bold hover:bg-blue-600 transition duration-200 ease-in-out">
                    My Reservations
                  </button>
                </Link>
              </>
            )}
            {user.isAdmin && (
              <>
                <Link to="/pending-activities">
                  <button className="bg-blue-500 p-3 rounded-xl text-white font-bold">
                    Pending Activities
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
