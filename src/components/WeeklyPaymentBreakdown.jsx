import React from 'react';
import { Check, X, Clock, DollarSign } from 'lucide-react';

const WeeklyPaymentBreakdown = ({ 
  schedule, 
  totalQuote, 
  showStatus = false, 
  userType = 'customer',
  onPaymentAction 
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <Check className="w-4 h-4 text-green-600" />;
      case 'completed':
        return <Clock className="w-4 h-4 text-blue-600" />;
      case 'scheduled':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <X className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'completed':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'scheduled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const dailyAmount = schedule.length > 0 ? totalQuote / schedule.length : 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Payment Schedule</h3>
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Total: ${totalQuote.toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3">
        {schedule.map((day, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
              showStatus ? getStatusColor(day.status) : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-4">
              {showStatus && (
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border border-current">
                  {getStatusIcon(day.status)}
                </div>
              )}
              <div>
                <p className="font-medium text-gray-900">{day.displayDate}</p>
                <p className="text-sm text-gray-600">
                  {day.dayName} • Week {day.weekNumber}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">
                  ${dailyAmount.toFixed(2)}
                </p>
                {showStatus && (
                  <p className="text-xs text-gray-600 capitalize">
                    {day.status}
                  </p>
                )}
              </div>
              
              {showStatus && userType === 'customer' && day.status === 'completed' && onPaymentAction && (
                <button
                  onClick={() => onPaymentAction(day)}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                >
                  Pay Now
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {schedule.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No payment schedule available</p>
        </div>
      )}
    </div>
  );
};

export default WeeklyPaymentBreakdown;
