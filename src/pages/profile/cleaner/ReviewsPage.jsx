import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button, PageHeader, Loader } from '../../../components';
import StarIcon from '../../../assets/rating.svg';
import { reviewsAPI } from '../../../services/api';

const ReviewsPage = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [overallRating, setOverallRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  // Fetch cleaner's reviews
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await reviewsAPI.getMyReviews();
      
      if (response.success && response.data) {
        const reviewsData = response.data.reviews || response.data || [];
        setReviews(reviewsData);
        
        // Calculate overall rating
        if (reviewsData.length > 0) {
          const totalRating = reviewsData.reduce((sum, review) => sum + (review.rating || 0), 0);
          const averageRating = totalRating / reviewsData.length;
          setOverallRating(Math.round(averageRating * 10) / 10);
          setTotalReviews(reviewsData.length);
        }
      } else {
        setReviews([]);
        setOverallRating(0);
        setTotalReviews(0);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError('Failed to load reviews. Please try again.');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Render star rating
  const renderStars = (rating, size = 'w-4 h-4') => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <img key={i} src={StarIcon} alt="Star" className={`${size} text-yellow-400`} />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <div key={i} className="relative">
            <img src={StarIcon} alt="Star" className={`${size} text-gray-300`} />
            <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
              <img src={StarIcon} alt="Star" className={`${size} text-yellow-400`} />
            </div>
          </div>
        );
      } else {
        stars.push(
          <img key={i} src={StarIcon} alt="Star" className={`${size} text-gray-300`} />
        );
      }
    }
    return stars;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} week${Math.ceil(diffDays / 7) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  // Get customer name
  const getCustomerName = (review) => {
    if (review.customer?.firstName && review.customer?.lastName) {
      return `${review.customer.firstName} ${review.customer.lastName}`;
    }
    if (review.customer?.name) {
      return review.customer.name;
    }
    if (review.customerName) {
      return review.customerName;
    }
    return 'Anonymous Customer';
  };

  // Get customer avatar
  const getCustomerAvatar = (review) => {
    if (review.customer?.profilePhoto?.url) {
      return review.customer.profilePhoto.url;
    }
    if (review.customer?.avatar) {
      return review.customer.avatar;
    }
    if (review.customerAvatar) {
      return review.customerAvatar;
    }
    return null;
  };

  // Get customer initials
  const getCustomerInitials = (review) => {
    const name = getCustomerName(review);
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <>
        <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 py-4">
          <PageHeader
            title="Ratings & Reviews"
            onBack={() => navigate(-1)}
            className="mb-6"
            titleClassName="text-xl font-semibold text-primary-500"
          />
          <Loader message="Loading reviews..." />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 py-4 max-sm:px-3 max-sm:py-3">
        <PageHeader
          title="Ratings & Reviews"
          onBack={() => navigate(-1)}
          className="mb-6 max-sm:mb-4"
          titleClassName="text-xl font-semibold text-primary-500 max-sm:text-lg"
        />

        {/* Overall Rating Card */}
        <div className="bg-white rounded-2xl shadow-custom p-6 mb-6 max-sm:p-4 max-sm:rounded-xl">
          <h2 className="text-lg font-semibold text-primary-500 mb-4 max-sm:text-base max-sm:mb-3">Overall Rating</h2>
          
          <div className="flex items-center gap-4 max-sm:gap-3">
            <div className="flex items-center gap-1">
              {renderStars(overallRating, 'w-6 h-6 max-sm:w-5 max-sm:h-5')}
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-500 max-sm:text-2xl">{overallRating}</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3 max-sm:p-3 max-sm:gap-2">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5 max-sm:w-4 max-sm:h-4" strokeWidth={2} />
            <div>
              <h4 className="text-sm font-medium text-red-800 max-sm:text-xs">Error</h4>
              <p className="text-sm text-red-600 mt-1 max-sm:text-xs">{error}</p>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-custom p-8 text-center max-sm:p-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 max-sm:w-12 max-sm:h-12 max-sm:mb-3">
              <img src={StarIcon} alt="Star" className="w-8 h-8 text-gray-400 max-sm:w-6 max-sm:h-6" />
            </div>
            <h3 className="text-lg font-semibold text-primary-500 mb-2 max-sm:text-base max-sm:mb-1.5">No Reviews Yet</h3>
            <p className="text-primary-200 mb-4 max-sm:text-sm max-sm:mb-3">
              You haven't received any reviews yet. Complete some jobs to start building your reputation!
            </p>
            <Button
              onClick={() => navigate('/cleaner-jobs')}
              size="md"
              className="px-6 max-sm:px-4 max-sm:text-sm"
            >
              View Available Jobs
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-custom p-6 max-sm:p-4 max-sm:rounded-xl">
            <div className="space-y-6 max-sm:space-y-4 ">
              {reviews.map((review, index) => (
                <div key={review._id || review.id || index} className="border-b border-[#F3F3F3] pb-4 max-sm:pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-4 max-sm:gap-3">
                    {/* Customer Avatar */}
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 max-sm:w-10 max-sm:h-10">
                      {getCustomerAvatar(review) ? (
                        <img 
                          src={getCustomerAvatar(review)} 
                          alt="Customer" 
                          className="w-12 h-12 rounded-full object-cover max-sm:w-10 max-sm:h-10"
                        />
                      ) : (
                        <span className="text-sm font-semibold text-primary-500 max-sm:text-xs">
                          {getCustomerInitials(review)}
                        </span>
                      )}
                    </div>

                    {/* Review Content */}
                    <div className="flex-1">
                      <div className="flex items-center  mb-2 max-sm:mb-1.5">
                        <h4 className="font-semibold text-primary-500 text-lg max-sm:text-sm">
                          {getCustomerName(review)}
                        </h4>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3 max-sm:gap-1.5 max-sm:mb-2 max-sm:flex-wrap">
                        <div className="flex items-center gap-1 max-sm:gap-0.5">
                          {renderStars(review.rating || 0, 'w-4 h-4 max-sm:w-3.5 max-sm:h-3.5')}
                        </div>
                        <span className="text-base font-semibold text-primary-500 font-medium max-sm:text-xs">
                          {review.rating || 0}
                        </span>
                        <span className="text-sm text-primary-200 font-medium w-1 h-1 rounded-full bg-[#6B7280] max-sm:w-0.5 max-sm:h-0.5">
                          
                        </span>
                        <span className="text-base text-primary-200 font-medium max-sm:text-xs">
                          {formatDate(review.createdAt || review.timestamp)}
                        </span>
                      </div>

                      {/* Review Text */}
                      {review.comment && (
                        <p className="text-primary-500 mb-3 text-base leading-relaxed max-sm:text-sm max-sm:mb-2">
                          "{review.comment}"
                        </p>
                      )}

                      {/* Feedback */}
                      {review.feedback && (
                        <div className="mb-3 max-sm:mb-2">
                          <p className="text-base text-primary-200 font-medium italic leading-relaxed max-sm:text-xs">
                            "{review.feedback}"
                          </p>
                        </div>
                      )}

                      {/* Liked Aspects */}
                      {review.likedAspects && review.likedAspects.length > 0 && (
                        <div className="mb-3 max-sm:mb-2">
                          <div className="flex flex-wrap gap-2 max-sm:gap-1.5">
                            {review.likedAspects.map((aspect, aspectIndex) => (
                              <span 
                                key={aspectIndex}
                                className="px-3 py-1.5 bg-[#EBF2FD] text-primary-600 text-sm font-medium rounded-full border border-[#9CC0F6] max-sm:px-2 max-sm:py-0.5 max-sm:text-[10px]"
                              >
                                {aspect}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tags */}
                      {review.tags && review.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 max-sm:gap-1.5">
                          {review.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full max-sm:px-2 max-sm:py-0.5 max-sm:text-[10px]"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default ReviewsPage;
