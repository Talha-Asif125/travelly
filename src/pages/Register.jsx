import axios from "../api/axios";
import regularAxios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import DriveFolderUploadOutlinedIcon from "@mui/icons-material/DriveFolderUploadOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import Swal from "sweetalert2";
import backgroundImage from "../assets/images/bg.jpg";
import Spinner from "../components/spinner/LoadingSpinner";
import { validateField, ValidationTypes } from "../utils/formValidation";

const Register = () => {
  const [loading2, setLoading2] = useState(false);
  const [file, setFile] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    repeatPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [validationStatus, setValidationStatus] = useState({
    email: null,
    mobile: null,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Real-time validation for specific fields
    if (name === 'email' && value) {
      debounceEmailCheck(value);
    } else if (name === 'mobile' && value) {
      debounceMobileCheck(value);
    }
  };

  // Debounced email check
  const debounceEmailCheck = debounce(async (email) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setValidationStatus(prev => ({ ...prev, email: 'invalid' }));
      return;
    }

    try {
      const response = await axios.get(`/auth/check-email?email=${email}`);
      setValidationStatus(prev => ({ ...prev, email: 'available' }));
    } catch (error) {
      setValidationStatus(prev => ({ ...prev, email: 'taken' }));
    }
  }, 500);

  // Debounced mobile check
  const debounceMobileCheck = debounce(async (mobile) => {
    // Remove non-digit characters and check length
    const cleanMobile = mobile.replace(/\D/g, '');
    
    // Pakistani mobile: 10 or 11 digits, starting with 03 or 3
    const isValid = (cleanMobile.length === 11 && cleanMobile.startsWith('03')) ||
                   (cleanMobile.length === 10 && cleanMobile.startsWith('3'));
    
    if (!isValid) {
      setValidationStatus(prev => ({ ...prev, mobile: 'invalid' }));
      return;
    }

    try {
      const response = await axios.get(`/auth/check-mobile?mobile=${mobile}`);
      setValidationStatus(prev => ({ ...prev, mobile: 'available' }));
    } catch (error) {
      setValidationStatus(prev => ({ ...prev, mobile: 'taken' }));
    }
  }, 500);

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else if (validationStatus.email === 'taken') {
      newErrors.email = 'Email is already registered';
    }

    // Mobile validation
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else {
      const cleanMobile = formData.mobile.replace(/\D/g, '');
      const isValid = (cleanMobile.length === 11 && cleanMobile.startsWith('03')) ||
                     (cleanMobile.length === 10 && cleanMobile.startsWith('3'));
      
      if (!isValid) {
        newErrors.mobile = 'Please enter a valid Pakistani mobile number (03XX-XXXXXXX or 3XX-XXXXXXX)';
      } else if (validationStatus.mobile === 'taken') {
        newErrors.mobile = 'Mobile number is already registered';
      }
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
    }

    // Confirm password validation
    if (!formData.repeatPassword) {
      newErrors.repeatPassword = 'Please confirm your password';
    } else if (formData.password !== formData.repeatPassword) {
      newErrors.repeatPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await Swal.fire({
      title: "Create Your Travely Account",
      text: "Are you ready to join our travel community?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#41A4FF",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Create Account!",
      cancelButtonText: "Cancel"
    });

    if (!result.isConfirmed) return;

    setLoading2(true);

    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "upload");

      let imageUrl = null;
      if (file) {
        const uploadRes = await regularAxios.post(
          "https://api.cloudinary.com/v1_1/dpgelkpd4/image/upload",
          data
        );
        imageUrl = uploadRes.data.url;
      }

      const registrationData = {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        country: "PK", // Default to Pakistan
        type: "traveler", // Default to traveler
        password: formData.password,
        ...(imageUrl && { img: imageUrl }),
      };

      const response = await axios.post("/auth/register", registrationData);

      if (response.data.success) {
        Swal.fire({
          title: "Registration Successful! 📧",
          html: `
            <p>Welcome to Travel Buddy!</p>
            <p><strong>Please check your email to verify your account before logging in.</strong></p>
            <p>We've sent a verification link to <strong>${formData.email}</strong></p>
            <p style="font-size: 14px; color: #666;">
              Can't find the email? Check your spam folder or 
              <a href="/verify-email" style="color: #41A4FF;">click here to resend</a>
            </p>
          `,
          icon: "success",
          confirmButtonColor: "#41A4FF",
          confirmButtonText: "Got it!"
        }).then(() => {
          navigate("/login", { 
            state: { 
              message: "Please verify your email before logging in",
              email: formData.email 
            }
          });
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      
      let errorMessage = "Registration failed. Please try again.";
      
      if (err.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = err.response.data.errors;
        const errorList = Object.values(validationErrors).join('\n');
        errorMessage = `Validation Failed:\n${errorList}`;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      Swal.fire({
        title: "Registration Failed",
        text: errorMessage,
        icon: "error",
        confirmButtonColor: "#1976d2",
      });
    } finally {
      setLoading2(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClasses = "w-full rounded-3xl border bg-[#FCFDFE] py-3 px-5 text-base text-body-color placeholder-[#ACB6BE] outline-none focus:ring transition-colors";
    
    if (errors[fieldName]) {
      return `${baseClasses} border-red-500 focus:border-red-500`;
    }
    
    if (fieldName === 'email' && validationStatus.email === 'available') {
      return `${baseClasses} border-green-500 focus:border-green-500`;
    }
    
    if (fieldName === 'mobile' && validationStatus.mobile === 'available') {
      return `${baseClasses} border-green-500 focus:border-green-500`;
    }
    
    return `${baseClasses} border-gray-300 focus:border-[#41A4FF]`;
  };

  const getValidationIcon = (fieldName) => {
    if (fieldName === 'email') {
      if (validationStatus.email === 'available') return <span className="text-green-500 text-sm">✓ Available</span>;
      if (validationStatus.email === 'taken') return <span className="text-red-500 text-sm">✗ Already taken</span>;
    }
    
    if (fieldName === 'mobile') {
      if (validationStatus.mobile === 'available') return <span className="text-green-500 text-sm">✓ Available</span>;
      if (validationStatus.mobile === 'taken') return <span className="text-red-500 text-sm">✗ Already taken</span>;
    }
    
    return null;
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      <div className="py-10 lg:py-20 px-4 sm:px-8 md:px-16 lg:px-32 xl:px-64 flex flex-col items-center">
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-xl">
          <div className="mb-8 text-center">
            <h2 
              className="text-4xl font-bold mb-2" 
              style={{ 
                color: '#1a365d', 
                textShadow: '2px 2px 4px rgba(255,255,255,0.8)' 
              }}
            >
              JOIN TRAVELY
            </h2>
            <p 
              style={{ 
                color: '#2c5282', 
                textShadow: '1px 1px 2px rgba(255,255,255,0.7)',
                fontWeight: 500
              }}
            >
              Create your account and start exploring
            </p>
          </div>

          <div className="mb-6 flex justify-center">
            <div className="relative">
              <img
                className="rounded-full border-4 border-white/20"
                src={
                  file
                    ? URL.createObjectURL(file)
                    : "https://icon-library.com/images/no-image-icon/no-image-icon-0.jpg"
                }
                alt="avatar"
                style={{ width: "120px", height: "120px", objectFit: "cover" }}
              />
              <label htmlFor="file" className="absolute bottom-0 right-0 bg-[#41A4FF] rounded-full p-2 cursor-pointer hover:bg-[#3094FF] transition-colors">
                <DriveFolderUploadOutlinedIcon className="text-white" />
              </label>
              <input
                type="file"
                id="file"
                name="file"
                style={{ display: "none" }}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && !file.type.startsWith("image/")) {
                    Swal.fire("Please select an image file", "", "error");
                    return;
                  }
                  setFile(file);
                }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                placeholder="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={getInputClassName('name')}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <input
                placeholder="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={getInputClassName('email')}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                {getValidationIcon('email')}
              </div>
            </div>

            <div>
              <input
                placeholder="Mobile Number (03XX-XXXXXXX)"
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                className={getInputClassName('mobile')}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
                {getValidationIcon('mobile')}
              </div>
            </div>

            <div className="relative">
              <input
                placeholder="Password (8+ chars, uppercase, lowercase, number, special char)"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${getInputClassName('password')} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            <div className="relative">
              <input
                placeholder="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                name="repeatPassword"
                value={formData.repeatPassword}
                onChange={handleChange}
                className={`${getInputClassName('repeatPassword')} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
              </button>
              {errors.repeatPassword && <p className="text-red-500 text-sm mt-1">{errors.repeatPassword}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading2}
                className="w-full font-bold text-center cursor-pointer rounded-3xl bg-[#41A4FF] hover:bg-[#3094FF] disabled:bg-gray-400 disabled:cursor-not-allowed py-3 px-5 text-white transition-colors"
              >
                {loading2 ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          {loading2 && (
            <div className="mt-4 flex justify-center">
              <Spinner />
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-700">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#41A4FF] hover:text-[#3094FF] font-bold hover:underline transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default Register;
