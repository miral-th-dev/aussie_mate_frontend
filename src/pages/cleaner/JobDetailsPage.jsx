import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { PageHeader, JobOverviewCard, ConfirmationModal } from '../../components';
import ChatIcon from '../../assets/message2.svg';
import { jobsAPI, subscriptionsAPI } from '../../services/api';
import { Wallet, Clock3, Home as HomeIcon, Ruler, AlertTriangle, CalendarDays, Trash2 } from 'lucide-react';

const JobDetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isContacted, setIsContacted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isSubscriptionExpired, setIsSubscriptionExpired] = useState(false);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch job details from API
        const response = await jobsAPI.getJobById(jobId);


        if (response.success && response.data) {
          const jobData = response.data;
          setJob(jobData);

          // Check if current cleaner has already contacted or is connected
          const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
          const currentUserId = currentUser.id || currentUser._id;
          
          const contacted = (jobData.contactedCleaners || []).some(c => 
            (c.cleanerId?._id || c.cleanerId) === currentUserId
          );
          setIsContacted(contacted);

          const isAssignedStatus = ['assigned', 'accepted', 'on_the_way', 'started', 'in_progress'].includes(jobData.status);
          setIsConnected(contacted || isAssignedStatus);
        } else {
          setError('Job not found');
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    const fetchSubscriptionStatus = async () => {
      try {
        setLoadingSubscription(true);
        const res = await subscriptionsAPI.getMyStatus().catch(() => ({ success: false }));
        if (res.success && res.data?.subscription?.currentPeriodEnd) {
          setIsSubscriptionExpired(new Date(res.data.subscription.currentPeriodEnd) < new Date());
        }
      } catch (err) {
        console.error('Error fetching subscription status:', err);
      } finally {
        setLoadingSubscription(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
      fetchSubscriptionStatus();
    }
  }, [jobId]);


  const resolveImageSrc = (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url || image.path || image.secureUrl || '';
  };

  const jobPhotos = useMemo(() => {
    if (!job) return [];
    const photos = job.photos || [];
    return photos.map(resolveImageSrc).filter(Boolean);
  }, [job]);

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

  const getJobTitle = (job) => {
    // Figma expects the service type name as the title
    return job?.serviceTypeId?.name || job?.serviceType?.name || job?.serviceType || job?.title || 'Job Details';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }) + ', ' + date.toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });
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

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '';
    const numeric = Number(value);
    if (Number.isNaN(numeric)) return value;
    return `$${numeric.toLocaleString('en-AU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: numeric % 1 === 0 ? 0 : 2,
    })}`;
  };

  const serviceDetail = getServiceDetail(job);
  const scheduledDateLabel = job?.scheduledDate ? formatDate(job.scheduledDate) : 'Date not set';
  const jobFrequencyLabel = getJobFrequency(job);
  const fromTab = location.state?.fromTab;

  const currentUserId = useMemo(() => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    return currentUser.id || currentUser._id || null;
  }, []);

  const myQuote = useMemo(() => {
    if (!job || !currentUserId) return null;
    
    // Check in quotes array
    const quotes = Array.isArray(job.quotes) ? job.quotes : [];
    const fromQuotes = quotes.find((q) => {
      const qCleanerId = q?.cleanerId?._id || q?.cleanerId || q?.cleaner?._id || q?.cleaner;
      return qCleanerId?.toString() === currentUserId?.toString();
    });

    if (fromQuotes) return fromQuotes;

    // Fallback: Check in contactedCleaners array (requests)
    const contacted = Array.isArray(job.contactedCleaners) ? job.contactedCleaners : [];
    const fromContacted = contacted.find((c) => {
      const cCleanerId = c?.cleanerId?._id || c?.cleanerId || c?.cleaner?._id || c?.cleaner;
      return cCleanerId?.toString() === currentUserId?.toString();
    });

    return fromContacted || null;
  }, [job, currentUserId]);


  const canWithdrawBid = useMemo(() => {
    if (!myQuote || !job) return false;
    
    // If the job is already assigned to SOMEONE (including me) or in progress, usually can't withdraw bid
    const isJobAssigned = ['on_the_way', 'started', 'in_progress', 'completed'].includes(job.status?.toLowerCase());
    if (isJobAssigned) return false;

    const quoteStatus = (myQuote.status || '').toLowerCase();
    // allow withdraw if still pending / waiting / connected / accepted (as long as job is still 'posted' or 'quoting')
    return !['withdrawn', 'rejected'].includes(quoteStatus);
  }, [myQuote, job]);



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

    // Show customer contact info ONLY if connected
    if (isConnected && job.customerId) {
      if (job.customerId.phone) {
        meta.push({
          label: 'Customer Phone',
          value: job.customerId.phone,
          icon: <span className="text-primary-400">📞</span>,
        });
      }
      if (job.customerId.email) {
        meta.push({
          label: 'Customer Email',
          value: job.customerId.email,
          icon: <span className="text-primary-400">📧</span>,
        });
      }
    }

    return meta;
  }, [job]);

  // Figma/Web: Chat should open directly (no intro popup)
  const handleChatWithCustomer = () => {
    if (isSubscriptionExpired && !isContacted) {
      navigate('/my-subscription');
      return;
    }
    navigate(`/chat/${jobId}`);
  };


  if (loading) {
    return null;
  }

  if (error || !job) {
    return (
      <>
        <div className="max-w-sm mx-auto min-h-screen sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="text-center py-8">
              <div className="text-red-500 text-lg font-medium">{error || 'Job not found'}</div>
              <button
                onClick={() => navigate(-1)}
                className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <PageHeader
          title={getJobTitle(job)}
          onBack={() => {
            const savedTab = localStorage.getItem('cleanerActiveTab');
            navigate('/cleaner-jobs', { state: { tab: savedTab || 'live-jobs' }, replace: true });
          }}
          className="px-4 sm:px-6 lg:px-8 py-2 sm:py-4"
          titleClassName="text-lg sm:text-xl font-semibold text-primary-500 truncate"
        />

        <div className="px-4 sm:px-6 lg:px-8 pb-6">
          {/* Job Overview Card */}
          <div className="mb-4">
            <JobOverviewCard
              jobId={job?.jobId || job?.referenceId || job?._id?.slice(-6)}
              // Figma: show Category / ServiceType on top line, and ServiceType as title
              propertyType={[
                job?.categoryId?.name,
                job?.serviceTypeId?.name
              ].filter(Boolean).join(' / ')}
              title={job?.serviceTypeId?.name || getJobTitle(job)}
              showQuotePill={false}
              serviceType={job?.categoryId?.name || job?.category || ''}
              serviceDetail={job?.serviceTypeId?.name || serviceDetail}
              instructions={
                job?.specialInstructions ||
                job?.instructions ||
                job?.additionalNotes ||
                ''
              }
              scheduledDate={scheduledDateLabel}
              frequency={jobFrequencyLabel}
              location={job?.location?.address || job?.address || job?.locationDescription || 'Location not specified'}
              photos={jobPhotos}
              viewerRole="cleaner"
              metaInfo={jobOverviewMeta}
            />
          </div>

          {/* Posted By Section (from mockup) */}
          {job.customerId && (
            <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src={job.customerId.profileImage || `https://ui-avatars.com/api/?name=${job.customerId.firstName}+${job.customerId.lastName}&background=random`} 
                  alt="Customer" 
                  className="w-12 h-12 rounded-full border border-gray-200 object-cover" 
                />
                <div>
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Posted by</p>
                  <p className="text-lg font-bold text-primary-500">{job.customerId.firstName} {job.customerId.lastName}.</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleChatWithCustomer}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm border transition-colors cursor-pointer ${
                    (isSubscriptionExpired && !isContacted)
                      ? 'bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100'
                      : 'bg-[#F1F6FF] text-primary-600 border-[#E0EAFF] hover:bg-blue-50'
                  }`}
                >
                  <img src={ChatIcon} alt="Chat" className="w-4 h-4" />
                   {isSubscriptionExpired && !isContacted ? 'Renew to Chat' : 'Chat'}
                </button>
                {/* Call button - only if phone is available (usually hidden until booking) */}
                {isConnected && job.customerId.phone && (
                   <button
                    onClick={() => window.open(`tel:${job.customerId.phone}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F1F6FF] text-primary-600 rounded-full font-semibold text-sm border border-[#E0EAFF] hover:bg-blue-50 transition-colors cursor-pointer"
                  >
                    <span className="text-primary-600">📞</span>
                    Call
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            {/* Show "I'm on the way" button only if assigned to me */}
            {(() => {
              const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
              const currentUserId = currentUser.id || currentUser._id;
              const isAssigned = ['assigned', 'accepted', 'on_the_way', 'started', 'in_progress'].includes(job.status);
              const isAssignedToMe = job.assignedCleanerId === currentUserId || 
                                    job.assignedCleanerId?._id === currentUserId ||
                                    job.cleanerId === currentUserId ||
                                    job.cleanerId?._id === currentUserId;
              
              if (isAssigned && isAssignedToMe) {
                return (
                  <button
                    onClick={async () => {
                      try {
                        const response = await jobsAPI.updateJobStatus(jobId, 'on_the_way');
                        if (response.success) {
                          navigate(`/in-progress-job/${jobId}`);
                        } else {
                          alert(response.message || 'Failed to update status');
                        }
                      } catch (err) {
                        console.error('Error updating status:', err);
                        alert('Failed to update status. Please try again.');
                      }
                    }}
                    className="bg-green-600 text-white cursor-pointer shadow-custom border border-green-100 font-medium py-2 px-4 sm:py-3 sm:px-6 rounded-xl transition-colors duration-200 flex items-center gap-2 hover:bg-green-700"
                  >
                    I'm On The Way
                  </button>
                );
              }
              return null;
            })()}
          </div>
        </div>
      </div>

      {/* Sticky bottom action (Figma) */}
      {canWithdrawBid && (
  <div className="w-full flex justify-center items-center py-10">
    <button
      type="button"
      onClick={() => { setModalError(''); setShowWithdrawModal(true); }}
       className="flex items-center gap-3 px-10 py-4 rounded-full bg-[#FFE4E4B2] text-[#EF4444] font-semibold text-lg hover:bg-red-200 transition-all cursor-pointer"
    >
       <Trash2 className="w-7 h-7" strokeWidth={2.2} />
      Withdraw Bid
    </button>
  </div>
)}

      <ConfirmationModal
        isOpen={showWithdrawModal}
        onClose={() => { if (isWithdrawing) return null; setShowWithdrawModal(false); setModalError(''); }}
        title="Withdraw Request?"
        message="Are you sure you want to withdraw your request? You will need to contact the customer again if you change your mind."
        confirmText="Withdraw"
        cancelText="Cancel"

        confirmButtonColor="bg-[#EF4444] hover:bg-red-600"
        errorMessage={modalError}
        autoCloseAfter={3000}
        isLoading={isWithdrawing}
        onConfirm={async () => {
          try {
            setIsWithdrawing(true);
            const res = await jobsAPI.withdrawBid(jobId);
            if (!res?.success) {
              setModalError(res?.message || 'Failed to withdraw bid');
              return;
            }
            setShowWithdrawModal(false);
            navigate('/cleaner-jobs', { state: { tab: 'my-bids' }, replace: true });
          } catch (e) {
            setModalError(e?.message || 'Failed to withdraw bid');
          } finally {
            setIsWithdrawing(false);
          }
        }}
      />
    </>
  );
};

export default JobDetailsPage;
