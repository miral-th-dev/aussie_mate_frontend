import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components';
import MessageIcon from '../../assets/message.svg';
import RightIcon from '../../assets/right.svg';
import QuestionMarkIcon from '../../assets/questionMark.svg';
import HelpBG from '../../assets/helpBG.jpg';

const HelpSupportPage = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleLiveChat = () => {
    navigate('/live-chat');
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <PageHeader
          title="Help & Support"
          onBack={handleBack}
          className="mb-6"
          titleClassName="text-lg sm:text-xl font-semibold text-gray-900"
        />

        {/* Need Help Section */}
        <div className="mb-6 rounded-2xl shadow-custom">
          <div className="relative rounded-xl p-6 sm:p-10 overflow-hidden flex flex-col sm:block items-center sm:items-start text-center sm:text-left">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img src={HelpBG} alt="Help Background" className="w-full h-full object-cover" />
            </div>

            {/* Question Marks Background */}
            <div className="relative sm:absolute right-4 top-4 flex items-center justify-center mb-6 sm:mb-0 order-1 sm:order-none">
              <img
                src={QuestionMarkIcon}
                alt="Question Mark"
                className="w-24 h-24 sm:w-32 sm:h-32"
              />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 sm:pr-24 order-2 sm:order-none">
              <h2 className="text-2xl sm:text-3xl font-semibold text-primary-500 mb-2">
                Need help?
              </h2>
              <p className="text-[#374151] font-medium text-base sm:text-lg leading-relaxed max-w-[280px] sm:max-w-none mx-auto sm:mx-0">
                We're here to assist you with bookings, payments, and more.
              </p>
            </div>
          </div>
        </div>

        {/* Live Chat Support Section */}
        <div className="mb-6">
          <div
            className="bg-white rounded-2xl border border-gray-200 shadow-custom p-4 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={handleLiveChat}
          >
            <div className="flex items-center gap-4">
              {/* Chat Icon */}
              <div className="flex-shrink-0">
                <img src={MessageIcon} alt="Live Chat" className="w-10 h-10" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-primary-500 mb-1">
                  Live Chat Support
                </h3>
                <p className="text-sm text-primary-200 font-medium">
                  Talk directly to an Aussie Mate support admin.
                </p>
              </div>

              {/* Arrow Icon */}
              <div className="flex-shrink-0">
                <img src={RightIcon} alt="Arrow" className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default HelpSupportPage;

