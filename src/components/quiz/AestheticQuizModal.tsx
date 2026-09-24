import React, { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, CheckCircle2, RotateCcw } from 'lucide-react';
import { QUIZ_QUESTIONS } from '../../data/quizQuestions';
import { TRENDING_AESTHETICS_25 } from '../../data/aesthetics';

interface AestheticQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (calculatedWeights: Record<string, number>, primaryAesthetic: string) => void;
}

export const AestheticQuizModal: React.FC<AestheticQuizModalProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [resultAesthetics, setResultAesthetics] = useState<Array<{ name: string; score: number }>>([]);
  const [calculatedWeights, setCalculatedWeights] = useState<Record<string, number>>({});

  if (!isOpen) return null;

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQuestion = QUIZ_QUESTIONS[currentStep];

  const handleSelectOption = (optionIndex: number) => {
    const nextAnswers = { ...selectedAnswers, [currentQuestion.id]: optionIndex };
    setSelectedAnswers(nextAnswers);

    if (currentStep < totalQuestions - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Calculate results on last question
      calculateAestheticProfile(nextAnswers);
    }
  };

  const calculateAestheticProfile = (answers: Record<number, number>) => {
    // Tally points across all 25 aesthetics
    const tallies: Record<string, number> = {};
    TRENDING_AESTHETICS_25.forEach((aes) => {
      tallies[aes] = 20; // baseline 20%
    });

    QUIZ_QUESTIONS.forEach((q) => {
      const selectedOptionIdx = answers[q.id];
      if (selectedOptionIdx !== undefined) {
        const option = q.options[selectedOptionIdx];
        if (option && option.aestheticWeights) {
          Object.entries(option.aestheticWeights).forEach(([aesthetic, weight]) => {
            if (tallies[aesthetic] !== undefined) {
              tallies[aesthetic] += weight;
            } else {
              tallies[aesthetic] = 20 + weight;
            }
          });
        }
      }
    });

    // Find min and max to normalize between 35% and 96%
    const values = Object.values(tallies);
    const maxVal = Math.max(...values, 1);
    const minVal = Math.min(...values, 0);

    const normalizedWeights: Record<string, number> = {};
    TRENDING_AESTHETICS_25.forEach((aes) => {
      const raw = tallies[aes] || 20;
      // Scale between 30 and 96
      const scaled = Math.round(30 + ((raw - minVal) / Math.max(1, maxVal - minVal)) * 66);
      normalizedWeights[aes] = Math.min(98, Math.max(25, scaled));
    });

    const sortedAesthetics = Object.entries(normalizedWeights)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score);

    setCalculatedWeights(normalizedWeights);
    setResultAesthetics(sortedAesthetics);
    setIsFinished(true);
  };

  const handleApplyResults = () => {
    const primary = resultAesthetics[0]?.name || 'Minimalist';
    onComplete(calculatedWeights, primary);
    onClose();
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setSelectedAnswers({});
    setIsFinished(false);
    setResultAesthetics([]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-950 border border-slate-700 rounded-3xl max-w-md w-full p-5 text-white shadow-2xl relative max-h-[92vh] flex flex-col justify-between overflow-hidden animate-in zoom-in-95">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-tight text-white">
                What's My Aesthetic?
              </h2>
              <p className="text-[10px] text-slate-400">20-Question Taste Discovery Quiz</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isFinished ? (
          /* Question View */
          <div className="flex-1 flex flex-col justify-between py-4 overflow-y-auto">
            {/* Progress Header */}
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="text-emerald-400 font-bold">
                  Question {currentStep + 1} of {totalQuestions}
                </span>
                <span className="text-slate-400 text-[11px]">
                  {Math.round(((currentStep + 1) / totalQuestions) * 100)}% Completed
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden mb-4 border border-slate-800">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  style={{ width: `${((currentStep + 1) / totalQuestions) * 100}%` }}
                />
              </div>

              {/* Category Pill */}
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {currentQuestion.category}
              </span>

              {/* Question Text */}
              <h3 className="text-base font-extrabold text-white leading-snug mb-5">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options List */}
            <div className="space-y-2.5 my-auto">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-150 flex items-start gap-3 group ${
                      isSelected
                        ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-950/50'
                        : 'bg-slate-900/80 border-slate-800 text-slate-200 hover:bg-slate-850 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'border-emerald-400 bg-emerald-400 text-black'
                          : 'border-slate-600 text-transparent group-hover:border-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold leading-relaxed group-hover:text-white">
                        {option.text}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Nav: Previous & Next/Skip */}
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800">
              <button
                onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
                disabled={currentStep === 0}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors ${
                  currentStep === 0
                    ? 'text-slate-600 cursor-not-allowed'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <span className="text-[11px] text-slate-500">
                Tap an option to proceed
              </span>
            </div>
          </div>
        ) : (
          /* Results View */
          <div className="flex-1 flex flex-col justify-between py-3 overflow-y-auto space-y-4">
            <div className="text-center pt-2">
              <div className="inline-flex p-3 rounded-full bg-emerald-500/20 text-emerald-400 mb-2 border border-emerald-500/30">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-black text-white">Your Aesthetic Profile</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                Calculated across 25 iconic style movements from the past 50 years.
              </p>
            </div>

            {/* Top 3 Aesthetic Highlights */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 space-y-3">
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Top Style Affinities
              </h4>
              <div className="space-y-2.5">
                {resultAesthetics.slice(0, 4).map((res, i) => (
                  <div key={res.name}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-white flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-[10px] font-mono text-emerald-400 flex items-center justify-center border border-slate-700">
                          {i + 1}
                        </span>
                        {res.name}
                      </span>
                      <span className="text-emerald-400 font-mono">{res.score}% Match</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                        style={{ width: `${res.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
              Applying these results will automatically adjust all 25 aesthetic sliders in your taste profile and calibrate your Swiping recommendations.
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleRestart}
                className="p-3 rounded-2xl border border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Retake Quiz"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleApplyResults}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
              >
                <span>Apply to Recommendations</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
