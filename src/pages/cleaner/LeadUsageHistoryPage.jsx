import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, History as HistoryIcon, Clock } from "lucide-react";
import { PageHeader, PaginationRanges, Loader, Button, Calendar, CustomSelect, DateRangePicker } from "../../components";
import { subscriptionsAPI } from "../../services/api";
import dayjs from "dayjs";

const LeadUsageHistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const limit = 10;

  const fetchHistory = async (pageNumber = 1, rangeOverride = null, sortOverride = null, orderOverride = null) => {
    setLoading(true);
    setError("");
    const currentRange = rangeOverride !== null ? rangeOverride : dateRange;
    const currentSortBy = sortOverride !== null ? sortOverride : sortBy;
    const currentSortOrder = orderOverride !== null ? orderOverride : sortOrder;

    try {
      const response = await subscriptionsAPI.getHistory({ 
        page: pageNumber, 
        limit,
        sortBy: currentSortBy,
        sortOrder: currentSortOrder,
        startDate: currentRange?.from ? dayjs(currentRange.from).format('YYYY-MM-DD') : undefined,
        endDate: currentRange?.to ? dayjs(currentRange.to).format('YYYY-MM-DD') : undefined
      });
      
      if (response.success) {
        setHistory(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        } else {
          setTotalPages(1);
        }
      } else {
        setError("Failed to fetch history");
      }
    } catch (err) {
      console.error("Error fetching history:", err);
      setError("An error occurred while fetching history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(page);
  }, [page]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-AU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <PageHeader
          title="Lead Usage History"
          onBack={() => navigate(-1)}
          className="mb-6"
        />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col min-w-0">
                <h3 className="text-[20px] font-semibold text-[#111827]">
                  Lead Usage History
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Track the credits used when you respond to customer job leads.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Advanced Date Range Picker */}
                <div className="w-64">
                  <DateRangePicker 
                    range={dateRange}
                    onRangeChange={setDateRange}
                    placeholder="Select Date Range"
                  />
                </div>

                <div className="w-36 h-[46px]">
                  <CustomSelect 
                    value={sortBy}
                    onChange={(val) => {
                      setSortBy(val);
                      // Auto apply sorting
                      // fetchHistory(1); // Usually sorting is auto-applied or needs a button
                    }}
                    placeholder="Sort By"
                    options={[
                      { label: 'Date', value: 'createdAt' },
                      { label: 'Amount', value: 'amount' },
                      { label: 'Type', value: 'type' }
                    ]}
                  />
                </div>
                
                <div className="w-36 h-[46px]">
                  <CustomSelect 
                    value={sortOrder}
                    onChange={setSortOrder}
                    placeholder="Order"
                    options={[
                      { label: 'Newest First', value: 'desc' },
                      { label: 'Oldest First', value: 'asc' }
                    ]}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="primary" 
                    onClick={() => fetchHistory(1)}
                    className="px-5 h-[46px] rounded-xl text-sm"
                  >
                    Apply
                  </Button>
                  {(dateRange?.from || dateRange?.to || sortBy !== 'createdAt' || sortOrder !== 'desc') && (
                    <button 
                      onClick={() => {
                        const resetRange = { from: null, to: null };
                        setDateRange(resetRange);
                        setSortBy('createdAt');
                        setSortOrder('desc');
                        fetchHistory(1, resetRange, 'createdAt', 'desc');
                      }}
                      className="w-[46px] h-[46px] flex items-center justify-center rounded-xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                      title="Clear Filters"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="min-h-[400px] flex flex-col">
            {loading && history.length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-10">
                <Loader message="Loading history details..." />
              </div>
            ) : error ? (
              <div className="flex-1 p-12 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                  <Clock className="w-8 h-8" />
                </div>
                <p className="text-red-600 font-semibold">{error}</p>
                <button
                  onClick={() => fetchHistory(page)}
                  className="mt-4 text-primary-600 font-bold hover:underline"
                >
                  Try Again
                </button>
              </div>
            ) : history.length > 0 ? (
              <>
                <div className="divide-y divide-[#F9FAFB]">
                  {history.map((item, idx) => (
                    <div
                      key={item._id || idx}
                      className="px-6 py-5 hover:bg-[#F9FAFB] transition-colors flex justify-between items-center"
                    >
                      <div className="flex gap-4 items-center">
                        <div>
                          <p className="text-[16px] font-semibold text-[#111827] leading-tight mb-1">
                            {item.type === "debit" &&
                            item.jobId?.categoryId?.name &&
                            item.jobId?.serviceTypeId?.name
                              ? `${item.jobId.categoryId.name} - ${item.jobId.serviceTypeId.name}`
                              : item.description}
                            {item.reason === "bonus_lead_usage" && (
                              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold text-[#1F6FEB] bg-blue-50 rounded-full border border-blue-100 uppercase tracking-tight">
                                Bonus Lead
                              </span>
                            )}
                          </p>
                          <p className="text-[13px] text-gray-400 font-medium">
                            {item.jobId ? (
                              <>
                                #
                                {typeof item.jobId === "object"
                                  ? item.jobId?.jobId
                                  : item.jobId}{" "}
                                •
                              </>
                            ) : null}{" "}
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p
                          className={`text-[14px] font-semibold leading-none mb-1 ${item.type === "credit" ? "text-[#10B981]" : "text-[#EF4444]"}`}
                        >
                          {item.type === "credit" ? "+" : "-"}
                          {Math.abs(item.amount)}
                        </p>
                        <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-widest leading-none">
                          CREDITS
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-8 border-t border-gray-50 mt-auto bg-gray-50/30">
                  <PaginationRanges
                    count={totalPages}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    hideIfSinglePage={false}
                  />
                </div>
              </>
            ) : (
              <div className="flex-1 p-20 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-200">
                  <HistoryIcon className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="text-gray-500 font-bold text-lg">
                  No Lead Activity Found
                </h4>
                <p className="text-gray-400 text-sm max-w-xs mx-auto mt-1">
                  Your lead activity will appear here once you start responding
                  to customer jobs.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadUsageHistoryPage;
