import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, RadioButtonGroup, PageHeader } from '../../components';

const QUIZ_QUESTIONS = [
  {
    id: 1,
    category: 'NDIS Safety & Compliance',
    title: 'Provider Compliance & Safety Quiz',
    subtitle: 'Pass this mandatory quiz (80% minimum) on NDIS compliance to continue.',
    question:
      'You are supporting an NDIS participant at their home. You observe a family member verbally abusing the participant. What is your immediate and mandatory action according to NDIS rules and platform policy?',
    options: [
      'Call the police and wait for them to arrive',
      'End the shift and report only to the Support Coordinator',
      'Document the event privately and confront the family member',
      'Ensure the participant is safe, remove yourself from danger, and report the incident immediately through the platform and to the NDIS Quality and Safeguards Commission'
    ],
    correctIndex: 3
  },
  {
    id: 2,
    category: 'Platform Job Flow',
    title: 'Provider Compliance & Safety Quiz',
    subtitle: 'Pass this mandatory quiz (80% minimum) on NDIS compliance to continue.',
    question:
      'A new job card appears for a support shift tomorrow morning. You’re interested but need to check availability. How long do you have to Accept or Decline before it’s offered to others?',
    options: [
      '24 hours',
      'Only 5 minutes',
      'Time limit is shown on the job card (e.g., 2 hours)',
      'You can take as long as you need'
    ],
    correctIndex: 2
  },
  {
    id: 3,
    category: 'Privacy & Confidentiality',
    title: 'Provider Compliance & Safety Quiz',
    subtitle: 'Pass this mandatory quiz (80% minimum) on NDIS compliance to continue.',
    question:
      'A participant’s family member requests your shift notes, including health goals and medication times. What should you do?',
    options: [
      'Hand over the notes',
      'Politely decline and refer them to the Support Coordinator',
      'Only share medication details',
      'Share notes if the participant verbally approves'
    ],
    correctIndex: 1
  }
];

