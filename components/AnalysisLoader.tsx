import React, { useState, useEffect } from 'react';

const steps = [
  "Initializing Safety Engine v9.0...",
  "Verifying company identity...",
  "Scanning global news & funding data...",
  "Analyzing layoff patterns & runway...",
  "Evaluating competitor threats...",
  "Parsing employee sentiment...",
  "Calculating stability score...",
  "Generating career impact report..."
];

const AnalysisLoader: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1500); // 1.5s per step

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4 w-full animate-in fade-in duration-500">
      <div className="relative w-20 h-20 mb-8">
        {/* Spinning outer ring */}
        <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        
        {/* Centered Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl animate-pulse">🛡️</span>
        </div>
      </div>

      <div className="text-center space-y-3 max-w-md">
        <h3 className="text-xl font-bold text-slate-900">
            Analyzing Company Data
        </h3>
        <p className="text-slate-500 min-h-[1.5rem] text-sm font-medium transition-all duration-300">
          {steps[currentStep]}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-64 h-1.5 bg-slate-100 rounded-full mt-8 overflow-hidden">
        <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out rounded-full"
            style={{ width: `${Math.min(((currentStep + 1) / steps.length) * 100, 100)}%` }}
        ></div>
      </div>
      
      <p className="text-xs text-slate-400 mt-6 font-medium">
        Powered by Gemini 2.5 Live Search
      </p>
    </div>
  );
};

export default AnalysisLoader;