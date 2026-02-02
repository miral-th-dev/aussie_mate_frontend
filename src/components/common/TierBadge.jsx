import React from 'react';
import GoldBadgeIcon from '../../assets/goldBadge.svg';
import SilverBadgeIcon from '../../assets/silverBadge.svg';
import BronzeBadgeIcon from '../../assets/bronzeBadge.svg';

const TierBadge = ({ tier, className = '', iconClassName = 'w-4 h-4 mr-1', showText = true }) => {
  if (!tier || tier === 'none' || tier === '' || tier === null || tier === undefined) {
    return null;
  }

  const tierConfig = {
    gold: {
      bgClass: 'bg-[linear-gradient(94.49deg,#FFDBAE_0%,#FFE7C4_100%)]',
      borderClass: 'border-[#FFDBAE]',
      icon: GoldBadgeIcon,
      label: 'Gold'
    },
    silver: {
      bgClass: 'bg-[linear-gradient(94.49deg,#FDFDFD_0%,#E9E9E9_100%)]',
      borderClass: 'border-primary-200',
      icon: SilverBadgeIcon,
      label: 'Silver'
    },
    bronze: {
      bgClass: 'bg-[linear-gradient(94.49deg,#D4A574_0%,#E6C7A3_100%)]',
      borderClass: 'border-[#CD7F32]',
      icon: BronzeBadgeIcon,
      label: 'Bronze'
    }
  };

  const tierLower = String(tier).toLowerCase();
  const config = tierConfig[tierLower];

  if (!config) {
    return null;
  }

  return (
    <div className={`flex items-center px-2 py-1 rounded-full border ${config.bgClass} ${config.borderClass} ${className}`}>
      {config.icon && (
        <img 
          src={config.icon} 
          alt={`${config.label} Badge`} 
          className={iconClassName} 
        />
      )}
      {showText && (
        <span className="text-sm font-medium text-primary-500 capitalize">
          {config.label}
        </span>
      )}
    </div>
  );
};

export default TierBadge;

