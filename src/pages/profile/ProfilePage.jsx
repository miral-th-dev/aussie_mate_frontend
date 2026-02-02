import React, { useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { userAPI, jobsAPI, matePointsAPI } from '../../services/api';
import { Button, PageHeader, Loader } from '../../components';
import { 
  Edit, 
  HelpCircle, 
  FileText, 
  BriefcaseBusiness, 
  LogOut, 
  Mail, 
  Bell, 
  Phone, 
  Star, 
  Wallet, 
  ChevronRight, 
  User, 
  ShieldCheck, 
  DollarSign, 
  MapPin 
} from 'lucide-react';
import ProfileBG from '../../assets/CardBG7.png';


const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [jobStats, setJobStats] = useState({ jobs: 0, completed: 0, reviews: 0 });
    const [matePoints, setMatePoints] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (user) {
          const response = await userAPI.getProfile();
          if (response.success) {
            // Ensure profilePhoto is available in the response
            if (response.data?.user && !response.data.user.profilePhoto) {
              const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
              if (storedUser.profilePhoto) {
                response.data.user.profilePhoto = storedUser.profilePhoto;
              }
            }
            setUserProfile(response.data);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchJobStats = async () => {
      try {
        if (user) {
          const currentUserId = user.id || user._id;
          let jobs = [];
          
          try {
            // Try to get all jobs first
            const jobsResponse = await jobsAPI.getAllJobs();
            if (jobsResponse.success) {
              jobs = jobsResponse.data.jobs || jobsResponse.data || [];
            }
          } catch (e) {
            console.error('Error fetching jobs:', e);
          }
          
          // Filter jobs to only include those posted by current customer
          const customerJobs = jobs.filter(job => {
            const jobCustomerId = job.customerId?._id || job.customerId?.id || job.customer?._id || job.customer?.id || job.postedBy?._id || job.postedBy?.id;
            return jobCustomerId === currentUserId;
          });
          
          // Count total jobs posted by customer
          const totalJobs = customerJobs.length;
          
          // Count completed jobs with various status formats
          const completedJobs = customerJobs.filter(job => {
            const status = (job.status || '').toString().toLowerCase();
            return status === 'completed' || status === 'done' || status === 'finished';
          }).length;
          
          setJobStats({ jobs: totalJobs, completed: completedJobs });
        }
      } catch (error) {
        console.error('Error fetching job stats:', error);
        // Set a fallback value
        setJobStats({ jobs: 0, completed: 0 });
      }
    };

    const fetchMatePoints = async () => {
      try {
        const pointsResponse = await matePointsAPI.getPoints();
        if (pointsResponse.success) {
          setMatePoints(pointsResponse.data.points || 0);
        }
      } catch (error) {
        console.error('Error fetching mate points:', error);
      }
    };

    fetchProfile();
    fetchJobStats();
    fetchMatePoints();

    // Listen for user updates
    const handleUserUpdate = () => {
      // Update user from localStorage
      const updatedUser = JSON.parse(localStorage.getItem('user') || 'null');
      if (updatedUser) {
        setUserProfile(updatedUser);
        // Force re-render by updating state
        setLoading(false);
      }
      fetchProfile();
    };

    window.addEventListener('userUpdated', handleUserUpdate);

    return () => {
      window.removeEventListener('userUpdated', handleUserUpdate);
    };
  }, [user]);

  // Listen for user context changes
  useEffect(() => {
    if (user) {
      // Check if profilePhoto is missing and add it from localStorage if available
      if (!user.profilePhoto && localStorage.getItem('user')) {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser.profilePhoto) {
          const updatedUser = { ...user, profilePhoto: storedUser.profilePhoto };
          setUserProfile(updatedUser);
          return;
        }
      }
      
      setUserProfile(user);
    }
  }, [user]);

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = async () => {
        logout();
        await new Promise(resolve => setTimeout(resolve, 100));
        navigate('/');
    };

    const cancelLogout = () => {
        setShowLogoutModal(false);
    };

    const handleEditProfile = () => {
        navigate('/edit-profile');
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    const statisticsData = [
        { icon: Star, value: jobStats.jobs, label: 'Total Jobs' },
        { icon: BriefcaseBusiness, value: jobStats.completed, label: 'Jobs Completed' },
        { icon: Wallet, value: matePoints, label: 'MatePoints' }
    ];

    const profileMenuItems = [
        { icon: User, label: 'Edit Profile', path: '/edit-profile' },
        
        // Customer-only menu items
        ...(user?.role === 'Customer' ? [{ icon: BriefcaseBusiness, label: 'My Jobs', path: '/my-jobs' }] : []),
        ...(user?.role === 'Customer' ? [{ icon: Wallet, label: 'Wallet & Payments', path: '/wallet' }] : []),
        ...(user?.role === 'Customer' ? [{ icon: Star, label: 'MatePoints & Rewards', path: '/rewards' }] : []),
        ...(user?.role === 'Customer' ? [{ icon: FileText, label: 'Invoices & History', path: '/invoices' }] : []),
        
        // Cleaner-only menu items
        ...(user?.role !== 'Customer' ? [{ icon: ShieldCheck, label: 'Verification & Documents', path: '/verification' }] : []),
        ...(user?.role !== 'Customer' ? [{ icon: DollarSign, label: 'Payments & Payouts', path: '/payments' }] : []),
        ...(user?.role !== 'Customer' ? [{ icon: Star, label: 'Ratings & Reviews', path: '/reviews' }] : []),
        ...(user?.role !== 'Customer' ? [{ icon: MapPin, label: 'Geo-fencing', path: '/set-cleaner-location' }] : []),
        
        // Common menu items for all users
        { icon: Bell, label: 'Notifications Settings', path: '/notifications-settings' },
        { icon: HelpCircle, label: 'Help & Support', path: '/help' },
    ];

    if (loading) {
        return <Loader fullscreen message="Loading profile..." />;
    }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="My Profile"
          onBack={() => navigate(-1)}
          className="h-16"
          titleClassName="text-xl font-semibold text-gray-900"
        />
      </div>

            <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 pt-0! px-4 sm:px-6 lg:px-8">
                {/* Profile and Statistics Container */}
                <div className=" grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6" >
                    {/* Profile Information Card */}
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 relative overflow-hidden flex-1 w-full justify-center items-center">
                        {/* Background Image */}
                        <div
                            className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 bg-cover bg-center bg-no-repeat z-0"
                            style={{ backgroundImage: `url(${ProfileBG})` }}
                        ></div>

                        <div className="relative z-10 flex flex-row items-center space-x-4 sm:space-x-6 lg:space-x-8">
                            {/* Profile Picture */}
                            <div className="relative">
                                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                    {(() => {
                                        const profileImage = user?.profilePhoto?.url || 
                                                           user?.profilePhoto?.secureUrl || 
                                                           user?.profilePicture || 
                                                           userProfile?.user?.profilePhoto?.url ||
                                                           userProfile?.user?.profilePhoto?.secureUrl ||
                                                           userProfile?.profilePicture || 
                                                           userProfile?.profilePhoto?.url || 
                                                           userProfile?.profilePhoto?.secureUrl;
                                        
                                        if (profileImage) {
                                            return (
                                                <img
                                                    src={profileImage}
                                                    alt="Profile"
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            );
                                        } else {
                                            return (
                                                <div className="w-full h-full bg-primary-500 flex items-center justify-center">
                                                    <span className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold">
                                                        {(user?.firstName || user?.name || 'U').charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            );
                                        }
                                    })()}
                                </div>
                                <button
                                    onClick={handleEditProfile}
                                    className="absolute bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors shodw-custom cursor-pointer"
                                >
                                    <Edit className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-primary-500" />
                                </button>
                            </div>

                            {/* User Details */}
                            <div className="flex-1 min-w-0">
                                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-2 sm:mb-3 capitalize">
                                    {userProfile?.firstName || user?.firstName || user?.name || 'User Name'}
                                </h2>

                                <div className="space-y-2 sm:space-y-3">
                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <Mail className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary-200 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm md:text-base text-primary-200 truncate font-medium">
                                            {userProfile?.email || user?.email || 'user@example.com'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-2 sm:space-x-3">
                                        <Phone className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary-200 flex-shrink-0" />
                                        <span className="text-xs sm:text-sm md:text-base text-primary-200 font-medium">
                                            {userProfile?.phone || user?.phone || user?.phoneNumber }
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Card - Only for Customers */}
                    {user?.role === 'Customer' && (
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 flex-1">
                            <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                                {statisticsData.map((stat, index) => {
                                    const IconComponent = stat.icon;
                                    const isLast = index === statisticsData.length - 1;
                                    return (
                                        <div key={index} className={`text-center ${!isLast ? 'border-r border-gray-200' : ''}`}>
                                            <div className="flex justify-center mb-1 sm:mb-2">
                                                <IconComponent className="w-8 h-8 text-[#1F6FEB]" strokeWidth={1} />
                                            </div>
                                            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-primary-500 mb-1">{stat.value}</div>
                                            <div className="text-[10px] sm:text-xs md:text-sm text-primary-200 font-medium">{stat.label}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>



                {/* Navigation Menu */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    {profileMenuItems.map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                            <button
                                key={index}
                                onClick={() => handleNavigation(item.path)}
                                className="w-full flex items-center justify-between p-3 sm:p-4 md:p-6 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer"
                            >
                                <div className="flex items-center space-x-3 sm:space-x-4">                            
                                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500 flex-shrink-0 " strokeWidth={2} />
                                    <span className="text-xs sm:text-sm md:text-base font-medium text-primary-500">
                                        {item.label}
                                    </span>
                                </div>
                                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                            </button>
                        );
                    })}

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-between p-3 sm:p-4 md:p-6 hover:bg-red-50 transition-colors text-red-600 cursor-pointer"
                    >
                        <div className="flex items-center space-x-3 sm:space-x-4">
                            <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm md:text-base font-medium">
                                Logout
                            </span>
                        </div>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" />
                    </button>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50 p-4" 
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
                >
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-auto shadow-custom border border-gray-200">
                        <h2 className="text-xl font-semibold text-primary-500 mb-4 text-center">
                            Logout?
                        </h2>
                        <p className="text-primary-200 font-medium text-center mb-6">
                            Are you sure you want to log out of your account?
                        </p>
                        <div className="flex space-x-3">
                            <Button
                                onClick={cancelLogout}
                                variant="outline"
                                size="md"
                                className="flex-1 bg-[#E5E7EB] hover:bg-gray-300 text-gray-800"
                            >
                                Cancel
                            </Button>
                            <Button 
                                onClick={confirmLogout}
                                size="md"
                                className="flex-1"
                            >
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            )}
    </>
  );
};

export default ProfilePage;
