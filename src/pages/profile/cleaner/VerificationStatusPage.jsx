import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { PageHeader, Loader, PageLayout } from '../../../components';
import PdfIcon from '../../../assets/pdf.svg';
import CalendarIcon from '../../../assets/Calendar.svg';
import InfoIcon from '../../../assets/info.svg';
import { userAPI } from '../../../services/api';

const Pill = ({ label, tone = 'gray' }) => {
    const toneClasses = {
        green: 'bg-green-500 text-green-500 font-medium border border-green-500',
        yellow: 'bg-yellow-500 text-yellow-500 font-medium border border-yellow-500',
        red: 'bg-red-500 text-red-500 font-medium border border-red-500',
    }[tone];

    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${toneClasses}`}>{label}</span>
    );
};

const RowMeta = ({ icon, text }) => (
    <div className="flex items-center gap-2 text-xs text-primary-200 font-medium">
        <img src={icon} alt="" className="w-4 h-4" />
        <span>{text}</span>
    </div>
);

const DocumentRow = ({ name, status, uploadedAt, expiry, tone, actionText = 'Replace File', onReplaceFile, docType }) => {
    const inputRef = useRef(null);
    
    const handleReplaceClick = () => {
        inputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file && onReplaceFile) {
            onReplaceFile(file, docType);
        }
    };

    return (
        <div className="w-full rounded-xl border border-[#F3F3F3] bg-white p-4 sm:p-5 flex flex-col gap-3 shadow-custom">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <img src={PdfIcon} alt="PDF" className="w-5 h-5" />
                    <span className="text-sm sm:text-base font-medium text-primary-500">{name}</span>
                </div>
                <Pill label={status} tone={tone} />
            </div>
            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4 flex-wrap">
                    {uploadedAt && <RowMeta icon={CalendarIcon} text={`Uploaded: ${uploadedAt}`} />}
                    {expiry && <RowMeta icon={CalendarIcon} text={`Expiry: ${expiry}`} />}
                </div>
                <button 
                    type="button" 
                    onClick={handleReplaceClick}
                    className="text-sm font-medium text-primary-600 hover:text-[#1d4ed8] underline cursor-pointer self-start"
                >
                    {actionText}
                </button>
                <input 
                    ref={inputRef} 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png" 
                    className="hidden" 
                    onChange={handleFileChange}
                />
            </div>
        </div>
    );
};


const VerificationStatusPage = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Fetch documents on component mount
    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            const response = await userAPI.getDocumentStatus();
            if (response.success) {
                setDocuments(response.data);
            } else {
                setError('Failed to fetch documents');
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            setError('Failed to fetch documents');
        } finally {
            setLoading(false);
        }
    };

    const getDocumentStatus = (docType) => {
        if (!documents?.documents) return { status: 'Not Uploaded', tone: 'gray' };
        
        const doc = documents.documents[docType];
        if (!doc) return { status: 'Not Uploaded', tone: 'gray' };
        
        switch (doc.status) {
            case 'verified': return { status: 'Verified', tone: 'green' };
            case 'pending_review': return { status: 'Pending', tone: 'yellow' };
            case 'rejected': return { status: 'Rejected', tone: 'red' };
            default: return { status: 'Not Uploaded', tone: 'gray' };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
    };


    const handleReplaceFile = async (file, docType) => {
        if (!file) return;
        
        try {
            setLoading(true);
            const formData = new FormData();
            
            // Map document types to the expected field names
            const fieldMapping = {
                'policeCheck': 'policeCheck',
                'visaWorkRights': 'visaWorkRights', 
                'trainingCertificates': 'trainingCertificates',
            };
            
            const fieldName = fieldMapping[docType];
            if (fieldName) {
                formData.append(fieldName, file);
            }
            
            const response = await userAPI.uploadDocuments(formData);
            if (response.success) {
                fetchDocuments(); // Refresh documents
            } else {
                setError(response.message || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setError('Upload failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageLayout>
            <PageHeader
                title="Verification & Documents"
                onBack={() => navigate(-1)}
                className="mb-4"
                titleClassName="text-lg sm:text-xl font-semibold text-primary-500"
            />

                {/* Common rounded container */}
                <div className="bg-white rounded-2xl border border-[#F3F3F3] p-4 sm:p-5 space-y-6">

                    {/* ABN verified card */}
                    {documents?.documents?.abnNumber && (
                        <div className="rounded-2xl border border-[#F3F3F3] bg-white p-4 sm:p-5 mb-4 shadow-custom">
                            <div className="flex items-center justify-between">
                                    <div className="flex flex-row items-center gap-2">
                                        <span className="text-sm sm:text-base font-medium text-primary-500">ABN Number :-</span>
                                        <p className="text-sm sm:text-base text-primary-200 font-medium">{documents.documents.abnNumber}</p>
                                    </div>
                            </div>
                        </div>
                    )}  


                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Loading State */}
                    {loading && (
                        <Loader message="Refreshing verification status..." />
                    )}

                    {/* Sections */}
                    {!loading && documents && (
                        <div className="space-y-3">
                            {/* Police Check */}
                            {(() => {
                                const policeDoc = documents.documents?.policeCheck;
                                const policeStatus = getDocumentStatus('policeCheck');
                                return (
                                    <div>
                                        <h3 className="text-sm font-semibold text-primary-500">Police Check</h3>
                                        <DocumentRow 
                                            name={policeDoc?.fileName || 'Police Check.pdf'} 
                                            status={policeStatus.status} 
                                            tone={policeStatus.tone} 
                                            uploadedAt={formatDate(policeDoc?.uploadedAt)}
                                            onReplaceFile={handleReplaceFile}
                                            docType="policeCheck"
                                        />
                                    </div>
                                );
                            })()}

                            {/* Visa Document */}
                            {(() => {
                                const visaDoc = documents.documents?.visaWorkRights;
                                const visaStatus = getDocumentStatus('visaWorkRights');
                                return (
                                    <div>
                                        <h3 className="text-sm font-semibold text-primary-500">Visa</h3>
                                        <DocumentRow 
                                            name={visaDoc?.fileName || 'Visa.pdf'} 
                                            status={visaStatus.status} 
                                            tone={visaStatus.tone} 
                                            uploadedAt={formatDate(visaDoc?.uploadedAt)}
                                            onReplaceFile={handleReplaceFile}
                                            docType="visaWorkRights"
                                        />
                                        {visaStatus.status === 'Rejected' && visaDoc?.rejectionReason && (
                                            <div className="mt-1 flex items-start gap-2 text-xs text-primary-200 font-medium">
                                                <img src={InfoIcon} alt="Info" className="w-4 h-4" />
                                                <span>{visaDoc.rejectionReason}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}

                            {/* Training Certificates */}
                            {(() => {
                                const trainingDoc = documents.documents?.trainingCertificates;
                                const trainingStatus = getDocumentStatus('trainingCertificates');
                                return (
                                    <div>
                                        <h3 className="text-sm font-semibold text-primary-500 mb-3">Training Certificates</h3>
                                        <DocumentRow 
                                            name={trainingDoc?.fileName || 'Training Certificates.pdf'} 
                                            status={trainingStatus.status} 
                                            tone={trainingStatus.tone} 
                                            uploadedAt={formatDate(trainingDoc?.uploadedAt)}
                                            onReplaceFile={handleReplaceFile}
                                            docType="trainingCertificates"
                                        />
                                        {trainingStatus.status === 'Rejected' && trainingDoc?.rejectionReason && (
                                            <div className="mt-1 flex items-start gap-2 text-xs text-primary-200 font-medium">
                                                <img src={InfoIcon} alt="Info" className="w-4 h-4" />
                                                <span>{trainingDoc.rejectionReason}</span>
                                            </div>
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    )}

                    {/* Expiry Warning */}
                    <div className="mt-6 p-4 bg-yellow-50 shadow-custom border border-yellow-200 rounded-xl">
                        <div className="flex items-start gap-3">
                            <div className="w-5 h-5 flex-shrink-0 text-yellow-800">
                                <AlertCircle className="w-full h-full" strokeWidth={2} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-yellow-800">
                                    Your Photo ID will expire in 14 days. Please upload a new one to avoid suspension.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
        </PageLayout>
    );
};

export default VerificationStatusPage;


    
