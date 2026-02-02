import React from 'react';

/**
 * PageLayout Component
 * Common wrapper for pages with consistent container styling
 * Note: Background is provided by AppLayout, this only handles container
 */
const PageLayout = ({ 
  children, 
  className = '', 
  containerClassName = '',
  maxWidth = 'max-w-7xl' 
}) => {
  return (
    <div className={`mx-auto w-full ${maxWidth} ${containerClassName} ${className}`}>
      {children}
    </div>
  );
};

export default PageLayout;