const ProviderComplianceQuizPage = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQuestion = QUIZ_QUESTIONS[currentIndex];

  const score = useMemo(
    () => answers.filter((answer) => answer?.isCorrect).length,
    [answers]
  );
  const scorePercent = Math.round((score / totalQuestions) * 100);
  const hasPassed = scorePercent >= 80;

  const progressPercent = useMemo(() => {
    const completed = showResults
      ? totalQuestions
      : currentIndex + (isSubmitted ? 1 : 0);
    return Math.round((completed / totalQuestions) * 100);
  }, [currentIndex, isSubmitted, showResults, totalQuestions]);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (showResults) {
      navigate('/availability');
      return;
    }

    if (!isSubmitted) {
      if (selectedOption === null) return;

      const isCorrect = selectedOption === currentQuestion.correctIndex;
      setAnswers((prev) => {
        const updated = [...prev];
        updated[currentIndex] = {
          selected: selectedOption,
          isCorrect
        };
        return updated;
      });
      setIsSubmitted(true);
      return;
    }

    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
    } else {
      const finalAnswers = [...answers];
      finalAnswers[currentIndex] = {
        selected: selectedOption,
        isCorrect: selectedOption === currentQuestion.correctIndex
      };
      const finalScore = finalAnswers.filter((answer) => answer?.isCorrect).length;
      if (finalScore === totalQuestions) {
        navigate('/availability');
        return;
      }
      setAnswers(finalAnswers);
      setShowResults(true);
    }
  };


  return (
    <div className="min-h-screen bg-white sm:bg-gray-50 flex justify-center px-4 py-6 sm:py-10">
      <div className="w-full max-w-[420px] sm:max-w-xl bg-white rounded-none sm:rounded-3xl sm:shadow-custom p-0 sm:p-8">
        <PageHeader
          title="Provider Compliance & Safety Quiz"
          onBack={() => (showResults ? navigate('/cleaner-dashboard') : navigate(-1))}
        />

        {showResults ? (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-primary-500 mb-2">
                Quiz Results
              </h1>
              <p className="text-sm sm:text-base text-primary-200 font-medium">
                You answered {score} out of {totalQuestions} questions correctly ({scorePercent}%).
              </p>
              <div className="mt-6">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${hasPassed ? 'bg-primary-500' : 'bg-[#EF4444]'}`}
                    style={{ width: `${Math.min(scorePercent, 100)}%` }}
                  />
                </div>
                <p className={`text-xs sm:text-sm font-semibold mt-3 ${hasPassed ? 'text-green-500' : 'text-red-500'}`}>
                  {hasPassed
                    ? 'Great job! You’ve met the 80% requirement. You can proceed to the next onboarding step.'
                    : 'Score below 80%. Please review the guidelines and retake the quiz.'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {QUIZ_QUESTIONS.map((question, index) => {
                const answer = answers[index];
                const isCorrect = answer?.isCorrect;

                return (
                  <div
                    key={question.id}
                    className={`border rounded-2xl p-4 sm:p-5 ${
                      isCorrect
                        ? 'border-[#1EB154] bg-[#F1FBF5] shadow-[0_0_6px_0_rgba(30,177,84,0.65)]'
                        : 'border-[#EF4444] bg-[#FEECEC] shadow-[0_0_6px_0_rgba(239,68,68,0.65)]'
                    }`}
                  >
                    <p className="text-xs uppercase tracking-wide font-semibold text-primary-200 mb-2">
                      Question {index + 1}
                    </p>
                    <p className="text-sm sm:text-base font-medium text-primary-500 leading-relaxed">
                      {question.question}
                    </p>
                    <div className="mt-3 text-xs sm:text-sm text-[#374151] font-medium">
                      <p>
                        Your answer:{' '}
                        <span className={isCorrect ? 'text-green-500' : 'text-red-500'}>
                          {question.options[answer?.selected ?? -1] || 'No answer'}
                        </span>
                      </p>
                      {!isCorrect && (
                        <p>
                          Correct answer:{' '}
                          <span className="text-green-500 font-semibold">
                            {question.options[question.correctIndex]}
                          </span>
                        </p>
                      )}
                    </div>
                    <p className="mt-3 text-xs sm:text-sm text-primary-500 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>
                );
              })}
            </div>

            <Button
              type="button"
              fullWidth
              variant="primary"
              onClick={() => navigate('/availability')}
            >
              Submit & Set Availability
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-primary-500 mb-2">
                {currentQuestion.title}
              </h1>
              <p className="text-sm sm:text-base text-primary-200 font-medium">
                {currentQuestion.subtitle}
              </p>
              <div className="mt-6">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500" style={{ width: `${progressPercent}%` }} />
                </div>
                <p className="text-xs sm:text-sm text-primary-200 font-medium mt-2">
                  Question {currentIndex + 1} of {totalQuestions} • Score required: 80%
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-wide font-semibold text-primary-200">
                {currentQuestion.category}
              </p>
              <p className="text-sm sm:text-base text-primary-500 font-medium leading-relaxed">
                {currentQuestion.question}
              </p>

              <RadioButtonGroup
                name={`quiz-${currentQuestion.id}`}
                options={currentQuestion.options.map((label, index) => ({
                  value: index,
                  label
                }))}
                selectedValue={selectedOption}
                onChange={(event) => {
                  if (isSubmitted) return;
                  setSelectedOption(Number(event.target.value));
                }}
                gridCols="grid-cols-1"
                disabled={isSubmitted}
                optionLabelClassName="text-xs sm:text-sm text-primary-500 leading-relaxed"
                getOptionClass={(value, isSelected) => {
                  const isCorrectOption = value === currentQuestion.correctIndex;
                  const isSelectedWrong = isSubmitted && isSelected && !isCorrectOption;
                  const isCorrectChoice = isSubmitted && isCorrectOption;

                  if (isCorrectChoice) {
                    return 'border-[#1EB154] bg-[#F1FBF5] shadow-[0_0_6px_0_rgba(30,177,84,0.65)]';
                  }
                  if (isSelectedWrong) {
                    return 'border-[#EF4444] bg-[#FEECEC] shadow-[0_0_6px_0_rgba(239,68,68,0.65)]';
                  }
                  if (!isSubmitted) {
                    return 'border-gray-200 bg-white hover:bg-gray-50';
                  }
                  return 'border-gray-200 bg-white';
                }}
                getOptionLabelClass={(value) => {
                  if (!isSubmitted) return '';
                  if (value === currentQuestion.correctIndex) {
                    return 'text-green-500 font-semibold';
                  }
                  if (value === selectedOption && value !== currentQuestion.correctIndex) {
                    return 'text-red-500 font-semibold';
                  }
                  return '';
                }}
              />
            </div>

            <Button
              type="submit"
              size="md"
              fullWidth
              disabled={!isSubmitted && selectedOption === null}
            >
              {isSubmitted
                ? currentIndex === totalQuestions - 1
                  ? 'View Results'
                  : 'Next Question'
                : 'Submit & Next'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ProviderComplianceQuizPage;


