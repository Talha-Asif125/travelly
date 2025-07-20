import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "../api/axios";
import Swal from "sweetalert2";
import backgroundImage from "../assets/images/bg.jpg";
import Spinner from "../components/spinner/LoadingSpinner";

const EmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [resendLoading, setResendLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setVerificationStatus('no-token');
    }
  }, [token]);

  const verifyEmail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/auth/verify-email/${token}`);
      
      if (response.data.success) {
        setVerificationStatus('success');
        setUserEmail(response.data.data.user.email);
        
        Swal.fire({
          title: "Email Verified! 🎉",
          text: "Your email has been successfully verified. You can now login to your account.",
          icon: "success",
          confirmButtonColor: "#41A4FF",
          confirmButtonText: "Go to Login"
        }).then(() => {
          navigate("/login");
        });
      }
    } catch (error) {
      console.error("Email verification error:", error);
      setVerificationStatus('error');
      
      const errorMessage = error.response?.data?.message || 'Verification failed';
      
      if (errorMessage.includes('expired')) {
        setVerificationStatus('expired');
      } else if (errorMessage.includes('invalid')) {
        setVerificationStatus('invalid');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const { value: email } = await Swal.fire({
      title: 'Resend Verification Email',
      input: 'email',
      inputLabel: 'Enter your email address',
      inputPlaceholder: 'your-email@example.com',
      showCancelButton: true,
      confirmButtonColor: "#41A4FF",
      inputValidator: (value) => {
        if (!value) {
          return 'You need to enter your email address!';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address!';
        }
      }
    });

    if (email) {
      setResendLoading(true);
      try {
        const response = await axios.post('/auth/resend-verification', { email });
        
        if (response.data.success) {
          Swal.fire({
            title: "Verification Email Sent! 📧",
            text: "Please check your email inbox for the new verification link.",
            icon: "success",
            confirmButtonColor: "#41A4FF",
          });
        }
      } catch (error) {
        console.error("Resend verification error:", error);
        Swal.fire({
          title: "Error",
          text: error.response?.data?.message || "Failed to send verification email. Please try again.",
          icon: "error",
          confirmButtonColor: "#41A4FF",
        });
      } finally {
        setResendLoading(false);
      }
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="text-center">
          <Spinner />
          <h2 className="text-2xl font-bold text-[#41A4FF] mb-4">Verifying Your Email...</h2>
          <p className="text-gray-600">Please wait while we verify your email address.</p>
        </div>
      );
    }

    switch (verificationStatus) {
      case 'success':
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-green-600 mb-4">Email Verified Successfully!</h2>
              <p className="text-gray-600 mb-6">
                Welcome to Travel Buddy! Your email <strong>{userEmail}</strong> has been verified.
              </p>
              <Link
                to="/login"
                className="inline-block bg-[#41A4FF] text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold"
              >
                Login to Your Account
              </Link>
            </div>
          </div>
        );

      case 'expired':
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-3xl font-bold text-orange-600 mb-4">Verification Link Expired</h2>
              <p className="text-gray-600 mb-6">
                Your verification link has expired. Don't worry, we can send you a new one!
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="inline-block bg-[#41A4FF] text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Send New Verification Email'}
              </button>
            </div>
          </div>
        );

      case 'invalid':
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-3xl font-bold text-red-600 mb-4">Invalid Verification Link</h2>
              <p className="text-gray-600 mb-6">
                This verification link is invalid or has already been used.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="inline-block bg-[#41A4FF] text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold disabled:opacity-50 mr-4"
              >
                {resendLoading ? 'Sending...' : 'Send New Verification Email'}
              </button>
              <Link
                to="/login"
                className="inline-block bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition duration-300 font-semibold"
              >
                Go to Login
              </Link>
            </div>
          </div>
        );

      case 'error':
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-3xl font-bold text-red-600 mb-4">Verification Failed</h2>
              <p className="text-gray-600 mb-6">
                Something went wrong while verifying your email. Please try again.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="inline-block bg-[#41A4FF] text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold disabled:opacity-50 mr-4"
              >
                {resendLoading ? 'Sending...' : 'Send New Verification Email'}
              </button>
              <Link
                to="/register"
                className="inline-block bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition duration-300 font-semibold"
              >
                Back to Register
              </Link>
            </div>
          </div>
        );

      case 'no-token':
        return (
          <div className="text-center">
            <div className="mb-6">
              <div className="text-6xl mb-4">🔗</div>
              <h2 className="text-3xl font-bold text-gray-600 mb-4">No Verification Token</h2>
              <p className="text-gray-600 mb-6">
                This page requires a verification token. Please check your email for the verification link.
              </p>
              <button
                onClick={handleResendVerification}
                disabled={resendLoading}
                className="inline-block bg-[#41A4FF] text-white px-8 py-3 rounded-lg hover:bg-blue-600 transition duration-300 font-semibold disabled:opacity-50 mr-4"
              >
                {resendLoading ? 'Sending...' : 'Send Verification Email'}
              </button>
              <Link
                to="/register"
                className="inline-block bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition duration-300 font-semibold"
              >
                Back to Register
              </Link>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-[#41A4FF] mb-2">🧳 Travel Buddy</h1>
            <p className="text-gray-600">Email Verification</p>
          </div>
          
          {renderContent()}
          
          <div className="mt-8 text-center">
            <Link
              to="/"
              className="text-[#41A4FF] hover:text-blue-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification; 