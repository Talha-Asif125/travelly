import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BiCalendar } from "react-icons/bi";
import { MdLocationOn, MdEvent } from "react-icons/md";

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLocation, setFilterLocation] = useState("");

  // Fetch event services
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://travelly-backend-27bn.onrender.com/api/services/event');
        const result = await response.json();
        
        if (result.success) {
          const eventServices = result.data || [];
          setEvents(eventServices);
          setFilteredEvents(eventServices);
        } else {
          setError(result.message || 'Failed to load events');
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events based on search term and location
  useEffect(() => {
    let result = events;
    
    if (searchTerm) {
      result = result.filter(event => 
        event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterLocation) {
      result = result.filter(event => 
        event.venue?.toLowerCase().includes(filterLocation.toLowerCase()) ||
        event.location?.toLowerCase().includes(filterLocation.toLowerCase())
      );
    }
    
    setFilteredEvents(result);
  }, [searchTerm, filterLocation, events]);

  // Get unique locations for filter
  const locations = [...new Set(events.filter(e => e.venue || e.location).map(event => event.venue || event.location))];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle location filter change
  const handleLocationChange = (e) => {
    setFilterLocation(e.target.value);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-purple-600 mb-4">
          <BiCalendar className="inline-block mr-2" />
          Discover Amazing Events
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore exciting events and experiences across the country. 
          Book your tickets for concerts, festivals, workshops, and more.
        </p>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-center gap-4 mb-8">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search events or event types..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex-1 max-w-md">
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={filterLocation}
            onChange={handleLocationChange}
          >
            <option value="">All Venues</option>
            {locations.map((location, index) => (
              <option key={index} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 py-12">
          <p>{error}</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No events found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <div 
              key={event._id} 
              className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="h-48 overflow-hidden">
                <img 
                  src={event.images?.[0] || "https://via.placeholder.com/400x200?text=Event"} 
                  alt={event.name} 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="font-bold text-xl mb-2 text-gray-800">{event.name}</h3>
                <p className="text-gray-600 text-sm mb-2 flex items-center">
                  <MdEvent className="inline-block mr-1" />
                  {event.eventType || "General Event"}
                </p>
                <p className="text-gray-600 text-sm mb-3 flex items-center">
                  <MdLocationOn className="inline-block mr-1" />
                  {event.venue || event.location || "Venue TBA"}
                </p>
                <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-semibold">
                    Rs. {event.price}/person
                  </span>
                  <span className="text-sm text-gray-600">
                    Max: {event.maxAttendees || event.capacity || "N/A"}
                  </span>
                </div>
                {event.duration && (
                  <div className="mb-4">
                    <span className="text-sm text-gray-600">
                      Duration: {event.duration} hours
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Link 
                    to={`/event-details/${event._id}`} 
                    className="flex-1 text-center bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    View Details
                  </Link>
                  <Link 
                    to={`/event-details/${event._id}`} 
                    className="flex-1 text-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded transition duration-300"
                  >
                    Book Now
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventList; 