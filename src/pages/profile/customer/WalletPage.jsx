import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, PageHeader, Loader } from '../../../components';
import WalletBG from '../../../assets/walletBG.jpg';
import { userAPI } from '../../../services/api';

const WalletPage = () => {
  const navigate = useNavigate();
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWalletBalance = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userAPI.getWalletBalance();
      if (response.success) {
        setWalletBalance(response.data?.currentBalance || 0);
      } else {
        setError(response.message || 'Unable to fetch wallet balance right now.');
      }
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
      setError('Unable to fetch wallet balance right now.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletBalance();
  }, []);

  const formattedBalance = loading
    ? '...'
    : new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
      }).format(walletBalance || 0);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <PageHeader title="Wallet & Payments" onBack={() => navigate(-1)} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 pt-0!">
        {loading ? (
          <Loader message="Fetching wallet balance..." />
        ) : (
          <section className="relative overflow-hidden rounded-2xl border border-[#F3F3F3] shadow-custom">
            <img
              src={WalletBG}
              alt="Wallet background"
              className="absolute inset-0 h-full w-full object-cover opacity-20"
            />
            <div className="relative z-10 flex flex-col gap-6 p-5 sm:p-6 md:p-8 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-200 sm:text-sm">
                  Available Balance
                </p>
                <h2 className="mt-2 text-3xl font-bold text-primary-500 sm:text-4xl md:text-5xl">
                  {formattedBalance}
                </h2>
                <p className="mt-3 text-sm font-medium leading-relaxed text-primary-200 sm:text-base">
                  Available to use for bookings & top-ups.
                </p>
                {error && (
                  <div className="mt-4 inline-flex rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default WalletPage;

