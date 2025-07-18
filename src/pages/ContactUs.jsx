import React, { useState, useContext } from "react";
import { AuthContext } from "../context/authContext";
import Swal from "sweetalert2";

const ContactUs = () => {
  const { user } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: ""
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (formData.message.trim().length > 1000) {
      newErrors.message = "Message cannot exceed 1000 characters";
    }

    if (formData.subject.trim().length > 200) {
      newErrors.subject = "Subject cannot exceed 200 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(user && { Authorization: `Bearer ${localStorage.getItem('token')}` })
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject.trim() || "General Inquiry",
          message: formData.message.trim()
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        Swal.fire({
          icon: "success",
          title: "Message Sent!",
          text: "Thank you for contacting us. We'll get back to you soon!",
          confirmButtonColor: "#41A4FF"
        });

        // Reset form for non-logged-in users, keep name/email for logged-in users
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          subject: "",
          message: ""
        });
      } else {
        throw new Error(result.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Something went wrong. Please try again later.",
        confirmButtonColor: "#41A4FF"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInputClassName = (fieldName) => {
    const baseClass = "form-control block w-full px-3 py-1.5 text-base font-normal text-gray-700 bg-white bg-clip-padding border border-solid rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:outline-none";
    const errorClass = "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200";
    const normalClass = "border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200";
    
    return `${baseClass} ${errors[fieldName] ? errorClass : normalClass}`;
  };

  return (
    <div className="container my-24 px-6 mx-auto">
      <section className="mb-32 text-gray-800">
        <div className="grid lg:grid-cols-2 gap-4 lg:gap-x-12 lg:mb-0">
          <div className="mb-12 lg:mb-0">
            <h2 className="text-3xl font-bold mb-6 text-[#41A4FF]">Contact Our Travel Team</h2>

            <p className="text-gray-500 mb-8">
              Have questions about your trip? Need help with bookings? Our travel experts are here to help you plan the perfect Pakistani adventure!
            </p>

            {/* Contact Information */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#41A4FF] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span>asif.talha2002@gmail.com</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#41A4FF] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <span>+92 313 5541485</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-[#41A4FF] rounded-full flex items-center justify-center mr-3">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span>Islamabad, Pakistan</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group mb-6">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={getInputClassName('name')}
                  placeholder="Your Full Name"
                  disabled={isSubmitting}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="form-group mb-6">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={getInputClassName('email')}
                  placeholder="Your Email Address"
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="form-group mb-6">
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className={getInputClassName('subject')}
                  placeholder="Subject (Optional)"
                  disabled={isSubmitting}
                />
                {errors.subject && (
                  <p className="text-red-500 text-sm mt-1">{errors.subject}</p>
                )}
              </div>

              <div className="form-group mb-6">
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className={getInputClassName('message')}
                  rows="4"
                  placeholder="Tell us how we can help you plan your perfect trip..."
                  disabled={isSubmitting}
                ></textarea>
                <div className="flex justify-between mt-1">
                  {errors.message && (
                    <p className="text-red-500 text-sm">{errors.message}</p>
                  )}
                  <p className="text-gray-400 text-sm ml-auto">
                    {formData.message.length}/1000 characters
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full px-6 py-2.5 text-white font-medium text-xs leading-tight uppercase rounded shadow-md transition duration-150 ease-in-out ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-[#41A4FF] hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending Message...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Additional Information Section */}
          <div className="lg:ml-8">
            <div className="bg-gradient-to-br from-[#41A4FF] to-blue-600 rounded-lg p-8 text-white">
              <h3 className="text-2xl font-bold mb-6">Why Choose Travel Buddy?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Local Expertise</h4>
                    <p className="text-blue-100 text-sm">Our team knows Pakistan's hidden gems and can guide you to authentic experiences.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">24/7 Support</h4>
                    <p className="text-blue-100 text-sm">We're here to help you before, during, and after your journey.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Best Prices</h4>
                    <p className="text-blue-100 text-sm">Competitive rates with no hidden fees for all our travel services.</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Secure Booking</h4>
                    <p className="text-blue-100 text-sm">Your personal information and payments are always protected.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-lg">
                <p className="text-sm text-center">
                  <strong>Response Time:</strong> We typically respond within 2-4 hours during business hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;
