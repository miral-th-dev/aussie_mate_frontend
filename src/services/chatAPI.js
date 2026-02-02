// services/chatAPI.js
import { API_CONFIG } from '../config/api';

const API_BASE = API_CONFIG.BASE_URL;

const getAuthHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
  'Content-Type': 'application/json'
});

export const chatAPI = {
  // Get all chat rooms
  async getChatRooms() {
    const response = await fetch(`${API_BASE}/chat/rooms`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Create or get chat room
  async createChatRoom(jobId, cleanerId) {
    const response = await fetch(`${API_BASE}/chat/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ jobId, cleanerId })
    });
    return response.json();
  },

  // Get chat messages
  async getChatMessages(chatRoomId, page = 1, limit = 50) {
    const response = await fetch(
      `${API_BASE}/chat/rooms/${chatRoomId}/messages?page=${page}&limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    return response.json();
  },

  // Mark chat as read
  async markChatAsRead(chatRoomId) {
    const response = await fetch(`${API_BASE}/chat/rooms/${chatRoomId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get unread count
  async getUnreadCount() {
    const response = await fetch(`${API_BASE}/chat/unread-count`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get chat history for a specific job and cleaner
  async getChatHistory(jobId, cleanerId) {
    try {
      // First, get all chat rooms
      const roomsResponse = await fetch(`${API_BASE}/chat/rooms`, {
        headers: getAuthHeaders()
      });
      const roomsData = await roomsResponse.json();
      
      if (!roomsData.success) {
        return { success: false, error: 'Failed to get chat rooms' };
      }
      
      // Find the chat room for this job and cleaner
      const chatRoom = roomsData.data.find(room => 
        room.jobId?._id === jobId || room.jobId?.id === jobId
      );
      
      if (!chatRoom) {
        return { success: true, data: { messages: [] } };
      }
      
      // Get messages for this chat room
      const messagesResponse = await fetch(
        `${API_BASE}/chat/rooms/${chatRoom._id}/messages?page=1&limit=100`,
        { headers: getAuthHeaders() }
      );
      const messagesData = await messagesResponse.json();
      
      if (messagesData.success) {
        return { success: true, data: { messages: messagesData.data.messages || [] } };
      } else {
        return { success: false, error: 'Failed to get messages' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Admin chat API endpoints
  // Get admin chat rooms
  async getAdminChatRooms() {
    const response = await fetch(`${API_BASE}/chat/admin/rooms`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Create or get admin chat room
  async createAdminChatRoom(userId, adminId, subject, relatedJobId) {
    const response = await fetch(`${API_BASE}/chat/admin/rooms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId, adminId, subject, relatedJobId })
    });
    return response.json();
  },

  // Get admin chat messages
  async getAdminChatMessages(adminChatRoomId, page = 1, limit = 50) {
    const response = await fetch(
      `${API_BASE}/chat/admin/rooms/${adminChatRoomId}/messages?page=${page}&limit=${limit}`,
      { headers: getAuthHeaders() }
    );
    return response.json();
  },

  // Mark admin chat as read
  async markAdminChatAsRead(adminChatRoomId) {
    const response = await fetch(`${API_BASE}/chat/admin/rooms/${adminChatRoomId}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get admin unread count
  async getAdminUnreadCount() {
    const response = await fetch(`${API_BASE}/chat/admin/unread-count`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};
