import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, PageHeader } from '../../components';
import UploadCloudIcon from '../../assets/upload-cloud.svg';
import UploadIcon from '../../assets/upload.svg';

const CompleteJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [needExtraTime, setNeedExtraTime] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        // TODO: Fetch job details from API
        // For now, using mock data
        setJob({
          id: jobId,
          title: 'Bond Cleaning - 2 Bed Apartment',
          serviceType: 'Bond Clean',
          estimatedPrice: 220,
          paymentMethod: 'Cash',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        });
      } catch (error) {
        console.error('Error fetching job:', error);
      } finally {
        setLoading(false);
      }
    };

    if (jobId) {
      fetchJobDetails();
    }
  }, [jobId]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Recently posted';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Posted just now';
    if (diffInHours === 1) return 'Posted 1h ago';
    return `Posted ${diffInHours}hrs ago`;
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleSubmitPhoto = (photoId) => {
  };

  const handleCompleteJob = () => {
    navigate(`/cleaner/job-completed/${jobId}`);
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl p-4">
          <div className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              <div className="h-20 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl p-4">
          <div className="bg-white rounded-2xl p-6 text-center">
            <p className="text-red-500">Job not found</p>
            <Button
              onClick={() => navigate(-1)}
              variant="primary"
              className="mt-4"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const progressPercentage = ((600 - timeLeft) / 600) * 100;

  return (
    <>
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl">
        <PageHeader
          title={job.title}
          onBack={() => navigate(-1)}
          className="py-4 px-4"
          titleClassName="text-lg font-semibold text-primary-500 truncate"
          rightSlot={
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500 text-white">
              Paid
            </span>
          }
        />

        <div className="px-4 space-y-4">
          {/* Job Overview */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              {job.serviceType} — {job.title.split(' - ')[1] || 'Apartment'}
            </h2>
            <p className="text-sm text-gray-500">{getTimeAgo(job.createdAt)}</p>
          </div>

          {/* Review Property Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Have you review property?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              If yes, are you thinking that it will take extra hours
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">Need extra time?</span>
              <button
                onClick={() => setNeedExtraTime(!needExtraTime)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  needExtraTime ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    needExtraTime ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {timeLeft > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  You have 10 mins to take your decision
                </p>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="absolute right-0 top-0 -mt-6">
                    <span className="text-sm font-semibold text-green-500">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Payment Summary Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quoted Price:</span>
                <span className="text-lg font-semibold text-blue-600">${job.estimatedPrice}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Payment Method:</span>
                <span className="text-sm font-semibold text-gray-900">{job.paymentMethod}</span>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                Customer paid $44 (10%) online to platform. $176 (80%) will be paid cash after job.
              </p>
              
              <div className="flex justify-end">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-500 text-white">
                  Paid
                </span>
              </div>
            </div>
          </div>

          {/* Upload Before Photo Section */}
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Before Photo</h3>
            
            {/* Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center bg-gray-50">
              <img src={UploadCloudIcon} alt="Upload" className="w-16 h-16 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">Select photos/videos to upload</p>
              
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium cursor-pointer hover:bg-blue-700 transition-colors"
              >
                <img src={UploadIcon} alt="Upload" className="w-5 h-5" />
                Upload Here
              </label>
            </div>

            {/* Uploaded Photos */}
            {uploadedPhotos.length > 0 && (
              <div className="mt-6 space-y-4">
                {uploadedPhotos.map((photo) => (
                  <div key={photo.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <img
                      src={photo.url}
                      alt={photo.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{photo.name}</p>
                      <p className="text-xs text-gray-500">
                        {(photo.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={() => handleSubmitPhoto(photo.id)}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
                    >
                      Submit Photo
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Action Button */}
          <div className="pb-6">
            <Button
              onClick={handleCompleteJob}
              variant="secondary"
              className="w-full bg-gray-200 text-gray-900 hover:bg-gray-300 font-semibold py-4 text-lg"
            >
              Complete Job
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompleteJobPage;
