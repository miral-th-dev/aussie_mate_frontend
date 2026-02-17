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

const PaymentForm = ({ amount, jobId, paymentId, onClose, onSuccess, displayAmount, walletAmountUsed }) => {
  console.log('📦 PaymentForm rendered with props:', { amount, jobId, paymentId, displayAmount, walletAmountUsed });
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
    <form onSubmit={handleSubmit} className="space-y-4 min-h-[300px]">
      {/* Wallet Deduction Info */}
      {walletAmountUsed && walletAmountUsed > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-green-800">
                ${walletAmountUsed} deducted from your wallet
              </p>
              <p className="text-xs text-green-600 mt-1">
                Pay remaining ${displayAmount} by card to complete booking
              </p>
            </div>
          </div>
        </div>
      )}

      <PaymentElement options={{ layout: 'accordion' }} />

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
        {processing ? 'Processing...' : `Pay $${displayAmount || amount}`}
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
  const [displayAmount, setDisplayAmount] = useState(finalCleanerData.total);
  const [walletAmountUsed, setWalletAmountUsed] = useState(0);
  const [walletBalance, setWalletBalance] = useState(null);

  // Fetch wallet balance on component mount
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/wallet/balance`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data?.availableBalance !== undefined) {
              setWalletBalance(data.data.availableBalance);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch wallet balance:', error);
      }
    };

    fetchWalletBalance();
  }, []);

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
      metadata: {}
    };

    console.log('📡 Sending payment payload:', paymentPayload);

    if (!quoteId || !amount || !serviceProviderId || serviceProviderId === 'Unknown') {
      setProcessing(false);
      throw new Error('Missing required payment information');
    }

    const response = await paymentService.createPayment(paymentPayload);
    console.log('✅ Full response:', response);
    console.log('🔍 Breakdown details:', {
      totalAmount: amount,
      walletBalance: walletBalance,
      breakdown: response?.data?.breakdown,
      fromWallet: response?.data?.breakdown?.fromWallet,
      fromStripe: response?.data?.breakdown?.fromStripe
    });

    // ✅ CASE 1: Stripe PaymentIntent (Wallet + Card OR Card Only)
    if (response?.success && response?.data?.clientSecret) {
      const secret = response.data.clientSecret;
      const pid = response.data.payment?._id;
      const walletUsed = response.data.breakdown?.fromWallet || 0;
      const cardAmount = response.data.breakdown?.fromStripe || response.data.breakdown?.fromCard || 0;

      console.log('🆔 Payment Details:', { 
        clientSecret: secret, 
        paymentId: pid,
        walletUsed,
        cardAmount 
      });

      if (!pid) {
        console.error('❌ paymentId missing!', response);
        setProcessing(false);
        setError('Failed to initialize payment. Please try again.');
        return;
      }

      // Update display amounts
      setWalletAmountUsed(walletUsed);
      setDisplayAmount(cardAmount);

      // 🔥 Update wallet balance after deduction
      if (walletBalance !== null && walletUsed > 0) {
        setWalletBalance(walletBalance - walletUsed);
      }

      // 🎯 Show wallet deduction info in modal instead of alert
      if (walletUsed > 0) {
        // Show wallet deduction info in the UI, no alert needed
        console.log(`✅ $${walletUsed} deducted from wallet. 💳 Pay $${cardAmount} by card.`);
      }

      // 🔥 IMPORTANT: Open payment modal for card payment
      setClientSecret(secret);
      setPaymentId(pid);
      setShowPaymentModal(true);
      setProcessing(false); // ⭐ Stop loading
      return;
    }

    // ✅ CASE 2: Wallet-only payment (Full payment from wallet)
    if (response?.success && response?.data?.requiresStripePayment === false) {
      console.log('💰 Wallet-only payment:', response.data);
      
      setProcessing(false); // ⭐ Stop loading
      
      alert(response?.message || '✅ Payment completed using wallet balance!');
      
      // Navigate after short delay
      setTimeout(() => {
        navigate('/my-jobs', {
          state: { 
            paymentSuccess: true,
            walletUsed: response.data.breakdown?.fromWallet 
          }
        });
      }, 500);
      
      return;
    }

    // ✅ CASE 3: Unexpected response
    setProcessing(false);
    console.error('❌ Unexpected response:', response);
    setError(response?.error || 'Failed to initialize payment.');

  } catch (err) {
    console.error('❌ Payment error:', err);
    setProcessing(false); // ⭐ Always stop loading on error
    setError(handlePaymentError(err));
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

        {/* Wallet Balance Display */}
        {walletBalance !== null && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 14a1 1 0 011-2h4a1 1 0 01-2 0-4z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-blue-800 font-semibold text-sm">Your Wallet Balance</h4>
                <p className="text-blue-600 text-sm">
                  ${walletBalance} available for payment
                </p>
              </div>
            </div>
          </div>
        )}

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
                  <span>Platform Charge (15%):</span>
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

        {/* Wallet Deduction Info */}
        {walletAmountUsed > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-green-800 font-semibold text-sm">Wallet Payment Applied</h4>
                <p className="text-green-600 text-sm">
                  ${walletAmountUsed} deducted from your wallet balance
                  {walletBalance !== null && (
                    <span className="text-green-700 font-medium">
                      <br />Remaining balance: ${walletBalance - walletAmountUsed}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleProceedToPay}
            size="md"
            className="px-6 py-3 mb-6"
            loading={processing}
            disabled={processing}
          >
            {processing ? 'Processing...' : 
             walletAmountUsed > 0 ? 
               `Confirm & Pay $${displayAmount}` : 
               `Confirm & Pay $${finalCleanerData.total}`}
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
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative animate-fade-in shadow-xl max-h-[95vh] overflow-visible">
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
                displayAmount={displayAmount}
                walletAmountUsed={walletAmountUsed}
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