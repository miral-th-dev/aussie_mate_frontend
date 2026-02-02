import React, { useEffect, useMemo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { ConfirmationModal, PageHeader } from '../../../components';
import SearchIcon from '../../../assets/search.svg';
import CalendarIcon from '../../../assets/Calendar.svg';
import ThreeDotIcon from '../../../assets/3dot.svg';
import DownloadIcon from '../../../assets/download.svg';
import TrashRedIcon from '../../../assets/trash-red.svg';


const InvoicesPage = () => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(null);
    const [showCalendar, setShowCalendar] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [invoiceToDelete, setInvoiceToDelete] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const calendarRef = useRef(null);
    const dropdownRef = useRef(null);

    // Sample invoice data
    const invoices = [
        {
            id: 'AM10432',
            title: 'Bond Cleaning',
            price: 170,
            date: '30 Sep, 2025',
            status: 'paid',
            createdAt: '2025-09-30T10:00:00Z',
            dueDate: '2025-10-15T23:59:59Z'
        },
        {
            id: 'AM10400',
            title: 'Carpet Cleaning',
            price: 120,
            date: '30 Sep, 2025',
            status: 'paid',
            createdAt: '2025-09-30T11:00:00Z',
            dueDate: '2025-10-15T23:59:59Z'
        },
        {
            id: 'AM10388',
            title: 'Pet Sitting',
            price: 90,
            date: '30 Sep, 2025',
            status: 'pending',
            createdAt: '2025-09-30T12:00:00Z',
            dueDate: '2025-10-15T23:59:59Z'
        },
        {
            id: 'AM10377',
            title: 'Housekeeping (4 Hours)',
            price: 110,
            date: '30 Sep, 2025',
            status: 'paid',
            createdAt: '2025-09-30T13:00:00Z',
            dueDate: '2025-10-15T23:59:59Z'
        },
        {
            id: 'AM10365',
            title: 'Retail Audit (Store Visit - Checklist & Photos)',
            price: 75,
            date: '30 Sep, 2025',
            status: 'overdue',
            createdAt: '2025-09-15T14:00:00Z',
            dueDate: '2025-09-30T23:59:59Z'
        },
        {
            id: 'AM10359',
            title: 'Bond + Carpet Cleaning Combo',
            price: 250,
            date: '30 Sep, 2025',
            status: 'paid',
            createdAt: '2025-09-30T15:00:00Z',
            dueDate: '2025-10-15T23:59:59Z'
        },
        {
            id: 'AM103244',
            title: 'Garden Maintenance',
            price: 85,
            date: '29 Sep, 2025',
            status: 'pending',
            createdAt: '2025-09-29T16:00:00Z',
            dueDate: '2025-10-14T23:59:59Z'
        }
    ];

    // Close calendar when clicking outside
    useEffect(() => {
        const handleOutside = (e) => {
            if (showCalendar && calendarRef.current && !calendarRef.current.contains(e.target)) {
                setShowCalendar(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, [showCalendar]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleOutside = (e) => {
          if (showDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
            setShowDropdown(null);
          }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
      }, [showDropdown]);
      


    // Filter invoices based on search query and date range
    const filteredInvoices = useMemo(() => {
        const q = query.trim().toLowerCase();

        return invoices.filter((invoice) => {
            const matchesQuery = !q ||
                invoice.title.toLowerCase().includes(q) ||
                invoice.id.toLowerCase().includes(q);

            // Date range filtering (inclusive)
            let matchesDate = true;
            if (startDate || endDate) {
                if (!invoice.createdAt) {
                    matchesDate = false;
                } else {
                    const invoiceTime = new Date(invoice.createdAt);
                    const invoiceDayStart = new Date(invoiceTime.getFullYear(), invoiceTime.getMonth(), invoiceTime.getDate()).getTime();
                    const startTs = startDate ? new Date(startDate).getTime() : null;
                    const endTs = endDate ? new Date(endDate).getTime() : null;
                    if (startTs !== null && invoiceDayStart < startTs) matchesDate = false;
                    if (endTs !== null && invoiceDayStart > endTs) matchesDate = false;
                }
            }

            return matchesQuery && matchesDate;
        });
    }, [query, startDate, endDate]);

    const handleBack = () => {
        navigate(-1);
    };

    const toggleDropdown = (invoiceId) => {
        setShowDropdown(showDropdown === invoiceId ? null : invoiceId);
    };

    const handleInvoiceAction = (action, invoiceId) => {
        if (action === 'download') {
            console.log(`Download invoice ${invoiceId}`);
            setShowDropdown(null);
        }
    };

    const handleConfirmDelete = async () => {
        try {
            setIsDeleting(true);
            
            // Here you would call the API to delete the invoice
            // const response = await invoicesAPI.deleteInvoice(invoiceToDelete);
            
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            setShowDeleteModal(false);
            setInvoiceToDelete(null);
            
            // You might want to refresh the invoices list here
            // fetchInvoices();
            
        } catch (error) {
            console.error('Error deleting invoice:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
        setInvoiceToDelete(null);
    };

    return (
        <div className="overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                <PageHeader
                    title="Invoices & Payment History"
                    onBack={handleBack}
                    className="mb-4"
                    titleClassName="text-lg sm:text-xl font-semibold text-primary-500"
                />

                {/* Search + Calendar */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2">
                            <img src={SearchIcon} alt="Search" className="w-4 h-4 sm:w-5 sm:h-5" />
                        </span>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search invoices..."
                            className="w-full pl-12 pr-3 py-2 sm:py-3 bg-white text-primary-200 font-medium border border-gray-200 rounded-xl focus:outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setShowCalendar((v) => !v)}
                        className={`p-2 sm:p-3 rounded-xl! border cursor-pointer ${startDate || endDate ? 'bg-primary-50 border-primary-300' : 'bg-white border-gray-200'
                            }`}
                        title="Filter by date range"
                    >
                        <img src={CalendarIcon} alt="Calendar" className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            className="p-2 sm:p-3 rounded-xl! bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors"
                            title="Clear date filter"
                        >
                            <X className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                        </button>
                    )}
                </div>

                {/* Calendar Panel */}
                {showCalendar && (
                    <div ref={calendarRef} className="mb-4 bg-white rounded-2xl border border-gray-200 shadow-custom p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-base sm:text-lg font-semibold text-primary-500">Filter by Date</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); }}
                                    className="px-3 py-2 text-sm rounded-xl border text-primary-200 font-medium border-gray-200 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={() => setShowCalendar(false)}
                                    className="px-3 py-2 text-sm rounded-xl bg-[#1F6FEB] text-white hover:opacity-90 cursor-pointer"
                                >
                                    Apply
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-primary-200 mb-1">Start date</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-primary-200 mb-1">End date</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none"
                                />
                            </div>
                        </div>
                        {(startDate || endDate) && (
                            <div className="mt-3 text-sm text-primary-200 font-medium">
                                Showing: {startDate || '—'} to {endDate || '—'}
                            </div>
                        )}
                    </div>
                )}


                {/* Invoice Cards */}
                <div className="space-y-3">
                    {filteredInvoices.map((invoice) => (
                        <div key={invoice.id} className="bg-white rounded-xl border border-gray-200 p-4">
                             {/* Top Row: Invoice ID, Price, Three Dots */}
                             <div className="flex items-center justify-between mb-1">
                                 <div className="text-sm font-medium text-primary-200">{invoice.id}</div>
                                 <div className="relative">
                                     <button
                                         onClick={() => toggleDropdown(invoice.id)}
                                         className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                                     >
                                         <img src={ThreeDotIcon} alt="More options" className="w-5 h-5" />
                                     </button>
                                     
                                     {/* Three Dot Menu Dropdown */}
                                     {showDropdown === invoice.id && (
                                         <div 
                                             className="invoice-dropdown absolute right-0 top-full w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-40"
                                             onClick={(e) => e.stopPropagation()}
                                         >
                                             <div className="py-1">
                                                 <button
                                                     onClick={(e) => {
                                                         e.stopPropagation();
                                                         handleInvoiceAction('download', invoice.id);
                                                     }}
                                                     className="w-full px-4 py-3 text-left text-sm text-primary-200 font-medium hover:bg-gray-100 transition-colors flex items-center gap-3 cursor-pointer"
                                                 >
                                                     <img src={DownloadIcon} alt="Download" className="w-4 h-4" />
                                                     Download PDF
                                                 </button>
                                                 <button
                                                     onClick={() => {
                                                         setInvoiceToDelete(invoice.id);
                                                         setShowDeleteModal(true);
                                                         setShowDropdown(null);
                                                     }}
                                                     className="w-full px-4 py-3 text-left text-sm text-red-500 font-medium hover:bg-red-50 transition-colors flex items-center gap-3 cursor-pointer"
                                                 >
                                                     <img src={TrashRedIcon} alt="Delete" className="w-4 h-4" />
                                                     Delete Invoice
                                                 </button>
                                             </div>
                                         </div>
                                     )}
                                 </div>
                             </div>

                            {/* Service Title */}
                            <div className="flex items-center gap-1 mb-2">
                                <h3 className="text-base font-semibold text-primary-500">{invoice.title}</h3>
                                <span  className='w-2 h-2 bg-primary-500 rounded-full'>  </span>
                                <span className="text-lg font-semibold text-blue-600">${invoice.price}</span>
                            </div>


                             {/* Date */}
                             <div className="text-sm text-primary-200 font-medium">{invoice.date}</div>
                        </div>
                    ))}
                </div>

                {/* Empty State */}
                {filteredInvoices.length === 0 && (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <img src={SearchIcon} alt="No results" className="w-8 h-8 text-primary-200" />
                        </div>
                        <h3 className="text-lg font-medium text-primary-500 mb-2">No invoices found</h3>
                        <p className="text-primary-200 font-medium">
                            {query ? 'Try adjusting your search terms' : 'You don\'t have any invoices yet'}
                        </p>
                    </div>
                )}
            </div>

            {/* Delete Invoice Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={handleCancelDelete}
                onConfirm={handleConfirmDelete}
                title="Delete Invoice?"
                message={`Are you sure you want to delete invoice ${invoiceToDelete}? This action cannot be undone.`}
                confirmText="Delete Invoice"
                cancelText="Cancel"
                confirmButtonColor="bg-[#EF4444] hover:bg-red-600"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default InvoicesPage;
