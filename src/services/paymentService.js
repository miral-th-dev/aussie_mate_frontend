// services/paymentService.js
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

// Helper: get auth token
const getAuthToken = () => localStorage.getItem('authToken');

// Generic payment API request
const paymentApiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options.headers || {}),
    },
    body: options.body,
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('text/html')) {
    throw new Error(`API endpoint not found: ${endpoint}. Backend server may not be running.`);
  }

  let data;
  try {
    data = await res.json();
  } catch {
    const text = await res.text();
    throw new Error(`Invalid JSON response: ${text}`);
  }

  if (!res.ok) {
    const err = new Error(data.error || data.message || `API error ${res.status}`);
    err.status = res.status;
    err.response = data;
    throw err;
  }

  return data;
};

// Payment API Service (aligned with backend routes)
export const paymentService = {
  // Create payment (customer initiates payment)
  createPayment: async (paymentData) => {
    return paymentApiRequest('/payments/create', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Verify payment status
  verifyPayment: async (paymentId) => {
    return paymentApiRequest(`/payments/${paymentId}/verify`);
  },

  // Capture payment (Manual capture if needed, though usually automatic via webhook)
  capturePayment: async (paymentId) => {
    return paymentApiRequest(`/payments/${paymentId}/capture`, {
      method: 'POST',
    });
  },

  // Stripe Connect (cleaner onboarding)
  createStripeConnectAccount: async () => {
    return paymentApiRequest('/payments/connect/create-account', {
      method: 'POST',
    });
  },

  getStripeOnboardingLink: async (accountId) => {
    return paymentApiRequest('/payments/connect/onboarding-link', {
      method: 'POST',
      body: JSON.stringify({ accountId }),
    });
  },

  getStripeAccountStatus: async () => {
    try {
      return await paymentApiRequest('/payments/stripe/status');
    } catch (error) {
      if (error.response?.code === 'NO_STRIPE_ACCOUNT' || error.status === 404) {
        return { success: false, data: null };
      }
      throw error;
    }
  },

  // Get payment history (all payments for current user)
  getPaymentHistory: async () => {
    return paymentApiRequest('/payments');
  },

  // Get payment status by job ID
  getPaymentStatus: async (jobId) => {
    return paymentApiRequest(`/payments/job/${jobId}/status`);
  },

  // Confirm checkout session (Stripe redirect success)
  confirmCheckoutSession: async (sessionId) => {
    return paymentApiRequest(`/payments/confirm-checkout?session_id=${sessionId}`);
  },
};

export const handlePaymentError = (error) => {
  console.error('Payment API Error:', error);

  if (error.response?.code === 'JOB_NOT_FOUND') return 'Job not found. Please try again.';
  if (error.response?.code === 'JOB_NOT_ACCEPTED') return 'Job must be accepted before payment.';
  if (error.response?.code === 'NO_ACCEPTED_QUOTE') return 'No accepted quote found for this job.';
  if (error.response?.code === 'CLEANER_NO_STRIPE_ACCOUNT') return 'Cleaner has not set up their payment account yet.';
  if (error.response?.code === 'ACCESS_DENIED') return 'You do not have permission to perform this action.';
  if (error.response?.code === 'VALIDATION_ERROR')
    return error.response?.details?.map((d) => d.msg).join(', ') || 'Validation failed.';
  if (error.response?.code === 'PAYMENT_NOT_FOUND') return 'Payment not found.';
  if (error.response?.code === 'INVALID_PAYMENT_STATUS') return 'Payment cannot be captured. Invalid status.';
  if (error.response?.code === 'CAPTURE_FAILED') return 'Payment capture failed. Please try again.';

  if (error.message.includes('401') || error.message.includes('Unauthorized'))
    return 'Session expired. Please login again.';

  if (error.message.includes('Failed to fetch') || error.message.includes('Network'))
    return 'Network error. Please check your connection.';

  return error.message || 'Payment processing failed. Please try again.';
};