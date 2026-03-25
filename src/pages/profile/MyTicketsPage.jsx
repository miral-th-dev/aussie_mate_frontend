import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader, Loader } from '../../components';
import { Plus, Inbox, Clock, CheckCircle2, Search } from 'lucide-react';

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('open');
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]); // Empty by default as per request

  const tabs = [
    { id: 'open', label: 'Open', icon: <Inbox className="w-4 h-4" /> },
    { id: 'in_progress', label: 'In Progress', icon: <Clock className="w-4 h-4" /> },
    { id: 'resolved', label: 'Resolved', icon: <CheckCircle2 className="w-4 h-4" /> }
  ];

  const handleBack = () => {
    navigate('/help');
  };

  const handleRaiseTicket = () => {
    navigate('/raise-ticket');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <PageHeader
            title="My Tickets"
            onBack={handleBack}
            className="mb-0"
          />
          <button
            onClick={handleRaiseTicket}
            className="flex items-center justify-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-full shadow-lg shadow-primary-500/20 transition-all font-medium text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 rounded-full bg-white text-[#1F6FEB] " />
            <span>Raise New Ticket</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-10 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-w-[80px] items-center justify-center gap-2 py-2 px-3 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-900 bg-white border border-gray-100'
              }`}
            >
              {/* <span className={`p-1.5 rounded-lg! ${activeTab === tab.id ? 'bg-primary-100/50' : 'bg-transparent'}`}>
                {tab.icon}
              </span> */}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className=" flex flex-col items-center justify-center p-10">
          {loading ? (
            <div className="">
              <Loader message="Fetching your tickets..." />
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center max-w-sm w-full">
              {/* <div className="relative mb-12">
                <div className="w-36 h-36 bg-gray-50 rounded-[56px] flex items-center justify-center mx-auto border-2 border-dashed border-gray-200/60 shadow-inner">
                  <Inbox className="w-14 h-14 text-gray-200" strokeWidth={1} />
                </div>
                <div className="absolute -bottom-2 right-[25%] sm:right-[30%] w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-gray-50 animate-bounce-slow">
                  <Search className="w-7 h-7 text-primary-200" />
                </div>
              </div> */}

              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No Tickets Found
              </h3>
              <p className="text-gray-400 font-medium text-base leading-relaxed mb-6">
                We couldn't find any <span className="text-primary-400 capitalize">{activeTab.replace('_', ' ')}</span> tickets in your history.
              </p>

              {/* <button
                onClick={handleRaiseTicket}
                className=" bg-primary-500 text-white px-6 py-3 rounded-full font-medium text-lg cursor-pointer"
              >
                Get Support
              </button> */}
            </div>
          ) : (
            <div className="w-full">
              {/* Tickets list placeholder - would be populated with ticket items */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTicketsPage;
