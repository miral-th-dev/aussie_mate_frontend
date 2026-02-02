import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ChevronDown, UserRound, XCircle, X } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, PageHeader, TierBadge } from '../../components';
import { paymentService, handlePaymentError } from '../../services/paymentService';
import { calculatePayoutAmounts } from '../../utils/paymentCalculations';
import StarIcon from '../../assets/rating.svg';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = ({ amount, jobId, paymentId, onClose, onSuccess }) => {
  console.log('📦 PaymentForm rendered with props:', { amount, jobId, paymentId });
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);
    setError(null);

    const returnUrl = `${window.location.origin}/payment/success?job_id=${jobId}&payment_id=${paymentId}`;
    console.log('🔗 Stripe return_url generated:', returnUrl);

    const { error: submitError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
    });

    if (submitError) {
      setError(submitError.message);
      setProcessing(false);
    } else {
      // successful payment will redirect to return_url
      if (onSuccess) onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {!paymentId && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <strong className="font-bold">Debug Error:</strong>
          <span className="block sm:inline"> paymentId is missing in PaymentForm prop. Redirect will fail.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || processing}
        loading={processing}
        className="w-full py-3"
        size="lg"
      >
        Pay ${amount}
      </Button>
    </form>
  );
};

const ConfirmYourCleanerPage = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const location = useLocation();

  const cleanerData = location.state?.cleanerData;
  const quoteData = location.state?.quoteData;

  const finalCleanerData = quoteData
    ? {
      id:
        quoteData.cleanerId?._id ||
        quoteData.cleanerId?.id ||
        quoteData.cleanerId ||
        'Unknown',
      name: quoteData.cleanerId
        ? `${quoteData.cleanerId.firstName || ''} ${quoteData.cleanerId.lastName || ''
          }`.trim() ||
        `Cleaner #${(
          quoteData.cleanerId._id ||
          quoteData.cleanerId.id ||
          quoteData.cleanerId
        ).slice(-4)}`
        : 'Cleaner',
      rating:
        quoteData.cleanerId?.averageRating ??
        quoteData.cleanerId?.rating ??
        0,
      tier: quoteData.cleanerId?.tier || 'none',
      baseQuote: quoteData.basePrice || quoteData.price || 0,
      total: quoteData.totalPrice || quoteData.price || 0,
    }
    : cleanerData || null;


  useEffect(() => {
    if (!finalCleanerData) {
      navigate('/my-jobs');
    }
  }, [finalCleanerData, navigate]);

  if (!finalCleanerData) return null;

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showOnlineBreakdown, setShowOnlineBreakdown] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [paymentId, setPaymentId] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);


  //Correct commission/GST/cleaner payout calculation
  const payoutAmounts = calculatePayoutAmounts(finalCleanerData.total);

  const handleProceedToPay = async () => {
    try {
      setProcessing(true);
      setError(null);

      const quoteId = String(quoteData?._id || quoteData?.id || '');
      const amount = Number(finalCleanerData.total);
      const serviceProviderId = String(finalCleanerData.id || '');

      const paymentPayload = {
        jobId: String(jobId),
        quoteId,
        amount,
        serviceProviderId,
        description: `Payment for job ${jobId}`,
        currency: 'AUD',
        metadata: {} // Providing empty object in case backend does metadata.toString()
      };

      console.log('📡 Sending payment payload:', paymentPayload);

      if (!quoteId || !amount || !serviceProviderId || serviceProviderId === 'Unknown') {
        throw new Error('Missing required payment information (Quote, Amount, or Cleaner ID)');
      }

      const response = await paymentService.createPayment(paymentPayload);

      console.log('✅ createPayment response:', response);

      // Handle Stripe Elements (clientSecret)
      if (response?.success && (response?.clientSecret || response.data?.clientSecret)) {
        const secret = response.clientSecret || response.data?.clientSecret;
        const pid = response.payment?._id || response.data?.payment?._id || response.data?._id || response._id;

        console.log('🆔 Captured IDs:', { clientSecret: secret, paymentId: pid });

        if (!pid) {
          console.error('❌ database paymentId is missing from response!', response);
          setError('Failed to initialize payment record. Please try again.');
          return;
        }

        setClientSecret(secret);
        setPaymentId(pid);
        setShowPaymentModal(true);
        return;
      }

      // Handle fallback or different structure
      if (response?.clientSecret || response.data?.clientSecret) {
        const secret = response.clientSecret || response.data?.clientSecret;
        const pid = response.payment?._id || response.data?.payment?._id || response.data?._id || response._id;

        console.log('🆔 Captured IDs (fallback):', { clientSecret: secret, paymentId: pid });

        if (!pid) {
          console.error('❌ database paymentId is missing from response!', response);
          setError('Failed to initialize payment record. Please try again.');
          return;
        }

        setClientSecret(secret);
        setPaymentId(pid);
        setShowPaymentModal(true);
        return;
      }

      // Handle Stripe Checkout (URL)
      if (response?.success && response?.data?.url) {
        const checkoutUrl = response.data.url;
        console.log('🌐 Redirecting to Stripe Checkout:', checkoutUrl);
        window.location.href = checkoutUrl;
        return;
      }

      console.error('❌ Unexpected payment response:', response);
      const msg =
        response?.error ||
        response?.message ||
        'Failed to initialize payment. Please try again.';
      setError(msg);
    } catch (err) {
      console.error('❌ Payment error:', err);
      setError(handlePaymentError(err));q
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="max-w-sm mx-auto sm:max-w-2xl lg:max-w-4xl xl:max-w-6xl px-4 py-4">
        <PageHeader
          title="Confirm Your Cleaner"
          onBack={() => navigate(-1)}
          className="mb-6"
          titleClassName="text-xl font-semibold text-primary-500"
        />

        {/* Cleaner Card */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
              <UserRound className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>

            <div className="flex-1">
              <h2 className="text-lg sm:text-xl font-semibold text-primary-500 mb-3">
                {finalCleanerData.name}
              </h2>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-[#FFF2DE] px-2 py-1 rounded-full">
                  <img src={StarIcon} alt="Rating" className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium text-primary-500">
                    {finalCleanerData.rating}
                  </span>
                </div>
                <TierBadge tier={finalCleanerData.tier} />
              </div>
            </div>
          </div>
        </div>

        {/* Quote Summary */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-primary-500 mb-4">
            Quote Summary
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-sm text-primary-200 font-medium">
                Base Quote:{' '}
                <span className="text-sm font-semibold text-primary-500">
                  ${finalCleanerData.baseQuote}
                </span>
              </span>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <span className="text-base font-semibold text-primary-500">
                Total:{' '}
                <span className="text-lg font-bold text-primary-500">
                  ${finalCleanerData.total}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl shadow-custom p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-primary-500 mb-4">
            Online Payment
          </h3>

          <div className="space-y-3">
            <p className="text-sm text-primary-200 font-medium">
              Pay securely online to confirm your booking instantly.
            </p>

            <Button
              onClick={() => setShowOnlineBreakdown(!showOnlineBreakdown)}
              variant="link"
              size="sm"
              className="flex items-center gap-1 text-sm text-primary-600 font-medium"
            >
              View Breakdown
              <ChevronDown
                className={`w-4 h-4 transition-transform ${showOnlineBreakdown ? 'rotate-180' : ''
                  }`}
              />
            </Button>

            {showOnlineBreakdown && (
              <div className="mt-2 space-y-3 text-sm text-primary-200 font-medium">

                {/* Commission */}
                <div className="flex justify-between">
                  <span>Commission (15%):</span>
                  <span className="font-semibold text-primary-500">
                    ${payoutAmounts.adminCommission}
                  </span>
                </div>


                {/* GST */}
                <div className="flex justify-between">
                  <span>GST (10%):</span>
                  <span className="font-semibold text-primary-500">
                    ${payoutAmounts.gstAmount}
                  </span>
                </div>

                {/* Cleaner payout */}
                <div className="flex justify-between">
                  <span>Cleaner Payout:</span>
                  <span className="font-semibold text-primary-500">
                    ${payoutAmounts.cleanerAmount}
                  </span>
                </div>

                <p className="text-xs text-primary-300 font-medium">
                  The remaining balance will be charged automatically after the job is completed.
                </p>
              </div>
            )}

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-500" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleProceedToPay}
            size="md"
            className="px-4 py-3 mb-6"
            loading={processing}
            disabled={processing}
          >
            {`Confirm & Pay $${finalCleanerData.total}`}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-xs text-primary-200">
            All payments are secured. Your cleaner's contact details will unlock once booking
            is confirmed.
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && clientSecret && paymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-fade-in shadow-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h3 className="text-xl font-bold text-gray-900 mb-6">Complete Payment</h3>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <PaymentForm
                amount={finalCleanerData.total}
                jobId={jobId}
                paymentId={paymentId}
                onClose={() => setShowPaymentModal(false)}
              />
            </Elements>
          </div>
        </div>
      )}
    </>
  );
};

export default ConfirmYourCleanerPage;