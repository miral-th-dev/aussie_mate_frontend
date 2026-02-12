import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { PageHeader } from '../../../components';
import ArrowDownIcon from '../../../assets/arrow-down.svg';
import ArrowUpIcon from '../../../assets/arrow-up.svg';
import Coin2Icon from '../../../assets/Coin2.svg';
import DownIcon from '../../../assets/Down.svg';
import InfoIcon from '../../../assets/info.svg';
import MetaBG from '../../../assets/metaBG.jpg';
import MetaBox from '../../../assets/metabox.png';
import CoinPNG from '../../../assets/coin3.svg';
import { matePointsAPI } from '../../../services/api';

const MatePointsPage = () => {
  const navigate = useNavigate();
  const [currentPoints, setCurrentPoints] = useState(0);
  const [nextRewardPoints] = useState(500);
  const [nextRewardAmount] = useState(10);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyHasNext, setHistoryHasNext] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const pointsHistory = useMemo(() => {
    const allHistory = history.map((tx) => {
      // Map /mate-points/transactions payload
      const pointsVal = (typeof tx.points === 'number') ? tx.points : (tx.amount ?? 0);
      const isEarn = pointsVal > 0;
      const icon = isEarn ? ArrowUpIcon : ArrowDownIcon;
      const title = tx.description || (isEarn ? 'Points Earned' : 'Points Redeemed');
      const dateIso = tx.date || tx.createdAt || tx.processedAt || Date.now();
      const date = new Date(dateIso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
      return {
        id: tx.id || tx._id || `${tx.type}-${dateIso}`,
        type: tx.type || (isEarn ? 'earn' : 'redeem'),
        title,
        date,
        points: pointsVal,
        icon
      };
    });

    // Show only first 2 items if not showing all
    return showAllHistory ? allHistory : allHistory.slice(0, 2);
  }, [history, showAllHistory]);

  const availableRewards = useMemo(() => ([
    {
      id: 1,
      title: '$10 Discount Voucher',
      pointsRequired: 500,
      currentPoints: currentPoints,
      isAvailable: currentPoints >= 500,
      bgColor: 'linear-gradient(120.74deg, #E9EEFC 0.11%, #FFFFFF 100.11%)'
    },
    {
      id: 2,
      title: '$20 Wallet Credit',
      pointsRequired: 1000,
      currentPoints: currentPoints,
      isAvailable: currentPoints >= 1000,
      bgColor: 'linear-gradient(140.46deg, #EDFCE9 1.17%, #FDFEFD 100%)'
    }
  ]), [currentPoints]);

  const progressPercentage = Math.min(100, (currentPoints / nextRewardPoints) * 100);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await matePointsAPI.getPoints();
      // Expected: { success, data: { points, totalEarned, totalRedeemed, lastActivity } }
      const pts = res?.data?.points ?? 0;
      setCurrentPoints(pts);
    } catch (e) {
      setError(e.message || 'Failed to load mate points');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (page = 1) => {
    try {
      const res = await matePointsAPI.getTransactions(page, 10);
      const transactions = res?.data?.transactions || [];
      setHistory(transactions);
      const pagination = res?.data?.pagination;
      setHistoryHasNext(Boolean(pagination?.hasNextPage));
      setHistoryPage(page);
    } catch (e) {
      // Non-blocking
    }
  };

  useEffect(() => {
    fetchPoints();
    fetchHistory(1);
  }, []);

  const handleRedeem = (reward) => {
    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const handleConfirmRedeem = async () => {
    if (!selectedReward) return;
    try {
      setLoading(true);
      const res = await matePointsAPI.redeem(selectedReward.pointsRequired);
      setShowRedeemModal(false);
      await fetchPoints();
      await fetchHistory(1);
      navigate('/reward-success', { state: { reward: selectedReward, redemption: res?.data } });
    } catch (e) {
      setError(e.message || 'Failed to redeem points');
      setShowRedeemModal(false);
    } finally {
      setLoading(false);
    }
  };

  const closeRedeemModal = () => {
    setShowRedeemModal(false);
    setSelectedReward(null);
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showRedeemModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showRedeemModal]);

  return (
    <>
      {/* Back Button */}
      <div className="max-w-7xl mx-auto py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="MatePoints Rewards"
          onBack={() => navigate(-1)}
          className="mb-6"
          titleClassName="text-xl font-semibold text-gray-900"
        />

        {/* Error / Loading */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}
        {loading && (
          <div className="mb-4 p-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 text-sm">
            Loading MatePoints...
          </div>
        )}

        {/* Rewards Banner */}
        <div className="mb-6 rounded-2xl shadow-custom border border-[#F3F3F3] overflow-hidden">
          <div className="relative p-4 sm:p-8 lg:p-10 min-h-[100px] sm:min-h-[200px]">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img src={MetaBG} alt="Rewards Background" className="w-full h-full object-cover" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 h-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
              <div className="flex-1 text-left">
                <h2 className="text-base sm:text-4xl lg:text-5xl font-semibold text-primary-500 mb-1 sm:mb-2">
                  You've earned {currentPoints}
                </h2>
                <h2 className="text-base sm:text-4xl lg:text-5xl font-semibold text-primary-500 mb-3 sm:mb-4">
                  MatePoints
                </h2>
                <p className="text-xs sm:text-lg text-[#374151] font-medium max-w-[200px] sm:max-w-[500px]">
                  Keep booking to unlock more rewards.
                </p>
              </div>
              <div className="absolute bottom-0 right-0 sm:relative sm:-bottom-10 sm:-right-10">
                <img src={MetaBox} alt="Rewards Box" className="w-24 h-24 sm:w-40 sm:h-40 lg:w-48 lg:h-48" />
              </div>
            </div>
          </div>
        </div>

        {/* Current Points Progress */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
          <div>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
              <div
                className="h-4 rounded-full transition-all duration-1000 ease-out relative"
                style={{
                  width: `${progressPercentage}%`,
                  background: 'linear-gradient(45deg, #3B82F6 25%, #1D4ED8 25%, #1D4ED8 50%, #3B82F6 50%, #3B82F6 75%, #1D4ED8 75%, #1D4ED8)',
                  backgroundSize: '20px 20px',
                  animation: 'progress-stripes 1s linear infinite'
                }}
              ></div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <span className="text-primary-200 font-medium text-base">Current: <span className="text-primary-500 font-semibold">{currentPoints} / {nextRewardPoints} points</span></span>
              <span className="text-primary-200 font-medium text-base">
                Earn {nextRewardPoints} points → Unlock ${nextRewardAmount} Discount Voucher
              </span>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-[#F3F3F3] rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 shadow-custom">
          <div className="flex items-center mb-6">
            <img src={InfoIcon} alt="Info" className="w-6 h-6 mr-3" />
            <h3 className="text-xl font-semibold sm:text-2xl text-primary-500">How It Works</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <img src={Coin2Icon} alt="Coin" className="w-6 h-6 mr-4" />
              <span className="text-primary-500 text-base sm:text-lg font-medium">Earn +25 points per completed job</span>
            </div>
            <div className="flex items-center">
              <img src={DownIcon} alt="Down" className="w-6 h-6 mr-4" />
              <span className="text-primary-500 text-base sm:text-lg font-medium">Lose -10 points on cancellations</span>
            </div>
          </div>
        </div>

        {/* Available Rewards */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-custom border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Available Rewards</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {availableRewards.map((reward) => {
              const pointsNeeded = reward.pointsRequired - reward.currentPoints;
              const isEligible = reward.currentPoints >= reward.pointsRequired;

              return (
                <div key={reward.id} className="rounded-xl p-6" style={{
                  background: reward.bgColor,
                  border: reward.id === 1 ? '1px solid #D5DEFA' : '1px solid #CEF4C4'
                }}>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{reward.title}</h4>
                  <p className="text-sm text-primary-500 mb-1">Points Required</p>
                  <p className="text-2xl font-bold text-gray-900 mb-4">{reward.pointsRequired} Points</p>
                  {!isEligible && (
                    <p className="text-sm text-primary-500 mb-4">Need {pointsNeeded} more points</p>
                  )}
                  <button
                    onClick={() => handleRedeem(reward)}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors cursor-pointer ${isEligible
                      ? 'hover:bg-opacity-90 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    style={{
                      backgroundColor: isEligible
                        ? (reward.id === 2 ? '#111827' : '#111827')
                        : undefined
                    }}
                    disabled={!isEligible}
                  >
                    Redeem Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Points History */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-custom border border-gray-200 p-4 sm:p-6 lg:p-8 mb-6">
          <h3 className="text-xl font-semibold text-primary-500 mb-6">Points History</h3>
          <div className="space-y-4">
            {pointsHistory.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <img
                    src={item.icon}
                    alt={item.type}
                    className="w-6 h-6 mr-4"
                  />
                  <div>
                    <p className="text-xl font-semibold text-primary-500">{item.title}</p>
                    <p className="text-base text-primary-200 font-medium">{item.date}</p>
                  </div>
                </div>
                <span className={`text-base font-semibold ${item.points > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {item.points > 0 ? '+' : ''}{item.points}
                </span>
              </div>
            ))}
          </div>

          {/* View More/Less Button */}
          {history.length > 2 && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowAllHistory(!showAllHistory)}
                className="text-white hover:text-primary-500 font-medium text-base transition-colors cursor-pointer bg-primary-500 px-4 py-2 rounded-lg"
              >
                {showAllHistory ? 'View Less' : `View More (${history.length - 2} more)`}
              </button>
            </div>
          )}
        </div>

        {/* Footer Note */}
        <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <div className="flex items-start">
            <img src={InfoIcon} alt="Info" className="w-6 h-6 mr-3" />
            <p className="text-sm text-primary-200 font-medium">
              MatePoints can only be redeemed inside Aussie Mate app. Rewards are non-transferable.
            </p>
          </div>
        </div>
      </div>

      {/* Redeem Modal */}
      {showRedeemModal && selectedReward && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-6"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-custom max-h-[85vh] overflow-y-auto">
            {/* Close Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={closeRedeemModal}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-6 h-6" strokeWidth={2} />
              </button>
            </div>

            {/* Coin Illustration */}
            <div className="flex justify-center mb-6">
              <div className="w-24 h-24 sm:w-32 sm:h-32">
                <img src={CoinPNG} alt="Coin" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Voucher Title */}
            <h3 className="text-xl font-semibold text-primary-500 text-center mb-6">
              {selectedReward.title}
            </h3>

            {/* Points Information */}
            <div className="space-y-3 mb-6 border-b border-gray-200 pb-6">
              <div className="flex justify-between items-center">
                <span className="text-primary-200 font-medium">Points Required</span>
                <span className="font-semibold text-primary-500">{selectedReward.pointsRequired} MatePoints</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary-200 font-medium">Your Balance</span>
                <span className="font-semibold text-primary-500">{currentPoints} Points</span>
              </div>
            </div>

            {/* Disclaimer */}
            <p className="text-sm text-primary-200 font-medium text-center mb-6">
              Once redeemed, points will be deducted. Rewards are non-transferable.
            </p>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmRedeem}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-3 px-4 rounded-lg transition-colors cursor-pointer"
            >
              Confirm Redeem
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MatePointsPage;
