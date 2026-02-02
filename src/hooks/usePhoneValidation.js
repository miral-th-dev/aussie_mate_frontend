import { useState, useCallback } from 'react';
import { validateMessageForPhoneNumbers, containsPhoneNumber } from '../utils/phoneValidator';

/**
 * Custom hook for phone number validation in chat messages
 */
export const usePhoneValidation = () => {
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  /**
   * Validate message content for phone numbers
   * @param {string} message - Message to validate
   * @param {boolean} showModal - Whether to show modal popup
   * @returns {boolean} - True if valid (no phone numbers)
   */
  const validateMessage = useCallback((message, showModal = true) => {
    const validation = validateMessageForPhoneNumbers(message);
    
    if (!validation.isValid) {
      setError(validation.message);
      if (showModal) {
        setModalMessage(validation.message);
        setIsModalOpen(true);
      }
      return false;
    }
    
    setError('');
    return true;
  }, []);

  /**
   * Check if message contains phone numbers (without setting error)
   * @param {string} message - Message to check
   * @returns {boolean} - True if contains phone numbers
   */
  const hasPhoneNumber = useCallback((message) => {
    return containsPhoneNumber(message);
  }, []);

  /**
   * Clear validation error and close modal
   */
  const clearError = useCallback(() => {
    setError('');
    setIsModalOpen(false);
    setModalMessage('');
  }, []);

  /**
   * Close modal only
   */
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  /**
   * Validate and send message if valid
   * @param {string} message - Message to validate and send
   * @param {Function} sendFunction - Function to call if message is valid
   * @param {boolean} showModal - Whether to show modal on error
   * @returns {boolean} - True if message was sent
   */
  const validateAndSend = useCallback((message, sendFunction, showModal = true) => {
    if (validateMessage(message, showModal)) {
      sendFunction(message);
      return true;
    }
    return false;
  }, [validateMessage]);

  /**
   * Show modal with custom message
   * @param {string} message - Custom message to show
   */
  const showModal = useCallback((message) => {
    setModalMessage(message);
    setIsModalOpen(true);
  }, []);

  return {
    error,
    isModalOpen,
    modalMessage,
    validateMessage,
    hasPhoneNumber,
    clearError,
    closeModal,
    showModal,
    validateAndSend
  };
};
