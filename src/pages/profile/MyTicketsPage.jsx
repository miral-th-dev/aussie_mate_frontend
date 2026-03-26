import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader, Loader } from "../../components";
import { Plus, Inbox, Clock, CheckCircle2 } from "lucide-react";
import { supportTicketsAPI, handleAPIError } from "../../services/api";

const MyTicketsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Open");
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);

  const tabs = [
    { id: "Open", label: "Open", icon: <Inbox className="w-4 h-4" /> },
    {
      id: "In Progress",
      label: "In Progress",
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: "Resolved",
      label: "Resolved",
      icon: <CheckCircle2 className="w-4 h-4" />,
    },
    { id: "Closed", label: "Closed", icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  useEffect(() => {
    fetchTickets(activeTab);
  }, [activeTab]);

  const fetchTickets = async (status) => {
    try {
      setLoading(true);
      const response = await supportTicketsAPI.getMyTickets(status);
      if (response.success) {
        setTickets(response.data || []);
      }
    } catch (error) {
      console.error(handleAPIError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/help");
  };

  const handleRaiseTicket = () => {
    navigate("/raise-ticket");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "In Progress":
        return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "Resolved":
        return "bg-green-100 text-green-600 border-green-200";
      case "Closed":
        return "bg-gray-100 text-gray-600 border-gray-200";
      default:
        return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <PageHeader title="My Tickets" onBack={handleBack} className="mb-0" />
          <button
            onClick={handleRaiseTicket}
            className="flex items-center justify-center gap-2 bg-primary-500 text-white px-4 py-2.5 rounded-full shadow-lg shadow-primary-500/20 transition-all font-medium text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4 rounded-full bg-white text-[#1F6FEB] " />
            <span>Raise New Ticket</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mb-10 gap-1 overflow-x-auto no-scrollbar pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex min-w-[80px] items-center justify-center gap-2 py-2 px-3 rounded-xl font-medium text-sm transition-all duration-300 cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-primary-500 text-white"
                  : "text-gray-900 bg-white border border-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-full">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20">
              <Loader message="Fetching your tickets..." />
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center mx-auto">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                No Tickets Found
              </h3>
              <p className="text-gray-400 font-medium text-base leading-relaxed mb-6">
                We couldn't find any{" "}
                <span className="text-primary-400 capitalize">
                  {activeTab.replace("_", " ")}
                </span>{" "}
                tickets in your history.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket._id || ticket.id}
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => navigate(`/my-tickets/${ticket._id || ticket.id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">
                        #{ticket.ticketId}
                      </span>
                      <h4 className="text-lg font-bold text-gray-900 leading-tight">
                        {ticket.category}
                      </h4>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[12px] font-bold border ${getStatusColor(
                        ticket.status
                      )}`}
                    >
                      {ticket.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium">
                    {ticket.description}
                  </p>
                  <div className="flex items-center justify-between text-[12px] text-gray-400 font-bold border-t border-gray-50 pt-3">
                    <span>
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                    {ticket.adminNote && (
                      <span className="text-blue-500 bg-blue-50 px-2 py-1 rounded flex items-center gap-1">
                        <Inbox className="w-3 h-3" />
                        Admin Replied
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTicketsPage;
