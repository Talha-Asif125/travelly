import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Rating,
  Button,
  Chip,
  Stack
} from '@mui/material';
import { LocationOn, Wifi, LocalParking, Restaurant } from '@mui/icons-material';
import ReservationModal from './ReservationModal';

const HotelCard = ({ hotel }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Ensure hotel object has all required properties with default values
  const hotelData = {
    id: hotel?.id || Math.random().toString(36).substr(2, 9),
    name: hotel?.name || 'Hotel Name',
    location: hotel?.location || 'Location',
    rating: hotel?.rating || 0,
    reviews: hotel?.reviews || 0,
    price: hotel?.price || 0,
    image: hotel?.image || 'https://via.placeholder.com/300x200?text=Hotel+Image',
    amenities: hotel?.amenities || [],
    description: hotel?.description || '',
    roomTypes: hotel?.roomTypes || [
      { type: 'standard', price: hotel?.price || 100 },
      { type: 'deluxe', price: (hotel?.price || 100) * 1.5 },
      { type: 'suite', price: (hotel?.price || 100) * 2 }
    ]
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          height="200"
          image={hotelData.image}
          alt={hotelData.name}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="h2">
            {hotelData.name}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ color: 'text.secondary', mr: 0.5 }} fontSize="small" />
            <Typography variant="body2" color="text.secondary">
              {hotelData.location}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={hotelData.rating} precision={0.5} readOnly />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({hotelData.reviews} reviews)
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
            {hotelData.amenities.includes('wifi') && (
              <Chip icon={<Wifi />} label="Free WiFi" size="small" />
            )}
            {hotelData.amenities.includes('parking') && (
              <Chip icon={<LocalParking />} label="Parking" size="small" />
            )}
            {hotelData.amenities.includes('restaurant') && (
              <Chip icon={<Restaurant />} label="Restaurant" size="small" />
            )}
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" color="primary">
                ${hotelData.roomTypes[0].price}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                per night
              </Typography>
            </Box>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleOpenModal}
            >
              Book Now
            </Button>
          </Box>
        </CardContent>
      </Card>

      <ReservationModal
        open={isModalOpen}
        onClose={handleCloseModal}
        hotel={hotelData}
      />
    </>
  );
};

export default HotelCard; 