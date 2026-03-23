import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PageHeader, PaginationRanges, Button } from '../../components';
import DownIcon from '../../assets/down2.svg';
import CalendarIcon from '../../assets/Calendar.svg';
import MapPinIcon from '../../assets/map-pin 1.png';
import CurrentLocationIcon from '../../assets/currentLocation.svg';
import SearchIcon from '../../assets/search.svg';
import { jobsAPI, userAPI, reviewsAPI } from '../../services/api';


const CleanerJobsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const normalizeTab = (tab) => {
    if (tab === 'live-jobs') return 'posted';
    if (tab === 'my-bids') return 'booking_request';
    if (tab === 'accepted') return 'assigned';
    return tab;
  };

  const [activeTab, setActiveTab] = useState(() => {
    return normalizeTab(location.state?.tab) || 'posted';
  });

  const [subFilter, setSubFilter] = useState('request_sent');

  // Update tab if location state changes (e.g. navigating from dashboard to a specific tab)
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(normalizeTab(location.state.tab));
    }
  }, [location.state]);



  const [showSortModal, setShowSortModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState([]); // jobs for the current page
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    { id: 'posted', label: 'Posted Jobs' },
    { id: 'booking_request', label: 'Booking Requests' },
    { id: 'assigned', label: 'Job Assigned' },
    { id: 'completed', label: 'Completed' }
  ];

  // --- NEW: helper to fetch jobs list once per (status,page) and cache ---
  const fetchJobsList = async ({ tab, subFilter, page = 1, limit = jobsPerPage, signal, categoryId, location, isUrgent }) => {
    // key includes tab & subFilter & page so cache is per page
    const cacheKey = `feed::tab:${tab}::sub:${subFilter}::page:${page}::limit:${limit}::cat:${categoryId}::loc:${location}::urgent:${isUrgent}`;

    if (apiCache.current[cacheKey]) {
      return apiCache.current[cacheKey];
    }

    // call backend with feed parameters
    const result = await jobsAPI.getCleanerJobFeed({
      tab,
      subFilter,
      page,
      limit,
      categoryId,
      location,
      isUrgent,
      signal
    });

    // normalize response
    const jobsArray = result?.data?.jobs || result?.data || [];
    const total = result?.data?.totalAvailable || result?.totalAvailable || jobsArray.length;
    const payload = { jobs: jobsArray, total };
    apiCache.current[cacheKey] = payload;
    return payload;
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
        // Safety check: Don't fetch jobs if coordinates aren't set yet (unless not in posted tab maybe?)
        // But for 'posted' jobs, distance is key.
        if (activeTab === 'posted' && !userLocation?.coordinates?.lat) {
          setLoading(false);
          return;
        }

        const result = await fetchJobsList({
          tab: activeTab,
          subFilter: activeTab === 'booking_request' ? subFilter : undefined,
          page: currentPage,
          limit: jobsPerPage,
          location: JSON.stringify({
            lat: userLocation?.coordinates?.lat,
            lng: userLocation?.coordinates?.lng,
            radius: distance
          }),
          isUrgent,
          signal: controller.signal
        });

        const jobsList = result.jobs || [];
        const allTransformed = jobsList.map(transformJobForUI);

        // Client-side search and distance filtering
        const filteredAll = allTransformed.filter(job => {
          // Distance filter (if job.distance is available and exceeds current radius)
          if (activeTab === 'posted' && job.distance !== null && job.distance > distance) {
            return false;
          }

          if (searchQuery.trim() === '') return true;
          return job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.id?.toString().toLowerCase().includes(searchQuery.toLowerCase());
        });

        setJobs(filteredAll);
        setTotalJobs(result.total || filteredAll.length);
        setTotalPages(Math.max(1, Math.ceil((result.total || filteredAll.length) / jobsPerPage)));
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
      controller.abort();
      activeController.current = null;
    };
  }, [activeTab, subFilter, currentPage, searchQuery, distance, isUrgent, refreshTrigger, userLocation]);

  // Haversine formula to calculate distance between two coordinates in kilometers
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance; // Return raw distance for precise formatting in transformJobForUI
  };

  const getCoordinates = (coordinates) => {
    if (!coordinates) return null;

    let lat, lng;

    if (typeof coordinates === 'string') {
      const coords = coordinates.split(',').map(coord => parseFloat(coord.trim()));
      // Most strings are "lat, lng", but let's check
      if (coords[0] < 40 && coords[1] > 40) {
        lat = coords[0];
        lng = coords[1];
      } else {
        lat = coords[1];
        lng = coords[0];
      }
    } else if (coordinates.lat && coordinates.lng) {
      lat = coordinates.lat;
      lng = coordinates.lng;
    } else if (Array.isArray(coordinates)) {
      // GeoJSON is [lng, lat], let's be robust
      // Melbourne is approx lat -37, lng 144
      const first = coordinates[0];
      const second = coordinates[1];

      if (first > 100 && second < 0) { // [lng, lat]
        lng = first;
        lat = second;
      } else if (first < 0 && second > 100) { // [lat, lng]
        lat = first;
        lng = second;
      } else {
        // Fallback or other regions
        lng = first;
        lat = second;
      }
    }

    if (lat && lng && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
    return null;
  };

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

    // Calculate distance if missing
    let jobDistance = job.distance;
    if (jobDistance === undefined || jobDistance === null) {
      const cleanerCoords = userLocation?.coordinates;
      const jobCoords = getCoordinates(job.location?.coordinates);

      if (cleanerCoords && jobCoords) {
        // userLocation.coordinates can be {lat, lng} or [lng, lat]
        let cLat, cLng;
        if (cleanerCoords.lat !== undefined) {
          cLat = cleanerCoords.lat;
          cLng = cleanerCoords.lng;
        } else if (Array.isArray(cleanerCoords)) {
          // Robust check for cleaner coordinates too
          if (cleanerCoords[0] > 100 && cleanerCoords[1] < 0) {
            cLng = cleanerCoords[0];
            cLat = cleanerCoords[1];
          } else {
            cLat = cleanerCoords[0];
            cLng = cleanerCoords[1];
          }
        }

        if (cLat !== undefined && cLng !== undefined) {
          jobDistance = getDistance(cLat, cLng, jobCoords.lat, jobCoords.lng);
        }
      }
    }

    return {
      id: job._id || job.jobId || job.id,
      title: job.serviceTypeId?.name || job.title || 'Cleaning Job',
      location: job.location?.address || job.location?.fullAddress || 'Location not specified',
      date: job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString('en-AU', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
      }) : 'Date not specified',
      // price: job.budget ? `$${job.budget}` : 'Price not specified',
      status: job.status || 'posted',
      timeAgo: job.createdAt ? getTimeAgo(new Date(job.createdAt)) : 'Recently posted',
      type: job.serviceType || 'general',
      originalJob: job,
      myQuote,
      isRequestSent: job.isRequestSent || false,
      isWaitlisted: job.isWaitlisted || false,
      distance: (jobDistance !== undefined && jobDistance !== null) ? parseFloat(jobDistance).toFixed(3) : null,
      isUrgent: job.isUrgent || false,
      category: job.categoryId?.name || 'Cleaning'
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
    // If job is in assigned tab or is active, always go to in-progress detail page
    if (activeTab === 'assigned' || ['on_the_way', 'started', 'in_progress'].includes(jobStatus)) {
      navigate(`/in-progress-job/${jobId}`);
      return;
    }
    if (jobStatus === 'completed') {
      navigate(`/cleaner-job-completed/${jobId}`);
      return;
    }
    // Pass tab context so details page can show tab-specific actions (e.g., withdraw bid in booking requests)
    navigate(`/job-details/${jobId}`, { state: { fromTab: activeTab } });
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
    apiCache.current = {}; 
    setRefreshTrigger(prev => prev + 1);
    setCurrentPage(1); 
  };

  // Jobs are now filtered on backend, no need for client-side filtering
  const filteredJobs = jobs;

  useEffect(() => {
    setCurrentPage(1);
    // Reset subFilter if navigating to booking_request
    if (activeTab !== 'booking_request') {
      // Keep it saved but show subfilters only when in that tab
    }
  }, [activeTab]);

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

        {/* Flat container (no extra rounded background behind tabs/cards) to match Figma */}
        <div className="bg-transparent rounded-none p-0 shadow-none">
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
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${activeTab === tab.id ? 'bg-[#EBF2FD] text-primary-600 font-semibold border-none' : 'bg-[#F3F3F3] text-gray-600 border border-[#F3F3F3] hover:bg-gray-50'}`}>
                  {tab.label} 
                </button>
              ))}
            </div>
          </div>

          {/* Sub-filters for Booking Requests */}
          {activeTab === 'booking_request' && (
            <div className="px-4 pb-4 flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="subFilter"
                  value="request_sent"
                  checked={subFilter === 'request_sent'}
                  onChange={(e) => setSubFilter(e.target.value)}
                  className="w-5 h-5 border-2 border-gray-300 rounded-full checked:border-primary-500 checked:bg-primary-500 transition-all cursor-pointer"
                />
                <span className={`text-sm font-medium ${subFilter === 'request_sent' ? 'text-primary-600' : 'text-gray-500'}`}>Request Sent</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="subFilter"
                  value="waitlisted"
                  checked={subFilter === 'waitlisted'}
                  onChange={(e) => setSubFilter(e.target.value)}
                  className="w-5 h-5 border-2 border-gray-300 rounded-full checked:border-primary-500 checked:bg-primary-500 transition-all cursor-pointer"
                />
                <span className={`text-sm font-medium ${subFilter === 'waitlisted' ? 'text-primary-600' : 'text-gray-500'}`}>Waitlisted</span>
              </label>
            </div>
          )}

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
                  <div 
                    key={job.id} 
                    onClick={() => handleJobClick(job.id, job.originalJob?.status)}
                    className="bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer"
                  >
                    <div className="flex flex-col gap-3">
                      {/* Top Info: Category and Status */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-500">
                          {job.category}
                        </span>
                        <div className="flex gap-2">
                          {/* {job.isUrgent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 border border-red-200 uppercase tracking-wider">
                              Urgent
                            </span>
                          )} */}
                          {activeTab === 'completed' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-600 border border-green-200 uppercase tracking-wider">
                              Completed
                            </span>
                          )}
                          {activeTab === 'assigned' && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-100 text-primary-600 border border-primary-200 uppercase tracking-wider">
                              Assigned
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Job Title */}
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {job.title}
                      </h3>

                      {/* Details with Icons */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-500">
                          <img src={CalendarIcon} alt="Date" className="w-4 h-4 opacity-60" />
                          <span className="text-sm font-medium">{job.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500">
                          <img src={MapPinIcon} alt="Location" className="w-4 h-4 opacity-60" />
                          <div className="min-w-0">
                            <span className="text-sm font-medium truncate block">{job.location}</span>
                            {job.distance !== null && (
                              <span className="text-[11px] font-bold text-primary-500 uppercase">
                                {job.distance} KM AWAY
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                   

                      {/* Assigned By (Simple) */}
                      {activeTab === 'assigned' && job.originalJob?.customerId && (
                        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-50">
                          <img 
                            src={job.originalJob.customerId.profileImage || `https://ui-avatars.com/api/?name=${job.originalJob.customerId.firstName}+${job.originalJob.customerId.lastName}&background=random`} 
                            alt="Customer" 
                            className="w-6 h-6 rounded-full object-cover" 
                          />
                          <p className="text-xs text-gray-400">
                            Assigned by <span className="font-bold text-gray-700">{job.originalJob.customerId.firstName}</span>
                          </p>
                        </div>
                      )}
                    </div>
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
                variant="secondary"
                size="md"
                fullWidth
                className="border-[#9CC0F6] text-"
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
