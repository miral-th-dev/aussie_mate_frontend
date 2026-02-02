import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const CompletionProofSection = ({ beforeImages = [], afterImages = [] }) => {
  const [proofModal, setProofModal] = useState({ isOpen: false, images: [], index: 0, label: '' });

  useEffect(() => {
    if (!proofModal.isOpen) {
      document.body.style.overflow = '';
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow || '';
    };
  }, [proofModal.isOpen]);

  const resolveImageSrc = (image) => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url || image.path || image.secureUrl || '';
  };

  const openProofModal = (images, index, label) => {
    if (!Array.isArray(images) || !images.length) return;
    setProofModal({ isOpen: true, images, index, label });
  };

  const closeProofModal = () => {
    setProofModal({ isOpen: false, images: [], index: 0, label: '' });
  };

  const showProofPrev = () => {
    setProofModal((prev) => {
      if (!prev.isOpen || prev.index === 0) return prev;
      return { ...prev, index: prev.index - 1 };
    });
  };

  const showProofNext = () => {
    setProofModal((prev) => {
      if (!prev.isOpen || prev.index >= prev.images.length - 1) return prev;
      return { ...prev, index: prev.index + 1 };
    });
  };

  const jumpToProof = (index) => {
    setProofModal((prev) => {
      if (!prev.isOpen) return prev;
      return { ...prev, index };
    });
  };

  const renderProofGroup = (images = [], label = 'Photos', emptyText = 'No photos available') => {
    const resolvedImages = Array.isArray(images)
      ? images.map(resolveImageSrc).filter(Boolean)
      : [];

    if (!resolvedImages.length) {
      return (
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">{label}</div>
          <div className="flex items-center justify-center bg-gray-100 rounded-xl h-40 text-gray-500 text-sm">
            {emptyText}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</div>
        <div className="flex flex-wrap gap-2 sm:gap-3 bg-[#E5E7EB] rounded-xl p-[6px] w-fit">
          {resolvedImages.slice(0, 4).map((src, index) => {
            const isOverflowTile = index === 3 && resolvedImages.length > 4;
            const remaining = resolvedImages.length - 4;

            return (
              <button
                key={`${label}-${index}`}
                type="button"
                onClick={() => openProofModal(resolvedImages, index, label)}
                className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl! overflow-hidden focus:outline-none hover:scale-[1.03] transition-transform duration-200 cursor-pointer"
              >
                <img
                  src={src}
                  alt={`${label} ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {isOverflowTile && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="text-white text-sm sm:text-base font-semibold">+{remaining}</span>
                  </div>
                )}
              </button>
            );
          })}

          {resolvedImages.length > 4 &&
            resolvedImages.slice(4).map((_, index) => (
              <button
                key={`${label}-hidden-${index}`}
                type="button"
                onClick={() => openProofModal(resolvedImages, index + 4, label)}
                className="hidden"
                aria-hidden="true"
              />
            ))}
        </div>
      </div>
    );
  };

  const resolvedBeforeImages = useMemo(
    () => (Array.isArray(beforeImages) ? beforeImages.map(resolveImageSrc).filter(Boolean) : []),
    [beforeImages]
  );
  const resolvedAfterImages = useMemo(
    () => (Array.isArray(afterImages) ? afterImages.map(resolveImageSrc).filter(Boolean) : []),
    [afterImages]
  );

  if (resolvedBeforeImages.length === 0 && resolvedAfterImages.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-primary-500 mb-1">Completion Proof</h3>
        <p className="text-sm text-gray-500 mt-2">No photos uploaded</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-primary-500 mb-1">Completion Proof</h3>
        <div className="grid gap-6 md:grid-cols-2">
          {renderProofGroup(beforeImages, 'Before Photos', 'No before photos')}
          {renderProofGroup(afterImages, 'After Photos', 'No after photos')}
        </div>
      </div>

      {proofModal.isOpen && proofModal.images[proofModal.index] && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 px-4">
          <div className="relative w-full max-w-4xl">
            <button
              type="button"
              onClick={closeProofModal}
              className="absolute -top-10 right-0 text-white hover:text-primary-200 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" strokeWidth={2.5} />
            </button>

            <div className="relative">
              <img
                src={proofModal.images[proofModal.index]}
                alt={`${proofModal.label} ${proofModal.index + 1}`}
                className="w-full max-h-[70vh] object-contain rounded-2xl"
              />
              <button
                type="button"
                onClick={showProofPrev}
                disabled={proofModal.index === 0}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center"
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={showProofNext}
                disabled={proofModal.index >= proofModal.images.length - 1}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white rounded-full p-2 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors flex items-center justify-center"
              >
                <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
              </button>
            </div>

            {proofModal.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {proofModal.images.map((src, idx) => (
                  <button
                    key={`${proofModal.label}-thumb-${idx}`}
                    type="button"
                    onClick={() => jumpToProof(idx)}
                    className={`h-16 w-16 sm:h-20 sm:w-20 rounded-xl! overflow-hidden border-2 ${
                      idx === proofModal.index ? 'border-primary-500' : 'border-transparent'
                    } cursor-pointer`}
                  >
                    <img
                      src={src}
                      alt={`${proofModal.label} thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

CompletionProofSection.propTypes = {
  beforeImages: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.object])
  ),
  afterImages: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.object])
  ),
};

CompletionProofSection.defaultProps = {
  beforeImages: [],
  afterImages: [],
};

export default CompletionProofSection;

