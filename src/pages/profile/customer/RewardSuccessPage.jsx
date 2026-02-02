import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PageHeader } from '../../../components';
import CopyIcon from '../../../assets/copy.svg';
import JobLiveGif from '../../../assets/joblive.gif';
import CardBG7 from '../../../assets/CardBG7.png';

const RewardSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [voucherCode, setVoucherCode] = useState('');
  const [reward, setReward] = useState(null);
  const [redemption, setRedemption] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [gifStopped, setGifStopped] = useState(false);

  useEffect(() => {
    // Get reward data from navigation state or generate default
    if (location.state?.reward) {
      setReward(location.state.reward);
      // Get redemption data from navigation state
      if (location.state?.redemption) {
        setRedemption(location.state.redemption);
        // Use redemption ID as voucher code - check both possible locations
        const redemptionId = location.state.redemption.redemptionId || 
                           location.state.redemption.id || 
                           location.state.redemption.data?.redemptionId;
        setVoucherCode(redemptionId || `AM-DIS${location.state.reward.pointsRequired === 500 ? '10' : '20'}-2025`);
      } else {
        // Fallback to generated code if no redemption data
        const code = `AM-DIS${location.state.reward.pointsRequired === 500 ? '10' : '20'}-2025`;
        setVoucherCode(code);
      }
    } else {
      // Default data if no state passed
      setReward({
        title: '$10 Discount Voucher',
        pointsRequired: 500
      });
      setVoucherCode('AM-DIS10-2025');
    }

    // Stop GIF after 3 seconds
    const timer = setTimeout(() => {
      setGifStopped(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [location.state]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(voucherCode);
      setCopySuccess(true);
      // Reset success message after 2 seconds
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = voucherCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };

  const handleUseReward = () => {
    navigate('/customer-dashboard');
  };

  const handleBackToRewards = () => {
    navigate('/rewards');
  };

  return (
    <>
      <div className="max-w-md mx-auto px-4 py-6">
        <PageHeader
          title="Reward Redeemed"
          subtitle={reward?.title || '$10 Discount Voucher'}
          onBack={handleBackToRewards}
          className="mb-4"
          titleClassName="text-lg sm:text-xl font-semibold text-primary-500"
          subtitleClassName="text-sm text-primary-200 font-medium"
          backLabel="Back to Rewards"
        />
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-custom mt-5 relative overflow-hidden">
          {/* Background Image - Top Right */}
          <div className="absolute top-0 right-0 w-32 h-32 sm:w-56 sm:h-56">
            <img 
              src={CardBG7} 
              alt="Background" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Success Animation - GIF */}
          <div className="flex justify-center mb-8">
            {!gifStopped ? (
              <img 
                src={JobLiveGif} 
                alt="Success Animation" 
                className="w-32 h-32 sm:w-40 sm:h-40 object-contain"
              />
            ) : (
              <div className="w-32 h-32 sm:w-40 sm:h-40 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-16 h-16 sm:w-20 sm:h-20 text-green-500" strokeWidth={2} />
              </div>
            )}
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-primary-500 mb-4">
              Reward Redeemed Successfully!
            </h1>
          </div>

          {/* Voucher Card */}
          <div 
            className="rounded-xl p-4 sm:p-6 mb-8 border border-[#D5DEFA]"
            style={{
              background: 'linear-gradient(120.74deg, #E9EEFC 0.11%, #FFFFFF 100.11%)'
            }}
          >
            <h2 className="text-lg sm:text-xl font-semibold text-primary-500 mb-4">
              {reward?.title || '$10 Discount Voucher'}
            </h2>
            
            {/* Voucher Code */}
            <div className="bg-white rounded-full px-4 py-3 mb-2 flex items-center justify-between border border-primary-200">
              <span className="text-sm sm:text-base font-semibold text-primary-500">
                {voucherCode}
              </span>
              <button
                onClick={handleCopyCode}
                className={`p-2 rounded-full transition-all duration-200 cursor-pointer ${
                  copySuccess 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
                title={copySuccess ? 'Copied!' : 'Copy voucher code'}
              >
                {copySuccess ? (
                  <Check className="w-4 h-4" strokeWidth={2} />
                ) : (
                  <img src={CopyIcon} alt="Copy" className="w-4 h-4" />
                )}
              </button>
            </div>
            
            {/* Copy Success Message */}
            {copySuccess && (
              <div className="text-center mb-2">
                <span className="text-sm text-green-600 font-medium">
                  ✓ Voucher code copied to clipboard!
                </span>
              </div>
            )}

            {/* Valid Till */}
            <p className="text-sm text-primary-200 font-medium mb-4">
              Valid Till: 30 Sep, 2025
            </p>

            {/* Balance */}
            <p className="text-sm text-primary-500 font-semibold mb-2">
              Your MatePoints Balance: {redemption?.newPointBalance || '45'}
            </p>

            {/* Use Reward Button */}
            <button
              onClick={handleUseReward}
              className="w-full bg-[#111827] hover:bg-gray-900 text-white font-medium py-3 px-4 rounded-lg! transition-colors cursor-pointer"
            >
              Use Reward Now
            </button>
          </div>

          {/* Back to Rewards */}
          <div className="text-center">
            <Button
              onClick={handleBackToRewards}
              variant="outline"
              size="sm"
              className="text-primary-500 border-primary-200"
            >
              Back to Rewards
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default RewardSuccessPage;
