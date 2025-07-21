import { useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import backgroundImage from '../../assets/images/event.jpg';

const Activity = ({ id, name, description, startTime, endTime, image }) => {
  const navigate = useNavigate();
  const truncatedDescription = description && description.length > 100 
    ? description.substring(0, 100) + '...' 
    : description || 'No description available';
  return (
    <div className='bg-white border border-gray-200 p-4 rounded-lg shadow-md mb-4 flex items-center'>
      <div className='flex-shrink-0'>
        <img
          src={image}
          alt={`Image for ${name}`}
          className='rounded-full'
          width={'200px'}
          height={'200px'}
        />
      </div>
      <div className='ml-4'>
        <h2
          onClick={() => {
            navigate(`/activities/${id}`);
          }}
          className='text-lg font-bold mb-2 text-gray-800 hover:text-blue-500 cursor-pointer'
        >
          {name}
        </h2>
        <p className='text-gray-700 mb-2'>{truncatedDescription}</p>
        <p className='text-gray-700'>
          {startTime} - {endTime}
        </p>
      </div>
    </div>
  );
};

const ActivityList = ({ activities }) => {
  console.log(activities);
  return (
    <div>
      {activities
        .filter(activity => activity && activity._id) // Filter out null/undefined activities
        .map((activity) => (
          <Activity
            key={activity._id}
            id={activity._id}
            name={activity.name || 'Unnamed Activity'}
            description={activity.description || 'No description available'}
            startTime={activity.timeRange?.startTime || '09:00'}
            endTime={activity.timeRange?.endTime || '17:00'}
            image={activity.image || '/placeholder-activity.jpg'}
          />
        ))}
    </div>
  );
};

const FilterActivities = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [activities, setActivities] = useState([]);
  const [activityType, setActivityType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadInitialActivities();
  }, []);

  const loadInitialActivities = async () => {
    setLoading(true);
    setError('');
    try {
      let allActivities = [];
      
      // Try to get activities from the services API (owner-added activities)
      try {
        const servicesResponse = await fetch('https://travelly-backend-27bn.onrender.com/api/services/event');
        const servicesResult = await servicesResponse.json();
        
        if (servicesResult.success && servicesResult.data) {
          // Format service activities to match the activity structure
          const formattedServiceActivities = servicesResult.data.map(service => ({
            _id: service._id,
            name: service.name || 'Unnamed Event',
            description: service.description || 'No description available',
            location: service.location || 'Location not specified',
            type: service.eventType || 'OUTDOOR',
            timeRange: {
              startTime: service.startTime || service.eventStartTime || '09:00',
              endTime: service.endTime || service.eventEndTime || '17:00'
            },
            dateRange: {
              startDate: service.availableFrom || service.eventDate || new Date().toISOString(),
              endDate: service.availableTo || service.eventEndDate || new Date().toISOString()
            },
            image: service.images?.[0] || service.image || '/placeholder-activity.jpg',
            status: 'APPROVED', // Services are considered approved
            isServiceActivity: true
          }));
          allActivities = [...allActivities, ...formattedServiceActivities];
        }
      } catch (serviceError) {
        console.log('No services found or services API unavailable');
      }
      
      // Try to get approved activities from the activities API
      try {
        const response = await fetch('https://travelly-backend-27bn.onrender.com/api/activities/approved');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.activities) {
            allActivities = [...allActivities, ...data.activities];
          }
        }
      } catch (activityError) {
        console.log('Activities API unavailable');
      }
      
      // If no activities from either source, try filter endpoint
      if (allActivities.length === 0) {
        await handleSearch();
      } else {
        setActivities(allActivities);
      }
      
    } catch (error) {
      console.error('Error loading activities:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(
        `/api/activities/filter?type=${activityType}&searchQuery=${searchQuery}&startDate=${startDate}&startTime=${startTime}&endDate=${endDate}&endTime=${endTime}`
      );
      
      const data = await response.json();
      
      if (data.activities) {
        setActivities(data.activities);
      } else {
        setActivities([]);
      }
    } catch (error) {
      console.error('Error searching activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setStartTime('');
    setEndDate('');
    setEndTime('');
    setActivityType('');
    loadInitialActivities();
  };

  return (
    <div className='bg-cover bg-center'>
      <div
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className='bg-[#DEEFFF] flex items-center justify-center w-full flex-col lg:flex-row'>
          <div className='p-8 pt-5 md:p-24 md:pt-5 lg:p-5'>
            <h1 className='text-3xl md:text-3xl font-bold uppercase text-[#272727] mb-10'>
              Find the
              <span className='text-[#41A4FF]'> Special Activity</span>
              <br />
              for your next stay today!
              <span className='text-2xl block md:text-3xl font-bold uppercase text-[#272727]'>
                Explore our activities
              </span>
            </h1>
            <div className='mb-4'>
              <input
                className='border rounded-lg px-4 py-2 w-full mb-10 focus:outline-none focus:ring-2 focus:ring-blue-500'
                style={{ width: '700px' }}
                type='text'
                placeholder='Search activities'
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.keyCode === 13) {
                    handleSearch();
                  }
                }}
              />
            </div>
          </div>
          <div className='p-8'>
            <img
              src={backgroundImage}
              alt='image-description'
              style={{ borderRadius: '10px', width: '500px', height: 'auto' }}
            />
          </div>
        </div>
      </div>
      <div
        className='flex max-w-7xl mx-auto p-4 gap-10 mt-10'
        style={{ marginBottom: '20rem' }}
      >
        <div className='w-1/3 pr-4 '>
          <h2 className='text-lg font-semibold mb-2'>Filter Activities</h2>
          <div className='mb-4'>
            <label className='block font-medium mb-2'>Start Date</label>
            <input
              className='border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              type='date'
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              min={new Date().toISOString().split('T')[0]}
              max={
                new Date(new Date().getFullYear() + 1, 11, 31)
                  .toISOString()
                  .split('T')[0]
              }
            />
          </div>
          <div className='mb-4'>
            <label className='block font-medium mb-2'>End Date</label>
            <input
              className='border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              type='date'
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              min={
                startDate ? startDate : new Date().toISOString().split('T')[0]
              }
              max={
                new Date(new Date().getFullYear() + 1, 11, 31)
                  .toISOString()
                  .split('T')[0]
              }
            />
          </div>
          <div className='mb-4'>
            <label className='block font-medium mb-2'>Start Time</label>
            <input
              className='border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              type='time'
              value={startTime}
              onChange={(event) => {
                setStartTime(event.target.value);
              }}
            />
          </div>

          <div className='mb-4'>
            <label className='block font-medium mb-2'>End Time</label>
            <input
              className='border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              type='time'
              value={endTime}
              onChange={(event) => {
                const selectedEndTime = event.target.value;
                const selectedStartTime = startTime;

                const endDate = new Date(`2000-01-01T${selectedEndTime}`);
                const startDate = new Date(`2000-01-01T${selectedStartTime}`);

                if (endDate <= startDate) {
                  Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'End time must be after start time',
                  });
                  return;
                }

                setEndTime(selectedEndTime);
              }}
            />
          </div>
          <div className='mb-4'>
            <label className='block font-medium mb-2'>Activity Type</label>
            <select
              className='border rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={activityType}
              onChange={(event) =>
                event.target.value === 'ALL'
                  ? setActivityType('')
                  : setActivityType(event.target.value)
              }
            >
              <option value='ALL'>ALL</option>
              <option value='INDOOR'>Indoor</option>
              <option value='OUTDOOR'>Outdoor</option>
            </select>
          </div>
          <button
            className='bg-blue-500 text-white px-4 py-2 rounded-lg mb-4'
            onClick={handleSearch}
          >
            Search
          </button>
        </div>
        <div className='w-3/4 '>
          {loading ? (
            <div className='flex items-center justify-center py-8'>
              <CircularProgress />
              <span className='ml-2'>Loading activities...</span>
            </div>
          ) : (
            <>
              {activities.length > 0 ? (
                <>
                  <div className='mb-4 flex justify-between items-center'>
                    <p className='text-gray-600'>
                      Showing {activities.length} activit{activities.length === 1 ? 'y' : 'ies'}
                    </p>
                    {(searchQuery || startDate || startTime || endDate || endTime || activityType) && (
                      <button
                        onClick={clearFilters}
                        className='bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm'
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                  <ActivityList activities={activities} />
                </>
              ) : (
                <div className='text-center py-8'>
                  <p className='text-gray-600 mb-4'>No activities found.</p>
                  {(searchQuery || startDate || startTime || endDate || endTime || activityType) && (
                    <button
                      onClick={clearFilters}
                      className='bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg'
                    >
                      Show All Activities
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterActivities;
