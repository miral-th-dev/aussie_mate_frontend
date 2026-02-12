import React from 'react';
import { Header, PageLayout } from './index';
/**
 * AppLayout Component
 * Wraps authenticated pages with Header (full width) and PageLayout
 * Use this to avoid adding Header and PageLayout manually to every page
 */


const AppLayout = ({ children, showHeader = true, usePageLayout = true }) => {
  // Header should be full width (outside PageLayout container)
  // Only page content goes inside PageLayout
  if (usePageLayout) {
    return (
      <div className="min-h-screen bg-gray-50 ">
        {showHeader && <Header />}
        <PageLayout>{children}</PageLayout>
      </div>
    );
  }
  return (
    <>
      {showHeader && <Header />}
      {children}
    </>
  );
};

export default AppLayout;
