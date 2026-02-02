import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowLeftIcon from '../../assets/arrow-left.svg';

const PageHeader = ({
  title,
  subtitle,
  onBack,
  showBack = true,
  backLabel = 'Go back',
  rightSlot = null,
  children = null,
  className = '',
  titleClassName = 'text-lg sm:text-xl font-semibold text-gray-900',
  subtitleClassName = 'text-sm text-primary-200 font-medium',
  backButtonClassName = 'p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer',
}) => {
  const navigate = useNavigate();

  const handleBack = (event) => {
    if (onBack) {
      onBack(event);
      return;
    }
    navigate(-1);
  };

  const trailingContent = rightSlot ?? children;
  const containerClassName = [
    'flex',
    'items-center',
    trailingContent ? 'justify-between' : 'justify-start',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClassName}>
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className={backButtonClassName}
          >
            <span className="sr-only">{backLabel}</span>
            <img src={ArrowLeftIcon} alt="" className="w-5 h-5" />
          </button>
        )}
        <div className="flex flex-col">
          <h1 className={titleClassName}>{title}</h1>
          {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
        </div>
      </div>
      {trailingContent}
    </div>
  );
};

export default PageHeader;

