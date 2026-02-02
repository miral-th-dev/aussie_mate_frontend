import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Check, UserRound, X } from 'lucide-react';
import { Button, PageHeader, Loader, JobOverviewCard, CompletionProofSection } from '../../components';
import RatingIcon from '../../assets/rating.svg';
import Rating2Icon from '../../assets/rating2.svg';
import PdfIcon from '../../assets/pdf.svg';
import DownloadIcon from '../../assets/download.svg';
import GoldBadgeIcon from '../../assets/goldBadge.svg';
import SilverBadgeIcon from '../../assets/silverBadge.svg';
import BronzeBadgeIcon from '../../assets/bronzeBadge.svg';
import { jobsAPI, jobPhotosAPI, jobDetailsAPI, reviewsAPI } from '../../services/api';
import { handleAPIError } from '../../services/api';

const JobDetailsCompletedPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [selectedRating, setSelectedRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [invoiceData, setInvoiceData] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [completingJob, setCompletingJob] = useState(false);

  const resolveImageSrc = (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url || image.path || image.secureUrl || '';
  };

  const overviewPhotos = useMemo(() => {
    if (!jobData) return [];
    // Only show original job photos, not completion proof photos
    const jobPhotos = jobData.photos || [];
    return jobPhotos.map(resolveImageSrc).filter(Boolean);
  }, [jobData]);


  const feedbackTags = [
    'Punctual', 'Professional', 'Quality Work', 'Friendly', 'Good Communication'
  ];

  const handleTagSelect = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Fetch job details and invoice data
  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch job details and photos in parallel
        const [jobResponse, photosResponse] = await Promise.all([
          jobsAPI.getJobById(jobId),
          jobPhotosAPI.getJobPhotos(jobId).catch(() => ({ data: { beforePhotos: [], afterPhotos: [] } }))
        ]);
        
        if (jobResponse.success && jobResponse.data) {
          const job = jobResponse.data;
          const photosData = photosResponse.data || photosResponse;
          
          // Transform job data to match expected format
          const acceptedQuote = job.quotes?.find(q => q.status === 'accepted');
          // Use completedBy if it's an object, otherwise try acceptedQuote cleanerId
          const cleaner = (job.completedBy && typeof job.completedBy === 'object') 
            ? job.completedBy 
            : (acceptedQuote?.cleanerId && typeof acceptedQuote.cleanerId === 'object')
              ? acceptedQuote.cleanerId
              : null;
          
          // Get photos from multiple possible sources
          const beforeImages = photosData.beforePhotos || job.beforePhotos || [];
          const afterImages = photosData.afterPhotos || job.afterPhotos || [];
          // Get original job photos
          const jobPhotos = job.photos || [];
          
          const transformedData = {
            jobId: job.jobId || job._id,
            title: job.title || job.serviceTypeDisplay || job.serviceType,
            serviceType: job.serviceTypeDisplay || job.serviceType || job.category || job.service || '',
            serviceDetail: job.serviceDetail || job.selectedServiceDetail || job.serviceName || job.title || '',
            instructions: job.specialInstructions || job.instructions || job.additionalNotes || '',
            frequency: job.frequency || job.recurringFrequency || job.schedule?.frequency || '',
            status: job.status || 'Completed',
            completedAt: job.completedAt ? new Date(job.completedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : 'Recently',
            location: job.location?.address || job.location?.fullAddress || 'Location',
            photos: jobPhotos,
            cleaner: {
              id: cleaner?._id || cleaner?.id || 'N/A',
              name: cleaner ? `${cleaner.firstName || ''} ${cleaner.lastName || ''}`.trim() : 'Cleaner',
              rating: cleaner?.averageRating !== undefined ? cleaner.averageRating : (cleaner?.rating || 0),
              tier: cleaner?.tier || 'none'
            },
            payment: {
              totalPaid: acceptedQuote?.price || job.estimatedPrice || 0,
              paidOnline: Math.round((acceptedQuote?.price || job.estimatedPrice || 0) * 0.1),
              cashToPay: Math.round((acceptedQuote?.price || job.estimatedPrice || 0) * 0.9),
              mode: job.paymentMethod || 'Cash'
            },
            completionProof: {
              beforeImages: beforeImages,
              afterImages: afterImages
            }
          };
          
          setJobData(transformedData);
          
          // Check if review already exists
          // First check localStorage for recently submitted review
          const recentReviewKey = `review_${jobId}`;
          const recentReview = localStorage.getItem(recentReviewKey);
          if (recentReview) {
            try {
              const reviewData = JSON.parse(recentReview);
              setHasReviewed(true);
              setExistingReview(reviewData);
              setSelectedRating(reviewData.rating || 0);
              setSelectedTags(reviewData.tags || reviewData.likedAspects || []);
              setFeedback(reviewData.feedback || '');
            } catch (e) {
              // Error parsing localStorage review
            }
          }
          
          try {
            const reviewStatusResponse = await reviewsAPI.checkReviewStatus(jobId);
            
            if (reviewStatusResponse.success && reviewStatusResponse.data) {
              const reviewData = reviewStatusResponse.data;
              
              if (reviewData.hasReviewed || reviewData.existingReview || reviewData.review || reviewData.rating || reviewData.likedAspects) {
                // Extract review data from different possible structures
                const actualReview = reviewData.existingReview || reviewData.review || reviewData;
                
                // Try multiple field names for each data type
                const rating = actualReview.rating || reviewData.rating || actualReview.starRating || reviewData.starRating || 0;
                const tags = actualReview.likedAspects || actualReview.tags || reviewData.tags || reviewData.likedAspects || [];
                const feedbackText = actualReview.feedback || reviewData.feedback || actualReview.comment || reviewData.comment || '';
                
                // Only set hasReviewed to true if we actually have meaningful data
                if (rating > 0 || tags.length > 0 || feedbackText.trim() !== '') {
                  setHasReviewed(true);
                  setExistingReview(actualReview);
                  setSelectedRating(rating);
                  setSelectedTags(tags);
                  setFeedback(feedbackText);
                } else {
                  setHasReviewed(false);
                }
              } else {
                setHasReviewed(false);
              }
            }
          } catch (reviewError) {
            // Try alternative approach - check if we can get review directly
            try {
              const directReviewResponse = await reviewsAPI.getCustomerReviews();
              if (directReviewResponse.success && directReviewResponse.data) {
                // Find review for this specific job
                const reviewForThisJob = directReviewResponse.data.reviews?.find(r => r.jobId === jobId);
                if (reviewForThisJob) {
                  setHasReviewed(true);
                  setExistingReview(reviewForThisJob);
                  setSelectedRating(reviewForThisJob.rating || 0);
                  setSelectedTags(reviewForThisJob.likedAspects || reviewForThisJob.tags || []);
                  setFeedback(reviewForThisJob.feedback || '');
                }
              }
            } catch (directError) {
              // Direct review fetch failed
            }
          }
          
          // Fetch invoice data if available
          try {
            const invoiceResponse = await jobDetailsAPI.getStripeInvoice(jobId);
            if (invoiceResponse.success) {
              setInvoiceData(invoiceResponse.data);
            }
          } catch (invoiceError) {
            // Invoice not available
          }
        }
      } catch (error) {
        setError(handleAPIError(error));
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  const handleSubmitReview = async () => {
    if (!selectedRating) {
      setErrorMessage('Please select a rating before submitting');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    try {
      setSubmittingReview(true);
      setErrorMessage(null);
      
      const response = await reviewsAPI.createReview(
        jobId,
        selectedRating,
        selectedTags,
        feedback
      );

      if (response.success) {
        const reviewData = {
          rating: selectedRating,
          tags: selectedTags,
          feedback: feedback,
          submittedAt: new Date().toISOString()
        };
        
        setHasReviewed(true);
        setExistingReview(reviewData);
        
        // Store in localStorage for immediate display
        const recentReviewKey = `review_${jobId}`;
        localStorage.setItem(recentReviewKey, JSON.stringify(reviewData));
        
        setSuccessMessage('Review submitted successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (error) {
      setErrorMessage(handleAPIError(error));
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCompleteJob = async () => {
    try {
      setCompletingJob(true);
      setErrorMessage(null);
      
      // Update job status to completed
      const response = await jobsAPI.updateJobStatus(jobId, 'completed');
      
      if (response.success) {
        // Update local job data status
        setJobData(prev => ({
          ...prev,
          status: 'completed'
        }));
        
        setSuccessMessage('Job marked as completed! You can now review your cleaner.');
        setTimeout(() => setSuccessMessage(null), 3000);
        
        // Refresh job data to get updated status
        const jobResponse = await jobsAPI.getJobById(jobId);
        if (jobResponse.success && jobResponse.data) {
          const job = jobResponse.data;
          setJobData(prev => ({
            ...prev,
            status: job.status || 'completed',
            completedAt: job.completedAt ? new Date(job.completedAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }) : new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          }));
        }
      } else {
        setErrorMessage(response.message || 'Failed to complete job. Please try again.');
        setTimeout(() => setErrorMessage(null), 5000);
      }
    } catch (error) {
      setErrorMessage(handleAPIError(error));
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setCompletingJob(false);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!invoiceData) {
      setErrorMessage('Invoice not available');
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    try {
      const blob = await jobDetailsAPI.downloadInvoice(jobId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_${jobId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('Invoice downloaded successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      setErrorMessage(handleAPIError(error));
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  if (loading) {
    return <Loader fullscreen message="Loading job details..." />;
  }

  if (error) {
    return (
      <>
        <div className="max-w-7xl mx-auto min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">{error}</div>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </>
    );
  }

  if (!jobData) {
    return (
      <>
        <div className="max-w-7xl mx-auto min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg text-gray-600">Job not found</div>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto min-h-screen">
        <PageHeader title={`Job #${jobData.jobId} - ${jobData.title}`} className="py-3 pl-3" />

        {/* Success Message */}
        {successMessage && (
          <div className="mx-4 mt-2 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 text-white" strokeWidth={2} />
            </div>
            <p className="text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="mx-4 mt-2 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <X className="w-3 h-3 text-white" strokeWidth={2} />
            </div>
            <p className="text-red-700 font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Completed Banner */}
        <div className="bg-green-500 border border-green-500 px-4 py-2 mx-4 mt-2 rounded-xl">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#1EB154] rounded-full mr-3"></div>
            <span className="text-green-500 font-medium">
              Completed on 
            </span>
          </div>
        </div>

        {/* Cleaner Info Card */}
        <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              <UserRound className="w-6 h-6 text-gray-400" strokeWidth={2} />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-primary-500">Cleaner #{jobData.cleaner.id}</h3>
              </div>
              
              <div className="flex items-center mt-1 space-x-2">
                <div className="flex items-center space-x-1 bg-[#FFF2DE] px-2 py-1 rounded-full" >
                  <img src={RatingIcon} alt="Rating" className="w-4 h-4" />
                  <span className="text-sm font-medium text-primary-500 font-medium">{jobData.cleaner.rating}</span>
                </div>
                {jobData.cleaner.tier && jobData.cleaner.tier !== 'none' && (
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-full border ${
                    jobData.cleaner.tier === 'gold' 
                      ? 'bg-gradient-to-r from-white to-[#FFDBAE] border-[#FFDBAE]'
                      : jobData.cleaner.tier === 'silver'
                      ? 'bg-gradient-to-r from-white to-[#E9E9E9] border-primary-200'
                      : jobData.cleaner.tier === 'bronze'
                      ? 'bg-gradient-to-r from-white to-[#D4A574] border-[#CD7F32]'
                      : 'bg-gradient-to-r from-white to-gray-200 border-gray-300'
                  }`}>
                    <img 
                      src={
                        jobData.cleaner.tier === 'gold' 
                          ? GoldBadgeIcon 
                          : jobData.cleaner.tier === 'silver'
                          ? SilverBadgeIcon
                          : BronzeBadgeIcon
                      } 
                      alt="Badge" 
                      className="w-5 h-5" 
                    />
                    <span className="text-sm text-primary-500 font-medium ml-1 capitalize">{jobData.cleaner.tier} Tier</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-4 mt-4">
          <JobOverviewCard
            jobId={jobData.jobId}
            title={jobData.title}
            serviceType={jobData.serviceType}
            serviceDetail={jobData.serviceDetail}
            instructions={jobData.instructions}
            scheduledDate={jobData.completedAt}
            frequency={jobData.frequency || jobData.serviceFrequency || ''}
            location={jobData.location}
            photos={overviewPhotos}
            viewerRole="customer"
          />
        </div>

        {/* Payment Info */}
        <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="">
            <h4 className="font-semibold text-primary-500 mb-1">Payment Summary</h4>
            <div className="">
              <div className="flex ">
                <span className="text-primary-200 font-medium mr-2">Total Paid:</span>
                <span className="font-bold text-primary-600">${jobData.payment.totalPaid}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice */}
        {invoiceData && (
          <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-primary-200 font-medium mr-2">Invoice:</span>
                <img src={PdfIcon} alt="PDF" className="w-5 h-5 mr-2" />
                <span className="text-gray-700">Invoice_{jobData.jobId}.pdf</span>
              </div>
              <button 
                onClick={handleDownloadInvoice}
                className="cursor-pointer hover:opacity-75"
              >
                <img src={DownloadIcon} alt="Download" className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            {/* Stripe Invoice Status */}
            <div className="mt-2 text-xs text-gray-500">
              Status: <span className={`font-medium ${
                invoiceData.status === 'paid' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {invoiceData.status?.toUpperCase()}
              </span>
            </div>
          </div>
        )}

        {/* Completion Proof */}
        <div className="mx-4 mt-4">
          <CompletionProofSection
            beforeImages={jobData.completionProof?.beforeImages || []}
            afterImages={jobData.completionProof?.afterImages || []}
          />
        </div>

        {/* Complete Job Button - Show if job is not completed yet */}
        {jobData.status?.toLowerCase() !== 'completed' && jobData.status !== 'Completed' && (
          <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col items-center justify-center py-4">
              <p className="text-primary-500 font-semibold mb-4 text-center">
                Has your cleaner completed the job?
              </p>
              <Button
                onClick={handleCompleteJob}
                disabled={completingJob}
                size="lg"
              >
                {completingJob ? 'Completing...' : 'Mark Job as Completed'}
              </Button>
            </div>
          </div>
        )}

        {/* Rate Your Cleaner / Review Section - Only show if job is completed */}
        {(jobData.status?.toLowerCase() === 'completed' || jobData.status === 'Completed') && (
          <div className="bg-white mx-4 mt-4 p-4 rounded-2xl shadow-sm border border-gray-100 mb-6">
            {hasReviewed ? (
            // Show existing review
            <>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-primary-500">Your Review</h3>
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-green-50 text-green-600 border border-green-200">
                   Submitted
                </span>
              </div>
              
              
              
              {/* Star Rating - Display Only */}
              <div className="flex space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <img 
                    key={star}
                    src={star <= selectedRating ? RatingIcon : Rating2Icon} 
                    alt={`Star ${star}`} 
                    className="w-8 h-8"
                  />
                ))}
              </div>
              
              {/* Selected Tags - Display Only */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">What you liked:</p>
                {selectedTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-sm font-medium bg-[#EBF2FD] text-primary-600 border border-[#9CC0F6]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No specific aspects selected</p>
                )}
              </div>
              
              {/* Feedback - Display Only */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Your feedback:</p>
                {feedback ? (
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-700">{feedback}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No additional feedback provided</p>
                )}
              </div>
              
              {/* Go to Dashboard Button */}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={() => navigate('/customer-dashboard')}
                  variant="primary"
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          ) : (
            // Show review form
            <>
              <h3 className="font-semibold text-primary-500 mb-1">Rate Your Cleaner</h3>
              
              {/* Star Rating */}
              <div className="flex space-x-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setSelectedRating(star)}
                    className="focus:outline-none cursor-pointer" 
                  >
                    <img 
                      src={star <= selectedRating ? RatingIcon : Rating2Icon} 
                      alt={`Star ${star}`} 
                      className="w-8 h-8"
                    />
                  </button>
                ))}
              </div>
              
              {/* Feedback Question */}
              <p className="text-gray-700 mb-3">What did you like about your cleaner?</p>
              
              {/* Feedback Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {feedbackTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors cursor-pointer ${
                      selectedTags.includes(tag)
                        ? 'bg-[#EBF2FD] text-primary-600 border border-[#9CC0F6]'
                        : 'bg-[#F9FAFB] text-[#374151] border border-primary-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              {/* Feedback Text Area */}
              <div className="text-primary-500 font-semibold text-sm mb-1"> Anything specific we should know? <span className="text-primary-200 font-medium text-sm">(Optional)</span></div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write your feedback here..."
                className="w-full p-3 border border-primary-200 rounded-xl! resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
              
              {/* Submit Button */}
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleSubmitReview}
                  disabled={submittingReview || !selectedRating}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </>
          )}
          </div>
        )}
      </div>
    </>
  );
};

export default JobDetailsCompletedPage;
