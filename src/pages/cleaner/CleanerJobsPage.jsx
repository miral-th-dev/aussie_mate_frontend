import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader, PaginationRanges, Button } from '../../components';
import DownIcon from '../../assets/down2.svg';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import CurrentLocationIcon from '../../assets/currentLocation.svg';
import SearchIcon from '../../assets/search.svg';
import { jobsAPI, userAPI, reviewsAPI } from '../../services/api';
import ChatIcon from '../../assets/message2.svg';

const CleanerJobsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Persistent activeTab using localStorage
  const [activeTab, setActiveTab] = useState(() => {
    // Priority: location.state > localStorage > default
    return location.state?.tab || localStorage.getItem('cleanerActiveTab') || 'live-jobs';
  });

  // Update tab if location state changes (e.g. navigating from dashboard to a specific tab)
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  useEffect(() => {
    localStorage.setItem('cleanerActiveTab', activeTab);
  }, [activeTab]);

  const [showSortModal, setShowSortModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]); // jobs for the current page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const jobsPerPage = 10;

  // Filters / other state kept same
  const [distance, setDistance] = useState(25);
  const [customDistance, setCustomDistance] = useState('');
  const [budget, setBudget] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [userLocation, setUserLocation] = useState({
    address: 'Location not set',
    city: 'Please set your location',
    coordinates: null
  });
  const [cleanerReviews, setCleanerReviews] = useState([]);
  const [cleanerProfile, setCleanerProfile] = useState(null);

  // --- NEW: cache and abort refs ---
  const apiCache = useRef({}); // cache per status: { statusKey: { data, total } }
  const activeController = useRef(null);

  // load cleaner profile/reviews once
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profileResponse = await userAPI.getProfile();
        if (mounted && profileResponse.success) {
          const profileData = profileResponse.data?.user || profileResponse.data;
          setCleanerProfile(profileData);
        }

        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = currentUser.id || currentUser._id;
        if (currentUserId) {
          const reviewsResponse = await reviewsAPI.getCleanerReviews(currentUserId);
          if (mounted && reviewsResponse.success) {
            setCleanerReviews(reviewsResponse.data?.reviews || reviewsResponse.data || []);
          }
        }
      } catch (err) {
        // ignore - best effort
      }
    })();
    return () => { mounted = false; };
  }, []);

  // user location logic preserved (kept same as your original)
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const userProfile = await userAPI.getProfile();
        const userData = userProfile?.data?.user || userProfile?.data || userProfile;
        const location = userData?.location;

        if (location) {
          const fullAddress = location.fullAddress || location.address || '';
          const addressParts = fullAddress.split(',');
          const address = addressParts[0]?.trim() || 'Location not set';
          const city = addressParts.length > 1 ? addressParts[addressParts.length - 2]?.trim() : (location.city || 'Please set your location');
          setUserLocation({ address, city, coordinates: location.coordinates || null });
          return;
        }
      } catch (e) {
        // fallback to localStorage
      }
      const stored = localStorage.getItem('userLocation');
      if (stored) {
        try {
          const loc = JSON.parse(stored);
          setUserLocation({
            address: loc.address?.split(',')[0] || 'Location not set',
            city: loc.city || 'Please set your location',
            coordinates: loc.coordinates || null
          });
        } catch { /* ignore */ }
      }
    };

    fetchUserLocation();
    const handleLocationUpdate = () => fetchUserLocation();
    window.addEventListener('locationUpdated', handleLocationUpdate);
    const handleStorageChange = (e) => { if (e.key === 'userLocation') fetchUserLocation(); };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('locationUpdated', handleLocationUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // disable body scroll when modal is open (kept)
  useEffect(() => {
    document.body.style.overflow = showSortModal ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [showSortModal]);

  const tabs = [
    { id: 'live-jobs', label: 'Live Jobs' },
    { id: 'my-bids', label: 'My Bids' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'completed', label: 'My Completed Jobs' }
  ];

  // --- NEW: helper to fetch jobs list once per (status,page) and cache ---
  const fetchJobsList = async ({ status, page = 1, limit = jobsPerPage, signal, search = '', currentUserId }) => {
    // Convert status array to comma-separated string for API
    const statusParam = Array.isArray(status) ? status.join(',') : status;

    // key includes status & page & search so cache is per page and search
    const cacheKey = `${statusParam}::page:${page}::limit:${limit}::search:${search}::cleaner:${currentUserId}`;

    if (apiCache.current[cacheKey]) {
      return apiCache.current[cacheKey];
    }

    // call backend with status and search parameters
    const result = await jobsAPI.getAllJobs({
      status: statusParam,
      page,
      limit,
      search,
      cleanerId: statusParam.includes('accepted') || statusParam.includes('completed') ? currentUserId : undefined,
      quotedBy: statusParam.includes('quotedByMe') ? currentUserId : undefined,
      signal
    });

    // normalize response: { jobs: [], total }
    const jobsArray = result?.data?.jobs || result?.data || [];
    const total = result?.data?.total || result?.total || jobsArray.length;
    const payload = { jobs: jobsArray, total };
    apiCache.current[cacheKey] = payload;
    return payload;
  };

  // --- NEW: fetch job details only for current page items (reduces N->jobsPerPage API calls) ---
  const fetchJobDetailsForPage = async (jobsList, signal) => {
    // jobsList: array of job objects (from getAllJobs)
    // Only fetch details for those actually shown on the page and only when needed
    const promises = jobsList.map(async (job) => {
      // Check if the job object already contains sufficient details
      // If it has quotes array and assignedCleanerId, we can skip fetching full details
      const hasQuotes = Array.isArray(job.quotes) && job.quotes.length >= 0;
      const hasAssignedCleaner = job.assignedCleanerId !== undefined;

      // If job already has the essential data, return it without making API call
      if (hasQuotes && hasAssignedCleaner) {
        return job;
      }

      try {
        const details = await jobsAPI.getJobById(job._id || job.jobId || job.id, { signal });
        return (details.success && details.data) ? details.data : job;
      } catch {
        return job;
      }
    });
    return Promise.all(promises);
  };

  // main data loader - reacts to tab/page/search changes
  useEffect(() => {
    // cancel previous requests
    if (activeController.current) {
      activeController.current.abort();
    }
    const controller = new AbortController();
    activeController.current = controller;

    (async () => {
      setLoading(true);
      setError('');
      try {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId = currentUser.id || currentUser._id;

        // Map tab -> status string used by backend
        const statusMap = {
          'live-jobs': 'posted,quoted',
          'my-bids': 'posted,quoted',
          'accepted': 'accepted,in_progress',
          'completed': 'completed'
        };

        const statusParam = statusMap[activeTab] || 'posted';
        // Add a signature for my-bids to filter in fetchJobsList if needed
        const effectiveStatus = activeTab === 'my-bids' ? `${statusParam},quotedByMe` : statusParam;

        // Fetch a larger set to allow proper frontend filtering/pagination
        const result = await fetchJobsList({
          status: effectiveStatus,
          page: 1, // Fetch bulk
          limit: 200, // Increase limit to ensure we have enough to filter
          search: searchQuery.trim(),
          currentUserId,
          signal: controller.signal
        });

        let jobsList = result.jobs || [];

        // If 'my-bids', we need to filter for jobs where current cleaner has a pending quote
        if (activeTab === 'my-bids') {
          // Fetch details for jobs to check quotes (we fetch more to ensure we can find 10 matches)
          const jobsWithDetails = await fetchJobDetailsForPage(jobsList, controller.signal);
          const myFiltered = jobsWithDetails.filter(job => {
            if (!job.quotes || job.quotes.length === 0) return false;
            return job.quotes.some(q => {
              const qCleanerId = q.cleanerId?._id || q.cleanerId || q.cleanerId?.id;
              return (qCleanerId === currentUserId || qCleanerId?.toString() === currentUserId?.toString()) && q.status === 'pending';
            });
          });

          const transformedAll = myFiltered.map(transformJobForUI);
          const totalFiltered = transformedAll.length;
          const startIndex = (currentPage - 1) * jobsPerPage;
          const pageJobs = transformedAll.slice(startIndex, startIndex + jobsPerPage);

          setJobs(pageJobs);
          setTotalJobs(totalFiltered);
          setTotalPages(Math.max(1, Math.ceil(totalFiltered / jobsPerPage)));
          setLoading(false);
          return;
        }

        // For 'accepted' tab, filter for jobs assigned to current cleaner
        if (activeTab === 'accepted') {
          const jobsWithDetails = await fetchJobDetailsForPage(jobsList, controller.signal);

          // Filter for jobs assigned to current cleaner
          const acceptedJobs = jobsWithDetails.filter(job => {
            const isAccepted = job.status === 'accepted' || job.status === 'in_progress';
            const isAssigned =
              job.assignedCleanerId === currentUserId ||
              job.assignedCleanerId?.toString() === currentUserId?.toString() ||
              job.cleanerId === currentUserId ||
              job.cleanerId?.toString() === currentUserId?.toString() ||
              job.acceptedBy === currentUserId ||
              job.acceptedBy?.toString() === currentUserId?.toString();

            // Also check if any quote from current cleaner is accepted
            const hasAcceptedQuote = job.quotes?.some(q => {
              const qCleanerId = q.cleanerId?._id || q.cleanerId?.id || q.cleanerId;
              return (qCleanerId === currentUserId || qCleanerId?.toString() === currentUserId?.toString()) && q.status === 'accepted';
            });

            return isAccepted && (isAssigned || hasAcceptedQuote);
          });

          const transformedAll = acceptedJobs.map(transformJobForUI);
          const totalFiltered = transformedAll.length;
          const startIndex = (currentPage - 1) * jobsPerPage;
          const pageJobs = transformedAll.slice(startIndex, startIndex + jobsPerPage);

          setJobs(pageJobs);
          setTotalJobs(totalFiltered);
          setTotalPages(Math.max(1, Math.ceil(totalFiltered / jobsPerPage)));
          setLoading(false);
          return;
        }

        // For 'completed' tab, filter for jobs completed by current cleaner
        if (activeTab === 'completed') {
          const jobsWithDetails = await fetchJobDetailsForPage(jobsList, controller.signal);

          const completedJobs = jobsWithDetails.filter(job => {
            if (job.status !== 'completed') return false;
            return (
              job.assignedCleanerId === currentUserId ||
              job.assignedCleanerId?.toString() === currentUserId?.toString() ||
              job.cleanerId === currentUserId ||
              job.cleanerId?.toString() === currentUserId?.toString() ||
              job.completedBy === currentUserId ||
              job.completedBy?.toString() === currentUserId?.toString() ||
              job.completedBy?._id === currentUserId ||
              job.completedBy?._id?.toString() === currentUserId?.toString()
            );
          });

          const transformedAll = completedJobs.map(transformJobForUI);
          const totalFiltered = transformedAll.length;
          const startIndex = (currentPage - 1) * jobsPerPage;
          const pageJobs = transformedAll.slice(startIndex, startIndex + jobsPerPage);

          setJobs(pageJobs);
          setTotalJobs(totalFiltered);
          setTotalPages(Math.max(1, Math.ceil(totalFiltered / jobsPerPage)));
          setLoading(false);
          return;
        }

        // All tabs now fall through to the logic below which handles 
        // searchable filtering and slicing for the current page.

        // Filter and transform for all tabs (including live-jobs)
        const allTransformed = jobsList.map(transformJobForUI);
        const filteredAll = allTransformed.filter(job => {
          if (searchQuery.trim() === '') return true;
          return job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.id?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        });

        const totalFiltered = filteredAll.length;
        const startIndex = (currentPage - 1) * jobsPerPage;
        const pageJobs = filteredAll.slice(startIndex, startIndex + jobsPerPage);

        setJobs(pageJobs);
        setTotalJobs(totalFiltered);
        setTotalPages(Math.max(1, Math.ceil(totalFiltered / jobsPerPage)));
      } catch (err) {
        if (err.name === 'AbortError') {
          // request aborted - ignore
        } else {
          setError('Failed to load jobs');
          setJobs([]);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      // cleanup - abort if component unmounts or next effect runs
      controller.abort();
      activeController.current = null;
    };
  }, [activeTab, currentPage, searchQuery]);

  // transform helper (keeps the UI shape identical to your original)
  const transformJobForUI = (job) => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const currentUserId = currentUser.id || currentUser._id;
    let myQuote = null;
    if (job.quotes && job.quotes.length > 0) {
      myQuote = job.quotes.find(q => {
        const qCleanerId = q.cleanerId?._id || q.cleanerId || q.cleanerId?.id;
        return (qCleanerId === currentUserId || qCleanerId?.toString() === currentUserId?.toString()) && q.status === 'pending';
      }) || null;
    }

    return {
      id: job._id || job.jobId || job.id,
      title: job.title || job.serviceTypeDisplay || `${(job.serviceType || '').toString().replace(/\b\w/g, c => c.toUpperCase())}`.trim(),
      location: job.location?.address || job.location?.fullAddress || 'Location not specified',
      date: job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString('en-AU', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      }) : 'Date not specified',
      price: myQuote ? `$${myQuote.price}` : (job.estimatedPrice ? `$${job.estimatedPrice}` : job.budget ? `$${job.budget}` : 'Price not specified'),
      status: job.status || 'posted',
      timeAgo: job.createdAt ? getTimeAgo(new Date(job.createdAt)) : 'Recently posted',
      type: job.serviceType || 'general',
      originalJob: job,
      myQuote
    };
  };

  // helper for time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Posted just now';
    if (diffInHours === 1) return 'Posted 1h ago';
    if (diffInHours < 24) return `Posted ${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `Posted ${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const handleJobClick = (jobId, jobStatus) => {
    if (jobStatus === 'in_progress') return;
    if (jobStatus === 'completed') {
      navigate(`/cleaner-job-completed/${jobId}`);
      return;
    }
    navigate(`/job-details/${jobId}`);
  };

  const handleInProgressJobClick = (jobId) => navigate(`/in-progress-job/${jobId}`);

  const handlePageChange = (_, page) => setCurrentPage(page);

  const handleResetFilters = () => {
    setDistance(25);
    setCustomDistance('');
    setIsUrgent(false);
  };

  const handleApplyFilters = () => {
    setShowSortModal(false);
    // Filter logic can be applied here if needed
  };

  // Jobs are now filtered on backend, no need for client-side filtering
  const filteredJobs = jobs;

  useEffect(() => setCurrentPage(1), [activeTab]);

  // --- rest of your UI markup unchanged, using the same classes and structure ---
  // For brevity, I will reuse the existing UI code you provided earlier
  // The UI uses `jobs`, `loading`, `error`, `totalPages`, `currentPage` etc. which are unchanged

  return (
    <div className='pb-6'>
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <PageHeader
          title="Jobs"
          onBack={() => navigate('/cleaner-dashboard')}
          className="py-3"
          rightSlot={
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/set-cleaner-location', { state: { from: 'cleaner-jobs' } })}
            >
              <img src={CurrentLocationIcon} alt="Location" className="w-5 h-5" />
              <span className="text-sm text-primary-600 font-medium ">
                {userLocation.address}, {userLocation.city}
              </span>
            </div>
          }
        />

        <div className="bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-custom">
          {/* Search & Sort */}
          <div className="px-4 py-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <img src={SearchIcon} alt="Search" className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 " />
                <input
                  type="text"
                  placeholder="Search jobs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none text-primary-200 font-medium cursor-pointer"
                />
              </div>

              <div className="relative sm:w-auto w-full">
                <button onClick={() => setShowSortModal(true)} className="flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-primary-200 font-medium hover:bg-gray-50 transition-colors whitespace-nowrap w-full sm:w-auto cursor-pointer ">
                  <span>Sort By</span>
                  <img src={DownIcon} alt="Dropdown" className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 pb-4">
            <div className="flex gap-2 overflow-x-auto no-scrollbar scrollbar-hide pb-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl! text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${activeTab === tab.id ? 'bg-[#EBF2FD] text-primary-600 shadow-sm font-semibold border-none' : 'bg-[#F9FAFB] text-gray-600 border border-[#F3F3F3] hover:bg-gray-50'}`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards: uses same rendering as before but using `jobs` from optimized loader */}
          <div className="px-4 pb-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <div key={i} className="bg-white border border-gray-200 rounded-3xl p-6 animate-pulse">...</div>)}
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8"><div className="text-red-500">{error}</div></div>
            ) : filteredJobs.length === 0 ? (
              <div className="flex items-center justify-center py-8"><div className="text-gray-500">No jobs found</div></div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {filteredJobs.map(job => (
                  <div key={job.id} onClick={() => handleJobClick(job.id, job.originalJob?.status)}
                    className={`bg-white border border-gray-200 rounded-2xl px-4 py-2 shadow-sm transition-all duration-200 ${job.originalJob?.status === 'in_progress' ? 'cursor-default' : 'cursor-pointer hover:shadow-md'}`}>
                    {/* Job ID and Status */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm text-primary-200 font-medium">
                        #{job.originalJob?.jobId || job.id?.substring(0, 8) || 'AM' + Math.random().toString(36).substr(2, 5).toUpperCase()}
                      </div>
                      {activeTab === 'completed' && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#D1FAE5] border border-[#D1FAE5] text-[#059669]">
                          Completed
                        </span>
                      )}
                      {activeTab === 'accepted' && job.originalJob?.status === 'in_progress' && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-yellow-500 border border-yellow-500 text-yellow-500">
                          Awaiting Payment
                        </span>
                      )}
                      {activeTab === 'accepted' && job.originalJob?.status === 'accepted' && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#D1FAE5] border border-[#D1FAE5] text-[#059669]">
                          Accepted
                        </span>
                      )}
                      {activeTab === 'my-bids' && job.myQuote && (
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#E0F2FE] text-[#0369A1] mb-1">
                            Quotes Sent
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Job Title */}
                    <h3 className="text-lg font-semibold text-primary-500 mb-2 capitalize">{job.title}</h3>

                    {/* Job Details with Icons */}
                    <div className="space-y-1">
                      {/* Location */}
                      <div className="flex items-center">
                        <img src={MapPinIcon} alt="Location" className="w-4 h-4 mr-3" />
                        <span className="text-sm text-primary-200 font-medium">{job.location}</span>
                      </div>

                      {/* Date & Time */}
                      <div className="flex items-center">
                        <img src={CalendarIcon} alt="Date" className="w-4 h-4 mr-3" />
                        <span className="text-sm text-primary-200 font-medium">
                          {activeTab === 'completed' ? `Completed: ${job.date}` : job.date}
                        </span>
                      </div>

                      {/* My Quote Amount for My Bids tab */}
                      {activeTab === 'my-bids' && job.myQuote && (
                        <div className="flex items-center">
                          <span className="text-sm font-semibold text-primary-500">
                            My Quote: <span className="ml-1 text-primary-600">${job.myQuote.price}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Chat with Customer Button for Accepted Jobs (not in_progress) */}
                    {activeTab === 'accepted' && job.originalJob?.status === 'accepted' && (
                      <div className="flex items-center justify-end cursor-pointer mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/chat/${job.id}`);
                          }}
                          className="text-primary-600 px-3 py-2 rounded-full font-medium transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm border border-[#9CC0F6] shadow-custom"
                        >
                          <img src={ChatIcon} alt="Chat" className="w-5 h-5 " />
                          Chat with Customer
                        </button>
                      </div>
                    )}

                    {/* View Details Button for In Progress Jobs */}
                    {activeTab === 'accepted' && job.originalJob?.status === 'in_progress' && (
                      <div className="flex items-center justify-end cursor-pointer mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInProgressJobClick(job.id);
                          }}
                          className="text-primary-600 px-3 py-2 rounded-full font-medium transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm border border-[#9CC0F6] shadow-custom"
                        >
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!loading && (
            <div className="px-4 pb-6 flex justify-center">
              <PaginationRanges
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                siblingCount={1}
                boundaryCount={1}
                stackProps={{ className: 'mt-6' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Sort Modal  */}
      {showSortModal && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={() => setShowSortModal(false)}
        >

          <div
            className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-md mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-primary-500">Sort By</h2>
                <button
                  onClick={() => setShowSortModal(false)}
                  className="text-primary-200 font-medium hover:text-primary-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Handle bar */}
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Distance Filter */}
              <div>
                <h3 className="text-lg font-semibold text-primary-500 mb-2">Distance</h3>
                <p className="text-sm text-primary-200 font-medium mb-4">Select your preferable distance</p>

                {/* Distance Slider */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm text-primary-200 font-medium mb-2">
                    <span>0 km</span>
                    <span className="font-medium text-blue-600">{distance} km</span>
                    <span>50 km</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={distance}
                    onChange={(e) => {
                      setDistance(parseInt(e.target.value));
                      setCustomDistance(''); // Clear custom input when slider is moved
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(distance / 50) * 100}%, #E5E7EB ${(distance / 50) * 100}%, #E5E7EB 100%)`
                    }}
                  />
                </div>

                {/* Custom Distance Input */}
                <div>
                  <label className="block text-sm font-medium text-primary-200 mb-2">
                    Enter Custom Value
                  </label>
                  <input
                    type="number"
                    value={customDistance}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      setCustomDistance(e.target.value);
                      if (value >= 0 && value <= 50) {
                        setDistance(value);
                      }
                    }}
                    placeholder="Enter custom distance"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                    min="0"
                    max="50"
                  />
                </div>
              </div>


              {/* Urgency Filter */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary-500 mb-1">Urgency</h3>
                  <p className="text-sm text-primary-200 font-medium">Tap on toggle to find urgent jobs</p>
                </div>
                <button
                  onClick={() => setIsUrgent(!isUrgent)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isUrgent ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isUrgent ? 'translate-x-6' : 'translate-x-1'
                      }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
              <Button
                onClick={handleResetFilters}
                variant="outline"
                size="md"
                fullWidth
                className="border-primary-200 text-primary-500 hover:bg-primary-50"
              >
                Reset
              </Button>
              <Button
                onClick={handleApplyFilters}
                variant="primary"
                size="md"
                fullWidth
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanerJobsPage;
