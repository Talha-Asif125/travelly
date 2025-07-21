import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import backgroundImage from "../assets/images/bg.jpg";
import Spinner from "../components/spinner/LoadingSpinner";
import { useLocation, useNavigate } from "react-router";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const ResetPassword = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token2 = searchParams.get("token");
  
  const [loading2, setLoading2] = useState(false);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || "https://travelly-backend-27bn.onrender.com/api",
    headers: {
      "Content-Type": "application/json",
    }
  });

  const handleForgotPassword = async (event) => {
    event.preventDefault();

    if (!email || !email.includes("@")) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter a valid email address",
      });
      return;
    }

    try {
      setLoading2(true);
      const response = await axiosInstance.post("/auth/forgot-password", {
        email: email,
      });
      
      setLoading2(false);
      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Reset Link Sent! 📧",
          html: `
            <p>Password reset link has been sent to:</p>
            <p><strong>${email}</strong></p>
            <p style="font-size: 14px; color: #666;">
              Please check your email (including spam folder) for the reset link.
              The link will expire in 1 hour.
            </p>
          `,
          confirmButtonColor: "#41A4FF",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setLoading2(false);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.message || "Failed to send reset link. Please try again.",
      });
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!password || password.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Password must be at least 6 characters long",
      });
      return;
    }

    try {
      setLoading2(true);
      try {
        const response = await axiosInstance.post("/auth/reset-password", {
          token: token2,
          password: password,
        });
        setLoading2(false);
        Swal.fire({
          icon: "success",
          title: "Done",
          text: response.data.message || "Password reset successful",
        });
        navigate("/login");
      } catch (firstError) {
        const response = await axiosInstance.post("/user/reset-password", {
          token: token2,
          password: password,
        });
        setLoading2(false);
        Swal.fire({
          icon: "success",
          title: "Done",
          text: response.data.message || "Password reset successful",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setLoading2(false);
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error.response?.data?.message || "Failed to reset password. Please try again.",
      });
    }
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="xl:px-96 xl:pt-36 xl:pb-52 p-16">
        <h2 
          className="text-center text-3xl font-bold pb-10"
          style={{ 
            color: '#1a365d', 
            textShadow: '2px 2px 4px rgba(255,255,255,0.8)' 
          }}
        >
          Reset Password
        </h2>
        {loading2 && <Spinner />}
        <p 
          className="text-center pb-8"
          style={{ 
            color: '#2c5282', 
            textShadow: '1px 1px 2px rgba(255,255,255,0.7)',
            fontWeight: 500
          }}
        >
          Enter your email and click the Get the Reset Link button to receive the
          reset link via Email, then click on that reset link and it will
          redirect you to the reset password page with access.
        </p>
        {token2 ? (
          <form onSubmit={handleResetPassword} className="mb-6">
            <label htmlFor="password" className="block mb-2 font-bold">
              New Password
            </label>
            <div className="relative mb-4">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                                className="w-full p-2 pr-12 border border-gray-400 rounded"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-600 hover:text-gray-800 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <VisibilityOffIcon className="h-5 w-5" />
                ) : (
                  <VisibilityIcon className="h-5 w-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Reset Password
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="mb-6">
            <label htmlFor="email" className="block mb-2 font-bold">
              Email
            </label>
            <input
              type="text"
              id="email"
              name="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full p-2 mb-4 border border-gray-400 rounded"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Get the Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
