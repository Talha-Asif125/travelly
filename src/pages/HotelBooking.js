import React, { useState, useEffect } from 'react';
import { Container, Grid, Paper, Typography, TextField, Button, Box, FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import HotelCard from '../components/HotelCard';
import { searchHotels, getPopularHotels } from '../services/hotelService';

const HotelBooking = () => {
  const [searchParams, setSearchParams] = useState({
    destination: '',
    checkIn: null,
    checkOut: null,
    guests: 1,
    rooms: 1
  });

  const [searchResults, setSearchResults] = useState([]);
  const [popularHotels, setPopularHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load popular hotels when component mounts
    loadPopularHotels();
  }, []);

  const loadPopularHotels = async () => {
    try {
      const hotels = await getPopularHotels();
      setPopularHotels(hotels);
    } catch (error) {
      console.error('Failed to load popular hotels:', error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      setError(null);
      const results = await searchHotels(searchParams);
      setSearchResults(results);
    } catch (error) {
      setError('Failed to search hotels. Please try again.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
        Find Your Perfect Stay
      </Typography>
      
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Destination"
              variant="outlined"
              value={searchParams.destination}
              onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
              placeholder="Where are you going?"
            />
          </Grid>
          
          <Grid item xs={12} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Check-in"
                value={searchParams.checkIn}
                onChange={(date) => setSearchParams({ ...searchParams, checkIn: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={new Date()}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Check-out"
                value={searchParams.checkOut}
                onChange={(date) => setSearchParams({ ...searchParams, checkOut: date })}
                renderInput={(params) => <TextField {...params} fullWidth />}
                minDate={searchParams.checkIn || new Date()}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Guests</InputLabel>
              <Select
                value={searchParams.guests}
                label="Guests"
                onChange={(e) => setSearchParams({ ...searchParams, guests: e.target.value })}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <MenuItem key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Rooms</InputLabel>
              <Select
                value={searchParams.rooms}
                label="Rooms"
                onChange={(e) => setSearchParams({ ...searchParams, rooms: e.target.value })}
              >
                {[1, 2, 3, 4].map((num) => (
                  <MenuItem key={num} value={num}>{num} {num === 1 ? 'Room' : 'Rooms'}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleSearch}
            disabled={loading}
            sx={{ px: 4, py: 1.5 }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Search Hotels'}
          </Button>
        </Box>
      </Paper>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" gutterBottom>
            Search Results
          </Typography>
          <Grid container spacing={3}>
            {searchResults.map((hotel) => (
              <Grid item key={hotel.id} xs={12} sm={6} md={4}>
                <HotelCard hotel={hotel} />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Popular Hotels Section */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Popular Hotels
        </Typography>
        <Grid container spacing={3}>
          {popularHotels.map((hotel) => (
            <Grid item key={hotel.id} xs={12} sm={6} md={4}>
              <HotelCard hotel={hotel} />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
};

export default HotelBooking; 