import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageHeader, Loader } from '../../../components';
import { userAPI } from '../../../services/api';
import dayjs from 'dayjs';

const WalletPage = () => {
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchWallet = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await userAPI.getWallet();
      if (response.success) {
        setWalletData(response.data);
      } else {
        setError(response.message || 'Unable to fetch wallet details.');
      }
    } catch (err) {
      console.error('Error fetching wallet:', err);
      // Fallback to empty state on error matching the new structure
      setWalletData({
        walletCredit: 0,
        holdBalance: 0,
        availableBalance: 0,
        sessionsSummary: { total: 0, completed: 0, refunded: 0, upcoming: 0, inProgress: 0 },
        transactionHistory: [],
        missedSessions: [],
        upcomingSessions: [],
        completedSessions: [],
        refundedSessions: []
      });
      setError('Unable to fetch wallet details at this time.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const refundSingleSession = async (occurrenceId) => {
    try {
      const response = await userAPI.refundMissedSession(occurrenceId);
      if (response.success) {
        alert(`$${response.data.refundAmount} added to wallet!`);
        fetchWallet(); // Refresh wallet data
      } else {
        alert(response.message || 'Refund failed');
      }
    } catch (err) {
      console.error('Error refunding single session:', err);
      alert('An error occurred while processing the refund.');
    }
  };

  const refundAllMissed = async () => {
    try {
      const response = await userAPI.refundAllMissedSessions();
      if (response.success) {
        alert(`$${response.data.totalRefunded} added to wallet!`);
        fetchWallet(); // Refresh wallet data
      } else {
        alert(response.message || 'Bulk refund failed');
      }
    } catch (err) {
      console.error('Error refunding all sessions:', err);
      alert('An error occurred while processing the bulk refund.');
    }
  };

  const filteredHistory = useMemo(() => {
    const history = walletData?.transactionHistory || [];
    if (!searchQuery.trim()) return history;

    const query = searchQuery.toLowerCase();
    return history.filter(item =>
      (item.type && item.type.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.jobId && item.jobId.toLowerCase().includes(query))
    );
  }, [walletData, searchQuery]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader message="Fetching wallet data..." />
      </div>
    );
  }

  const missedSessions = walletData?.missedSessions || [];
  const upcomingSessions = walletData?.upcomingSessions || [];
  const completedSessions = walletData?.completedSessions || [];
  const refundedSessions = walletData?.refundedSessions || [];
  const summary = walletData?.sessionsSummary || {};

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-12">
      {/* Header Container */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6">
        <PageHeader title="Wallet & Sessions" onBack={() => navigate(-1)} />

        {/* Balance Cards Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Wallet Balance */}
          <div className="md:col-span-2 relative overflow-hidden rounded-[32px] p-8 text-white shadow-xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8]">
            <div className="absolute top-[-20%] right-[-10%] w-[200px] h-[200px] bg-white opacity-10 blur-[60px] rounded-full"></div>
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-4">Total Wallet Credit</p>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-bold">${walletData?.walletCredit || 0}</span>
                <span className="text-lg opacity-80 mb-1">AUD</span>
              </div>
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
                  <p className="text-[10px] font-medium opacity-80 uppercase">Available</p>
                  <p className="font-bold">${walletData?.availableBalance || 0}</p>
                </div>
                <div className="px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20">
                  <p className="text-[10px] font-medium opacity-80 uppercase">On Hold</p>
                  <p className="font-bold">${walletData?.holdBalance || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action / Refund All Card */}
          <div className="bg-white rounded-[32px] p-8 border border-[#E5E7EB] shadow-sm flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#6B7280] mb-2">Pending Refunds</p>
              <h3 className="text-2xl font-bold text-[#111827]">{missedSessions.length} Sessions</h3>
            </div>
            {missedSessions.length > 0 ? (
              <button
                onClick={refundAllMissed}
                className="w-full bg-[#111827] text-white font-bold py-4 rounded-2xl transition-all hover:bg-black active:scale-95 shadow-lg shadow-black/10 mt-6"
              >
                Refund All Missed
              </button>
            ) : (
              <p className="text-sm text-[#9CA3AF] mt-6 italic">No missed sessions pending refund.</p>
            )}
          </div>
        </div>

        {/* Sessions Summary Grid */}
        <div className="mt-10">
          <h3 className="text-lg font-bold text-[#111827] mb-4">Sessions Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Total', value: summary.total, color: 'blue' },
              { label: 'Completed', value: summary.completed, color: 'green' },
              { label: 'Refunded', value: summary.refunded, color: 'orange' },
              { label: 'Upcoming', value: summary.upcoming, color: 'indigo' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white p-4 rounded-2xl border border-[#F3F4F6] text-center shadow-sm">
                <p className="text-[10px] font-bold uppercase text-[#6B7280] mb-1">{stat.label}</p>
                <p className={`text-xl font-bold text-${stat.color}-600`}>{stat.value || 0}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Missed Sessions */}
        {missedSessions.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-[#111827] mb-6 flex items-center gap-2">
              Missed Sessions <span className="bg-orange-100 text-orange-600 text-xs py-1 px-3 rounded-full">{missedSessions.length}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {missedSessions.map((session) => (
                <div key={session.occurrenceId} className="bg-white p-5 rounded-[24px] border border-[#E5E7EB] shadow-sm hover:border-orange-200 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="bg-orange-50 text-orange-600 text-[10px] font-bold px-2 py-1 rounded uppercase mb-2 inline-block">Missed</span>
                      <h4 className="font-bold text-[#111827]">Job #{session.jobId}</h4>
                      <p className="text-xs text-[#6B7280]">{dayjs(session.scheduledDate).format('D MMM YYYY, hh:mm A')}</p>
                    </div>
                    <span className="text-lg font-bold text-[#111827]">${session.amount}</span>
                  </div>
                  <button
                    onClick={() => refundSingleSession(session.occurrenceId)}
                    className="w-full bg-orange-50 text-orange-600 font-bold py-2.5 rounded-xl transition-all hover:bg-orange-600 hover:text-white group-hover:shadow-md active:scale-95 text-sm"
                  >
                    Claim Refund
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Sessions */}
        {upcomingSessions.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-bold text-[#111827] mb-6">Upcoming Bookings</h3>
            <div className="space-y-4">
              {upcomingSessions.map((session, idx) => (
                <div key={idx} className="bg-white p-4 rounded-2xl border border-[#F3F4F6] flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold">
                      {dayjs(session.scheduledDate).format('DD')}
                    </div>
                    <div>
                      <h4 className="font-bold text-[#111827]">Session #{session.occurrenceIndex} of {session.jobId}</h4>
                      <p className="text-xs text-[#6B7280]">{dayjs(session.scheduledDate).format('dddd, hh:mm A')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#111827]">${session.amount}</p>
                    <span className="text-[10px] text-blue-500 font-medium uppercase">{session.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History Section */}
        <div className="mt-12 pt-8 border-t border-[#E5E7EB]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-2xl font-bold text-[#111827]">Activity Log</h3>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                placeholder="Search activity..."
                className="w-full bg-white border border-[#E5E7EB] rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-6">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item, index) => {
                const isRefund = item.type === 'refund';
                return (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isRefund ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                        {isRefund ? 'R' : 'P'}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#111827] text-sm group-hover:text-blue-600 transition-colors">
                          {item.description}
                        </h4>
                        <p className="text-[11px] text-[#9CA3AF]">
                          Job #{item.jobId} • {dayjs(item.date).format('D MMM YYYY, h:mm A')}
                        </p>
                      </div>
                    </div>
                    <div className={`font-bold ${isRefund ? 'text-orange-600' : 'text-green-600'}`}>
                      {isRefund ? '+' : '-'}${item.amount}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-[#E5E7EB]">
                <p className="text-[#9CA3AF] text-sm">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && !walletData && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-8 py-4 rounded-2xl shadow-2xl text-sm font-bold z-50">
          {error}
        </div>
      )}
    </div>
  );
};

export default WalletPage;
