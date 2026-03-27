import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Plus, 
  CheckCircle2, 
  CreditCard, 
  Info,
  Flame
} from 'lucide-react';
import { subscriptionsAPI } from '../../services/api';
import { Button, Loader, PageHeader } from '../../components';

const BuyCreditsPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCreditPackages();
  }, []);

  const fetchCreditPackages = async () => {
    setLoading(true);
    try {
      const res = await subscriptionsAPI.getCredits();
      if (res.success) {
        setPackages(res.data);
        // Select the most popular package by default if available
        const popular = res.data.find(p => p.isPopular);
        if (popular) {
          setSelectedPackage(popular);
        } else if (res.data.length > 0) {
          setSelectedPackage(res.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching credit packages:', err);
      setError('Failed to load credit packages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleCheckout = async () => {
    if (!selectedPackage) return;
    
    setCheckoutLoading(true);
    setError('');
    try {
      const res = await subscriptionsAPI.checkoutCredits(selectedPackage._id);
      if (res.success && res.url) {
        window.location.href = res.url; // Redirect to Stripe
      } else {
        setError('Failed to initiate checkout. Please try again.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError('An error occurred during checkout.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader fullscreen message="Loading credit packages..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-32">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <PageHeader 
          title="My Subscription" 
          onBack={() => navigate(-1)} 
          className="py-4"
        />

        <div className="mt-6 mb-8">
          <h1 className="text-2xl sm:text-2xl font-[600] text-[#111111] mb-2 tracking-tight">Purchase More Credits</h1>
          <p className="text-gray-500 font-medium text-sm sm:text-base leading-relaxed">
            Continue responding to cleaning job leads by purchasing additional credits.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-600 flex items-center gap-2">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {packages.map((pkg) => (
            <div 
              key={pkg._id}
              onClick={() => handlePackageSelect(pkg)}
              className={`relative bg-[#F8FAFF] rounded-2xl p-6 border transition-all cursor-pointer ${
                selectedPackage?._id === pkg._id 
                ? 'border-blue-500 bg-white ring-1 ring-blue-500 shadow-lg shadow-blue-50' 
                : 'border-blue-50 hover:border-blue-200'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute top-0 right-4 -translate-y-1/2 bg-[#FFF4E5] text-[#FF8A00] px-3 py-1 rounded-full flex items-center gap-1.5 border border-[#FFE0BD]">
                  <Flame className="w-3.5 h-3.5" fill="currentColor" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider">Most Popular</span>
                </div>
              )}

              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-semibold text-[#111827]">{pkg.credits} Credits</p>
                  <h3 className="text-xl sm:text-2xl font-black text-[#111111]">
                    {formatCurrency(pkg.price)}
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-gray-400 mt-2">
                    {pkg.approxLeads || "5 leads"}
                  </p>
                </div>
              </div>
              
              <button 
                className="mt-4 flex items-center gap-2.5 text-[#1F6FEB] text-base hover:opacity-80 transition-opacity"
              >
                <div className="w-6 h-6 rounded-full bg-[#1F6FEB] flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                </div>
                Purchase Credits
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Optimized Bottom Bar for Web */}
      {selectedPackage && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 p-4 sm:p-6 z-50 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                Credit Package: <span className="text-[#111111]">{selectedPackage.credits} Credits</span>
              </p>
              <p className="text-2xl font-black text-[#111111]">{formatCurrency(selectedPackage.price)}</p>
            </div>
            
            {/* Mobile Summary */}
            <div className="sm:hidden w-full flex justify-between items-center mb-1">
               <div className="text-left">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Credit Package: {selectedPackage.credits}</p>
                  <p className="text-xl font-black text-[#111111]">{formatCurrency(selectedPackage.price)}</p>
               </div>
            </div>

            <Button 
              className="w-full sm:w-auto h-14 sm:h-16 px-12 rounded-2xl font-black text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 transition-all active:scale-95"
              onClick={handleCheckout}
              loading={checkoutLoading}
            >
              Continue & Pay
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyCreditsPage;
