import React, { useState } from 'react';

const ContactCustomerModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  customerName,
  isLoading = false 
}) => {
  const [message, setMessage] = useState('Hi! I\'m ready to help with your cleaning job.');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (message.trim()) {
      onConfirm(message.trim());
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      <div 
        className="bg-white rounded-[32px] p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-primary-500 mb-2 text-center">
          Message {customerName || 'Customer'}
        </h3>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Send a friendly intro message to start the conversation.
        </p>

        <div className="mb-6">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:border-primary-400 min-h-[120px] resize-none"
            placeholder="Type your message here..."
            autoFocus
          />
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleSubmit}
            disabled={isLoading || !message.trim()}
            className="w-full bg-[#1F6FEB] hover:bg-blue-600 text-white font-bold py-4 rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-lg shadow-blue-200"
          >
            {isLoading ? 'Sending...' : 'Send Message'}
          </button>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full bg-white text-gray-400 font-semibold py-2 rounded-full transition-colors cursor-pointer disabled:opacity-50 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactCustomerModal;
