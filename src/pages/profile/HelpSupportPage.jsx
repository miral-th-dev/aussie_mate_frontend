import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components';
import MessageIcon from '../../assets/Vector.svg';
import RightIcon from '../../assets/right.svg';
import QuestionMarkIcon from '../../assets/questionMark.svg';
import HelpBG from '../../assets/helpBG.jpg';
import SearchIcon from '../../assets/search.svg';
import { ChevronDown, ChevronUp } from 'lucide-react';

const HelpSupportPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);

  const handleBack = () => {
    navigate(-1);
  };

  const handleSupportTicket = () => {
    navigate('/profile');
  };

  const faqs = [
    {
      id: 1,
      category: 'Getting Started',
      questions: [
        { id: 'q1', question: 'How do I post a job?', answer: 'Go to your dashboard and click on "Post a new job". Follow the prompts to describe your needs.' },
        { id: 'q2', question: 'Is my data safe?', answer: 'AussieMate uses enterprise-grade security to ensure your personal and payment data is always protected.' },
      ]
    },
    {
      id: 2,
      category: 'Bookings & Payments',
      questions: [
        { id: 'q3', question: 'How do I pay for a job?', answer: 'Payments are handled securely through our platform via Stripe. You pay once the job is completed or as per the agreed schedule.' },
        { id: 'q4', question: 'Can I cancel a booking?', answer: 'Yes, you can cancel a booking from your "My Jobs" section. Please check our cancellation policy for details.' },
      ]
    }
  ];

  const filteredFaqs = faqs.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  return (
    <>
      <div className="max-w-7xl mx-auto px-8 py-6">
        <PageHeader
          title="Help & Support"
          onBack={handleBack}
          className="mb-6"
          titleClassName="text-lg sm:text-xl font-semibold text-gray-900"
        />

        {/* Need Help Section */}
        <div className="mb-6 rounded-2xl shadow-custom">
          <div className="relative rounded-xl p-6 sm:p-10 overflow-hidden flex flex-col sm:block items-center sm:items-start text-center sm:text-left">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img src={HelpBG} alt="Help Background" className="w-full h-full object-cover" />
            </div>

            {/* Question Marks Background */}
            <div className="relative sm:absolute right-4 top-4 flex items-center justify-center mb-6 sm:mb-0 order-1 sm:order-none">
              <img
                src={QuestionMarkIcon}
                alt="Question Mark"
                className="w-24 h-24 sm:w-32 sm:h-32"
              />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 sm:pr-24 order-2 sm:order-none">
              <h2 className="text-2xl sm:text-3xl font-semibold text-primary-500 mb-2">
                Need help?
              </h2>
              <p className="text-[#374151] font-medium text-base sm:text-lg leading-relaxed max-w-[280px] sm:max-w-none mx-auto sm:mx-0">
                We're here to assist you with bookings, payments, and more.
              </p>
            </div>
          </div>
        </div>

        {/* Support Ticket Section */}
        <div 
          onClick={handleSupportTicket}
          className="mb-10 bg-white rounded-2xl border border-gray-100 shadow-custom px-6 py-4 cursor-pointer hover:shadow-lg transition-all group active:scale-[0.98]"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center  border border-blue-100/30">
               <img src={MessageIcon} alt="Tickets" className="w-8 h-8 opacity-80" />
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                Support Ticket
              </h3>
              <p className="text-gray-400 text-sm font-medium">
                Describe your issue to receive a solution from our team.
              </p>
            </div>

            <div className="w-12 h-12 flex items-center justify-center text-gray-400">
              <img src={RightIcon} alt="Go" className="w-6 h-6 translate-x-0.5 opacity-40 group-hover:opacity-100" />
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 px-1">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">FAQs</h2>
              <p className="text-gray-400 text-sm font-medium mt-1">Frequently Asked Questions</p>
            </div>
            
            <div className="relative w-full sm:w-80">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                 <img src={SearchIcon} alt="Search" className="w-5 h-5 opacity-30" />
              </div>
              <input 
                type="text"
                placeholder="Search your problem..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring focus:ring-gray-400 text-gray-700 transition-all font-medium text-sm"
              />
            </div>
          </div>

          <div className="space-y-8">
            {filteredFaqs.map((cat) => (
              <div key={cat.id} className="space-y-4">
                <h4 className="text-[14px] font-semibold text-gray-900 px-1">{cat.category}</h4>
                <div className="space-y-3">
                  {cat.questions.map((q) => (
                    <div 
                      key={q.id} 
                      className={`bg-white rounded-3xl border transition-all duration-300 ${
                        openFaq === q.id ? 'border-gray-200 shadow-sm' : 'border-gray-50 shadow-sm hover:border-gray-200'
                      }`}
                    >
                      <button 
                        onClick={() => setOpenFaq(openFaq === q.id ? null : q.id)}
                        className="w-full px-7 py-4 flex items-center justify-between text-left transition-colors active:scale-[0.995] cursor-pointer"
                      >
                        <span className={`font-medium text-[16px] transition-colors ${openFaq === q.id ? 'text-primary-600' : 'text-gray-900'}`}>{q.question}</span>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${openFaq === q.id ? 'bg-primary-50 text-white' : 'bg-gray-50 text-gray-300'}`}>
                          {openFaq === q.id ? <ChevronUp className="w-5 h-5 text-primary-600" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>
                      <div 
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openFaq === q.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-7 pb-6 pt-4 border-t border-gray-100">
                          <p className="text-gray-500 text-sm leading-relaxed font-medium pr-4">
                            {q.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {filteredFaqs.length === 0 && (
              <div className="text-center py-24 bg-white rounded-[32px] border-2 border-dashed border-gray-100">
                <p className="text-gray-300 font-black text-xl mb-2">No Results Found</p>
                <p className="text-gray-400 text-sm font-semibold">Try searching with different keywords</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HelpSupportPage;
