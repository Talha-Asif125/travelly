import React, { useContext, useState, useEffect } from "react";
import regularAxios from "axios";
import { AuthContext } from "../context/authContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import LoadingSpinner from "../components/spinner/LoadingSpinner";
import { BiArrowBack } from "react-icons/bi";

const Profileupdate = () => {
  const { user, dispatch } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [mobile, setMobile] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setCountry(user.country || "");
      setMobile(user.mobile || "");
      console.log("Current user data:", user);
    }
  }, [user]);

  const handleDeleteUser = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Match the exact route in userRoutes.js
          await regularAxios.delete(`http://localhost:5000/api/users/delete/${user._id}`);
          navigate("/");
          dispatch({ type: "LOGOUT" });
          Swal.fire("Deleted!", "Your account has been deleted.", "success");
        } catch (err) {
          console.error("Delete error:", err);
          console.error("Delete error details:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
          Swal.fire(
            "Error!",
            "There was an error deleting your account.",
            "error"
          );
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    try {
      const updatedUser = {
        name,
        country,
        mobile,
      };

      // Use the unprotected update route exactly as defined in userRoutes.js
      console.log("Updating user with ID:", user._id);
      console.log("Update data:", updatedUser);
      
      const response = await regularAxios.put(
        `http://localhost:5000/api/users/update/${user._id}`, 
        updatedUser
      );
      
      console.log("Update response:", response.data);
      
      // If there's a file, upload it
      if (file) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", "upload");
        try {
          // Use Cloudinary for image upload
          console.log("Uploading image to Cloudinary");
          const uploadRes = await regularAxios.post(
            "https://api.cloudinary.com/v1_1/dpgelkpd4/image/upload",
            data
          );
          
          const { url } = uploadRes.data;
          console.log("Image uploaded successfully:", url);
          
          // Update with the image URL using the unprotected route
          const imageUpdateResponse = await regularAxios.put(
            `http://localhost:5000/api/users/update/${user._id}`, 
            { img: url }
          );
          
          console.log("Image update response:", imageUpdateResponse.data);
          
          // Update local state with new image
          updatedUser.img = url;
        } catch (err) {
          console.error("Error uploading image:", err);
          console.error("Upload error details:", {
            message: err.message,
            response: err.response?.data,
            status: err.response?.status
          });
          setError("Failed to upload image, but user info was updated");
        }
      }

      // Update auth context with the updated user information
      const updatedUserData = {
        ...user,
        ...updatedUser
      };
      
      console.log("Updating user context with:", updatedUserData);
      
      dispatch({ 
        type: "UPDATE_USER", 
        payload: updatedUserData 
      });
      
      Swal.fire("Success!", "Profile updated successfully", "success");
      setLoading(false);
      navigate("/profile");
    } catch (err) {
      setLoading(false);
      console.error("Update error:", err);
      console.error("Error details:", {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        url: err.config?.url
      });
      setError(err.response?.data?.message || "Failed to update profile");
      Swal.fire("Error!", "Failed to update profile", "error");
    }
  };

  return (
    <>
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-lg">
            <button
              className="flex items-center gap-2 text-blue-600 mb-4"
              onClick={() => navigate("/profile")}
            >
              <BiArrowBack /> Back to Profile
            </button>

            <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">
              Update Your Profile
            </h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8 bg-white"
            >
              <div>
                <label htmlFor="name" className="sr-only">
                  Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                    placeholder="Name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="country" className="sr-only">
                  Country
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                    placeholder="Country"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mobile" className="sr-only">
                  Mobile
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="mobile"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full rounded-lg border-gray-200 p-4 pe-12 text-sm shadow-sm"
                    placeholder="Mobile"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="file" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Image
                </label>
                <input
                  type="file"
                  id="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleDeleteUser}
                  className="inline-block rounded-lg bg-red-500 px-5 py-3 text-sm font-medium text-white"
                >
                  Delete Account
                </button>
                <button
                  type="submit"
                  className="inline-block rounded-lg bg-blue-500 px-5 py-3 text-sm font-medium text-white"
                >
                  Update Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Profileupdate;
