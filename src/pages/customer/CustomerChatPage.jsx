import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Button, PageHeader, PhoneValidationAlert, Loader } from '../../components';
import InfoIcon from '../../assets/info.svg';
import MessageIcon from '../../assets/sendChat.svg';
import UserIcon from '../../assets/user.svg';
import { jobsAPI } from '../../services/api';
import { chatAPI } from '../../services/chatAPI';
import { socketService } from '../../services/socketService';

const CustomerChatPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [searchParams] = useSearchParams();
  const cleanerId = searchParams.get('cleaner');
  
  
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [currentChatRoom, setCurrentChatRoom] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [phoneValidationError, setPhoneValidationError] = useState('');
  const [showPhoneAlert, setShowPhoneAlert] = useState(false);
  
  const [newMessage, setNewMessage] = useState('');
  const [quoteData, setQuoteData] = useState({
    baseQuote: 0,
    addons: [],
    total: 0
  });
  
  const messagesEndRef = useRef(null);

  // Initialize Socket Connection and User Data
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
      setError('Authentication required');
      navigate('/login');
      return;
    }

    setCurrentUser(user);
    
    // Connect to socket
    socketService.connect(token);

    // Socket event listeners
    socketService.on('connectionStatus', setIsConnected);
    socketService.on('chatJoined', (data) => {
      setCurrentChatRoom(data);
    });
     socketService.on('chatHistory', (historyMessages) => {
       if (historyMessages && historyMessages.length > 0) {
         // Remove duplicates from chat history
         const uniqueMessages = historyMessages.filter((msg, index, self) => 
           index === self.findIndex(m => 
             (m._id && m._id === msg._id) || 
             (m.id && m.id === msg.id) ||
             (m.content === msg.content && m.timestamp === msg.timestamp)
           )
         );
         setMessages(uniqueMessages);
       } else {
         // No history - start with empty messages
         setMessages([]);
       }
       setLoading(false);
     });
     socketService.on('newMessage', (message) => {
       // Create a unique identifier for this message
       const messageId = message._id || message.id || `${message.content}-${message.senderId?._id}-${message.createdAt}`;
       
       setMessages(prev => {
         // Check if message already exists to prevent duplicates
         const messageExists = prev.some(msg => {
           const existingId = msg._id || msg.id || `${msg.content}-${msg.senderId?._id}-${msg.createdAt}`;
           return existingId === messageId;
         });
         
         if (messageExists) {
           return prev;
         }
         
         return [...prev, message];
       });
       scrollToBottom();
     });
     socketService.on('error', (error) => {
       // Check if it's a phone validation error
       if (error.message && error.message.includes('Phone numbers are not allowed')) {
         setPhoneValidationError(error.message);
         setShowPhoneAlert(true);
         // No auto-hide - user must manually close
       } else {
         // Handle other errors more gracefully
         if (error.message === 'Cleaner has not quoted on this job') {
           setError('Chat system temporarily unavailable');
         } else {
           setError(error.message);
         }
         
         // Start with empty messages on error
         setMessages([]);
         setLoading(false);
       }
     });

    return () => {
      socketService.off('connectionStatus', setIsConnected);
      socketService.off('chatJoined', () => {});
      socketService.off('chatHistory', () => {});
      socketService.off('newMessage', () => {});
      socketService.off('error', () => {});
      socketService.disconnect();
    };
  }, [navigate]);

  // Join Chat Room
  useEffect(() => {
    if (jobId && cleanerId && cleanerId !== 'undefined' && cleanerId !== 'null' && isConnected) {
      
      // First, let's verify the cleaner has actually quoted for this job
      const verifyCleanerQuote = async () => {
        try {
          const jobResponse = await jobsAPI.getJobById(jobId);
          if (jobResponse.success && jobResponse.data) {
            const job = jobResponse.data;
            
             if (job.quotes && job.quotes.length > 0) {
               
               // First try to match by quote ID (since cleanerId in URL might be quote ID)
               let cleanerQuote = job.quotes.find(quote => {
                 const quoteId = quote._id || quote.id;
                 return quoteId === cleanerId || quoteId === String(cleanerId);
               });
               
               // If not found by quote ID, try to match by cleaner ID
               if (!cleanerQuote) {
                 cleanerQuote = job.quotes.find(quote => {
                   const quoteCleanerId = quote.cleanerId?._id || quote.cleanerId?.id || quote.cleanerId;
                   const match = quoteCleanerId === cleanerId || 
                                quoteCleanerId === String(cleanerId) || 
                                String(quoteCleanerId) === cleanerId ||
                                quoteCleanerId?.toString() === cleanerId?.toString();
                   
                   return match;
                 });
               }
              
              if (cleanerQuote) {
                // Set quote data for display
                setQuoteData({
                  baseQuote: cleanerQuote.basePrice || cleanerQuote.price || 0,
                  addons: cleanerQuote.addons || [],
                  total: cleanerQuote.totalPrice || cleanerQuote.price || 0
                });
                
                // Get the actual cleaner ID from the quote
                const actualCleanerId = cleanerQuote.cleanerId?._id || cleanerQuote.cleanerId?.id || cleanerQuote.cleanerId;
                
                // If we don't have cleanerId, try to get it from the cleaner object
                if (!actualCleanerId) {
                  // Try to get cleaner ID from the cleaner object
                  const cleanerObj = cleanerQuote.cleaner;
                  const cleanerIdFromCleaner = cleanerObj?._id || cleanerObj?.id;

                  if (cleanerIdFromCleaner) {
                    socketService.joinChat(jobId, cleanerIdFromCleaner);
                  } else {
                    // This is a backend data structure issue - the cleaner should have an ID
                    socketService.joinChat(jobId, cleanerQuote._id);

                    // Show user-friendly message about backend issue
                    setError('Chat system using demo mode - backend data needs updating. Contact support if this persists.');
                  }
                } else {
                  socketService.joinChat(jobId, actualCleanerId);
                }
              } else {
                setError('This cleaner has not submitted a quote for this job. Please select a cleaner who has quoted.');
                setMessages([]);
                setLoading(false);
              }
            } else {
              setError('No quotes found for this job.');
              setMessages([]);
              setLoading(false);
            }
          }
        } catch (err) {
          setError('Unable to verify cleaner quote. Please try again.');
          setMessages([]);
          setLoading(false);
        }
      };
      
      verifyCleanerQuote();
    } else if (!isConnected || !cleanerId || cleanerId === 'undefined' || cleanerId === 'null') {
      // Start with empty messages if not connected or no valid cleanerId
      setMessages([]);
      setLoading(false);
    }
  }, [jobId, cleanerId, isConnected]);

  // Load chat history via REST API as fallback
  useEffect(() => {
    const loadChatHistoryFallback = async () => {
      if (jobId && cleanerId) {
        try {
          // Try to get chat history via REST API
          const response = await chatAPI.getChatHistory(jobId, cleanerId);
          
          if (response.success && response.data?.messages) {
            setMessages(response.data.messages);
          }
        } catch (error) {
          // Silently handle error
        }
      }
    };

    // Try to load chat history immediately and also after a delay
    loadChatHistoryFallback();
    const timeoutId = setTimeout(loadChatHistoryFallback, 3000);
    return () => clearTimeout(timeoutId);
  }, [jobId, cleanerId]);

  // Mark messages as read when chat is viewed
  useEffect(() => {
    if (currentChatRoom?.chatRoomId) {
      socketService.markAsRead(currentChatRoom.chatRoomId);
    }
  }, [currentChatRoom, messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      
      if (currentChatRoom?.chatRoomId && isConnected) {
        socketService.sendMessage(currentChatRoom.chatRoomId, newMessage.trim());
        setNewMessage('');
      } else {
        // Fallback to static messages when not connected
        const message = {
          id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sender: 'user',
          message: newMessage.trim(),
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          })
        };
        setMessages(prev => {
          return [...prev, message];
        });
        setNewMessage('');
      }
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };
  
  const handleAcceptQuote = () => {
    const addOnsTotal = quoteData.addons?.reduce((sum, addon) => sum + (addon.price || 0), 0) || 0;
    const addOnsName = quoteData.addons?.map(addon => addon.name).join(', ') || 'Additional Services';
  
    const currentQuote = {
      _id: cleanerId,
      price: quoteData.total,
      basePrice: quoteData.baseQuote,
      addOns: addOnsTotal,
      addOnName: addOnsName,
      totalPrice: quoteData.total,
      cleanerId: {
        _id: cleanerId,
        firstName: 'Cleaner',
        lastName: `#${cleanerId}`,
        rating:
          quoteData.cleanerId?.averageRating ??
          quoteData.cleanerId?.rating ??
          0,
        tier: quoteData.cleanerId?.tier ?? 'none'
      }
    };
  
    const cleanerData = {
      id: cleanerId,
      name: `Cleaner #${cleanerId}`,
      distance: 'Distance not available',
      rating:
        quoteData.cleanerId?.averageRating ??
        quoteData.cleanerId?.rating ??
        0,
      tier: quoteData.cleanerId?.tier ?? 'none',
      baseQuote: quoteData.baseQuote,
      addOns: addOnsTotal,
      addOnName: addOnsName,
      total: quoteData.total
    };
  
    navigate(`/confirm-cleaner/${jobId}`, {
      state: {
        cleanerData,
        quoteData: currentQuote,
        jobData: null
      }
    });
  };
  
  
  
  return (
    <>
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl py-2 sm:py-3">
        <PageHeader
          title={`Cleaner #${cleanerId || '1047'}`}
          onBack={() => navigate(-1)}
          titleClassName="text-base sm:text-lg font-semibold text-gray-900"
          backButtonClassName="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer mr-2 sm:mr-3"
        />
      </div>
      
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl bg-white rounded-xl shadow-custom pt-1 overflow-x-hidden  ">
      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg mx-4 mb-4">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              onClick={() => navigate(`/customer-job-details/${jobId}`)}
              variant="danger"
              size="xs"
              className="ml-3"
            >
              Go Back
            </Button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="px-4 py-8">
          <Loader message="Loading chat..." />
        </div>
      )}

      {/* Safety Banner */}
      <div className="bg-[#F9FAFB] px-3 sm:px-4 py-2 sm:py-3 mt-3 sm:mt-4 rounded-2xl shadow-custom border border-primary-200 max-w-lg mx-auto">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <img src={InfoIcon} alt="Info" className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" />
          <p className="text-xs sm:text-sm text-primary-200 font-medium leading-relaxed">
            For safety, phone numbers and emails are hidden until booking. Please chat only through Aussie Mate.
          </p>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 px-3 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 overflow-y-auto">
         {messages.map((msg, index) => {
           const isSentByCurrentUser = msg.senderId?._id === currentUser?.id || msg.senderId?._id === currentUser?._id || msg.sender === 'user';
           const messageTime = msg.createdAt ? 
             new Date(msg.createdAt).toLocaleTimeString('en-US', {
               hour: 'numeric',
               minute: '2-digit',
               hour12: true
             }).toLowerCase() : 
             msg.timestamp || '';

           // Create unique key combining multiple identifiers
           const uniqueKey = msg._id || msg.id || `msg-${index}-${msg.content?.slice(0, 10) || 'empty'}`;

           return (
             <div
               key={uniqueKey}
               className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
             >
              <div className={`flex items-start space-x-2 max-w-[280px] sm:max-w-xs md:max-w-md ${isSentByCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar */}
                {!isSentByCurrentUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <img src={UserIcon} alt="Cleaner" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}
                
                {/* Message Bubble */}
                <div className="flex flex-col">
                  {/* Quote Message */}
                  {msg.messageType === 'quote' && msg.quoteData && (
                    <div className="px-2.5 sm:px-3 py-2 sm:py-3 rounded-2xl bg-[#EBF2FD] text-primary-500 font-medium mb-2">
                      <div className="text-xs font-semibold text-primary-500 mb-2">💰 Quote Update</div>
                      <div className="text-xs space-y-1">
                        <div>Price: <span className="font-semibold">${msg.quoteData.price}</span></div>
                        <div>Duration: <span className="font-semibold">{msg.quoteData.estimatedDuration}</span></div>
                        {msg.quoteData.availability && (
                          <div>Available: <span className="font-semibold">
                            {new Date(msg.quoteData.availability).toLocaleDateString()}
                          </span></div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Budget Update Message */}
                  {msg.messageType === 'budget_update' && msg.budgetData && (
                    <div className="px-2.5 sm:px-3 py-2 sm:py-3 rounded-2xl bg-white border border-gray-200 text-primary-500 font-medium mb-2">
                      <div className="text-xs font-semibold text-primary-500 mb-2">💵 Budget Update</div>
                      <div className="text-xs space-y-1">
                        <div>Amount: <span className="font-semibold">${msg.budgetData.amount}</span></div>
                        <div>Status: <span className="font-semibold">
                          {msg.budgetData.isNegotiable ? 'Negotiable' : 'Fixed'}
                        </span></div>
                      </div>
                    </div>
                  )}

                  {/* Regular Text Message */}
                  {(msg.content || msg.message) && (
                    <div
                      className={`px-2.5 sm:px-3 py-2 sm:py-3 rounded-2xl text-primary-500 font-medium ${
                        isSentByCurrentUser
                          ? 'bg-white border border-gray-200'
                          : 'bg-[#EBF2FD]'
                      }`}
                    >
                      <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">
                        {msg.content || msg.message}
                      </p>
                    </div>
                  )}
                  
                  <span className="text-xs text-gray-500 mt-1">
                    {messageTime}
                    {msg.isRead && isSentByCurrentUser && (
                      <span className="ml-1 text-green-500">✓✓</span>
                    )}
                  </span>
                </div>
                
                {/* User Avatar */}
                {isSentByCurrentUser && (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <img src={UserIcon} alt="You" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <div className="bg-white py-2 sm:py-3 px-3 sm:px-6">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Message..."
            className="flex-1 px-3 py-3 border border-primary-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-blue-500 shadow-custom bg-[#F9FAFB]"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            variant="ghost"
            size=""
            icon={MessageIcon}
            className="p-1 sm:p-2 [&>img]:w-8 [&>img]:h-8"
          />
        </div>
      </div>
      
      {/* Quote Summary */}
      <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-primary-200 rounded-t-4xl bg-[#F9FAFB]">
        <h3 className="text-base sm:text-lg font-semibold text-primary-500 mb-2 sm:mb-3">Quote Summary</h3>
        
        {/* Base Quote */}
        <div className="flex items-center py-1 sm:py-2 space-x-2">
          <span className="text-xs sm:text-sm text-primary-200 font-medium">Base Quote:</span>
          <span className="text-xs sm:text-sm font-bold text-primary-500">${quoteData.baseQuote}</span>
        </div>
        
        {/* Add-ons */}
        {quoteData.addons && quoteData.addons.length > 0 && quoteData.addons.map((addon, index) => (
          <div key={index} className="flex justify-between items-center py-1">
            <span className="text-xs sm:text-sm text-primary-200 font-medium">Add-on: +$ <span className="text-primary-600 font-bold">{addon.price}</span> ({addon.name})</span>
          </div>
        ))}
        
        {/* Total */}
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm sm:text-base font-semibold text-gray-900">Total:</span>
            <span className="text-base sm:text-lg font-bold text-blue-600">${quoteData.total}</span>
          </div>
        </div>
        
        {/* Accept Button Only */}
        <div className="mt-3 sm:mt-4 flex justify-end">
          <Button
            onClick={handleAcceptQuote}
            size="sm"
            className="px-3 sm:px-4 py-2 sm:py-2.5"
          >
            Accept Quote & Book
          </Button>
        </div>
      </div>
      </div>

      {/* Phone Validation Alert */}
      <PhoneValidationAlert
        error={phoneValidationError}
        onClose={() => {
          setShowPhoneAlert(false);
          setPhoneValidationError('');
        }}
        isVisible={showPhoneAlert}
      />
    </>
  );
};

export default CustomerChatPage;
