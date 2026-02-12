import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import heroVideo from '../assets/onboarding_video.mp4';
import rectangleImage from '../assets/Rectangle 516.png';
const LoginPage = React.lazy(() => import('./auth/LoginPage'));

const HomePage = () => {

  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      {/* Desktop Layout */}
      <div className="hidden lg:flex h-full">
        {/* Left Side - Hero Section */}
        <div className="flex-1 relative ">
          {/* Video Background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
     

          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0  rounded-t-3xl p-6">
            {/* Content */}
            <div className="relative z-10 py-6 max-w-xl">
              <h2 className="text-4xl font-bold text-black mb-4">
                  Find trusted cleaners & home helpers near you
              </h2>
              <p className="text-black text-opacity-80 mb-6 text-lg">
                Post a job, compare quotes, book in minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side - Call to Action */}
        <div className="flex-1 flex items-center justify-center p-12 relative">
            <LoginPage />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Hero Section */}
        <div className="relative h-screen">
          {/* Video Background */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover z-0"
          >
            <source src={heroVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

            {/* Mobile Content Card with Glass Effect */}
            <div className="absolute bottom-0 left-0 right-0 backdrop-blur-lg bg-white/60 rounded-t-3xl p-4">
              {/* Rectangle 516 Image */}
              <div className="absolute inset-0 rounded-t-3xl overflow-hidden">
                <img 
                  src={rectangleImage} 
                  alt="Background" 
                  className="w-full h-full object-cover opacity-20"
                />
              </div>
              
              {/* Content */}
              <div className="relative z-10">
                {/* Logo */}
                <div className="flex items-center justify-center mb-4">
                  <img src={logo} alt="Aussie Mate" className="h-12 w-auto" />
                </div>

                <h2 className="text-xl font-bold text-primary-500 mb-3 text-center">
                  Find trusted cleaners & home helpers near you
                </h2>

                <p className="text-sm text-primary-500 text-opacity-80 mb-6 text-center">
                  Post a job, compare quotes, book in minutes.
                </p>

                {/* Sign In Button */}
                <div className="text-center space-y-4">
                  <Link 
                    to="/login"
                    className="block w-full max-w-sm mx-auto bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-xl transition-colors duration-200 text-sm sm:text-base"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
