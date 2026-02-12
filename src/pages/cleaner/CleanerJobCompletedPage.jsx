import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, PageHeader, Loader, JobOverviewCard, CompletionProofSection } from '../../components';
import { jobsAPI, jobPhotosAPI, reviewsAPI } from '../../services/api';
import StarFullIcon from '../../assets/rating.svg';

const resolveImageSrc = (image) => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || image.path || image.secureUrl || '';
};

const CleanerJobCompletedPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customerReview, setCustomerReview] = useState(null);


  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);

        const [jobResponse, photosResponse, reviewResponse] = await Promise.all([
          jobsAPI.getJobById(jobId),
          jobPhotosAPI
            .getJobPhotos(jobId)
            .catch(() => ({ data: { beforePhotos: [], afterPhotos: [] } })),
          reviewsAPI.getMyReviews().catch(() => null),
        ]);

        if (jobResponse.success && jobResponse.data) {
          const job = jobResponse.data;
          const photosData = photosResponse.data || photosResponse;

          if (
            job.status === 'in_progress' ||
            job.status === 'in-progress' ||
            job.status === 'started' ||
            job.status === 'accepted'
          ) {
            navigate(`/cleaner-jobs/${jobId}`, { replace: true });
            return;
          }

          const acceptedQuote = job.quotes?.find((q) => q.status === 'accepted');
          const customer = job.customerId;

          const beforeImages = photosData.beforePhotos || job.beforePhotos || [];
          const afterImages = photosData.afterPhotos || job.afterPhotos || [];
          // Get original job photos (uploaded when job was created)
          const jobPhotos = job.photos || [];

          const transformedData = {
            jobId: job.jobId || job._id,
            title: job.title || job.serviceType,
            serviceType: job.serviceType,
            serviceDetail: job.serviceDetail,
            instructions: job.instructions,
            scheduledDate: job.completedAt || job.scheduledDate,
            frequency: job.frequency || 'One-time',
            location: job.location?.address || job.location?.fullAddress || 'Location not available',
            photos: jobPhotos,
            completionProof: {
              beforeImages,
              afterImages,
            },
            payment: {
              totalPaid: acceptedQuote?.price || job.estimatedPrice || 0,
              paidOnline: acceptedQuote?.price || job.estimatedPrice || 0,
            },
            customerName: customer
              ? `${customer.firstName || ''} ${customer.lastName || ''}`.trim()
              : 'Customer',
          };

          setJobData(transformedData);

          if (reviewResponse && reviewResponse.success && reviewResponse.data) {
            const reviews = reviewResponse.data.reviews || reviewResponse.data;
            const jobReview = Array.isArray(reviews)
              ? reviews.find(
                (r) =>
                  r.jobId === jobId ||
                  r.jobId?._id === jobId ||
                  r.job === jobId ||
                  r.job?._id === jobId ||
                  r.job?.jobId === jobId,
              )
              : null;

            if (jobReview) {
              setCustomerReview(jobReview);
            }
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

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId, navigate]);

  const overviewPhotos = useMemo(() => {
    if (!jobData) return [];
    // Only show original job photos, not completion proof photos
    const jobPhotos = jobData.photos || [];
    return jobPhotos.map(resolveImageSrc).filter(Boolean);
  }, [jobData]);

  if (loading) {
    return <Loader fullscreen message="Loading job details..." />;
  }

  if (error || !jobData) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-12 sm:py-20 px-4">
          <div className="text-sm sm:text-base text-red-500 text-center">{error || 'Job not found'}</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-3 sm:px-4 pb-6">
        <PageHeader
          title="Job Completed"
          onBack={() => {
            const savedTab = localStorage.getItem('cleanerActiveTab');
            navigate('/cleaner-jobs', { state: { tab: savedTab || 'completed' }, replace: true });
          }}
          className="py-2 sm:py-3"
        />

        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-custom mb-4 sm:mb-6">
          <JobOverviewCard
            jobId={jobData.jobId}
            title={jobData.title}
            serviceType={jobData.serviceType}
            serviceDetail={jobData.serviceDetail}
            instructions={jobData.instructions}
            scheduledDate={jobData.completedAt}
            frequency={jobData.frequency}
            location={jobData.location}
            photos={overviewPhotos}
            viewerRole="cleaner"
            roleSections={{}}
            metaInfo={[]}
          />

          {customerReview && (
            <div className="mt-4 sm:mt-6 border border-[#EBF2FD] rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-[#F8FAFF]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 mb-2 sm:mb-3">
                <h3 className="text-base sm:text-lg font-semibold text-primary-500 sm:mr-2">Customer Review:-</h3>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, idx) => (
                    <img
                      key={idx}
                      src={StarFullIcon}
                      alt="Star"
                      className={`w-4 h-4 sm:w-5 sm:h-5 ${idx < (customerReview.rating || 0) ? 'opacity-100' : 'opacity-30'}`}
                    />
                  ))}
                  <span className="text-xs sm:text-sm font-medium text-primary-500">
                    {customerReview.rating || 0}/5
                  </span>
                </div>
              </div>
              {customerReview.feedback && (
                <p className="text-xs sm:text-sm text-primary-500 italic mb-2 sm:mb-3">
                  "{customerReview.feedback}"
                </p>
              )}
              {customerReview.likedAspects?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {customerReview.likedAspects.map((aspect) => (
                    <span
                      key={aspect}
                      className="px-2 sm:px-3 py-0.5 sm:py-1 bg-[#EBF2FD] text-primary-600 text-[10px] sm:text-xs font-medium rounded-full border border-[#9CC0F6]"
                    >
                      {aspect}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-4 sm:mt-6 border border-[#EBF2FD] rounded-xl sm:rounded-2xl p-3 sm:p-4 bg-[#F8FAFF]">
            <h3 className="text-base sm:text-lg font-semibold text-primary-500 mb-2 sm:mb-3">Payment Summary</h3>
            <div className="space-y-1.5 sm:space-y-2">
              <div className="flex flex-col sm:flex-row text-xs sm:text-sm">
                <span className="text-primary-300 font-medium sm:mr-2">Total Amount:-</span>
                <span className="text-primary-500 font-semibold">
                  ${jobData.payment.totalPaid}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row text-xs sm:text-sm">
                <span className="text-primary-300 font-medium sm:mr-2">Paid Online:-</span>
                <span className="text-green-600 font-semibold">
                  ${jobData.payment.paidOnline}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 sm:mt-6">
            <CompletionProofSection
              beforeImages={jobData.completionProof?.beforeImages || []}
              afterImages={jobData.completionProof?.afterImages || []}
            />
          </div>
        </div>

        <div className="flex justify-end mt-4 sm:mt-6">
          <Button onClick={() => navigate('/cleaner-jobs')} className="w-full sm:w-auto">
            Back to My Jobs
          </Button>
        </div>
      </div>
    </>
  )
}

export default CleanerJobCompletedPage;

