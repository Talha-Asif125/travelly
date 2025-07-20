import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Box,
  Tabs,
  Tab,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Rating,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { AccessTime, LocationOn, Group } from '@mui/icons-material';
import TourBookingModal from '../components/TourBookingModal';
import { getToursByCategory } from '../services/tourService';

// Removed dummy tour data - now uses MongoDB data only

const TourPackages = () => {
  const [selectedCategory, setSelectedCategory] = useState('beach');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tours, setTours] = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  useEffect(() => {
    loadTours(selectedCategory);
  }, [selectedCategory]);

  const loadTours = async (category) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getToursByCategory(category);
      setTours(data);
    } catch (error) {
      setError('Failed to load tours. Please try again.');
      console.error('Error loading tours:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  const handleBookTour = (tour) => {
    setSelectedTour(tour);
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedTour(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" align="center" gutterBottom>
        Tour Packages
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs
          value={selectedCategory}
          onChange={handleCategoryChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="tour categories"
        >
          <Tab label="Sun & Beach" value="beach" />
          <Tab label="Adventure" value="adventure" />
          <Tab label="Cultural" value="cultural" />
        </Tabs>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={4}>
          {tours.map((tour) => (
            <Grid item key={tour.id} xs={12} sm={6} md={4}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={tour.image}
                  alt={tour.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {tour.title}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ color: 'text.secondary', mr: 0.5 }} fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {tour.location}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTime sx={{ color: 'text.secondary', mr: 0.5 }} fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {tour.duration}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Group sx={{ color: 'text.secondary', mr: 0.5 }} fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      Group size: {tour.groupSize}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" paragraph>
                    {tour.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Rating value={tour.rating} precision={0.5} readOnly size="small" />
                    <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      ({tour.reviews} reviews)
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
                  <Typography variant="h6" color="primary">
                    ${tour.price}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => handleBookTour(tour)}
                  >
                    Book Now
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTour && (
        <TourBookingModal
          open={isBookingModalOpen}
          onClose={handleCloseBookingModal}
          tour={selectedTour}
        />
      )}
    </Container>
  );
};

export default TourPackages; 