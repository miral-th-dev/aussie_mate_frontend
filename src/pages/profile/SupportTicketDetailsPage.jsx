import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader, Loader } from "../../components";
import { Clock, CheckCircle2, Inbox, MessageSquare, Paperclip, Calendar } from "lucide-react";
import { supportTicketsAPI, handleAPIError } from "../../services/api";

const SupportTicketDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTicketDetails();
  }, [id]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const response = await supportTicketsAPI.getTicketDetails(id);
      if (response.success) {
        setTicket(response.data);
      } else {
        setError(response.message || "Failed to fetch ticket details");
      }
    } catch (err) {
      setError(handleAPIError(err));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open": return "bg-blue-100 text-blue-600 border-blue-200";
      case "In Progress": return "bg-yellow-100 text-yellow-600 border-yellow-200";
      case "Resolved": return "bg-green-100 text-green-600 border-green-200";
      case "Closed": return "bg-gray-100 text-gray-600 border-gray-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  if (loading) return <Loader fullscreen message="Loading ticket details..." />;
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-10">
        <p className="text-red-500 font-bold mb-4">{error}</p>
        <button onClick={() => navigate("/my-tickets")} className="text-primary-500 font-bold underline">Go Back to My Tickets</button>
    </div>
  );
  if (!ticket) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-10">
        <p className="text-gray-500 font-bold mb-4">Ticket not found</p>
        <button onClick={() => navigate("/my-tickets")} className="text-primary-500 font-bold underline">Go Back to My Tickets</button>
    </div>
  );

  return (
    <div className="bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <PageHeader title="Ticket Details" onBack={() => navigate("/my-tickets", { replace: true })} className="mb-6" />

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-5 pb-3 border-b border-gray-50">
            <div>
              <span className="text-sm text-[#374151] mb-2 block">
                Ticket ID #{ticket.ticketId}
              </span>
              <h2 className="text-2xl font-semibold text-[#111827] tracking-tight break-words">
                {ticket.category}
              </h2>
            </div>
            <div className={`px-5 py-2 rounded-full text-sm font-semibold border self-start ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center ">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Raised On</span>
                <span className="text-sm font-semibold text-[#374151]">{new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Issue Category</span>
                <span className="text-sm font-semibold text-[#374151]">{ticket.category}</span>
              </div>
            </div>
          </div>

          <div className="mb-12">
            <h3 className="text-base font-semibold text-[#111827] mb-2 flex items-center gap-2.5">
              <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
              Description
            </h3>
            <div className="bg-[#F9FAFB] rounded-xl p-4 border border-gray-100/50">
              <p className="text-[#4B5563] text-base leading-relaxed whitespace-pre-wrap font-medium break-words">
                {ticket.description}
              </p>
            </div>
          </div>

          {ticket.attachments?.length > 0 && (
            <div className="mb-12">
              <h3 className="text-base font-bold text-[#111827] mb-5 flex items-center gap-2.5">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                Attachments
              </h3>
              <div className="flex flex-wrap gap-5">
                {ticket.attachments.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group">
                    <div className="w-24 h-24 rounded-2xl border-2 border-gray-100 p-1 group-hover:border-blue-400 group-hover:shadow-lg group-hover:shadow-blue-50 transition-all duration-300 overflow-hidden bg-white shadow-sm ring-4 ring-transparent group-hover:ring-blue-50">
                        <img src={url} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {ticket.adminNote && (
            <div className="mt-12 pt-12 border-t border-gray-100">
              <div className="bg-blue-50/40 rounded-3xl p-6 sm:p-10 border border-blue-100/30 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform duration-500">
                  <Inbox className="w-32 h-32 text-blue-600" />
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-blue-600 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Inbox className="w-4 h-4" />
                    </div>
                    Support Team Reply
                  </h3>
                  
                  <div className="relative pl-6 border-l-2 border-blue-200">
                    <p className="text-[#374151] text-lg leading-relaxed font-semibold italic opacity-90 break-words">
                      "{ticket.adminNote}"
                    </p>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-blue-100/40 flex items-center">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-blue-400 uppercase tracking-widest">
                       <Clock className="w-3.5 h-3.5" />
                       Replied on {new Date(ticket.updatedAt).toLocaleDateString()} at {new Date(ticket.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportTicketDetailsPage;