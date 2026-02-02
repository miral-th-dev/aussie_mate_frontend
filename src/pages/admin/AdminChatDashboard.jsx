import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Loader } from '../../components';
import { chatAPI } from '../../services/chatAPI';
import { useAuth } from '../../contexts/AuthContext';

const AdminChatDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [adminChatRooms, setAdminChatRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (user?.role !== 'Admin') {
      navigate('/login');
      return;
    }

    loadChatRooms();
    
    // Refresh rooms every 30 seconds
    const interval = setInterval(loadChatRooms, 30000);
    
    return () => clearInterval(interval);
  }, [user, navigate]);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const response = await chatAPI.getAdminChatRooms();
      if (response.success) {
        setAdminChatRooms(response.data || []);
      } else {
        setError(response.error || 'Failed to load chat rooms');
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      setError('Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleRoomClick = (room) => {
    navigate(`/admin/chat/${room._id}`, {
      state: {
        userId: room.userId?._id,
        adminId: room.adminId?._id,
        userName: `${room.userId?.firstName || ''} ${room.userId?.lastName || ''}`.trim()
      }
    });
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Sort rooms: pending first, then by unread count, then by last message time
  const sortedRooms = [...adminChatRooms].sort((a, b) => {
    // Pending rooms first
    if (!a.adminId && b.adminId) return -1;
    if (a.adminId && !b.adminId) return 1;
    
    // Then by unread count
    if (a.unreadCount !== b.unreadCount) {
      return (b.unreadCount || 0) - (a.unreadCount || 0);
    }
    
    // Then by last message time
    const aTime = a.lastMessage?.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTime = b.lastMessage?.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PageHeader
          title="Admin Chat Dashboard"
          onBack={handleBack}
          className="mb-6"
          titleClassName="text-lg sm:text-xl font-semibold text-gray-900"
        />

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader message="Loading chat rooms..." />
          </div>
        ) : sortedRooms.length === 0 ? (
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-custom text-center">
            <p className="text-primary-500 text-lg">No chat rooms available</p>
            <p className="text-primary-200 text-sm mt-2">Users will appear here when they start a conversation</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRooms.map((room) => (
              <div
                key={room._id}
                onClick={() => handleRoomClick(room)}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-custom cursor-pointer hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-primary-500">
                        {room.userId?.firstName} {room.userId?.lastName}
                      </h3>
                      {room.unreadCount > 0 && (
                        <span className="px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-primary-200 mt-1">{room.userId?.email}</p>
                    {room.lastMessage && (
                      <p className="text-xs text-gray-500 mt-2 truncate">
                        {room.lastMessage.content}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    {!room.adminId && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full whitespace-nowrap">
                        Pending
                      </span>
                    )}
                    {room.lastMessage?.createdAt && (
                      <span className="text-xs text-gray-400">
                        {new Date(room.lastMessage.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default AdminChatDashboard;

