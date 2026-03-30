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
    <div className="min-h-screen bg-gray-50 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="My Subscription"
          onBack={() => navigate(-1)}
          className="py-4"
        />

        <div className="mt-8 mb-10 text-center sm:text-left">
          <h1 className="text-xl font-semibold text-[#1F2937] mb-3 tracking-tight">Purchase More Credits</h1>
          <p className="text-[#6B7280] text-lg  leading-relaxed max-w-lg">
            Continue responding to cleaning job leads by purchasing additional credits.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              onClick={() => handlePackageSelect(pkg)}
              className={`relative rounded-xl p-6 border-2 transition-all duration-300 cursor-pointer group ${selectedPackage?._id === pkg._id
                  ? 'bg-[#F9FAFB] border-[#9CC0F6] shadow-xl shadow-blue-50 translate-y-[-2px]'
                  : 'bg-[#F9FAFB] border-[#F3F3F3] hover:border-[#9CC0F6]/30'
                }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-3 right-6 bg-[#FEF3C7] text-[#D97706] px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-[#FDE68A] shadow-sm">
                  <Flame className="w-3.5 h-3.5 fill-[#D97706]" />
                  <span className="text-[10px] sm:text-xs font-semibold tracking-wider">Most Popular</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-[#6B7280]">
                    {pkg.credits} Credits
                  </p>
                  <h3 className="text-3xl font-bold text-[#111827]">
                    {formatCurrency(pkg.price)}
                  </h3>
                  <p className="text-sm font-medium text-[#6B7280]">
                    {pkg.approxLeads || "Approx. 5 leads"}
                  </p>
                </div>

                {/* Vertical Divider */}
                <div className="w-px h-16 bg-[#F3F3F3] mx-8 hidden sm:block" />

                <div className="flex items-center gap-2 text-[#1F6FEB] font-bold text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#1F6FEB] flex items-center justify-center transition-transform group-hover:scale-110">
                    <Plus className="w-4 h-4 text-white" strokeWidth={3} />
                  </div>
                  <span>Purchase Credits</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Optimized Bottom Bar for Web */}
      {selectedPackage && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#F9FAFB] border-t border-[#E5E7EB] rounded-t-[36px] px-8 py-6 z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <p className=" font-medium text-[#6B7280]">
                Selected Package
              </p>
              <div className="flex items-baseline gap-2 justify-center sm:justify-start">
                <span className="text-2xl font-semibold text-[#111827]">{formatCurrency(selectedPackage.price)}</span>
                <span className="text-sm font-semibold text-[#6B7280]">/ {selectedPackage.credits} Credits</span>
              </div>
            </div>

            <Button
              className="w-full sm:w-auto px-8"
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
