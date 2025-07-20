import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const getNotifications = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/notifications`, {
      headers: getAuthHeaders()
    });
    return response.data.data || [];
  } catch (error) {
    throw new Error('Failed to fetch notifications: ' + error.message);
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/notifications/${notificationId}/read`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to mark notification as read: ' + error.message);
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.post(`${API_BASE_URL}/notifications/mark-all-read`, {}, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to mark all notifications as read: ' + error.message);
  }
};

export const sendNotification = async (notificationData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/notifications`, notificationData, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to send notification: ' + error.message);
  }
};

// Notification templates
export const NotificationTypes = {
  PROVIDER_REQUEST_APPROVED: 'provider_request_approved',
  PROVIDER_REQUEST_REJECTED: 'provider_request_rejected',
  NEW_RESERVATION: 'new_reservation',
  RESERVATION_APPROVED: 'reservation_approved',
  RESERVATION_REJECTED: 'reservation_rejected',
  SERVICE_ADDED: 'service_added',
  SERVICE_UPDATED: 'service_updated',
  PAYMENT_CONFIRMED: 'payment_confirmed',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  NEW_SERVICE_BOOKING: 'new_service_booking',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled'
};

export const createNotification = (type, data) => {
  const templates = {
    [NotificationTypes.PROVIDER_REQUEST_APPROVED]: {
      title: 'Service Provider Request Approved!',
      message: `Congratulations! Your request to become a ${data.providerType} service provider has been approved. You can now access your service provider dashboard and start adding your services.`,
      type: NotificationTypes.PROVIDER_REQUEST_APPROVED
    },
    [NotificationTypes.PROVIDER_REQUEST_REJECTED]: {
      title: 'Service Provider Request Update',
      message: `Your request to become a ${data.providerType} service provider has been declined. ${data.reason ? `Reason: ${data.reason}` : 'Please contact support for more information.'}`,
      type: NotificationTypes.PROVIDER_REQUEST_REJECTED
    },
    [NotificationTypes.NEW_RESERVATION]: {
      title: 'New Reservation Request',
      message: `You have a new reservation request for ${data.serviceName} from ${data.customerName}. Please review and respond.`,
      type: NotificationTypes.NEW_RESERVATION
    },
    [NotificationTypes.RESERVATION_APPROVED]: {
      title: 'Reservation Confirmed!',
      message: `Great news! Your reservation for ${data.serviceName} has been approved. Confirmation number: ${data.confirmationNumber}`,
      type: NotificationTypes.RESERVATION_APPROVED
    },
    [NotificationTypes.RESERVATION_REJECTED]: {
      title: 'Reservation Update',
      message: `Sorry, your reservation for ${data.serviceName} has been declined. ${data.reason ? `Reason: ${data.reason}` : 'Please try different dates or contact the provider.'}`,
      type: NotificationTypes.RESERVATION_REJECTED
    },
    [NotificationTypes.NEW_SERVICE_BOOKING]: {
      title: 'New Service Booking',
      message: `You have a new booking request for ${data.serviceName} from ${data.customerName}. Check-in: ${data.checkInDate}. Total: Rs. ${data.totalAmount}`,
      type: NotificationTypes.NEW_SERVICE_BOOKING
    },
    [NotificationTypes.BOOKING_CONFIRMED]: {
      title: 'Booking Confirmed!',
      message: `Your booking for ${data.serviceName} has been confirmed! Confirmation number: ${data.confirmationNumber}. Check-in: ${data.checkInDate}`,
      type: NotificationTypes.BOOKING_CONFIRMED
    },
    [NotificationTypes.BOOKING_CANCELLED]: {
      title: 'Booking Cancelled',
      message: `Your booking for ${data.serviceName} has been cancelled. ${data.reason ? `Reason: ${data.reason}` : 'Please contact the provider for more information.'}`,
      type: NotificationTypes.BOOKING_CANCELLED
    },
    [NotificationTypes.SERVICE_ADDED]: {
      title: 'New Service Available',
      message: `A new ${data.serviceType} service "${data.serviceName}" is now available for booking!`,
      type: NotificationTypes.SERVICE_ADDED
    },
    [NotificationTypes.PAYMENT_CONFIRMED]: {
      title: 'Payment Confirmed',
      message: `Your payment of Rs. ${data.amount} for ${data.serviceName} has been confirmed. Thank you!`,
      type: NotificationTypes.PAYMENT_CONFIRMED
    },
    [NotificationTypes.SYSTEM_MAINTENANCE]: {
      title: 'Scheduled Maintenance',
      message: `The system will be under maintenance from ${data.startTime} to ${data.endTime}. Some features may be unavailable.`,
      type: NotificationTypes.SYSTEM_MAINTENANCE
    }
  };

  return templates[type] || {
    title: 'Notification',
    message: data.message || 'You have a new notification.',
    type: 'info'
  };
};

// Real-time notification handling (can be enhanced with WebSocket)
export class NotificationManager {
  constructor() {
    this.listeners = [];
    this.pollInterval = null;
  }

  startPolling(interval = 30000) {
    this.pollInterval = setInterval(async () => {
      try {
        const notifications = await getNotifications();
        this.notifyListeners(notifications);
      } catch (error) {
        console.error('Error polling notifications:', error);
      }
    }, interval);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  addListener(callback) {
    this.listeners.push(callback);
  }

  removeListener(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }

  notifyListeners(notifications) {
    this.listeners.forEach(listener => listener(notifications));
  }

  async sendToUser(userId, type, data) {
    const notification = createNotification(type, data);
    return await sendNotification({
      userId,
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  async sendToProvider(providerId, type, data) {
    const notification = createNotification(type, data);
    return await sendNotification({
      userId: providerId,
      ...notification,
      timestamp: new Date().toISOString()
    });
  }

  async sendToAdmin(type, data) {
    const notification = createNotification(type, data);
    return await sendNotification({
      userType: 'admin',
      ...notification,
      timestamp: new Date().toISOString()
    });
  }
}

export const notificationManager = new NotificationManager(); 