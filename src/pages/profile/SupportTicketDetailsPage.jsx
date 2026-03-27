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
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <PageHeader title="Ticket Details" onBack={() => navigate("/my-tickets")} className="mb-6" />

        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">#{ticket.ticketId}</span>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">{ticket.category}</h2>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold border self-start ${getStatusColor(ticket.status)}`}>
              {ticket.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10 pb-8 border-b border-gray-50 text-gray-400">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-300" />
                <span className="text-sm font-bold tracking-tight uppercase">Raised on {new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-gray-300" />
                <span className="text-sm font-bold tracking-tight uppercase">Category: {ticket.category}</span>
              </div>
            </div>
          </div>

          <div className="mb-10">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-500" />
                Description
            </h3>
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <p className="text-gray-600 text-base leading-relaxed whitespace-pre-wrap font-medium">
                {ticket.description}
              </p>
            </div>
          </div>

          {ticket.attachments?.length > 0 && (
            <div className="mb-10">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-primary-500" />
                Attachments
              </h3>
              <div className="flex flex-wrap gap-4">
                {ticket.attachments.map((url, idx) => (
                  <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group">
                    <div className="w-24 h-24 rounded-2xl border-2 border-gray-100 p-1 group-hover:border-primary-200 transition-colors overflow-hidden bg-white shadow-sm">
                        <img src={url} alt={`Attachment ${idx + 1}`} className="w-full h-full object-cover rounded-xl" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {ticket.adminNote && (
            <div className="mt-8 pt-8 border-t-2 border-dashed border-gray-100">
              <div className="bg-blue-50/50 rounded-2xl p-6 sm:p-8 border border-blue-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Inbox className="w-24 h-24 text-primary-500" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-bold text-primary-600 mb-4 flex items-center gap-3">
                    <Inbox className="w-6 h-6" />
                    Support Team Reply
                  </h3>
                  <p className="text-gray-700 text-base leading-relaxed font-bold italic">
                    "{ticket.adminNote}"
                  </p>
                  <div className="mt-6 flex items-center justify-between">
                      <div className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">
                        Replied on {new Date(ticket.updatedAt).toLocaleTimeString()} · {new Date(ticket.updatedAt).toLocaleDateString()}
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
