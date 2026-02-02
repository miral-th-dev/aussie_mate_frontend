import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SettingsIcon from '../../assets/settings.svg'
import { PageHeader } from '../../components'

const NotificationPage = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'jobs', label: 'Jobs' },
    { id: 'payments', label: 'Payments' },
    { id: 'admin', label: 'Admin' },
    { id: 'system', label: 'System' }
  ]

  const notifications = [
    {
      id: 1,
      title: 'New Bond Cleaning Job Available',
      description: '2BHK apartment in Sydney CBD, $180 - Flexible in 2 days',
      action: 'View Job',
      timestamp: '2 mins ago',
      category: 'jobs',
      isRead: false
    },
    {
      id: 2,
      title: 'Escrow Released - $220',
      description: 'Customer confirmed job completion, payout scheduled in 24h',
      action: 'View Earnings',
      timestamp: '10 mins ago',
      category: 'payments',
      isRead: false
    },
    {
      id: 3,
      title: 'Police Check Expiring Soon',
      description: 'Upload new document before 30 Aug to continue receiving jobs.',
      action: 'Update Now',
      timestamp: 'Yesterday, 5:42 PM',
      category: 'admin',
      isRead: true
    },
    {
      id: 4,
      title: 'Training Video Update',
      description: 'New NDIS training material has been added to your profile.',
      action: 'View Training',
      timestamp: 'Yesterday, 5:42 PM',
      category: 'admin',
      isRead: true
    },
    {
      id: 5,
      title: 'Almost Silver Badge!',
      description: 'Complete 3 more jobs to reach Silver Tier & unlock perks.',
      action: 'See Progress',
      timestamp: '2 days ago',
      category: 'system',
      isRead: true
    }
  ]

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notification => notification.category === activeTab)

  const handleNotificationClick = (notification) => {
    // Handle notification click logic here
    console.log('Notification clicked:', notification)
  }

  const handleActionClick = (notification, e) => {
    e.stopPropagation()
    // Handle action click logic here
    console.log('Action clicked:', notification.action)
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <PageHeader
          title="Notifications"
          onBack={() => navigate(-1)}
          className="mb-4 sm:mb-6"
          titleClassName="text-xl sm:text-2xl font-bold text-gray-900"
          rightSlot={
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <img src={SettingsIcon} alt="Settings" className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          }
        />

        {/* Tab Navigation */}
        <div className="mb-4 sm:mb-6">
          <div className="flex overflow-x-auto scrollbar-hide">
            <div className="flex space-x-1 sm:space-x-2 min-w-max">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg! text-sm sm:text-base font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#EBF2FD] text-primary-600'
                      : 'bg-white text-primary-200 font-medium border-[#F3F3F3]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-custom overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <div className="text-gray-500 text-sm sm:text-base">No notifications found</div>
            </div>
          ) : (
            <div className="space-y-3 mx-3">
              {filteredNotifications.map((notification, index) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={"p-4 sm:p-5 hover:bg-gray-50 cursor-pointer transition-colors border-b border-[#F3F3F3] rounded-lg "}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1 sm:mb-2">
                        <h3 className={`text-sm sm:text-base font-semibold text-primary-500 line-clamp-2 ${
                          !notification.isRead ? 'font-bold' : ''
                        }`}>
                          {notification.title}
                        </h3>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1.5 ml-2"></div>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-primary-200 font-medium mb-2 sm:mb-3 line-clamp-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={(e) => handleActionClick(notification, e)}
                          className="text-primary-600 hover:text-[#0088FF] text-xs sm:text-sm font-medium cursor-pointer"
                        >
                          {notification.action}
                        </button>
                        <span className="text-xs text-primary-200 font-medium ml-2">
                          {notification.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default NotificationPage
