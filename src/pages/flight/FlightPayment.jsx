import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaLock, FaCreditCard, FaMoneyBill, FaCheckCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';

const FlightPayment = () => {
  const navigate = useNavigate();
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  
  useEffect(() => {
    // Retrieve booking data from session storage
    const bookingDataStr = sessionStorage.getItem('flightBooking');
    if (!bookingDataStr) {
      Swal.fire({
        icon: 'error',
        title: 'No Booking Data',
        text: 'Booking information not found. Please start a new booking.',
        confirmButtonText: 'Go to Flights'
      }).then(() => {
        navigate('/flights');
      });
      return;
    }
    
    try {
      const parsedData = JSON.parse(bookingDataStr);
      setBookingData(parsedData);
      setLoading(false);
    } catch (error) {
      console.error("Error parsing booking data:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'There was a problem with your booking data. Please try again.'
      }).then(() => {
        navigate('/flights');
      });
    }
  }, [navigate]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCardDetails({
      ...cardDetails,
      [name]: value
    });
  };
  
  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };
  
  const validateCardDetails = () => {
    if (paymentMethod !== 'credit-card') return true;
    
    if (!cardDetails.cardNumber || cardDetails.cardNumber.length < 15) {
      Swal.fire('Invalid Card', 'Please enter a valid card number', 'error');
      return false;
    }
    
    if (!cardDetails.cardholderName) {
      Swal.fire('Invalid Name', 'Please enter the cardholder name', 'error');
      return false;
    }
    
    if (!cardDetails.expiryDate || !cardDetails.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      Swal.fire('Invalid Date', 'Please enter a valid expiry date (MM/YY)', 'error');
      return false;
    }
    
    if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
      Swal.fire('Invalid CVV', 'Please enter a valid CVV code', 'error');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateCardDetails()) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      // Create a booking reference
      const bookingReference = 'TB' + Math.floor(100000 + Math.random() * 900000);
      
      // Update booking status
      const updatedBooking = {
        ...bookingData,
        status: 'Confirmed',
        paymentStatus: 'Paid',
        bookingReference
      };
      
      // In a real app, we would send this to the backend
      // For demo, save in session storage
      sessionStorage.setItem('confirmedBooking', JSON.stringify(updatedBooking));
      
      setIsProcessing(false);
      setPaymentComplete(true);
    }, 2000);
  };
  
  const handleContinue = () => {
    // Clear the booking from session storage
    sessionStorage.removeItem('flightBooking');
    
    // Navigate to user bookings page
    navigate('/my-bookings');
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-3">Loading payment page...</p>
      </div>
    );
  }
  
  if (paymentComplete) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheckCircle className="text-green-600 text-4xl" />
          </div>
          
          <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your booking. Your flight has been confirmed.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h2>
            
            <div className="grid grid-cols-2 gap-4 text-left">
              <div>
                <p className="text-gray-600 text-sm">Flight</p>
                <p className="font-bold">{bookingData.flightNumber}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Booking Reference</p>
                <p className="font-bold text-blue-600">{bookingData.bookingReference}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Passengers</p>
                <p className="font-bold">{bookingData.passengers.length}</p>
              </div>
              
              <div>
                <p className="text-gray-600 text-sm">Total Amount</p>
                <p className="font-bold">PKR {bookingData.totalPrice.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-4">
              A confirmation email has been sent to {bookingData.contactDetails.email}.
              You can view your booking details and generate boarding passes in the "My Bookings" section.
            </p>
          </div>
          
          <button
            onClick={handleContinue}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg"
          >
            Go to My Bookings
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-4">
        <Link to={`/flights`} className="text-blue-600 hover:text-blue-800">
          &larr; Back to Flights
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-center mb-8">Payment</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side - Payment Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Payment Method</h2>
            
            <div className="flex flex-wrap gap-4 mb-6">
              <button
                className={`flex items-center px-4 py-3 border rounded-lg ${paymentMethod === 'credit-card' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => handlePaymentMethodChange('credit-card')}
              >
                <FaCreditCard className={`mr-2 ${paymentMethod === 'credit-card' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={paymentMethod === 'credit-card' ? 'font-bold' : ''}>Credit Card</span>
              </button>
              
              <button
                className={`flex items-center px-4 py-3 border rounded-lg ${paymentMethod === 'bank-transfer' ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => handlePaymentMethodChange('bank-transfer')}
              >
                <FaMoneyBill className={`mr-2 ${paymentMethod === 'bank-transfer' ? 'text-blue-600' : 'text-gray-400'}`} />
                <span className={paymentMethod === 'bank-transfer' ? 'font-bold' : ''}>Bank Transfer</span>
              </button>
            </div>
            
            {paymentMethod === 'credit-card' ? (
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.cardNumber}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 pl-10"
                      maxLength="16"
                      required
                    />
                    <FaCreditCard className="absolute left-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Cardholder Name</label>
                  <input
                    type="text"
                    name="cardholderName"
                    placeholder="John Smith"
                    value={cardDetails.cardholderName}
                    onChange={handleInputChange}
                    className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={handleInputChange}
                      className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                      maxLength="5"
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-700 mb-2">CVV</label>
                    <div className="relative">
                      <input
                        type="password"
                        name="cvv"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={handleInputChange}
                        className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500"
                        maxLength="4"
                        required
                      />
                      <div className="absolute right-3 top-3.5 text-gray-400 text-xs">
                        <FaLock />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                        Processing Payment...
                      </>
                    ) : (
                      `Pay PKR ${bookingData.totalPrice.toLocaleString()}`
                    )}
                  </button>
                </div>
                
                <div className="mt-4 text-center text-sm text-gray-500">
                  <FaLock className="inline-block mr-1" />
                  Secure payment. Your card details are protected.
                </div>
              </form>
            ) : (
              <div className="border rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">Bank Transfer Details</h3>
                <p className="mb-2">Please transfer the total amount to the following account:</p>
                
                <div className="bg-gray-50 p-4 rounded mb-4">
                  <p><strong>Bank:</strong> National Bank of Pakistan</p>
                  <p><strong>Account Name:</strong> Travel Buddy Ltd</p>
                  <p><strong>Account Number:</strong> 0123-4567-8901-2345</p>
                  <p><strong>IBAN:</strong> PK36NBPA0123456789012345</p>
                  <p><strong>Amount:</strong> PKR {bookingData.totalPrice.toLocaleString()}</p>
                  <p><strong>Reference:</strong> Flight Booking</p>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                  After making the transfer, please click the button below to confirm your payment.
                  Our team will verify your payment and confirm your booking within 24 hours.
                </p>
                
                <button
                  onClick={handleSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                      Processing...
                    </>
                  ) : (
                    'Confirm Bank Transfer'
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Side - Booking Summary */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Booking Summary</h2>
            
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Flight</p>
                <p className="font-bold">{bookingData.flightNumber}</p>
              </div>
              
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Passengers</p>
                <p>{bookingData.passengers.length}</p>
              </div>
              
              {bookingData.passengers.map((passenger, index) => (
                <div key={index} className="text-sm text-gray-500 ml-4 mb-1">
                  - {passenger.firstName} {passenger.lastName}
                </div>
              ))}
            </div>
            
            <div className="border-b pb-4 mb-4">
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Base Fare</p>
                <p>PKR {bookingData.totalPrice.toLocaleString()}</p>
              </div>
              
              <div className="flex justify-between mb-2">
                <p className="text-gray-600">Taxes & Fees</p>
                <p>Included</p>
              </div>
            </div>
            
            <div className="flex justify-between font-bold text-lg">
              <p>Total</p>
              <p className="text-blue-600">PKR {bookingData.totalPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightPayment; 