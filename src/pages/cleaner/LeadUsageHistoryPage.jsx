import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Briefcase, History as HistoryIcon, Clock } from "lucide-react";
import { PageHeader, PaginationRanges, Loader } from "../../components";
import { subscriptionsAPI } from "../../services/api";

const LeadUsageHistoryPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchHistory = async (pageNumber) => {
    setLoading(true);
    setError("");
    try {
      const response = await subscriptionsAPI.getHistory(pageNumber, limit);
      if (response.success) {
        setHistory(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
        } else {
          // Fallback logic if pagination metadata is not directly available
          // (Though our API helper suggests it should be there)
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

        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 bg-white">
            <div className="flex flex-col">
              <h3 className="text-lg font-medium text-gray-900">
                Lead Usage History
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Track the credits used when you respond to customer job leads.
              </p>
            </div>
            <div className="mt-4">
              <span className="text-[14px] font-medium text-gray-300">
                Full Activity Log
              </span>
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
                        {/* <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 border border-gray-100">
                          <Briefcase className="w-6 h-6" strokeWidth={1.5} />
                        </div> */}
                        <div>
                          <p className="text-[14px] font-medium text-[#111827] leading-tight mb-1 flex items-center flex-wrap gap-2">
                            {item.type === "debit" &&
                            item.jobId?.categoryId?.name &&
                            item.jobId?.serviceTypeId?.name
                              ? `${item.jobId.categoryId.name} - ${item.jobId.serviceTypeId.name}`
                              : item.description}
                            {item.reason === "bonus_lead_usage" && (
                              <span className="px-2 py-0.5 text-[10px] font-medium text-[#1F6FEB] bg-blue-50 rounded-full border border-blue-100">
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
                          className={`text-[18px] font-semibold leading-none mb-1 ${item.type === "credit" ? "text-[#10B981]" : "text-[#EF4444]"}`}
                        >
                          {item.type === "credit" ? "+" : "-"}
                          {Math.abs(item.amount)}
                        </p>
                        <p className="text-[10px] font-medium text-gray-400 leading-none">
                          Credits
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
                <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-gray-200">
                  <HistoryIcon className="w-10 h-10 text-gray-300" />
                </div>
                <h4 className="text-gray-900 font-bold text-xl mb-2">
                  No Lead Activity Found
                </h4>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">
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
