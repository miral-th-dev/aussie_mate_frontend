import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  ChevronRight, 
  Loader2, 
  Sparkles, 
  Star, 
  Trophy, 
  ShieldCheck, 
  ArrowRight 
} from 'lucide-react';
import { subscriptionsAPI } from '../../services/api';
import BGVector from "../../assets/BG Vectorr.svg";

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState(null);

  useEffect(() => {
    verifySubscription();
  }, []);

  const verifySubscription = async (retryCount = 0) => {
    try {
      if (retryCount === 0) setLoading(true);
      
      const res = await subscriptionsAPI.getMyStatus().catch(() => ({ success: false }));
      
      if (res.success && res.data?.subscription?.status === 'active') {
        setSubscription(res.data);
        setLoading(false);
      } else if (retryCount < 3) {
        // Retry after 2 seconds to allow for webhook processing
        setTimeout(() => verifySubscription(retryCount + 1), 2000);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error verifying subscription:', err);
      if (retryCount >= 3) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#F9FAFB]">
        <Loader2 className="w-12 h-12 text-[#1F6FEB] animate-spin mb-4" />
        <p className="text-gray-600 font-bold text-lg animate-pulse">Verifying your subscription...</p>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F9FAFB] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decoration - Subtler and more integrated */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] pointer-events-none opacity-30 select-none">
        <div
          className="absolute inset-0 bg-no-repeat bg-right-top bg-contain"
          style={{ backgroundImage: `url(${BGVector})` }}
        />
        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-400/20 to-transparent blur-[80px]" />
      </div>

      <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in-95 duration-700">
        <div className="bg-white rounded-2xl shadow-[0_30px_70px_rgba(0,0,0,0.06)] border border-gray-100 p-8 md:p-10 text-center relative">
          
          {/* Success Ring Animation */}
          <div className="relative flex justify-center mb-6">
            <div className="absolute w-20 h-20 bg-green-50 rounded-full animate-ping opacity-30" />
            <div className="relative w-20 h-20 bg-gradient-to-r from-green-400 to-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
              <CheckCircle2 className="w-10 h-10 text-white" strokeWidth={3} />
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 leading-tight flex items-center justify-center gap-2">
              Payment Confirmed! <Sparkles className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            </h1>
            <p className="mt-3 text-gray-500 font-medium leading-relaxed max-w-[280px] mx-auto">
              Your subscription is now active. You have full access to premium leads.
            </p>
          </div>

          {subscription && (
            <div className="bg-[#F8FAFC] border border-gray-100 rounded-2xl p-1 mb-8 overflow-hidden">
              <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-50 m-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Active Plan</p>
                      <h3 className="text-base font-black text-gray-900 truncate max-w-[140px]">
                        {subscription.subscription?.planId?.name || 'Cleaning Pro'}
                      </h3>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-green-50/50 p-3 rounded-2xl border border-green-100/50">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-bold text-green-700">
                    {subscription.availableCredits} Credits successfully added
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => navigate('/cleaner-dashboard')}
              className="w-full h-14 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-lg transition-all duration-300 shadow-xl shadow-gray-200 active:scale-95 flex items-center justify-center gap-2 cursor-pointer group"
            >
              Back to Dashboard
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/cleaner-jobs')}
              className="w-full py-3 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer group"
            >
              Start Finding Jobs 
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Footer info - more compact */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <div className="flex items-center gap-2 text-gray-400 font-bold text-[9px] uppercase tracking-[0.2em]">
            <span>Secured By Stripe Payment Gateway</span>
          </div>
          <div className="w-12 h-0.5 bg-gray-100 rounded-full" />
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
