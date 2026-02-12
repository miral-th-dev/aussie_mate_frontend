import React, { useMemo, useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import { CalendarDays, ChevronLeft, ChevronRight, MapPin, BriefcaseBusiness, Calendar } from 'lucide-react'
import { Button, Loader } from '../../components'
import { useAuth } from '../../contexts/AuthContext'
import { jobsAPI, authAPI } from '../../services/api'
import { getStatusColors } from '../../utils/statusUtils'
import CleanerBG from '../../assets/cleanerBG.jpg'
import BoldJobIcon from '../../assets/boldJob.svg'
import Coin3 from '../../assets/coin3.svg'

const CleanerDashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isAvailable, setIsAvailable] = useState(true);
  const swiperRef = useRef(null);
  const [activeJobs, setActiveJobs] = useState([])
  const [completedJobs, setCompletedJobs] = useState([])
  const [liveJobsCount, setLiveJobsCount] = useState(0)
  const [stats, setStats] = useState({ weeklyEarnings: 0, completedJobs: 0 })
  const [loadingDashboard, setLoadingDashboard] = useState(false)
  const [dashboardError, setDashboardError] = useState('')

  const formatLabel = (str) =>
    (str || "")
      .toString()
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase());


  const formatCurrency = (value) => {
    const amount = Number(value)
    if (Number.isNaN(amount)) return '$0'
    return `$${Math.round(amount).toLocaleString('en-AU')}`
  }

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

  useEffect(() => {
    if (user && typeof user.isAvailable === 'boolean') {
      setIsAvailable(user.isAvailable)
    } else if (user && typeof user.isActive === 'boolean') {
      setIsAvailable(user.isActive)
    }
  }, [user])

  const liveJobsLabel = loadingDashboard
    ? 'Loading...'
    : `${liveJobsCount || 0} ${liveJobsCount === 1 ? 'Job' : 'Jobs'} Found`;

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        setActiveJobs([])
        setCompletedJobs([])
        setLiveJobsCount(0)
        setStats({ weeklyEarnings: 0, completedJobs: 0 })
        setLoadingDashboard(false)
        return
      }

      setLoadingDashboard(true)
      setDashboardError('')

      const cleanerId = (user.id || user._id || '').toString()

      const extractJobs = (response) => response?.data?.jobs || response?.data || []

      // Checks if ANY cleanerId inside job matches logged-in cleaner
      const doesJobBelongToCleaner = (job, cleanerId) => {
        if (!cleanerId) return false;

        const jobString = JSON.stringify(job);
        return jobString.includes(cleanerId);
      };


      const buildJobTitle = (job) =>
        job.title ||
        job.jobTitle ||
        (job.serviceTypeDisplay ? `${job.serviceTypeDisplay}${job.propertyType ? ` – ${formatLabel(job.propertyType)}` : ''}` : `${formatLabel(job.serviceType)} – ${formatLabel(job.propertyType)}`) ||
        "Job Detail";

      const getJobIdentifier = (job) =>
        job.jobId ||
        job._id ||
        job.id ||
        job.referenceId ||
        "Unknown Job";

      const getJobPrice = (job) =>
        Number(
          [
            job?.budget?.total,
            job?.paymentDetails?.totalAmount,
            job?.paymentSummary?.total,
            job?.quoteAmount,
            job?.quotedAmount,
            job?.quotedPrice,
            job?.price,
            job?.budget
          ].find(v => v !== undefined)
        ) || 0;


      const getJobNote = (job) => {
        if (job.paymentStatus) return formatLabel(job.paymentStatus)
        if (job.payoutStatus) return formatLabel(job.payoutStatus)
        if (job.quoteStatus) return formatLabel(job.quoteStatus)
        if (job.statusNote) return formatLabel(job.statusNote)
        if (job.note) return formatLabel(job.note)
        return ''
      }

      const getJobLocation = (job) => {
        if (job.location?.fullAddress) {
          return job.location.fullAddress;
        }
        if (job.location?.address) {
          return job.location.address;
        }
        if (job.address) {
          return job.address;
        }
        return 'Location not specified'
      }

      const getJobDate = (job) => {
        // Prefer scheduledDate, fallback to createdAt
        const dateToUse = job.scheduledDate || job.createdAt || job.updatedAt;
        if (!dateToUse) return 'Date not specified';

        try {
          const date = new Date(dateToUse);
          if (Number.isNaN(date.getTime())) return 'Date not specified';

          const day = date.getDate().toString().padStart(2, '0');
          const month = date.toLocaleDateString('en-AU', { month: 'short' });
          const year = date.getFullYear();

          return `${day} ${month} ${year}`;
        } catch (error) {
          return 'Date not specified';
        }
      }

      const getAcceptedQuotePrice = (job, cleanerId) => {
        if (!job.quotes || !Array.isArray(job.quotes) || !cleanerId) return null;

        // Find accepted quote for this cleaner
        const acceptedQuote = job.quotes.find(quote => {
          const quoteCleanerId = quote.cleanerId?._id || quote.cleanerId?.id || quote.cleanerId;
          const isMyQuote = quoteCleanerId?.toString() === cleanerId.toString();
          const isAccepted = quote.status === 'accepted';
          return isMyQuote && isAccepted;
        });

        if (acceptedQuote) {
          return acceptedQuote.price || acceptedQuote.quoteAmount || acceptedQuote.amount || null;
        }

        return null;
      }

      const getStatusRaw = (job) =>
        job.status ||
        job.jobStatus ||
        job.currentStatus ||
        job.state ||
        job.assignmentStatus ||
        ''

      const normalizeStatus = (status) => (status || '').toString().toLowerCase().trim()

      const inProgressStatuses = new Set([
        'in_progress',
        'in progress',
        'in-progress',
        'accepted',
        'pending_customer_confirmation',
      ])

      const completedStatuses = new Set(['completed'])

      try {
        // Fetch current user details to get the most accurate completedJobs count
        const profileResponse = await authAPI.getCurrentUser().catch(() => null);
        const freshUser = profileResponse?.data?.user || profileResponse?.user || (profileResponse?.success ? profileResponse.data : null);

        const allJobsResponse = await jobsAPI.getAllJobs({ page: 1, limit: 200 }).catch(() => null)
        const allJobs = extractJobs(allJobsResponse)

        const inProgressJobs = allJobs
          .filter((job) => doesJobBelongToCleaner(job, cleanerId))
          .filter((job) => inProgressStatuses.has(normalizeStatus(getStatusRaw(job))))
          .filter(
            (job, index, self) =>
              getJobIdentifier(job) &&
              index ===
              self.findIndex(
                (other) => getJobIdentifier(other)?.toString() === getJobIdentifier(job)?.toString()
              )
          )
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.completedAt || b.createdAt || 0) -
              new Date(a.updatedAt || a.completedAt || a.createdAt || 0)
          )

        const formattedActiveJobs = inProgressJobs.slice(0, 12).map((job) => {
          const statusRaw = getStatusRaw(job)
          const quotePrice = getAcceptedQuotePrice(job, cleanerId);
          const jobLocation = getJobLocation(job);
          const jobDate = getJobDate(job);

          return {
            id: getJobIdentifier(job),
            rawId: job._id || job.id || job.jobId,
            title: buildJobTitle(job),
            status: formatLabel(statusRaw || 'In Progress'),
            statusRaw,
            price: getJobPrice(job),
            quotePrice: quotePrice, // Quote price for in-progress jobs
            location: jobLocation,
            date: jobDate,
            note: getJobNote(job),
          }
        })

        setActiveJobs(formattedActiveJobs)

        const completedJobEntries = allJobs
          .filter((job) => doesJobBelongToCleaner(job, cleanerId))
          .filter((job) => completedStatuses.has(normalizeStatus(getStatusRaw(job))))
          .filter((job, index, self) => {
            const id = getJobIdentifier(job)
            return id && index === self.findIndex((other) => getJobIdentifier(other) === id)
          })
          .sort(
            (a, b) =>
              new Date(b.completedAt || b.updatedAt || b.createdAt || 0) -
              new Date(a.completedAt || a.updatedAt || a.createdAt || 0)
          )

        const formattedCompletedJobs = completedJobEntries.slice(0, 12).map((job) => ({
          id: getJobIdentifier(job),
          rawId: job._id || job.id || job.jobId,
          title: buildJobTitle(job),
          price: getJobPrice(job),
          location: getJobLocation(job),
          date: getJobDate(job),
          completedAt: job.completedAt || job.updatedAt || job.createdAt || null,
          note: getJobNote(job),
          status: 'Completed',
          statusRaw: 'completed',
        }))

        setCompletedJobs(formattedCompletedJobs)

        const liveStatuses = new Set(['posted', 'quoted'])
        const liveJobs = allJobs
          .filter((job) => !doesJobBelongToCleaner(job, cleanerId))
          .filter((job) => liveStatuses.has(normalizeStatus(getStatusRaw(job))))
        setLiveJobsCount(liveJobs.length)

        const recentCompleted = completedJobEntries.filter((job) => {
          const completedAt = new Date(job.completedAt || job.updatedAt || job.createdAt || 0)
          if (Number.isNaN(completedAt.getTime())) return false
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
          return completedAt.getTime() >= sevenDaysAgo
        })

        const fallbackWeeklyEarnings = recentCompleted.reduce(
          (total, job) => total + getJobPrice(job),
          0
        )

        setStats({
          weeklyEarnings: fallbackWeeklyEarnings,
          completedJobs: freshUser?.completedJobs ?? user?.completedJobs ?? completedJobEntries.length ?? 0,
        })
      } catch (error) {
        setDashboardError(error.message || 'Failed to load dashboard data.')
      } finally {
        setLoadingDashboard(false)
      }
    }

    fetchDashboardData()
  }, [user])

  const handleJobClick = (job) => {
    const status = (job.statusRaw || job.status || '').toLowerCase().trim()
    const jobIdentifier = job.rawId || job.id

    if (!jobIdentifier) {
      navigate('/cleaner-jobs')
      return
    }

    if (status === 'completed') {
      navigate(`/cleaner-job-completed/${jobIdentifier}`)
    } else if (['in_progress', 'in progress', 'in-progress'].includes(status)) {
      navigate(`/in-progress-job/${jobIdentifier}`)
    } else {
      navigate(`/job-details/${jobIdentifier}`)
    }
  }

  const greetingName = useMemo(() => {
    const name = user?.firstName || user?.name || ''
    return name ? formatLabel(name) : 'Cleaner'
  }, [user])

  const swiperJobs = useMemo(() => {
    if (activeJobs.length === 0 && completedJobs.length === 0) return []
    return [...activeJobs, ...completedJobs]
  }, [activeJobs, completedJobs])

  return (
    <div className='pb-6'>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Greeting + Availability */}
        <div className="flex flex-row sm:items-center justify-between pt-3 sm:pt-4 gap-3 sm:gap-0">
          <div>
            <h2 className="text-lg sm:text-[22px] md:text-2xl lg:text-3xl font-bold text-primary-500 leading-tight">Hi, {greetingName}</h2>
            <p className="text-xs sm:text-sm text-primary-200 font-medium">Welcome back</p>
          </div>
        </div>

        {/* Earnings Card */}
        <div className="mt-3 sm:mt-4 shadow-custom rounded-2xl">
          <div className="relative rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img src={CleanerBG} alt="Cleaner Background" className="w-full h-full object-cover" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 p-2 sm:p-3">
              <p className="text-xs sm:text-sm md:text-lg lg:text-xl text-[#374151]">Earnings This Week</p>
              <div className="flex items-end justify-between mt-1">
                <div>
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary-500 mb-1 sm:mb-2">
                    {formatCurrency(stats.weeklyEarnings)}
                  </div>
                  <div className="text-xs sm:text-sm md:text-base text-primary-200 font-medium">
                    {stats.completedJobs || 0} {stats.completedJobs === 1 ? 'job' : 'jobs'} completed
                  </div>
                  <button onClick={() => navigate('/earnings')} className="text-primary-500 text-xs sm:text-sm md:text-base font-semibold mt-1 sm:mt-2 cursor-pointer">
                    View Earnings
                    <span className="inline-block ml-1">→</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Coin3 image positioned at bottom right */}
            <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-10">
              <img src={Coin3} alt="coins" className="w-12 h-10 sm:w-14 sm:h-14 md:w-20 md:h-20 lg:w-36 lg:h-36" />
            </div>
          </div>
        </div>

        {/* Live jobs near you */}
        <div className="mt-3 sm:mt-4 bg-white rounded-2xl border-[#F3F3F3] p-3 sm:p-4 shadow-custom">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-primary-50 flex items-center justify-center">
                <img src={BoldJobIcon} alt="jobs" className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-10" />
              </div>
              <span className="ml-2 text-xs sm:text-sm md:text-xl text-primary-500 font-medium">Live Jobs near you</span>
            </div>
            <button
              onClick={() => navigate('/cleaner-jobs', { state: { tab: 'live-jobs' } })}
              className="text-xs sm:text-sm md:text-lg text-primary-600 font-medium flex items-center cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-primary-500 mr-2"></span> {liveJobsLabel}</button>
          </div>
        </div>

        {/* Active Jobs */}
        <div className="mt-3 sm:mt-4 md:mt-5 bg-white rounded-2xl border-[#F3F3F3] p-2 sm:p-3 md:p-4 lg:p-5 shadow-custom">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 sm:mb-3 md:mb-4 gap-2 sm:gap-3 md:gap-0">
            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-primary-500">Your Active Jobs</h3>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between sm:justify-end space-x-2">
              <Button
                onClick={() => navigate('/cleaner-jobs', { state: { tab: 'accepted' } })}
                size="sm"
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium text-xs sm:text-sm rounded-full px-2 flex items-center justify-center space-x-1"
                icon={
                  <BriefcaseBusiness className="w-3 h-3 sm:w-4 sm:h-4 md:w-4 md:h-4" strokeWidth={2} />
                }
              >
                <span className="hidden sm:inline">View Jobs</span>
                <span className="sm:hidden">Jobs</span>
              </Button>

              <div className="flex space-x-1 sm:space-x-2">
                <Button
                  onClick={goToPrev}
                  variant="ghost"
                  size="xs"
                  className="rounded-full p-1 sm:p-1.5 md:p-2"
                  icon={<ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" strokeWidth={2} />}
                />

                <Button
                  onClick={goToNext}
                  variant="ghost"
                  size="xs"
                  className="rounded-full p-1 sm:p-1.5 md:p-2"
                  icon={<ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gray-600" strokeWidth={2} />}
                />
              </div>
            </div>
          </div>

          {dashboardError && (
            <div className="mt-3 text-sm text-red-500 font-medium">{dashboardError}</div>
          )}

          {loadingDashboard ? (
            <div className="py-8 flex justify-center">
              <Loader message="Loading your jobs..." />
            </div>
          ) : swiperJobs.length > 0 ? (
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
              loop={swiperJobs.length > 1}
              className="!pb-4 mt-3"
            >
              {swiperJobs.map((job, index) => (
                <SwiperSlide key={`job-${job.id || index}`}>
                  <div
                    className="bg-white rounded-2xl border border-[#F3F3F3] p-3 sm:p-4 md:p-5 shadow-custom min-h-[180px] sm:min-h-[200px] cursor-pointer hover:border-primary-300 transition-colors"
                    onClick={() => handleJobClick(job)}
                  >
                    <div className="flex flex-col justify-between h-full">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs sm:text-sm text-primary-200 font-medium truncate">#{job.id}</span>
                          {(() => {
                            const statusColors = getStatusColors(job.statusRaw || job.status)
                            return (
                              <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${statusColors.bg} ${statusColors.text} ${statusColors.border} flex-shrink-0 ml-2`}>
                                {job.status}
                              </span>
                            )
                          })()}
                        </div>
                        <div className="text-primary-500 font-semibold text-sm sm:text-base mb-2 line-clamp-2 capitalize">
                          {job.title}
                        </div>
                        <div className="flex items-start text-primary-200 font-medium text-xs sm:text-sm mb-1.5">
                          <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 mt-0.5" strokeWidth={2} />
                          <span className="line-clamp-2 leading-relaxed">{job.location || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center text-primary-200 font-medium text-xs sm:text-sm mb-2">
                          <Calendar className="w-4 h-4 mr-1.5 flex-shrink-0" strokeWidth={2} />
                          <span>{job.date || 'Date not specified'}</span>
                        </div>
                        {/* Show quote price for in-progress jobs */}
                        {job.statusRaw && (job.statusRaw.toLowerCase() === 'in_progress' || job.statusRaw.toLowerCase() === 'in progress' || job.statusRaw.toLowerCase() === 'in-progress' || job.statusRaw.toLowerCase() === 'accepted') && job.quotePrice && (
                          <div className="text-primary-500 font-bold text-sm sm:text-base mt-1">
                            {formatCurrency(job.quotePrice)}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        className="mt-2 py-2 rounded-xl border border-primary-300 text-primary-600 font-medium hover:bg-primary-50 shadow-custom text-xs sm:text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJobClick(job);
                        }}
                      >
                        {((job.statusRaw || job.status || '').toLowerCase() === 'completed') ? 'View Summary' : 'Open Job'}
                      </Button>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="py-8 text-center text-primary-200 font-medium text-sm sm:text-base">
              No active jobs right now. Explore live jobs to get started.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CleanerDashboard


