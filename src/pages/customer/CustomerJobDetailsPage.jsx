import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Wallet,
  Clock3,
  Home as HomeIcon,
  Ruler,
  AlertTriangle,
  CalendarDays,
} from 'lucide-react';
import { Button, ConfirmationModal, PageHeader, JobOverviewCard } from '../../components';
import ThreeDotIcon from '../../assets/3dot.svg';
import UserIcon from '../../assets/user.svg';
import RatingIcon from '../../assets/rating.svg';
import SilverBadgeIcon from '../../assets/silverBadge.svg';
import GoldBadgeIcon from '../../assets/goldBadge.svg';
import BronzeBadgeIcon from '../../assets/bronzeBadge.svg';
import MessageIcon from '../../assets/message2.svg';
import CloseIcon from '../../assets/close.svg';
import { jobsAPI, quotesAPI } from '../../services/api';
import { chatAPI } from '../../services/chatAPI';

const CustomerJobDetailsPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [quoteToAccept, setQuoteToAccept] = useState(null);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const [quoteToDecline, setQuoteToDecline] = useState(null);
  const [cleanerQuotes, setCleanerQuotes] = useState([]);
  const [chatRooms, setChatRooms] = useState([]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await jobsAPI.getJobById(jobId);

        if (response.success && response.data) {
          setJob(response.data);

          if (response.data.quotes && response.data.quotes.length > 0) {
            setCleanerQuotes(response.data.quotes);
          }
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    const fetchChatRooms = async () => {
      try {
        const chatResponse = await chatAPI.getChatRooms();
        if (chatResponse.success) {
          const jobChatRooms = chatResponse.data.filter(room =>
            room.jobId._id === jobId || room.jobId === jobId
          );
          setChatRooms(jobChatRooms);
        }
      } catch (err) {
      }
    };

    if (jobId) {
      fetchJobDetails();
      fetchChatRooms();
    }
  }, [jobId]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getJobTitle = (job) => {
    if (!job) return 'Job Details';
    const serviceType = job.serviceType?.charAt(0).toUpperCase() + job.serviceType?.slice(1) || 'Service';
    return `${serviceType} `;
  };

  const getServiceDetail = (job) => {
    if (!job) return '';
    return (
      job.serviceDetail ||
      job.serviceDetailName ||
      job.service?.detail ||
      job.service?.name ||
      job.selectedServiceDetail ||
      ''
    );
  };

  const getJobFrequency = (job) => {
    if (!job) return 'One-time';
    return job.frequency || job.serviceFrequency || job.schedule?.frequency || 'One-time';
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return value;
    return `$${numeric.toLocaleString('en-AU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    })}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getPreferredDaysDisplay = (preferredDays) => {
    if (!preferredDays || typeof preferredDays !== 'object') return '';

    const days = Object.keys(preferredDays).filter(day => preferredDays[day] === true);
    if (days.length === 0) return '';

    return days.join(', ');
  };

  const getRepeatWeeksDisplay = (repeatWeeks) => {
    if (!repeatWeeks) return '';
    return `${repeatWeeks} week${repeatWeeks === '1' ? '' : 's'}`;
  };

  const getFrequencyDisplay = (job) => {
    const frequency = getJobFrequency(job);
    const preferredDays = getPreferredDaysDisplay(job?.preferredDays);
    const repeatWeeks = getRepeatWeeksDisplay(job?.repeatWeeks);

    let display = frequency;

    if (preferredDays && repeatWeeks) {
      display += ` • ${preferredDays} • ${repeatWeeks}`;
    } else if (preferredDays) {
      display += ` • ${preferredDays}`;
    } else if (repeatWeeks) {
      display += ` • ${repeatWeeks}`;
    }

    return display;
  };

  const handleDropdownToggle = () => {
    setShowDropdown(!showDropdown);
  };

  const handleCancelJob = () => {
    setShowDropdown(false);
    setShowCancelModal(true);
  };

  const handleAcceptQuote = (quoteId) => {
    const quote = cleanerQuotes.find(q => q._id === quoteId);
    if (quote) {
      setQuoteToAccept(quote);
      setShowAcceptModal(true);
    }
  };

  const handleDeclineQuote = (quoteId) => {
    const quote = cleanerQuotes.find(q => q._id === quoteId);
    if (quote) {
      setQuoteToDecline(quote);
      setShowDeclineModal(true);
    }
  };

  const handleConfirmAcceptQuote = async () => {
    if (!quoteToAccept) return;

    try {
      setIsAccepting(true);

      const response = await quotesAPI.acceptQuote(jobId, quoteToAccept._id);

      if (response.success) {
        const updatedQuotes = cleanerQuotes.map(quote =>
          quote._id === quoteToAccept._id
            ? { ...quote, status: 'accepted' }
            : { ...quote, status: 'rejected' }
        );
        setCleanerQuotes(updatedQuotes);

        // Close modal
        setShowAcceptModal(false);
        setQuoteToAccept(null);
      } else {
        setError(response.error || 'Failed to accept quote');
        setShowAcceptModal(false);
      }
    } catch (err) {
      setError('Failed to accept quote. Please try again.');
      setShowAcceptModal(false);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleCancelAcceptQuote = () => {
    setShowAcceptModal(false);
    setQuoteToAccept(null);
  };

  const handleConfirmDeclineQuote = async () => {
    if (!quoteToDecline) return;

    try {
      setIsDeclining(true);

      // Call API to reject quote
      const response = await quotesAPI.rejectQuote(jobId, quoteToDecline._id);

      if (response.success) {
        // Update the quote status locally
        const updatedQuotes = cleanerQuotes.map(quote =>
          quote._id === quoteToDecline._id
            ? { ...quote, status: 'rejected' }
            : quote
        );
        setCleanerQuotes(updatedQuotes);

        // Close modal
        setShowDeclineModal(false);
        setQuoteToDecline(null);
      } else {
        setError(response.error || 'Failed to decline quote');
        setShowDeclineModal(false);
      }
    } catch (err) {
      setError('Failed to decline quote. Please try again.');
      setShowDeclineModal(false);
    } finally {
      setIsDeclining(false);
    }
  };

  const handleCancelDeclineQuote = () => {
    setShowDeclineModal(false);
    setQuoteToDecline(null);
  };

  const handleConfirmCancel = async () => {
    try {
      setIsCancelling(true);

      const response = await jobsAPI.cancelJob(jobId);

      if (response.success) {
        navigate('/my-jobs');
      } else {
        setError('Failed to cancel job. Please try again.');
        setShowCancelModal(false);
      }
    } catch (error) {
      setError('Failed to cancel job. Please try again.');
      setShowCancelModal(false);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
  };

  const resolveImageSrc = (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url || image.path || image.secureUrl || '';
  };

  const jobPhotos = useMemo(() => {
    if (!job) return [];
    // Only show original job photos, not completion proof photos
    const photos = job.photos || [];
    return photos.map(resolveImageSrc).filter(Boolean);
  }, [job]);

  const serviceDetail = getServiceDetail(job);
  const scheduledDateLabel = job?.scheduledDate ? formatDate(job.scheduledDate) : 'Date not set';
  const jobFrequencyLabel = getFrequencyDisplay(job);
  const jobOverviewMeta = useMemo(() => {
    if (!job) return [];
    const meta = [];

    const budgetValue = job.budget || job.estimatedPrice || job.priceEstimate || job.priceRange;
    if (budgetValue) {
      meta.push({
        label: 'Budget',
        value: formatCurrency(budgetValue),
        icon: <Wallet className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    const durationValue = job.estimatedDuration || job.duration || job.timeEstimate;
    if (durationValue) {
      meta.push({
        label: 'Duration',
        value: typeof durationValue === 'number' ? `${durationValue} hrs` : durationValue,
        icon: <Clock3 className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    const propertyTypeValue = job.propertyType || job.propertyCategory;
    if (propertyTypeValue) {
      meta.push({
        label: 'Property Type',
        value: propertyTypeValue,
        icon: <HomeIcon className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    const propertySizeValue = job.propertySize || job.squareFootage || job.propertyArea;
    if (propertySizeValue) {
      meta.push({
        label: 'Property Size',
        value: propertySizeValue,
        icon: <Ruler className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    const priorityValue = job.priority || job.priorityLevel;
    if (priorityValue) {
      meta.push({
        label: 'Priority',
        value: priorityValue,
        icon: <AlertTriangle className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    // Add preferred days if available
    const preferredDaysDisplay = getPreferredDaysDisplay(job?.preferredDays);
    if (preferredDaysDisplay) {
      meta.push({
        label: 'Preferred Days',
        value: preferredDaysDisplay,
        icon: <CalendarDays className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    // Add repeat weeks if available
    const repeatWeeksDisplay = getRepeatWeeksDisplay(job?.repeatWeeks);
    if (repeatWeeksDisplay) {
      meta.push({
        label: 'Duration',
        value: repeatWeeksDisplay,
        icon: <Clock3 className="w-4 h-4 text-primary-400" strokeWidth={2.2} />,
      });
    }

    return meta;
  }, [job, getPreferredDaysDisplay, getRepeatWeeksDisplay]);

  const roleSections = useMemo(() => {
    if (!job) return {};

    const getPersonName = (person) => {
      if (!person) return '';
      const { firstName, lastName, name, fullName } = person;
      const combined = `${firstName || ''} ${lastName || ''}`.trim();
      return combined || fullName || name || '';
    };

    const getPersonPhone = (person) => {
      if (!person) return '';
      return (
        person.phone ||
        person.phoneNumber ||
        person.mobile ||
        person.contactNumber ||
        ''
      );
    };

    const assignedCleaner =
      job.assignedCleaner ||
      job.cleaner ||
      job.acceptedCleaner ||
      job.assignedCleanerInfo ||
      job.assignedTo ||
      job.assignedCleanerId;

    const assignedCleanerName =
      typeof assignedCleaner === 'string'
        ? assignedCleaner
        : getPersonName(assignedCleaner);

    const assignedCleanerPhone =
      typeof assignedCleaner === 'string' ? '' : getPersonPhone(assignedCleaner);

    const assignedCleanerRating =
      typeof assignedCleaner === 'object'
        ? assignedCleaner.averageRating || assignedCleaner.rating
        : '';

    const customer =
      job.customer ||
      job.customerId ||
      job.postedBy ||
      job.createdBy;

    const customerName = getPersonName(customer);
    const customerPhone = getPersonPhone(customer);

    const sections = {};

    const customerItems = [
      assignedCleanerName
        ? { label: 'Assigned Cleaner', value: assignedCleanerName }
        : null,
      assignedCleanerPhone
        ? { label: 'Cleaner Contact', value: assignedCleanerPhone }
        : null,
      assignedCleanerRating
        ? { label: 'Cleaner Rating', value: `${assignedCleanerRating}⭐` }
        : null,
      job.specialInstructions
        ? { label: 'Special Instructions', value: job.specialInstructions }
        : null,
    ].filter(Boolean);

    if (customerItems.length > 0) {
      sections.customer = customerItems;
    }

    const cleanerItems = [
      customerName
        ? { label: 'Customer', value: customerName }
        : null,
      customerPhone
        ? { label: 'Customer Contact', value: customerPhone }
        : null,
      job.accessInstructions
        ? { label: 'Access Notes', value: job.accessInstructions }
        : null,
      job.petDetails
        ? { label: 'Pet Details', value: job.petDetails }
        : null,
    ].filter(Boolean);

    if (cleanerItems.length > 0) {
      sections.cleaner = cleanerItems;
    }

    return sections;
  }, [job]);

  // Helper function to check if customer has chatted with a cleaner
  const getChatRoomForCleaner = (cleanerId) => {
    return chatRooms.find(room =>
      room.cleanerId._id === cleanerId || room.cleanerId === cleanerId
    );
  };

  // Helper function to get chat status for a cleaner
  const getChatStatus = (cleanerId) => {
    const chatRoom = getChatRoomForCleaner(cleanerId);
    if (chatRoom) {
      if (chatRoom.lastMessageAt) {
        const lastMessageDate = new Date(chatRoom.lastMessageAt);
        const timeAgo = getTimeAgo(lastMessageDate);
        return {
          hasChat: true,
          lastMessage: timeAgo,
          unreadCount: chatRoom.unreadCount || 0
        };
      }
      return { hasChat: true, lastMessage: 'No messages yet', unreadCount: 0 };
    }
    return { hasChat: false, lastMessage: null, unreadCount: 0 };
  };

  // Helper function to format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Helper function to format cleaner data from quotes
  const formatCleanerData = (quote) => {
    const cleaner = quote.cleanerId || quote.cleaner;
    const cleanerId = cleaner?._id || cleaner?.id || quote.cleanerId || quote._id || quote.id;

    return {
      id: cleanerId,
      quoteId: quote._id || quote.id,
      name: cleaner ? `${cleaner.firstName || ''} ${cleaner.lastName || ''}`.trim() || `Cleaner #${cleanerId?.slice(-4)}` : 'Cleaner',
      rating: cleaner?.averageRating !== undefined ? cleaner.averageRating : (cleaner?.rating || 0),
      reviews: cleaner?.reviewCount || 0,
      tier: cleaner?.tier,
      quoteAmount: quote.price || quote.amount || 0,
      isVerified: cleaner?.isVerified || false,
      status: quote.status || 'pending',
      distance: quote.distance || cleaner?.distance || 'Distance not available'
    };
  };


  if (loading) {
    return (
      <>
        <div className="max-w-sm mx-auto min-h-screen sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
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
            <div className="text-center py-8">
              <div className="text-red-500 text-lg font-medium">{error || 'Job not found'}</div>
              <Button
                onClick={() => {
                  const savedTab = localStorage.getItem('customerActiveTab');
                  navigate('/my-jobs', { state: { tab: savedTab || 'all' }, replace: true });
                }}
                size="md"
                className="mt-4"
              >
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-6xl mx-auto py-3 sm:py-4 px-3 sm:px-4 md:px-4">
        <PageHeader
          title={`Job Details - ${job.serviceType || 'Cleaning'}`}
          onBack={() => {
            const savedTab = localStorage.getItem('customerActiveTab');
            navigate('/my-jobs', { state: { tab: savedTab || 'all' }, replace: true });
          }}
          titleClassName="text-sm sm:text-base md:text-lg font-semibold text-primary-500 truncate"
          backButtonClassName="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          rightSlot={
            <div className="relative" ref={dropdownRef}>
              <Button
                onClick={handleDropdownToggle}
                variant=""
                size="sm"
                icon={ThreeDotIcon}
                className="p-1 sm:p-2"
              />

              {showDropdown && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
                  <div className="py-2">
                    <Button
                      onClick={handleCancelJob}
                      variant=""
                      size="sm"
                      icon={CloseIcon}
                      className="w-full justify-start px-4 py-3 text-gray-700"
                    >
                      Cancel Job
                    </Button>
                  </div>
                </div>
              )}
            </div>
          }
        />
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 md:px-6">
        <div className="mb-3 sm:mb-4">
          <JobOverviewCard
            jobId={job.jobId || job.referenceId || job._id?.slice(-6)}
            title={getJobTitle(job)}
            serviceType={job.serviceType || job.category || job.service}
            serviceDetail={serviceDetail}
            instructions={
              job.specialInstructions ||
              job.instructions ||
              job.additionalNotes ||
              ''
            }
            scheduledDate={scheduledDateLabel}
            frequency={jobFrequencyLabel}
            location={job.location?.address || job.address || job.locationDescription || 'Location not specified'}
            photos={jobPhotos}
            viewerRole="customer"
            metaInfo={jobOverviewMeta}
            roleSections={roleSections}
          />
        </div>

        {/* Custom Job Dates Section */}
        {job?.frequency === 'Custom' && job?.occurrences && job.occurrences.length > 0 && (
          <div className="bg-white rounded-2xl shadow-custom p-3 sm:p-4 md:p-6 mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary-500 mb-3 sm:mb-4">
              Job Schedule
            </h3>
            <div className="space-y-2 sm:space-y-3">
              {job.occurrences.map((occurrence, index) => (
                <div key={occurrence._id || index} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="font-medium text-primary-500 text-sm sm:text-base">
                        {occurrence.label || `Job ${index + 1}`}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        {formatDate(occurrence.scheduledDate)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-semibold text-primary-600">
                      ${occurrence.amount || 0}
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-1 ${
                      occurrence.status === 'completed' ? 'bg-green-100 text-green-700' :
                      occurrence.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                      occurrence.status === 'pending_customer_confirmation' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {occurrence.statusDisplay || occurrence.status || 'Pending'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-green-600">
                    {job.occurrences.filter(occ => occ.status === 'completed').length}
                  </span> completed •
                  <span className="font-medium text-blue-600 ml-1">
                    {job.occurrences.filter(occ => occ.status === 'in_progress').length}
                  </span> in progress •
                  <span className="font-medium text-gray-600 ml-1">
                    {job.occurrences.filter(occ => occ.status === 'pending' || occ.status === 'pending_customer_confirmation').length}
                  </span> pending
                </div>
                <div className="text-sm font-medium text-primary-600">
                  Total: ${job.occurrences.reduce((sum, occ) => sum + (occ.amount || 0), 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Service Provider Quotes Section */}
        <div className="bg-white rounded-2xl shadow-custom p-3 sm:p-4 md:p-6">
          <div className="mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary-500 mb-1 sm:mb-2">
              {job.serviceType === 'petSitting' ? 'Pet Sitter Quotes' :
                job.serviceType === 'cleaning' ? 'Cleaner Quotes' :
                  job.serviceType === 'handyman' ? 'Handyman Quotes' :
                    job.serviceType === 'housekeeping' ? 'Housekeeper Quotes' :
                      job.serviceType === 'commercialCleaning' ? 'Commercial Cleaner Quotes' :
                        job.serviceType === 'ndisSupport' ? 'NDIS Support Quotes' :
                          'Pet Sitting Quote'} ({cleanerQuotes.filter(quote => quote.status !== 'rejected').length})
            </h3>
            <p className="text-xs sm:text-sm text-primary-200 font-medium">
              {cleanerQuotes.filter(quote => quote.status !== 'rejected').length > 0
                ? (job.serviceType === 'petSitting' ? "Pet sitters nearby have sent their offers. Review and chat before choosing." :
                  job.serviceType === 'cleaning' ? "Cleaners nearby have sent their offers. Review and chat before choosing." :
                    job.serviceType === 'handyman' ? "Handymen nearby have sent their offers. Review and chat before choosing." :
                      job.serviceType === 'housekeeping' ? "Housekeepers nearby have sent their offers. Review and chat before choosing." :
                        job.serviceType === 'commercialCleaning' ? "Commercial cleaners nearby have sent their offers. Review and chat before choosing." :
                          job.serviceType === 'ndisSupport' ? "NDIS support providers nearby have sent their offers. Review and chat before choosing." :
                            "Service providers nearby have sent their offers. Review and chat before choosing.")
                : (job.serviceType === 'petSitting' ? "No quotes yet. Pet sitters will send quotes soon." :
                  job.serviceType === 'cleaning' ? "No quotes yet. Cleaners will send quotes soon." :
                    job.serviceType === 'handyman' ? "No quotes yet. Handymen will send quotes soon." :
                      job.serviceType === 'housekeeping' ? "No quotes yet. Housekeepers will send quotes soon." :
                        job.serviceType === 'commercialCleaning' ? "No quotes yet. Commercial cleaners will send quotes soon." :
                          job.serviceType === 'ndisSupport' ? "No quotes yet. NDIS support providers will send quotes soon." :
                            "No quotes yet. Service providers will send quotes soon.")
              }
            </p>
          </div>

          {cleanerQuotes.filter(quote => quote.status !== 'rejected').length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              {cleanerQuotes.filter(quote => quote.status !== 'rejected').map((quote, index) => {
                const cleaner = formatCleanerData(quote);
                const chatStatus = getChatStatus(cleaner.id);

                return (
                  <div key={quote._id || quote.id || `quote-${index}`} className="border border-primary-200 shadow-custom rounded-xl p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        {/* Top row: Cleaner ID, Badge, Rating */}
                        <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
                          <div className="flex items-center space-x-1">
                            <img src={UserIcon} alt="User" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm font-medium text-primary-500">
                              {cleaner.name}
                            </span>
                          </div>
                          {cleaner.tier && cleaner.tier !== 'none' && (
                            <div className={`flex items-center space-x-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full border-[0.6px] ${cleaner.tier === 'gold'
                              ? 'bg-[linear-gradient(94.49deg,#FFDBAE_0%,#FFE7C4_100%)] border-[#FFDBAE]'
                              : cleaner.tier === 'silver'
                                ? 'bg-[linear-gradient(94.49deg,#FDFDFD_0%,#E9E9E9_100%)] border-primary-200'
                                : cleaner.tier === 'bronze'
                                  ? 'bg-[linear-gradient(94.49deg,#D4A574_0%,#E6C7A3_100%)] border-[#CD7F32]'
                                  : 'bg-gray-100 border-gray-300'
                              }`}>
                              <img
                                src={
                                  cleaner.tier === 'gold'
                                    ? GoldBadgeIcon
                                    : cleaner.tier === 'silver'
                                      ? SilverBadgeIcon
                                      : BronzeBadgeIcon
                                }
                                alt="Badge"
                                className="w-3 h-3 sm:w-4 sm:h-4"
                              />
                              <span className="text-xs text-primary-500 font-medium capitalize">
                                {cleaner.tier}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1 bg-[#FFF2DE] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                            <img src={RatingIcon} alt="Rating" className="w-3 h-3" />
                            <span className="text-xs font-medium text-primary-500">
                              {cleaner.rating}
                            </span>
                          </div>
                        </div>

                        {/* Quote details */}
                        <div className="space-y-1">
                          <div className="text-xs sm:text-sm text-[#374151] font-medium">
                            Quote Amount: <span className="font-bold text-primary-600">${cleaner.quoteAmount}</span>
                            {cleaner.estimatedDuration && (
                              <span className="text-xs text-gray-500 ml-2">({cleaner.estimatedDuration})</span>
                            )}
                          </div>
                          <div className="text-xs text-primary-500 font-medium">
                            {cleaner.distance}
                          </div>

                          {/* Chat Status */}
                          {chatStatus.hasChat && (
                            <div className="flex items-center space-x-2 mt-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span className="text-xs text-green-600 font-medium">
                                {chatStatus.lastMessage}
                              </span>
                              {chatStatus.unreadCount > 0 && (
                                <span className="bg-red-500 text-red-500 font-medium border border-red-500 text-xs px-1.5 py-0.5 rounded-full">
                                  {chatStatus.unreadCount}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto mt-2 sm:mt-0 sm:ml-4">
                        {/* For pending quotes - show Accept and Decline buttons */}
                        {quote.status === 'pending' && (
                          <>
                            <Button
                              onClick={() => handleAcceptQuote(quote._id)}
                              variant="success"
                              size="sm"
                              className="px-3 sm:px-4 py-2"
                            >
                              Accept
                            </Button>
                            <Button
                              onClick={() => handleDeclineQuote(quote._id)}
                              variant="danger"
                              size="sm"
                              className="px-3 sm:px-4 py-2"
                            >
                              Decline
                            </Button>
                          </>
                        )}

                        {/* For accepted quotes - show Start Chat button */}
                        {quote.status === 'accepted' && (
                          <Button
                            onClick={() => {
                              if (cleaner.id && cleaner.id !== 'undefined' && cleaner.id !== 'null') {
                                navigate(`/customer-chat/${jobId}?cleaner=${cleaner.id}`);
                              } else {
                                setError('Unable to start chat - cleaner information not available. Please try refreshing the page.');
                              }
                            }}
                            variant="secondary"
                            size="sm"
                            icon={MessageIcon}
                            className="px-3 sm:px-4 py-2 shadow-custom"
                          >
                            Start Chat
                          </Button>
                        )}

                        {/* Quote Status for rejected quotes */}
                        {quote.status === 'rejected' && (
                          <div className="bg-red-500 text-red-500 border border-red-500 px-3 sm:px-4 py-2 rounded-xl flex items-center justify-center shadow-custom">
                            <span className="text-xs sm:text-sm font-medium">Rejected</span>
                          </div>
                        )}

                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {cleanerQuotes.filter(quote => quote.status !== 'rejected').length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-500 text-sm">
                {job.serviceType === 'petSitting' ? "Waiting for pet sitters to send quotes..." :
                  job.serviceType === 'cleaning' ? "Waiting for cleaners to send quotes..." :
                    job.serviceType === 'handyman' ? "Waiting for handymen to send quotes..." :
                      job.serviceType === 'housekeeping' ? "Waiting for housekeepers to send quotes..." :
                        job.serviceType === 'commercialCleaning' ? "Waiting for commercial cleaners to send quotes..." :
                          job.serviceType === 'ndisSupport' ? "Waiting for NDIS support providers to send quotes..." :
                            "Waiting for service providers to send quotes..."}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Cancel Job Confirmation Modal */}
      <ConfirmationModal
        isOpen={showCancelModal}
        onClose={handleCancelModalClose}
        onConfirm={handleConfirmCancel}
        title="Cancel Job?"
        message="Are you sure you want to cancel this job? This action cannot be undone and all cleaner quotes will be lost."
        confirmText="Cancel Job"
        cancelText="Keep Job"
        confirmButtonColor="bg-[#EF4444] hover:bg-red-600"
        isLoading={isCancelling}
      />

      {/* Accept Quote Confirmation Modal */}
      <ConfirmationModal
        isOpen={showAcceptModal}
        onClose={handleCancelAcceptQuote}
        onConfirm={handleConfirmAcceptQuote}
        title="Accept Quote?"
        message={
          quoteToAccept ?
            `Are you sure you want to accept this quote for $${quoteToAccept.price}? This will reject all other quotes and confirm this cleaner for your job.` :
            "Are you sure you want to accept this quote?"
        }
        confirmText="Accept Quote"
        cancelText="Cancel"
        confirmButtonColor="bg-green-500 text-green-500! hover:text-[#00832D]! border border-green-500"
        isLoading={isAccepting}
      />

      {/* Decline Quote Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeclineModal}
        onClose={handleCancelDeclineQuote}
        onConfirm={handleConfirmDeclineQuote}
        title="Decline Quote?"
        message={
          quoteToDecline ?
            `Are you sure you want to decline this quote for $${quoteToDecline.price}? This action cannot be undone.` :
            "Are you sure you want to decline this quote?"
        }
        confirmText="Decline Quote"
        cancelText="Cancel"
        confirmButtonColor="bg-red-500 hover:bg-[#EF4444] text-red-500! hover:text-white! border border-red-500"
        isLoading={isDeclining}
      />
    </>
  );
};

export default CustomerJobDetailsPage;
