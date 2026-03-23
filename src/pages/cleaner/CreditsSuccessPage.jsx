import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from '../../components';

const CreditsSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const credits = searchParams.get('credits') || '200';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-700">
        {/* Success Illustration / Icon */}
        <div className="relative flex justify-center">
            {/* Colorful background glow */}
            <div className="absolute inset-0 bg-blue-100/50 blur-3xl rounded-full scale-150 animate-pulse" />
            
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full shadow-2xl flex items-center justify-center border-8 border-blue-50">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
                    <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
            </div>

            {/* Decorative dots/shapes to mimic the "colorful" look in screenshot */}
            <div className="absolute -top-4 -right-4 w-4 h-4 bg-yellow-400 rounded-full animate-bounce delay-75" />
            <div className="absolute top-1/2 -left-8 w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-150" />
            <div className="absolute -bottom-2 right-12 w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-300" />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl sm:text-4xl font-black text-[#111111] leading-tight">
            Credits Added to Your Account!
          </h1>
          <p className="text-gray-500 font-medium text-base sm:text-lg leading-relaxed px-4">
            {credits} credits have been added to your account. You can now continue responding to customer leads.
          </p>
        </div>

        <div className="pt-8 space-y-4 px-4">
          <Button 
            fullWidth 
            variant="primary" 
            className="rounded-2xl h-16 font-black text-xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 transition-all active:scale-95 flex items-center justify-center gap-2"
            onClick={() => navigate('/cleaner-jobs')}
          >
            Browse Leads
          </Button>
          
          <button 
            onClick={() => navigate('/cleaner-dashboard')}
            className="w-full flex items-center justify-center gap-2 text-gray-500 font-bold text-base hover:text-gray-700 transition-colors py-2"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditsSuccessPage;
