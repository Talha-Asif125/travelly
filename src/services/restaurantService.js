import axios from "../api/axios";

/**
 * Service for handling restaurant-related API calls
 */
const restaurantService = {
  /**
   * Get all restaurants
   * @returns {Promise} Promise with restaurants data
   */
  getAllRestaurants: async () => {
    try {
      // Try different endpoint patterns
      try {
        const response = await axios.post("/restaurant/find-first-five-resturents", {});
        return response.data;
      } catch (firstError) {
        try {
          const response = await axios.get("/restaurant");
          return response.data;
        } catch (secondError) {
          const response = await axios.get("/restaurants");
          return response.data;
        }
      }
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      throw error;
    }
  },

  /**
   * Get restaurant by ID
   * @param {string} id Restaurant ID
   * @returns {Promise} Promise with restaurant data
   */
  getRestaurantById: async (id) => {
    try {
      try {
        const response = await axios.post("/restaurant/find-resturent-by-id", { id });
        return Array.isArray(response.data) ? response.data[0] : response.data;
      } catch (firstError) {
        try {
          const response = await axios.get(`/restaurant/${id}`);
          return response.data;
        } catch (secondError) {
          const response = await axios.get(`/restaurants/${id}`);
          return response.data;
        }
      }
    } catch (error) {
      console.error(`Error fetching restaurant with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a new restaurant
   * @param {Object} restaurantData Restaurant data to create
   * @returns {Promise} Promise with created restaurant data
   */
  createRestaurant: async (restaurantData) => {
    try {
      try {
        const response = await axios.post("/restaurant", restaurantData);
        return response.data;
      } catch (firstError) {
        const response = await axios.post("/restaurants", restaurantData);
        return response.data;
      }
    } catch (error) {
      console.error("Error creating restaurant:", error);
      throw error;
    }
  },

  /**
   * Update an existing restaurant
   * @param {string} id Restaurant ID
   * @param {Object} restaurantData Updated restaurant data
   * @returns {Promise} Promise with updated restaurant data
   */
  updateRestaurant: async (id, restaurantData) => {
    try {
      try {
        const response = await axios.put(`/restaurant/${id}`, restaurantData);
        return response.data;
      } catch (firstError) {
        const response = await axios.put(`/restaurants/${id}`, restaurantData);
        return response.data;
      }
    } catch (error) {
      console.error(`Error updating restaurant with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Delete a restaurant
   * @param {string} id Restaurant ID to delete
   * @returns {Promise} Promise with delete status
   */
  deleteRestaurant: async (id) => {
    try {
      try {
        const response = await axios.delete(`/restaurant/${id}`);
        return response.data;
      } catch (firstError) {
        const response = await axios.delete(`/restaurants/${id}`);
        return response.data;
      }
    } catch (error) {
      console.error(`Error deleting restaurant with id ${id}:`, error);
      throw error;
    }
  },

  /**
   * Create a restaurant reservation
   * @param {Object} reservationData Reservation data
   * @returns {Promise} Promise with created reservation data
   */
  createReservation: async (reservationData) => {
    try {
      try {
        const response = await axios.post("/restaurantReservation/create", reservationData);
        return response.data;
      } catch (firstError) {
        try {
          const response = await axios.post("/restaurant-reservation", reservationData);
          return response.data;
        } catch (secondError) {
          const response = await axios.post("/restaurant-reservations", reservationData);
          return response.data;
        }
      }
    } catch (error) {
      console.error("Error creating reservation:", error);
      throw error;
    }
  }
};

export default restaurantService; 