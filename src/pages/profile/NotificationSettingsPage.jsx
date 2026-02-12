import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components';
import { useAuth } from '../../contexts/AuthContext';

const NotificationSettingsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // State for toggle switches
  const [notifications, setNotifications] = useState({
    // Cleaner-specific notifications
    jobAlerts: true,
    bidUpdates: true,
    bookingConfirmed: false,
    paymentsPayouts: true,
    verificationDocuments: false,
    chatMessages: false,
    promotionsSurveys: true,
    // Customer-specific notifications
    pushNotifications: true,
    jobUpdates: false,
    promotions: true,
    loyaltyUpdates: false
  });

  // Cleaner notification settings
  const cleanerNotifications = [
    {
      key: 'jobAlerts',
      title: 'Job Alerts',
      description: 'New jobs within radius',
      isOn: notifications.jobAlerts
    },
    {
      key: 'bidUpdates',
      title: 'Bid Updates',
      description: 'When customers view, accept, or reject your quote.',
      isOn: notifications.bidUpdates
    },
    {
      key: 'bookingConfirmed',
      title: 'Booking Confirmed',
      description: 'Get alerts when a booking is locked in.',
      isOn: notifications.bookingConfirmed
    },
    {
      key: 'paymentsPayouts',
      title: 'Payments & Payouts',
      description: 'Escrow release, payout processed, or payment hold.',
      isOn: notifications.paymentsPayouts
    },
    {
      key: 'verificationDocuments',
      title: 'Verification & Documents',
      description: 'ABN, Police Check, and ID status updates.',
      isOn: notifications.verificationDocuments
    },
    {
      key: 'chatMessages',
      title: 'Chat Messages',
      description: 'Messages from customers, linked to jobs.',
      isOn: notifications.chatMessages
    },
    {
      key: 'promotionsSurveys',
      title: 'Promotions & Surveys',
      description: 'Special offers, loyalty updates, and feedback surveys.',
      isOn: notifications.promotionsSurveys
    }
  ];

  // Customer notification settings
  const customerNotifications = [
    {
      key: 'pushNotifications',
      title: 'Push Notifications',
      description: 'Allow Aussie Mate to send you alerts.',
      isOn: notifications.pushNotifications
    },
    {
      key: 'jobUpdates',
      title: 'Job Updates',
      description: 'Get updates about bids, bookings & job status.',
      isOn: notifications.jobUpdates
    },
    {
      key: 'promotions',
      title: 'Promotions',
      description: 'Receive offers, discounts & new services.',
      isOn: notifications.promotions
    },
    {
      key: 'loyaltyUpdates',
      title: 'Loyalty / MatePoints Updates',
      description: 'Be notified when you earn or redeem MatePoints.',
      isOn: notifications.loyaltyUpdates
    }
  ];

  const handleBack = () => {
    navigate(-1);
  };

  const toggleNotification = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Custom toggle switch component
  const ToggleSwitch = ({ isOn, onToggle, className = "" }) => {
    return (
      <button
        onClick={onToggle}
        className={`toggle-switch relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none cursor-pointer ${isOn ? 'bg-primary-500' : 'bg-gray-300'
          } ${className}`}
      >
        <span
          className={`toggle-switch-circle inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ${isOn ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
    );
  };

  return (
    <div className='px-3 md:px-4'>  
        <PageHeader
          title="Notification Settings"
          onBack={handleBack}
          className="mb-4"
          titleClassName="text-lg sm:text-xl font-semibold text-gray-900 py-4 pl-0!"
        />
        {/* Notification Settings - Show for all users except customers */}
        {user?.role !== 'Customer' && (
          <div className="bg-white rounded-2xl border border-gray-200">
            {cleanerNotifications.map((notification, index) => (
              <div 
                key={notification.key}
                className={`flex items-center justify-between py-4 px-2 mx-4 ${
                  index < cleanerNotifications.length - 1 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900 mb-1">
                    {notification.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {notification.description}
                  </p>
                </div>
                <ToggleSwitch
                  isOn={notification.isOn}
                  onToggle={() => toggleNotification(notification.key)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Customer-specific settings */}
        {user?.role === 'Customer' && (
          <div>
            {/* General Section */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-primary-200 uppercase tracking-wide mb-2 ">
                GENERAL
              </h2>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-custom p-4 space-y-4">
                {customerNotifications.slice(0, 2).map((notification) => (
                  <div key={notification.key} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-primary-500 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-primary-200 font-medium">
                        {notification.description}
                      </p>
                    </div>
                    <ToggleSwitch
                      isOn={notification.isOn}
                      onToggle={() => toggleNotification(notification.key)}
                      className="cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Offers & Loyalty Section */}
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-primary-200 uppercase tracking-wide mb-2">
                OFFERS & LOYALTY
              </h2>

              <div className="bg-white rounded-2xl border border-gray-200 shadow-custom p-4 space-y-4">
                {customerNotifications.slice(2).map((notification) => (
                  <div key={notification.key} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-primary-500 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-primary-200 font-medium">
                        {notification.description}
                      </p>
                    </div>
                    <ToggleSwitch
                      isOn={notification.isOn}
                      onToggle={() => toggleNotification(notification.key)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
       
    </div>
  );
};

export default NotificationSettingsPage;
