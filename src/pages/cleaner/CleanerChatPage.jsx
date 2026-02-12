import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FloatingLabelInput, ConfirmationModal, PhoneValidationAlert, PageHeader, Loader } from '../../components';
import InfoIcon from '../../assets/info.svg';
import SendIcon from '../../assets/sendChat.svg';
import MessageIcon from '../../assets/message2.svg';
import { jobsAPI, quotesAPI } from '../../services/api';
import { chatAPI } from '../../services/chatAPI';
import { socketService } from '../../services/socketService';
import WithdrawIcon from '../../assets/trash-red.svg';
import UserIcon from '../../assets/user.svg';


const CleanerChatPage = () => {
    const navigate = useNavigate();
    const { jobId } = useParams();
    const [searchParams] = useSearchParams();
    const cleanerId = searchParams.get('cleanerId');
    const [hasSubmittedQuote, setHasSubmittedQuote] = useState(false);
    const [quoteStatus, setQuoteStatus] = useState('pending');
    const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
    const [myQuote, setMyQuote] = useState(null);
    const [job, setJob] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [phoneValidationError, setPhoneValidationError] = useState('');
    const [showPhoneAlert, setShowPhoneAlert] = useState(false);
    
    const [quoteAmount, setQuoteAmount] = useState('');
    const [isNegotiable, setIsNegotiable] = useState(false);
    const [showBudgetModal, setShowBudgetModal] = useState(false);
    const [hasShownModalOnce, setHasShownModalOnce] = useState(false);
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [sentQuote, setSentQuote] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [currentChatRoom, setCurrentChatRoom] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [effectiveCleanerId, setEffectiveCleanerId] = useState(null);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);
    const messagesEndRef = useRef(null);
    const lastMessageRef = useRef(null);

    // Lock body scroll when budget modal is open
    useEffect(() => {
        if (showBudgetModal) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [showBudgetModal]);

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
        
        // Set effective cleaner ID
        const urlCleanerId = searchParams.get('cleanerId');
        const userCleanerId = user?.id || user?._id;
        setEffectiveCleanerId(urlCleanerId || userCleanerId);
        
        // Connect to socket directly
        socketService.connect(token);

        // Socket event listeners
        socketService.on('connectionStatus', (status) => {
            setIsConnected(status);
        });
        socketService.on('chatJoined', (data) => {
            setCurrentChatRoom(data);
        });
        socketService.on('chatHistory', (historyMessages) => {
            setIsLoadingMessages(false);
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
                // Add some demo messages if no history
                setMessages([
                    {
                        id: 1,
                        senderId: { _id: 'cleaner_demo' },
                        content: "Hi! I'm ready to help with your cleaning job.",
                        message: "Hi! I'm ready to help with your cleaning job.",
                        messageType: 'text',
                        createdAt: new Date(Date.now() - 3600000).toISOString(),
                        time: '9:00 am'
                    }
                ]);
            }
        });
        socketService.on('newMessage', (message) => {
            // Create a unique identifier for this message
            const messageId = message._id || message.id || `${message.content || message.message}-${message.senderId?._id}-${message.createdAt}`;
            
            // Check if this exact message was just processed
            if (lastMessageRef.current === messageId) {
                return;
            }
            
            setMessages(prev => {
                // Check if message already exists in state
                const messageExists = prev.some(msg => {
                    const existingId = msg._id || msg.id || `${msg.content || msg.message}-${msg.senderId?._id}-${msg.createdAt}`;
                    return existingId === messageId;
                });
                
                if (messageExists) {
                    return prev;
                }
                
                lastMessageRef.current = messageId;
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
            } else if (error.message === 'Failed to join chat') {
                // Silently handle chat room join failure
                setMessages([
                    {
                        _id: 'demo_welcome',
                        id: 1,
                        senderId: { _id: currentUser?.id || currentUser?._id || 'cleaner_demo' },
                        content: "Hi! I'm ready to discuss this cleaning job with you.",
                        message: "Hi! I'm ready to discuss this cleaning job with you.",
                        messageType: 'text',
                        createdAt: new Date(Date.now() - 60000).toISOString(),
                        time: new Date(Date.now() - 60000).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }).toLowerCase()
                    }
                ]);
            } else if (error.message === 'You must submit a quote for this job first. Once the customer accepts your quote, you can start chatting.') {
                // Silently handle quote requirement message
            } else if (error.message === 'Access denied. Please check your login status or contact support.') {
                setError('You do not have permission to access this chat. Please contact support if this is an error.');
            } else if (error.message === 'Failed to send quote') {
                // Ignore this error - it's a backend bug that sends error even when quote is successful
            } else {
                setError(error.message);
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

    // Fetch Job Details
    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                setLoading(true);
                setError('');

                const response = await jobsAPI.getJobById(jobId);

                if (response.success && response.data) {
                    const jobData = response.data;
                    setJob(jobData);
                } else {
                    setError('Job not found');
                }
            } catch (err) {
                setError('Failed to load job details');
            } finally {
                setLoading(false);
            }
        };

        if (jobId) {
            fetchJobDetails();
        }
    }, [jobId]);

    // Check if cleaner has submitted quote for this job
    useEffect(() => {
        const checkExistingQuote = async () => {
            if (jobId && effectiveCleanerId) {
                try {
                    // First try to get job details with quotes
                    const response = await jobsAPI.getJobById(jobId);
                    if (response.success && response.data) {
                        const job = response.data;
                        
                        // Check if this cleaner has a quote for this job
                        if (job.quotes && job.quotes.length > 0) {
                            const myQuoteData = job.quotes.find(quote => {
                                // Handle different cleanerId formats safely
                                if (!quote.cleanerId) return false;
                                
                                // If cleanerId is a string
                                if (typeof quote.cleanerId === 'string') {
                                    return quote.cleanerId === effectiveCleanerId;
                                }
                                
                                // If cleanerId is an object
                                if (typeof quote.cleanerId === 'object') {
                                    return quote.cleanerId._id === effectiveCleanerId ||
                                           quote.cleanerId.id === effectiveCleanerId;
                                }
                                
                                return false;
                            });
                            
                            if (myQuoteData) {
                                setHasSubmittedQuote(true);
                                setQuoteStatus(myQuoteData.status);
                                setMyQuote(myQuoteData);
                                setQuoteAmount(myQuoteData.price.toString());
                            }
                        }
                    }
                    
                    // Fallback: Try to get cleaner's quotes directly
                    try {
                        const cleanerQuotesResponse = await quotesAPI.getCleanerQuotes();
                        if (cleanerQuotesResponse.success && cleanerQuotesResponse.data) {
                            const existingQuote = cleanerQuotesResponse.data.find(quote => 
                                quote.jobId === jobId || quote.jobId._id === jobId
                            );
                            
                            if (existingQuote) {
                                setHasSubmittedQuote(true);
                                setQuoteStatus(existingQuote.status);
                                setMyQuote(existingQuote);
                                setQuoteAmount(existingQuote.price.toString());
                            }
                        }
                    } catch (fallbackErr) {
                        // Silently handle fallback failure
                    }
                    
                } catch (err) {
                    // Silently handle quote check errors
                }
            }
        };

        checkExistingQuote();
    }, [jobId, effectiveCleanerId]);

    // Load chat history via REST API as fallback
    useEffect(() => {
        const loadChatHistoryFallback = async () => {
            if (jobId && effectiveCleanerId) {
                try {
                    // Try to get chat history via REST API
                    const response = await chatAPI.getChatHistory(jobId, effectiveCleanerId);
                    
                    if (response.success && response.data?.messages) {
                        setMessages(response.data.messages);
                        setIsLoadingMessages(false);
                    }
                } catch (error) {
                    // Silently handle error
                    setIsLoadingMessages(false);
                }
            }
        };

        // Try to load chat history immediately and also after a delay
        loadChatHistoryFallback();
        const timeoutId = setTimeout(loadChatHistoryFallback, 2000);
        const timeoutId2 = setTimeout(loadChatHistoryFallback, 5000);
        const loadingTimeout = setTimeout(() => setIsLoadingMessages(false), 10000);
        return () => {
            clearTimeout(timeoutId);
            clearTimeout(timeoutId2);
            clearTimeout(loadingTimeout);
        };
    }, [jobId, effectiveCleanerId]);

    // Join Chat Room - Only after quote is submitted and accepted
    useEffect(() => {
        if (jobId && effectiveCleanerId && isConnected) {
            // Only join chat if quote is submitted and accepted
            if (hasSubmittedQuote && quoteStatus === 'accepted') {
                socketService.joinChat(jobId, effectiveCleanerId);
            } else if (!hasSubmittedQuote) {
                // Show message that quote needs to be submitted first
                if (messages.length === 0) {
                    setMessages([
                        {
                            _id: 'quote_required',
                            id: 1,
                            senderId: { _id: 'system' },
                            content: "Please submit your quote for this job first. The customer needs to accept your quote before you can start chatting.",
                            message: "Please submit your quote for this job first. The customer needs to accept your quote before you can start chatting.",
                            messageType: 'system',
                            createdAt: new Date().toISOString(),
                            time: new Date().toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            }).toLowerCase()
                        }
                    ]);
                }
            } else if (hasSubmittedQuote && quoteStatus === 'pending') {
                // Show message that quote is pending - always add this message
                const systemMessage = {
                    _id: 'quote_pending_system',
                    id: 'quote_pending_system',
                    senderId: { _id: 'system' },
                    content: "Quote submitted successfully! Customer will review your quote. You can chat after they accept it.",
                    message: "Quote submitted successfully! Customer will review your quote. You can chat after they accept it.",
                    messageType: 'system',
                    createdAt: new Date().toISOString(),
                    time: new Date().toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }).toLowerCase()
                };
                
                // Check if system message already exists
                const hasSystemMessage = messages.some(msg => 
                    msg.messageType === 'system' && 
                    msg.content.includes('Quote submitted successfully')
                );
                
                if (!hasSystemMessage) {
                    setMessages(prev => [...prev, systemMessage]);
                }
            } else if (hasSubmittedQuote && quoteStatus === 'rejected') {
                // Show message that quote was rejected
                const rejectedMessage = {
                    _id: 'quote_rejected_system',
                    id: 'quote_rejected_system',
                    senderId: { _id: 'system' },
                    content: " Your quote has been rejected by the customer. You can submit a new quote if the job is still available.",
                    message: "Your quote has been rejected by the customer. You can submit a new quote if the job is still available.",
                    messageType: 'system',
                    createdAt: new Date().toISOString(),
                    time: new Date().toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }).toLowerCase()
                };
                
                // Check if rejected message already exists
                const hasRejectedMessage = messages.some(msg => 
                    msg.messageType === 'system' && 
                    msg.content.includes('quote has been rejected')
                );
                
                if (!hasRejectedMessage) {
                    setMessages(prev => [...prev, rejectedMessage]);
                }
            }
        } else if (!effectiveCleanerId) {
            // If no effectiveCleanerId, initialize demo mode immediately
            if (messages.length === 0) {
                setMessages([
                    {
                        _id: 'demo_welcome',
                        id: 1,
                        senderId: { _id: currentUser?.id || currentUser?._id || 'cleaner_demo' },
                        content: "Hello! I'm here to help with your cleaning needs.",
                        message: "Hello! I'm here to help with your cleaning needs.",
                        messageType: 'text',
                        createdAt: new Date().toISOString(),
                        time: new Date().toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }).toLowerCase()
                    }
                ]);
            }
        }
    }, [jobId, effectiveCleanerId, isConnected, hasSubmittedQuote, quoteStatus]);

    // Show budget modal automatically when cleaner first enters (no quote submitted) - only once
    useEffect(() => {
        if (!hasSubmittedQuote && effectiveCleanerId && !loading && job && !hasShownModalOnce) {
            setShowBudgetModal(true);
            setHasShownModalOnce(true);
        }
    }, [hasSubmittedQuote, effectiveCleanerId, loading, job, hasShownModalOnce]);

    // Mark messages as read when chat is viewed
    useEffect(() => {
        if (currentChatRoom?.chatRoomId) {
            socketService.markAsRead(currentChatRoom.chatRoomId);
        }
    }, [currentChatRoom, messages]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = () => {
        if (newMessage.trim()) {
            if (currentChatRoom?.chatRoomId && isConnected) {
                socketService.sendMessage(currentChatRoom.chatRoomId, newMessage.trim());
                setNewMessage('');
            } else {
                // Fallback: add message locally for demo
                const message = {
                    _id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    senderId: { _id: currentUser?.id || currentUser?._id || 'cleaner_demo' },
                    content: newMessage.trim(),
                    message: newMessage.trim(),
                    messageType: 'text',
                    createdAt: new Date().toISOString(),
                    time: new Date().toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    }).toLowerCase()
                };
                setMessages(prev => [...prev, message]);
                setNewMessage('');
            }
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendQuote = async () => {
        if (quoteAmount.trim()) {
            const price = parseFloat(quoteAmount);
            
            // Validate price
            if (price <= 0 || isNaN(price)) {
                setError('Please enter a valid budget amount');
                return;
            }
            
            setIsSubmittingQuote(true);
            try {
                let response;
                
                // Check if updating existing quote or submitting new one
                if (hasSubmittedQuote && myQuote?._id && (quoteStatus === 'pending' || quoteStatus === 'accepted')) {
                    // Update existing quote (pending or accepted if negotiable is ON)
                    response = await quotesAPI.updateQuote(myQuote._id, {
                        price
                    });
                } else if (hasSubmittedQuote && quoteStatus === 'rejected') {
                    // Quote is rejected, cannot update
                    setError('Cannot update quote - Quote has been rejected. Please contact customer directly.');
                    setIsSubmittingQuote(false);
                    return;
                } else {
                    // Submit new quote - backend will set availability automatically
                    response = await quotesAPI.submitQuote(jobId, {
                        price
                    });
                }

                if (response.success) {
                    // Check if this is an update or new submission
                    const isUpdate = hasSubmittedQuote && myQuote?._id && (quoteStatus === 'pending' || quoteStatus === 'accepted');
                    
                    setHasSubmittedQuote(true);
                    setQuoteStatus(response.data.status || 'pending');
                    setMyQuote(response.data);
                    
                    // Add quote message to chat
                    const messageText = isUpdate 
                        ? `Quote updated: $${price}${isNegotiable ? ' (negotiable)' : ''}`
                        : `Quote submitted: $${price}${isNegotiable ? ' (negotiable)' : ''}`;
                    
                    if (currentChatRoom?.chatRoomId && isConnected) {
                        // Cleaner sends only price in quote
                        socketService.sendQuote(
                            currentChatRoom.chatRoomId,
                            price,
                            messageText
                        );
                        
                        // Also send a regular text message to ensure it appears in chat
                        socketService.sendMessage(currentChatRoom.chatRoomId, messageText);
                    } else {
                        const quoteMessage = {
                            _id: `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            id: `quote-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            senderId: { _id: currentUser?.id || currentUser?._id },
                            content: messageText,
                            messageType: 'quote',
                            quoteData: {
                                price
                            },
                            createdAt: new Date().toISOString(),
                            time: new Date().toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            }).toLowerCase()
                        };
                        setMessages(prev => [...prev, quoteMessage]);
                        
                        // Also add a regular text message to ensure it appears
                        const textMessage = {
                            _id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                            senderId: { _id: currentUser?.id || currentUser?._id },
                            content: messageText,
                            messageType: 'text',
                            createdAt: new Date().toISOString(),
                            time: new Date().toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                            }).toLowerCase()
                        };
                        
                        setMessages(prev => [...prev, textMessage]);
                    }

                    setSentQuote({
                        base: price,
                        addOns: [],
                        total: price,
                        isNegotiable
                    });
                    
                    setShowBudgetModal(false);
                    setQuoteAmount('');
                    setError('');
                } else {
                    setError(response.error || response.message || 'Failed to submit quote');
                }
            } catch (err) {
                setError('Failed to submit quote. Please try again.');
            } finally {
                setIsSubmittingQuote(false);
            }
        }
    };

    const handleWithdrawBid = () => {
        setShowWithdrawModal(true);
    };

    const handleConfirmWithdraw = async () => {
        setIsWithdrawing(true);
        try {
            if (myQuote?._id) {
                const response = await quotesAPI.withdrawQuote(myQuote._id);
                
                if (response.success) {
                    // Reset quote states
                    setHasSubmittedQuote(false);
                    setQuoteStatus('pending');
                    setMyQuote(null);
                    setQuoteAmount('');
                    setSentQuote(null);
                    
                    // Navigate back to jobs page
                    navigate('/cleaner-jobs');
                } else {
                    setError(response.error || 'Failed to withdraw bid');
                }
            }
        } catch (err) {
            setError('Failed to withdraw bid. Please try again.');
        } finally {
            setIsWithdrawing(false);
            setShowWithdrawModal(false);
        }
    };

    const handleCancelWithdraw = () => {
        setShowWithdrawModal(false);
    };

    const getJobTitle = (job) => {
        if (!job) return 'Job Chat';
        const serviceType = job.serviceTypeDisplay || (job.serviceType?.charAt(0).toUpperCase() + job.serviceType?.slice(1)) || 'Service';
        return `${serviceType}`;
    };

    if (loading) {
        return (
            <>
                <div className="max-w-sm mx-auto min-h-screen sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
                    <div className="p-4 sm:p-6 lg:p-8">
                        <Loader message="Loading chat..." />
                    </div>
                </div>
            </>
        );
    }

    if (error || !job) {
        return (
            <>
                <div className="max-w-sm mx-auto min-h-screen sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="text-red-500 text-lg font-medium">{error || 'Job not found'}</div>
                        <Button onClick={() => navigate(-1)}>Go Back</Button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <div className='px-3 md:px-4'>
            <div className="max-w-6xl mx-auto py-4 px-1">
                <PageHeader title={getJobTitle(job)} onBack={() => navigate(-1)} />
            </div>

            <div className="max-w-6xl mx-auto px-4 bg-white rounded-2xl shadow-custom py-4">
            {/* Error Message */}
                {error && (
                    <div className="px-4 py-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg mx-4 mb-4">
                        {error}
                        {error.includes('submit your quote') && (
                            <div className="mt-3">
                                <button
                                    onClick={() => navigate(`/cleaner-jobs/${jobId}`)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                                >
                                    Go to Job Details to Submit Quote
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Safety Banner */}
                <div className="bg-[#F9FAFB] px-4 py-3 sm:px-6 rounded-xl border border-primary-200 max-w-lg mx-auto">
                    <div className="flex items-center space-x-2">
                        <img src={InfoIcon} alt="Info" className="w-4 h-4 flex-shrink-0" />
                        <p className="text-xs text-primary-200 font-medium">
                            For safety, phone numbers and emails are hidden until booking. Please chat only through Aussie Mate.
                        </p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 h-[50vh]">
                    <div className="space-y-4">
                        {isLoadingMessages && (
                            <div className="py-4">
                                <Loader message="Loading chat..." />
                            </div>
                        )}
                        {messages.map((message, index) => {
                            const isSentByCurrentUser = message.senderId?._id === currentUser?.id || message.senderId?._id === currentUser?._id;
                            const messageTime = message.createdAt ? 
                                new Date(message.createdAt).toLocaleTimeString('en-US', {
                                    hour: 'numeric',
                                    minute: '2-digit',
                                    hour12: true
                                }).toLowerCase() : 
                                message.time || '';

                            // Create unique key combining multiple identifiers
                            const uniqueKey = message._id || message.id || `msg-${index}-${message.content?.slice(0, 10) || 'empty'}`;
                            
                            // System messages (centered) - Show based on quote status
                            if (message.messageType === 'system') {
                                // Show pending messages only when quote is pending
                                if (message.content.includes('Quote submitted successfully') && quoteStatus !== 'pending') {
                                    return null;
                                }
                                
                                // Show rejected messages only when quote is rejected
                                if (message.content.includes('quote has been rejected') && quoteStatus !== 'rejected') {
                                    return null;
                                }
                                
                                // Determine message styling based on content
                                const isRejectedMessage = message.content.includes('quote has been rejected');
                                const bgColor = isRejectedMessage ? 'bg-red-500' : 'bg-green-500';
                                const borderColor = isRejectedMessage ? 'border-red-500' : 'border-green-500';
                                const textColor = isRejectedMessage ? 'text-red-500' : 'text-green-500';
                                
                                return (
                                    <div key={uniqueKey} className="flex justify-center my-4">
                                        <div className={`${bgColor} border ${borderColor} ${textColor} px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-center max-w-md`}>
                                            {message.content || message.message}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={uniqueKey}
                                    className={`flex ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-start space-x-2 max-w-xs sm:max-w-md lg:max-w-lg ${isSentByCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                        {/* Customer Avatar (left side) */}
                                        {!isSentByCurrentUser && (
                                            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <img src={UserIcon} alt="Customer" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            </div>
                                        )}
                                        
                                        {/* Message Content */}
                                        <div className="flex flex-col">
                                        {/* Quote Message */}
                                        {message.messageType === 'quote' && message.quoteData && (
                                            <div className={`px-4 py-3 rounded-2xl font-medium mb-2 ${
                                                isSentByCurrentUser
                                                    ? 'bg-[#F9FAFB] text-primary-500 border border-primary-200'
                                                    : 'bg-[#EBF2FD] text-primary-500'
                                            }`}>
                                                <div className="text-sm font-semibold text-primary-500 mb-2">💰 Quote Update</div>
                                                <div className="text-sm space-y-1">
                                                    <div>Price: <span className="font-semibold">${message.quoteData.price}</span></div>
                                                    {message.quoteData.estimatedDuration && (
                                                        <div>Duration: <span className="font-semibold">{message.quoteData.estimatedDuration}</span></div>
                                                    )}
                                                    {message.quoteData.availability && (
                                                        <div>Available: <span className="font-semibold">
                                                            {new Date(message.quoteData.availability).toLocaleDateString()}
                                                        </span></div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {/* Budget Update Message */}
                                        {message.messageType === 'budget_update' && message.budgetData && (
                                            <div className={`px-4 py-3 rounded-2xl font-medium mb-2 ${
                                                isSentByCurrentUser
                                                    ? 'bg-[#F9FAFB] text-primary-500 border border-primary-200'
                                                    : 'bg-[#EBF2FD] text-primary-500'
                                            }`}>
                                                <div className="text-sm font-semibold text-primary-500 mb-2">💵 Budget Update</div>
                                                <div className="text-sm space-y-1">
                                                    <div>Amount: <span className="font-semibold">${message.budgetData.amount}</span></div>
                                                    <div>Status: <span className="font-semibold">
                                                        {message.budgetData.isNegotiable ? 'Negotiable' : 'Fixed'}
                                                    </span></div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Regular Text Message */}
                                        {(message.content || message.message) && (
                                            <div
                                                className={`px-4 py-3 rounded-2xl font-medium ${
                                                    isSentByCurrentUser
                                                        ? 'bg-[#F9FAFB] text-primary-500 border border-primary-200'
                                                        : 'bg-[#EBF2FD] text-primary-500'
                                                }`}
                                            >
                                                <p className="text-sm">{message.content || message.message}</p>
                                                <p className="text-xs mt-1 text-primary-200">
                                                    {messageTime}
                                                </p>
                                                {message.isRead && isSentByCurrentUser && (
                                                    <div className="flex justify-end mt-1">
                                                        <span className="text-xs text-green-500">✓✓</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        </div>
                                        
                                        {/* Cleaner Avatar (right side) */}
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
                </div>

                {/* Message Input */}
                <div className="bg-white px-4 py-3 sm:px-6">
                    {!hasSubmittedQuote && !showBudgetModal ? (
                        <div className="flex items-center justify-center">
                            <button
                                onClick={() => setShowBudgetModal(true)}
                                className="bg-primary-500 text-white px-6 py-3 rounded-full font-medium hover:bg-primary-600 transition-colors cursor-pointer flex items-center space-x-2"
                            >
                                <img src={MessageIcon} alt="Message" className="w-5 h-5 brightness-0 invert" />
                                <span>Chat with Customer</span>
                            </button>
                        </div>
                    ) : hasSubmittedQuote ? (
                        // Show normal message input when quote is submitted
                        <div className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={quoteStatus === 'accepted' ? "Message..." : "Submit quote first to start chatting..."}
                                disabled={quoteStatus !== 'accepted'}
                                className={`flex-1 px-4 py-3 rounded-full text-sm focus:outline-none border shadow-custom ${
                                    quoteStatus === 'accepted'
                                        ? 'bg-[#F9FAFB] border-primary-200' 
                                        : 'bg-gray-100 border-gray-300 cursor-not-allowed'
                                }`}
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || quoteStatus !== 'accepted'}
                                className={`cursor-pointer ${(!newMessage.trim() || quoteStatus !== 'accepted') ? 'opacity-50' : ''}`}
                            >
                                <img src={SendIcon} alt="Send" className="w-10 h-10" />
                            </button>
                        </div>
                    ) : null}

                     {/* Withdraw Bid Button - Show only when quote is pending */}
                     {hasSubmittedQuote && quoteStatus === 'pending' && (
                                <div className="flex justify-center pt-4">
                                    <button
                                        onClick={handleWithdrawBid}
                                        className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors cursor-pointer text-sm flex items-center justify-center"
                                    >
                                        <img src={WithdrawIcon} alt="Withdraw" className="w-4 h-4 mr-2" />
                                        Withdraw Bid
                                    </button>
                                </div>
                            )}
                </div>

                {/* Quote Summary inside chat */}
                {hasSubmittedQuote && quoteStatus === 'accepted' && (
                <div className="bg-white border-t border-gray-100 mt-4 pt-8">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-primary-500">Quote Summary</h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-primary-500 font-medium">Is Negotiable?</span>
                                <button
                                    onClick={() => setIsNegotiable(!isNegotiable)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${isNegotiable ? 'bg-primary-500' : 'bg-gray-300'
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isNegotiable ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Budget Input - Show when negotiable is ON or no quote submitted */}
                        <div className="space-y-3 sm:space-y-4">
                            {(!hasSubmittedQuote || (hasSubmittedQuote && isNegotiable)) && (
                                <div className="flex items-center space-x-1 sm:space-x-1">
                                    <div className="flex-1">
                                        <FloatingLabelInput
                                            id="quoteAmount"
                                            name="quoteAmount"
                                            label="Budget Amount"
                                            type="number"
                                            value={quoteAmount}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                if (value === '' || (value.match(/^\d*\.?\d*$/) && parseFloat(value) >= 0)) {
                                                    setQuoteAmount(value);
                                                }
                                            }}
                                            placeholder=""
                                            min="0"
                                            step="0.01"
                                            maxLength={10}
                                        />
                                    </div>
                                    <button
                                        onClick={handleSendQuote}
                                        disabled={!quoteAmount.trim() || isSubmittingQuote}
                                        className="px-3 sm:px-4 py-2.5 sm:py-3 text-primary-500 font-medium hover:bg-primary-50 rounded-lg transition-colors cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed text-xs sm:text-sm"
                                    >
                                        {isSubmittingQuote ? 'Submitting...' : hasSubmittedQuote ? 'Post Budget' : 'Post Budget'}
                                    </button>
                                </div>
                            )}

                            <div className="flex space-x-3">
                                <button
                                    onClick={() => {
                                        setIsNegotiable(false);
                                        setQuoteAmount('');
                                    }}
                                    className="flex-1 text-center py-2.5 sm:py-3 text-red-500 font-medium cursor-pointer text-xs sm:text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendQuote}
                                    disabled={!quoteAmount.trim() || isSubmittingQuote || quoteStatus === 'rejected'}
                                    className="flex-1 bg-primary-500 text-white py-2.5 sm:py-3 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm"
                                >
                                    {isSubmittingQuote ? 'Submitting...' : 'Send Quote'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                )}
            </div>

            {/* Define Budget Modal - Show only when no quote submitted */}
            {showBudgetModal && !hasSubmittedQuote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm mx-auto">
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-primary-500">Define your price</h3>
                            </div>

                            <div className="relative">
                                <FloatingLabelInput
                                    id="modalQuoteAmount"
                                    name="modalQuoteAmount"
                                    label="Enter the amount here..."
                                    type="number"
                                    value={quoteAmount}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === '' || (value.match(/^\d*\.?\d*$/) && parseFloat(value) >= 0)) {
                                            setQuoteAmount(value);
                                        }
                                    }}
                                    placeholder=""
                                    min="0"
                                    step="0.01"
                                    maxLength={10}
                                />
                            </div>
                            
                            <div className="flex items-center justify-end">
                                <button
                                    onClick={handleSendQuote}
                                    disabled={!quoteAmount.trim()}
                                    className="bg-primary-500 text-white py-2 px-4 rounded-lg font-medium disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer text-xs sm:text-sm md:text-base"
                                >
                                    Send Quote
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Withdraw Bid Confirmation Modal */}
            <ConfirmationModal
                isOpen={showWithdrawModal}
                onClose={handleCancelWithdraw}
                onConfirm={handleConfirmWithdraw}
                title="Withdraw Bid"
                message="Are you sure you want to withdraw your bid? You will need to submit a new quote to bid on this job again."
                confirmText="Withdraw"
                cancelText="Cancel"
                confirmButtonColor="bg-red-500 hover:bg-red-600"
                isLoading={isWithdrawing}
            />

            {/* Phone Validation Alert */}
            <PhoneValidationAlert
                error={phoneValidationError}
                onClose={() => {
                    setShowPhoneAlert(false);
                    setPhoneValidationError('');
                }}
                isVisible={showPhoneAlert}
            />
        </div>
    );
};

export default CleanerChatPage;          
