import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { PageHeader } from '../../components';
import ExportIcon from '../../assets/export.svg';
import BusinessIcon from '../../assets/business.svg';
import DollarIcon from '../../assets/dollar.svg';
import TimeIcon from '../../assets/time.svg';

const EarningsPage = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('Weekly');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Sample data - replace with actual API data
  const earningsData = {
    thisWeek: 560.00,
    pending: 176.00,
    lifetime: 12450.00,
    payout: {
      amount: 176.00,
      releaseDate: 'Sep 4, 2025',
      method: 'Bank Transfer • 1234'
    },
    weeklyChart: [
      { day: 'Mon', amount: 1200 },
      { day: 'Tue', amount: 1800 },
      { day: 'Wed', amount: 87455 }, 
      { day: 'Thu', amount: 2200 },
      { day: 'Fri', amount: 1500 },
      { day: 'Sat', amount: 1900 },
      { day: 'Sun', amount: 1100 }
    ],
    jobs: [
      {
        id: 1,
        title: 'Bond Cleaning',
        date: 'Sep 1, 2025',
        amount: 176.00,
        status: 'Completed',
        fee: '20%'
      },
      {
        id: 2,
        title: 'Carpet Cleaning',
        date: 'Aug 29, 2025',
        amount: 120.00,
        status: 'Completed',
        fee: '20%'
      },
      {
        id: 3,
        title: 'Retail Audit',
        date: 'Aug 27, 2025',
        amount: 0.00,
        status: 'Completed',
        fee: '20%'
      }
    ]
  };

  const maxAmount = Math.max(...earningsData.weeklyChart.map(item => item.amount));

  // Dropdown options
  const periodOptions = ['Weekly', 'Monthly', 'Yearly'];

  const handlePeriodSelect = (period) => {
    setSelectedPeriod(period);
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PageHeader
          title="Earnings Dashboard"
          onBack={() => navigate(-1)}
          rightSlot={
            <button className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl! transition-colors cursor-pointer">
              <img src={ExportIcon} alt="Export" className="w-4 h-4" />
              <span className="text-sm font-medium text-gray-700">Export</span>
            </button>
          }
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0!">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* This Week's Earnings */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                  <img src={BusinessIcon} alt="Earnings" className="w-12 h-12" />
                <div>
                  <h3 className="text-sm font-medium text-gray-600">This Week's Earnings</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">${earningsData.thisWeek.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending (Escrow) */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2  rounded-lg">
                  <img src={TimeIcon} alt="Pending" className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Pending (Escrow)</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">${earningsData.pending.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Lifetime Earnings */}
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 ">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg">
                  <img src={DollarIcon} alt="Lifetime" className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-600">Lifetime Earnings</h3>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">${earningsData.lifetime.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payout Summary */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-primary-500 mb-4">Payout Summary</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <p className="text-sm font-medium text-primary-200 mb-1">Amount</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">${earningsData.payout.amount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-primary-200 mb-1">Release Date</p>
              <p className="text-lg font-medium text-primary-500">{earningsData.payout.releaseDate}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-primary-200 mb-1">Payout Method</p>
              <p className="text-lg font-medium text-primary-500">{earningsData.payout.method}</p>
            </div>
          </div>
        </div>

        {/* This Week's Earnings Chart */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 md:mb-6 gap-2 sm:gap-0">
            <div>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold text-primary-500">This Week's Earnings</h2>
              <p className="text-xs sm:text-sm text-primary-200 font-medium">3 jobs completed</p>
            </div>
            {/* Custom Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 focus:outline-none text-primary-200 font-medium"
              >
                <span className="text-primary-200">{selectedPeriod}</span>
                <ChevronDown
                  className={`w-4 h-4 ml-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                  strokeWidth={2}
                />
              </button>
              
              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {periodOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handlePeriodSelect(option)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
                        selectedPeriod === option ? 'bg-blue-50 text-primary-500' : 'text-primary-200'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart */}
          <div className="space-y-2 sm:space-y-4">
            {/* Chart Container with Grid Lines */}
            <div className="relative h-40 sm:h-48 md:h-56 bg-gray-50 rounded-lg p-2 sm:p-4">
              {/* Grid Lines */}
              <div className="absolute inset-2 sm:inset-4 flex flex-col justify-between">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="border-t border-gray-200"></div>
                ))}
              </div>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-2 sm:top-4 bottom-2 sm:bottom-4 flex flex-col justify-between text-xs text-primary-200 font-medium">
                <span className="text-xs">$100k</span>
                <span className="text-xs">$80k</span>
                <span className="text-xs">$60k</span>
                <span className="text-xs">$40k</span>
                <span className="text-xs">$20k</span>
                <span className="text-xs">$0</span>
              </div>
              
              {/* Chart Bars */}
              <div className="flex items-end justify-between h-full pl-6 sm:pl-8 pr-2 sm:pr-4">
                {earningsData.weeklyChart.map((item, index) => {
                  // Calculate height based on a max of $100,000 for better visualization
                  const chartMax = 100000;
                  let height = (item.amount / chartMax) * 100;
                  
                  // Find the highest amount to determine which bar should be highlighted
                  const maxAmount = Math.max(...earningsData.weeklyChart.map(day => day.amount));
                  const isHighlighted = item.amount === maxAmount;
                  
                  // Ensure minimum height for visibility and cap at 100%
                  height = Math.max(height, 5); // Minimum 5% height for visibility
                  height = Math.min(height, 100); // Maximum 100% height
                  
                  // Debug log for highest bar
                  if (isHighlighted) {
                    console.log('Highest bar:', { day: item.day, amount: item.amount, height, isHighlighted });
                    console.log('Bar style will be:', { height: `${height}%`, minHeight: '100%' });
                  }
                  
                  return (
                    <div key={index} className="flex flex-col items-center flex-1 relative group">
                      <div className="relative w-6 sm:w-8 md:w-10 h-full flex items-end">
                        <div
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            isHighlighted 
                              ? 'bg-[#3354F4] border-2 border-[#1F6FEB] shadow-lg' 
                              : 'bg-[#E6EEF5] hover:bg-gray-500'
                          }`}
                          style={{ 
                            height: `${height}%`,
                            minHeight: isHighlighted ? '50px' : '20px'
                          }}
                        ></div>
                        
                        {/* Tooltip for highlighted bar - always visible */}
                        {isHighlighted && (
                          <div className="absolute -top-12 sm:-top-16 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 rounded-lg shadow-lg px-2 sm:px-3 py-1 sm:py-2 text-xs whitespace-nowrap z-10 opacity-100">
                            <div className="text-gray-600 text-xs">Aug 28</div>
                            <div className="font-bold text-gray-900 text-xs sm:text-sm">${item.amount.toLocaleString()}</div>
                            <div className="text-gray-600 text-xs">Bond Cleaning</div>
                            {/* Arrow pointing down */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 sm:border-l-4 border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-l-transparent border-r-transparent border-t-white"></div>
                          </div>
                        )}
                      </div>
                      
                      {/* Day labels */}
                      <div className="mt-1 sm:mt-2 text-xs font-medium text-primary-500">{item.day}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Job-wise Breakdown */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-primary-500">Job-wise Breakdown</h2>
          </div>
          
          <div className="mx-3">
            {earningsData.jobs.map((job) => (
              <div key={job.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors border-b border-primary-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-primary-500 mb-1 capitalize">{job.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{job.date}</p>
                    <p className="text-sm font-medium text-primary-200">
                      ${job.amount.toFixed(2)} (after {job.fee} fee)
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#DBF9E7] text-green-500">
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default EarningsPage;
