import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import backgroundImage from "../assets/images/bg.jpg";
import Spinner from "../components/spinner/LoadingSpinner";
import { BASE_URL } from "../utils/config";

const Login = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const [loading2, setLoading2] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setCredentials((prev) => ({ ...prev, [id]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!credentials.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!credentials.password) {
      newErrors.password = "Password is required";
    } else if (credentials.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClick = async (e) => {
    e.preventDefault();
    
    dispatch({ type: "LOGIN_START" });
    setLoading2(true);

    try {
      const res = await axios.post(`${BASE_URL}/auth/login`, credentials);
      const result = res.data;
      if (result.success && result.data) {
        const { user, token } = result.data;
        localStorage.setItem("token", token);
        dispatch({ type: "LOGIN_SUCCESS", payload: user });
        Swal.fire({
          title: "Welcome Back!",
          text: `Welcome back, ${user.name}!`,
          icon: "success",
          confirmButtonColor: "#1976d2",
          timer: 2000,
          showConfirmButton: false
        });
        if (user.isAdmin === true) {
          localStorage.setItem("adminLoginTime", Date.now().toString());
          navigate("/admin");
        } else if (user.type === "financeManager") {
          navigate("/finance");
        } else {
          navigate("/");
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error("Login error:", err);
      dispatch({ type: "LOGIN_FAILURE", payload: err.message });
      
      // Check if error is about email verification
      if (err.message && err.message.includes('verify your email')) {
        Swal.fire({
          title: "Email Verification Required 📧",
          html: `
            <p>${err.message}</p>
            <p style="margin-top: 15px;">
              <a href="/verify-email" style="color: #41A4FF; text-decoration: underline;">
                Click here to resend verification email
              </a>
            </p>
          `,
          icon: "warning",
          confirmButtonColor: "#41A4FF",
          confirmButtonText: "OK"
        });
      } else {
        Swal.fire({
          title: "Login Failed",
          text: err.message || "Something went wrong during login",
          icon: "error",
          confirmButtonColor: "#1976d2",
        });
      }
    } finally {
      setLoading2(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClasses = "w-full rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:ring transition-colors";
    
    if (errors[fieldName]) {
      return `${baseClasses} border-red-500 focus:border-red-500`;
    }
    
    return `${baseClasses} border-gray-300 focus:border-[#41A4FF]`;
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="w-full max-w-lg mx-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl">
          <div className="mb-8 text-center">
            <h2 
              className="text-4xl font-bold mb-2" 
              style={{ 
                color: '#1a365d', 
                textShadow: '2px 2px 4px rgba(255,255,255,0.8)' 
              }}
            >
              WELCOME BACK
            </h2>
            <p 
              style={{ 
                color: '#2c5282', 
                textShadow: '1px 1px 2px rgba(255,255,255,0.7)',
                fontWeight: 500
              }}
            >
              Sign in to your Travely account
            </p>
          </div>
          
          <form onSubmit={handleClick} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                id="email"
                name="email"
                value={credentials.email}
                onChange={handleChange}
                className={getInputClassName('email')}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                id="password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                className={`${getInputClassName('password')} pr-12`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading2}
                className="w-full cursor-pointer rounded-3xl font-bold bg-[#41A4FF] hover:bg-[#3094FF] disabled:bg-gray-400 disabled:cursor-not-allowed text-center py-3 px-5 text-white transition-colors"
              >
                {loading2 ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>

          {loading2 && (
            <div className="mt-4 flex justify-center">
              <Spinner />
            </div>
          )}

          <div className="mt-6 text-center space-y-4">
            <Link
              to="/reset-password"
              className="block text-gray-700 hover:text-gray-900 font-medium hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
            
            <p className="text-gray-700">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-[#41A4FF] hover:text-[#3094FF] font-bold hover:underline transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
