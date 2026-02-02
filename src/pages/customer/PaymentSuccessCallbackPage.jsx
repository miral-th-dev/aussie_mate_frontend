import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Check, Loader2, X } from 'lucide-react';
import { paymentService } from '../../services/paymentService';
import { Button, Loader } from '../../components';

const PaymentSuccessCallbackPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        setLoading(true);

        const searchString = window.location.search;
        console.log('🔍 Full URL Search String:', searchString);

        // Get parameters from URL
        const sessionId = searchParams.get('session_id');
        const paymentIntentId = searchParams.get('payment_intent');
        const redirectStatus = searchParams.get('redirect_status');
        const jobId = searchParams.get('job_id') || searchParams.get('jobId');
        // Check for multiple possible parameter names
        let databasePaymentId = searchParams.get('payment_id') || searchParams.get('paymentId') || searchParams.get('database_id') || searchParams.get('id');

        console.log('✅ Extracted Params:', { sessionId, paymentIntentId, redirectStatus, jobId, databasePaymentId });

        // FIRST: If we have session_id, call confirm-checkout to update job status
        let response;
        if (sessionId) {
          console.log(`🔌 Calling confirmCheckoutSession with session_id: ${sessionId}`);
          response = await paymentService.confirmCheckoutSession(sessionId);
          
          // Extract payment ID from response for further verification
          if (response?.success && response?.data?.payment?._id) {
            databasePaymentId = response.data.payment._id;
            console.log(`✅ Got payment ID from confirmCheckout: ${databasePaymentId}`);
          }
        }
        // SELF-HEALING: If database ID is missing, we fetch it using Job ID
        else if (!databasePaymentId && jobId) {
          console.log(`🔍 databasePaymentId missing from URL. Attempting to recover via jobId: ${jobId}...`);
          try {
            const statusResponse = await paymentService.getPaymentStatus(jobId);
            if (statusResponse?.success) {
              const paymentRecord = statusResponse.payment || statusResponse.data?.payment || statusResponse.data;
              if (paymentRecord?._id) {
                databasePaymentId = paymentRecord._id;
                console.log(`✅ Recovered databaseId from backend: ${databasePaymentId}`);
              }
            }
          } catch (recoveryErr) {
            console.warn('⚠️ Could not recover ID via jobId fallback:', recoveryErr);
          }
        }

        // If we have NO database ID, calling verify with Stripe ID will cause backend 500
        if (!response && databasePaymentId) {
          console.log(`🔌 Calling verifyPayment with DATABASE ID: ${databasePaymentId}`);
          response = await paymentService.verifyPayment(databasePaymentId);
        } else if (!response && jobId) {
          console.log(`🔌 Still no payment_id, using Job ID status check: ${jobId}`);
          response = await paymentService.getPaymentStatus(jobId);
        } else if (!response && paymentIntentId) {
          console.warn('⚠️ Final fallback: Verify with Stripe ID (Backend might 500)');
          response = await paymentService.verifyPayment(paymentIntentId);
        } else if (!response && sessionId) {
          response = await paymentService.verifyPayment(sessionId);
        }

        // Check if response is successful. Handle both nested 'data' and root-level properties.
        if (response && response.success) {
          const paymentData = response.payment || response.data?.payment || response.data || response;
          const paymentStatus = paymentData.status;
          console.log("💎 Final Payment Status from Backend:", paymentStatus);

          // SUCCESS CONDITIONS: 
          // 1. Backend says success/completed/captured/authorized
          // 2. OR Stripe says succeeded in URL and backend isn't saying 'failed'
          const isSuccessful =
            ['succeeded', 'completed', 'pending_capture', 'authorized', 'captured'].includes(paymentStatus) ||
            (redirectStatus === 'succeeded' && paymentStatus !== 'failed');

          if (isSuccessful) {
            setVerificationStatus('success');

            // Wait a moment to show success message, then redirect
            const targetJobId = jobId || paymentData.jobId || paymentData.job || (typeof paymentData.jobId === 'object' ? paymentData.jobId._id : null);
            setTimeout(() => {
              navigate(`/booking-confirmation/${targetJobId || 'my-jobs'}`, { replace: true });
            }, 2000);
          } else if (paymentStatus === 'processing' || paymentStatus === 'pending') {
            setVerificationStatus('processing');
            // Retry after 3 seconds
            setTimeout(() => {
              window.location.reload();
            }, 3000);
          } else {
            setVerificationStatus('failed');
            setError(`Payment status: ${paymentStatus}. Please contact support.`);
          }
        } else {
          setError(response?.message || 'Unable to verify payment status. Please try again.');
        }
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment. Please try again or contact support.');
        setVerificationStatus('error');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  const handleRetryPayment = () => {
    const jobId = searchParams.get('job_id');
    if (jobId) {
      navigate(`/job-details/${jobId}`);
    } else {
      navigate('/my-jobs');
    }
  };

  const handleContactSupport = () => {
    navigate('/help-support');
  };

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-8">
        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <Loader message="Verifying payment..." />
          </div>
        ) : verificationStatus === 'success' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Success Icon */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Payment Successful! 🎉</h1>
                <p className="text-gray-600">
                  Your payment has been confirmed. Redirecting to booking details...
                </p>
              </div>

              {/* Loading indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 text-primary-500 animate-spin" strokeWidth={2} />
                <span>Redirecting...</span>
              </div>
            </div>
          </div>
        ) : verificationStatus === 'processing' ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Processing Icon */}
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" strokeWidth={2} />
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Payment Processing...</h1>
                <p className="text-gray-600">
                  Your payment is being processed. This usually takes a few seconds.
                </p>
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-pulse">⏱️</div>
                <span>Checking status again...</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <X className="w-10 h-10 text-red-600" strokeWidth={2} />
              </div>

              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-gray-900">Payment Verification Failed</h1>
                <p className="text-red-600 font-medium">{error}</p>
                <p className="text-gray-600 text-sm">
                  Don't worry, if your payment went through, you can check your booking in "My Jobs"
                </p>
                <div className="text-[10px] text-gray-400 mt-4 font-mono break-all opacity-50">
                  Debug IDs: {JSON.stringify({
                    p_id: searchParams.get('payment_id'),
                    pi_id: searchParams.get('payment_intent'),
                    status: searchParams.get('redirect_status')
                  })}
                </div>
              </div>

              <div className="w-full space-y-3">
                <Button onClick={handleRetryPayment} variant="primary" fullWidth>
                  Try Again
                </Button>
                <Button onClick={() => navigate('/my-jobs')} variant="secondary" fullWidth>
                  Go to My Jobs
                </Button>
                <button
                  onClick={handleContactSupport}
                  className="w-full px-4 py-3 text-gray-600 font-medium hover:text-gray-900 transition-colors text-sm"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PaymentSuccessCallbackPage;

