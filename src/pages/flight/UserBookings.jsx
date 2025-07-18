import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaPlane, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaFilePdf } from 'react-icons/fa';
import { AuthContext } from '../../context/authContext';
import Swal from 'sweetalert2';
import jspdf from 'jspdf';
import 'jspdf-autotable';

const UserBookings = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  
  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);
  
  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // In a real app, we would fetch bookings from an API
      // Mock data for demonstration
      const mockBookings = [
        {
          id: 1,
          flightNumber: 'PK301',
          airline: 'PIA',
          origin: 'Islamabad',
          destination: 'Karachi',
          departureDate: '2023-12-25',
          departureTime: '09:00',
          arrivalTime: '11:00',
          passengers: [
            { firstName: 'John', lastName: 'Doe' }
          ],
          status: 'Confirmed',
          totalPrice: 12000,
          bookingDate: '2023-11-15',
          paymentStatus: 'Paid',
          bookingReference: 'TRAV123456'
        },
        {
          id: 2,
          flightNumber: 'PK205',
          airline: 'Airblue',
          origin: 'Lahore',
          destination: 'Dubai',
          departureDate: '2023-12-28',
          departureTime: '14:30',
          arrivalTime: '17:30',
          passengers: [
            { firstName: 'John', lastName: 'Doe' },
            { firstName: 'Jane', lastName: 'Doe' }
          ],
          status: 'Confirmed',
          totalPrice: 90000,
          bookingDate: '2023-11-20',
          paymentStatus: 'Paid',
          bookingReference: 'TRAV234567'
        },
        {
          id: 3,
          flightNumber: 'PK762',
          airline: 'SereneAir',
          origin: 'Karachi',
          destination: 'Peshawar',
          departureDate: '2023-10-15',
          departureTime: '18:45',
          arrivalTime: '20:15',
          passengers: [
            { firstName: 'John', lastName: 'Doe' }
          ],
          status: 'Completed',
          totalPrice: 14000,
          bookingDate: '2023-09-20',
          paymentStatus: 'Paid',
          bookingReference: 'TRAV345678'
        },
        {
          id: 4,
          flightNumber: 'PK503',
          airline: 'PIA',
          origin: 'Lahore',
          destination: 'Islamabad',
          departureDate: '2023-09-05',
          departureTime: '07:30',
          arrivalTime: '08:30',
          passengers: [
            { firstName: 'John', lastName: 'Doe' }
          ],
          status: 'Cancelled',
          totalPrice: 10000,
          bookingDate: '2023-08-15',
          paymentStatus: 'Refunded',
          bookingReference: 'TRAV456789'
        }
      ];
      
      // Simulate API delay
      setTimeout(() => {
        setBookings(mockBookings);
        setLoading(false);
      }, 800);
      
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load your bookings. Please try again later.'
      });
      setLoading(false);
    }
  };
  
  const getFilteredBookings = () => {
    if (activeTab === 'upcoming') {
      return bookings.filter(booking => 
        new Date(booking.departureDate) >= new Date() && booking.status !== 'Cancelled'
      );
    } else if (activeTab === 'past') {
      return bookings.filter(booking => 
        new Date(booking.departureDate) < new Date() || booking.status === 'Completed'
      );
    } else if (activeTab === 'cancelled') {
      return bookings.filter(booking => booking.status === 'Cancelled');
    }
    return bookings;
  };
  
  const generateBoardingPass = (booking) => {
    const doc = new jspdf();
    
    // Heading
    doc.setFontSize(20);
    doc.text("Boarding Pass", 105, 15, { align: 'center' });
    
    // Airline and Flight Info
    doc.setFontSize(16);
    doc.text(`${booking.airline} - Flight ${booking.flightNumber}`, 105, 25, { align: 'center' });
    
    // Divider Line
    doc.setLineWidth(0.5);
    doc.line(20, 30, 190, 30);
    
    // Passenger and Booking Info
    doc.setFontSize(12);
    doc.text(`Passenger: ${booking.passengers[0].firstName} ${booking.passengers[0].lastName}`, 20, 40);
    doc.text(`Booking Reference: ${booking.bookingReference}`, 20, 50);
    
    // Flight Details
    doc.text("Flight Details", 105, 65, { align: 'center' });
    doc.setFontSize(10);
    
    // From-To Section
    doc.text(`From: ${booking.origin}`, 40, 75);
    doc.text(`To: ${booking.destination}`, 150, 75);
    
    // Departure-Arrival Info
    doc.text(`Departure: ${booking.departureDate}`, 40, 85);
    doc.text(`Time: ${booking.departureTime}`, 40, 95);
    
    doc.text(`Arrival: ${booking.departureDate}`, 150, 85);
    doc.text(`Time: ${booking.arrivalTime}`, 150, 95);
    
    // Additional Info
    doc.setFontSize(12);
    doc.text("Important Information", 105, 110, { align: 'center' });
    doc.setFontSize(10);
    doc.text("Please arrive at the airport at least 2 hours before your scheduled departure.", 20, 120);
    doc.text("Have your ID or passport ready for security checks.", 20, 130);
    
    // Bottom Instructions
    doc.text("This is a digital copy of your boarding pass. You can print or show it on your device during travel.", 105, 150, { align: 'center', maxWidth: 170 });
    
    // Footer
    doc.setFontSize(8);
    doc.text("Generated by Travel Buddy - Your trusted travel companion", 105, 180, { align: 'center' });
    
    // Save the PDF
    doc.save(`BoardingPass_${booking.bookingReference}.pdf`);
  };
  
  const generateETicket = (booking) => {
    const doc = new jspdf();
    
    // Heading
    doc.setFontSize(20);
    doc.text("Electronic Ticket", 105, 15, { align: 'center' });
    
    // Airline Info
    doc.setFontSize(16);
    doc.text(`${booking.airline}`, 105, 25, { align: 'center' });
    
    // Ticket Number
    doc.setFontSize(12);
    doc.text(`E-Ticket Number: ${booking.bookingReference}`, 105, 35, { align: 'center' });
    
    // Divider Line
    doc.setLineWidth(0.5);
    doc.line(20, 40, 190, 40);
    
    // Passenger Information
    doc.setFontSize(14);
    doc.text("Passenger Information", 20, 50);
    doc.setFontSize(10);
    
    booking.passengers.forEach((passenger, index) => {
      doc.text(`Passenger ${index + 1}: ${passenger.firstName} ${passenger.lastName}`, 30, 60 + (index * 10));
    });
    
    // Flight Information
    doc.setFontSize(14);
    doc.text("Flight Information", 20, 90);
    doc.setFontSize(10);
    
    doc.text(`Flight Number: ${booking.flightNumber}`, 30, 100);
    doc.text(`From: ${booking.origin}`, 30, 110);
    doc.text(`To: ${booking.destination}`, 30, 120);
    doc.text(`Departure Date: ${booking.departureDate}`, 30, 130);
    doc.text(`Departure Time: ${booking.departureTime}`, 30, 140);
    doc.text(`Arrival Time: ${booking.arrivalTime}`, 30, 150);
    
    // Booking Details
    doc.setFontSize(14);
    doc.text("Booking Details", 120, 90);
    doc.setFontSize(10);
    
    doc.text(`Booking Date: ${booking.bookingDate}`, 130, 100);
    doc.text(`Status: ${booking.status}`, 130, 110);
    doc.text(`Payment Status: ${booking.paymentStatus}`, 130, 120);
    doc.text(`Total Price: PKR ${booking.totalPrice.toLocaleString()}`, 130, 130);
    
    // Terms and Conditions
    doc.setFontSize(12);
    doc.text("Terms and Conditions", 105, 170, { align: 'center' });
    doc.setFontSize(8);
    doc.text("This e-ticket is subject to the carrier's conditions of carriage. Passengers must present a valid ID/passport at check-in.", 105, 180, { align: 'center', maxWidth: 170 });
    
    // Footer
    doc.text("Generated by Travel Buddy - Your trusted travel companion", 105, 200, { align: 'center' });
    
    // Save the PDF
    doc.save(`ETicket_${booking.bookingReference}.pdf`);
  };
  
  if (!user) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
        <p className="mb-4">You need to be logged in to view your bookings.</p>
        <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Sign In
        </Link>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 mr-2 ${activeTab === 'upcoming' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button
          className={`px-4 py-2 mr-2 ${activeTab === 'past' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'cancelled' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
          onClick={() => setActiveTab('cancelled')}
        >
          Cancelled
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2">Loading your bookings...</p>
        </div>
      ) : (
        <>
          {getFilteredBookings().length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <FaPlane className="text-gray-300 text-5xl mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Bookings Found</h3>
              <p className="text-gray-500 mb-6">
                {activeTab === 'upcoming' ? "You don't have any upcoming flights." : 
                 activeTab === 'past' ? "You don't have any past flights." : 
                 "You don't have any cancelled flights."}
              </p>
              <Link to="/flights" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                Book a Flight
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {getFilteredBookings().map(booking => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {/* Header with status */}
                  <div className={`px-6 py-3 flex justify-between items-center ${
                    booking.status === 'Confirmed' ? 'bg-green-50' : 
                    booking.status === 'Completed' ? 'bg-blue-50' : 
                    'bg-red-50'
                  }`}>
                    <div className="flex items-center">
                      {booking.status === 'Confirmed' || booking.status === 'Completed' ? 
                        <FaCheckCircle className="text-green-500 mr-2" /> : 
                        <FaTimesCircle className="text-red-500 mr-2" />
                      }
                      <span className="font-semibold">
                        {booking.status === 'Confirmed' ? 'Confirmed Booking' : 
                         booking.status === 'Completed' ? 'Completed Trip' : 
                         'Cancelled Booking'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Booking Reference: <span className="font-medium">{booking.bookingReference}</span>
                    </div>
                  </div>
                  
                  {/* Booking details */}
                  <div className="p-6">
                    <div className="flex flex-wrap justify-between mb-6">
                      <div className="mb-4 lg:mb-0">
                        <h3 className="text-xl font-bold text-gray-800">{booking.airline}</h3>
                        <p className="text-gray-500">Flight {booking.flightNumber}</p>
                      </div>
                      
                      <div className="flex items-center mb-4 lg:mb-0">
                        <div className="text-center mr-8">
                          <p className="text-sm text-gray-500">{booking.origin}</p>
                          <p className="text-lg font-bold">{booking.departureTime}</p>
                        </div>
                        
                        <div className="w-20 h-px bg-gray-300 relative">
                          <FaPlane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" />
                        </div>
                        
                        <div className="text-center ml-8">
                          <p className="text-sm text-gray-500">{booking.destination}</p>
                          <p className="text-lg font-bold">{booking.arrivalTime}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center text-gray-500 mb-1">
                          <FaCalendarAlt className="mr-1" />
                          <span>{booking.departureDate}</span>
                        </div>
                        <p className="font-bold text-blue-600">
                          PKR {booking.totalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 flex flex-wrap justify-between items-center">
                      <div>
                        <p className="text-gray-600">
                          {booking.passengers.length} {booking.passengers.length === 1 ? 'Passenger' : 'Passengers'} •
                          Booked on {booking.bookingDate}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-2 lg:mt-0">
                        {(booking.status === 'Confirmed' || booking.status === 'Completed') && (
                          <>
                            <button
                              onClick={() => generateBoardingPass(booking)}
                              className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                            >
                              <FaFilePdf className="mr-1" /> Boarding Pass
                            </button>
                            <button
                              onClick={() => generateETicket(booking)}
                              className="flex items-center bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                            >
                              <FaFilePdf className="mr-1" /> E-Ticket
                            </button>
                          </>
                        )}
                        {booking.status === 'Confirmed' && (
                          <Link
                            to={`/flights`}
                            className="flex items-center bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Cancel
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserBookings; 