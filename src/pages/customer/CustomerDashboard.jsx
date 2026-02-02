import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { BriefcaseBusiness, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button, Loader } from '../../components';
import { jobsAPI, userAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getStatusChip } from '../../utils/statusUtils';
import CardBG2 from '../../assets/CardBG2.png';
import CardBG3 from '../../assets/CardBG3.png';
import CardBG4 from '../../assets/CardBG4.png';
import RewardImage from '../../assets/Reward.jpg';
import CoinImage from '../../assets/coin.png';
import CalendarIcon from '../../assets/Calendar.svg';
import PersonIcon from '../../assets/user-check.svg';
import SearchIcon from '../../assets/search.svg';
import PlusIcon from '../../assets/plus.svg';
import CleaningImage from '../../assets/Cleaning.png';
import HandymanImage from '../../assets/Handyman.png';
import HousekeepingImage from '../../assets/Housekeeping.png';
import PetSittingImage from '../../assets/Pet Sitting.png';
import NDISSupportImage from '../../assets/NDIS Support.png';
import CommercialCleaningImage from '../../assets/commercialCleaning.svg';

const CustomerDashboard = () => {
  const [ongoingJobs, setOngoingJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState(null);
  const swiperRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const goToPrev = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  const goToNext = () => {
    if (swiperRef.current) {
      swiperRef.current.swiper.slideNext();
    }
  };

  // Helper functions
  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const opts = { day: '2-digit', month: 'short' };
    const date = d.toLocaleDateString('en-AU', opts);
    const time = d.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit' });
    return `${date}, ${time}`;
  };


  const getActionText = (status) => {
    const s = (status || '').toString().toLowerCase();
    if (s === 'in_progress') return 'Track Job';
    if (s === 'completed') return 'Rate & Review';
    return 'View Quotes';
  };
  const handleViewJobs = () => {
    navigate('/my-jobs');
  };
  const handleViewRewards = () => {
    navigate('/rewards');
  };

  // Get current user ID
  useEffect(() => {
    const getCurrentUserId = async () => {
      try {
        if (user?.id) {
          setCurrentUserId(user.id);
        } else if (user?._id) {
          setCurrentUserId(user._id);
        } else {
          const userProfile = await userAPI.getProfile();
          const userData = userProfile.data?.user || userProfile.data || userProfile;
          setCurrentUserId(userData?._id || userData?.id);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
        setError('Failed to load user information');
      }
    };

    getCurrentUserId();
  }, [user]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (!currentUserId) return;

      try {
        setLoading(true);
        const res = await jobsAPI.getCustomerJobs(currentUserId, { page: 1, limit: 10 });
        const list = res?.data || res || [];

        const normalized = list.map((j) => {
          const status = (j.status || '').toString();
          const assignedTo = j.assignedCleaner?.name || j.assignedCleaner?.fullName || j.cleaner?.name || j.assignedTo || null;
          const dateLabel = formatDate(j.createdAt);
          const title = j.title || j.serviceTypeDisplay || `${(j.serviceType || '').toString().replace(/\b\w/g, c => c.toUpperCase())}`.trim();
          const statusChip = getStatusChip(status);
          
          return {
            id: j.jobId || j._id || j.reference || j.id,
            title,
            status: statusChip.label,
            date: dateLabel,
            action: getActionText(status),
            assignedTo
          };
        });
        
        setOngoingJobs(normalized);
      } catch (e) {
        setError('Failed to load jobs');
        console.error('Error fetching jobs:', e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [currentUserId]);

  const serviceCategories = [
    {
      id: 'cleaning',
      name: 'Cleaning',
      image: CleaningImage,
      description: 'Professional cleaning services'
    },
    {
      id: 'housekeeping',
      name: 'Housekeeping',
      image: HousekeepingImage,
      description: 'Complete housekeeping solutions'
    },
    {
      id: 'supportServices',
      name: 'Support Services',
      image: NDISSupportImage,
      description: 'Support services'
    },
    {
      id: 'commercialCleaning',
      name: 'Commercial Cleaning',
      image: CommercialCleaningImage,
      description: 'Retail auditing services'
    },
    {
      id: 'petsitting',
      name: 'Pet Sitting',
      image: PetSittingImage,
      description: 'Pet care and sitting'
    },
    {
      id: 'handyman',
      name: 'Handyman',
      image: HandymanImage,
      description: 'Repair and maintenance'
    }
  ];


  return (
    <>
      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto py-1 px-4 sm:px-6 lg:px-8">
        {/* Search Section */}
        <div className="bg-white px-4 sm:px-6 py-4 rounded-2xl mb-4 sm:mb-6 mt-4 shadow-custom">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center justify-center">
                <img src={SearchIcon} alt="Search" className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <input
                type="text"
                placeholder="Search services, e.g. bond clean..."
                className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-gray-100 rounded-lg text-sm text-primary-200 font-medium focus:outline-none"
              />
            </div>
            <Button 
              onClick={() => navigate('/post-new-job')} 
              size="sm"
              icon={PlusIcon}
            >
              <span className="hidden sm:inline">Post New Job</span>
              <span className="sm:hidden">Post Job</span>
            </Button>
          </div>
        </div>

          {/* Book a cleaner section */}
          <div className="bg-white px-4 sm:px-6 py-4 rounded-2xl shadow-custom mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary-500 mb-1">Book a cleaner in minutes</h2>
            <p className="text-xs sm:text-sm md:text-base text-primary-200 font-medium mb-3 sm:mb-4">Post job → Receive quotes → Choose & pay securely</p>
            
          {/* Service Categories Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
            {serviceCategories.map((service) => (
              <div
                key={service.id}
                className="relative bg-white border border-gray-200 rounded-2xl sm:rounded-3xl p-2 sm:p-3 md:p-6 text-center hover:shadow-custom-5 transition-shadow cursor-pointer overflow-hidden shadow-custom"
              >
                {/* Top-left background image */}
                <div className="absolute top-0 left-0 w-12 h-16 sm:w-20 sm:h-24 overflow-hidden rounded-tl-xl sm:rounded-tl-2xl">
                  <img src={CardBG3} alt="Card Background" className="w-full h-full object-cover" />
                </div>
                
                {/* Top-right background image */}
                <div className="absolute top-0 right-0 w-12 h-16 sm:w-20 sm:h-24 overflow-hidden rounded-tr-xl sm:rounded-tr-2xl">
                  <img src={CardBG2} alt="Card Background" className="w-full h-full object-cover" />
                </div>
                
                {/* Bottom-left background image */}
                <div className="absolute bottom-0 left-0 w-12 h-16 sm:w-20 sm:h-24 overflow-hidden rounded-bl-xl sm:rounded-bl-2xl">
                  <img src={CardBG4} alt="Card Background" className="w-full h-full object-cover" />
                </div>
                
                {/* Service Image */}
                <div className="relative z-10 mb-1 sm:mb-2 flex justify-center">
                  <img 
                    src={service.image} 
                    alt={service.name}
                    className="w-8 h-8 sm:w-12 sm:h-12 md:w-20 md:h-20 object-contain"
                  />
                </div>
                
                {/* Service Name */}
                <div className="relative z-10 text-xs sm:text-sm md:text-lg font-medium text-gray-900">{service.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* MatePoints Section */}
        <div className="my-4 sm:my-6 rounded-2xl shadow-custom">
          <div className="relative rounded-xl p-3 sm:p-4 md:p-6 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img src={RewardImage} alt="Reward Background" className="w-full h-full object-cover" />
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary-500 mb-1">Earn MatePoints with Every Booking</h3>
                <p className="text-xs sm:text-sm md:text-base text-[#374151] mb-2 sm:mb-3">Collect points on each job completed and redeem them for discounts & perks.</p>
                <Button 
                  onClick={handleViewRewards} 
                  size="sm"
                  className="bg-[#111827] hover:bg-[#111827] text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-[8px] text-xs sm:text-sm font-medium"
                >
                  View Rewards
                </Button>
              </div>
            </div>
            
            {/* Coin in right bottom corner */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10">
              <img src={CoinImage} alt="Coin" className="w-12 h-12 sm:w-16 sm:h-16 md:w-24 md:h-24" />
            </div>
          </div>
        </div>

        {/* Ongoing Jobs Section */}
        <div className="bg-white px-4 sm:px-7 py-4 sm:py-6 rounded-2xl shadow-custom">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
            <h3 className="text-base sm:text-lg md:text-xl font-semibold text-primary-500">Ongoing Jobs</h3>
            
            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Button 
                onClick={handleViewJobs} 
                size="sm"
                className="rounded-full px-3 sm:px-5 py-1.5 sm:py-2 flex items-center gap-2"
              >
                <BriefcaseBusiness className="w-4 h-4" strokeWidth={2} />
                <span>View Jobs</span>
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  onClick={goToPrev}
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-1.5 sm:p-2 "
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" strokeWidth={2} />
                </Button>
                
                <Button 
                  onClick={goToNext}
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-1.5 sm:p-2"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" strokeWidth={2} />
                </Button>
              </div>
            </div>
          </div>
          
          {loading && (
            <div className="py-8">
              <Loader message="Loading your jobs..." />
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}
          
          {!loading && !error && ongoingJobs.length === 0 && (
            <div className="text-center py-8">
              <div className="text-sm text-gray-500">No jobs found</div>
            </div>
          )}
          
          {!loading && !error && ongoingJobs.length > 0 && (
            <Swiper
              ref={swiperRef}
              modules={[Autoplay]}
              spaceBetween={16}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 16,
                },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 16,
                  },
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              speed={800}
              effect="slide"
              loop={ongoingJobs.length > 1}
              className="!pb-4"
            >
              {ongoingJobs.map((job) => (
                <SwiperSlide key={job.id}>
                  <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-custom h-44 sm:h-48">
                    <div className="flex flex-col justify-between h-full">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="text-xs sm:text-sm text-primary-200 font-medium">#{job.id}</div>
                          {job.status && (
                            <span className={`inline-block font-semibold text-xs px-2 py-1 rounded-full ${
                              job.status === 'Pending Quotes' 
                                ? 'bg-[#E5F3FF] text-[#0088FF] border border-[#DDEFFF]'
                                : job.status === 'In Progress'
                                ? 'bg-[#FFEBCA] text-yellow-500 border border-yellow-500'
                                : job.status === 'Completed'
                                ? 'bg-green-500 text-[#10B981] border border-[#D2F8E0]'
                                : 'bg-[#E5F3FF] text-[#0088FF] border border-[#E5F3FF]'
                            }`}> 
                              {job.status}
                            </span>  
                          )}
                        </div>
                        <h4 className="font-semibold text-primary-500 mb-2 line-clamp-2 text-sm sm:text-base capitalize" >{job.title}</h4>
                        <div className="flex items-center text-xs font-medium text-primary-200 mb-1">
                          <img src={CalendarIcon} alt="Calendar" className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          {job.date}
                        </div>
                        {job.assignedTo && (
                          <div className="flex items-center text-xs text-[#6B7280]">
                            <img src={PersonIcon} alt="Person" className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                            <span className="truncate">Assigned to: {job.assignedTo}</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="secondary" 
                        size="xs"
                        className="w-full mt-2 sm:mt-3 text-xs sm:text-sm font-medium"
                      >
                        {job.action}
                      </Button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </div>
    </>
  );
};

export default CustomerDashboard;
