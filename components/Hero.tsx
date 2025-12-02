import React, { useState } from 'react';

interface Props {
  onSearch: (term: string) => void;
  isLoading: boolean;
}

const Hero: React.FC<Props> = ({ onSearch, isLoading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  const handleTryClick = (term: string) => {
    setInput(term);
    onSearch(term);
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 w-full max-w-5xl mx-auto">
      <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight text-center mb-6 leading-tight">
        Is that startup <span className="text-blue-600">safe</span> to join?
      </h1>
      
      <p className="text-lg sm:text-xl text-slate-500 text-center max-w-3xl mb-12 leading-relaxed font-light">
        We translate confusing financial jargon into simple, honest advice. Find out if your next job offers real growth or just late nights.
      </p>

      <div className="w-full max-w-3xl">
        <form onSubmit={handleSubmit} className="relative group">
           <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          <input
            type="text"
            className="w-full pl-16 pr-36 py-5 rounded-2xl border border-slate-200 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] focus:ring-4 focus:ring-blue-100 focus:border-blue-400 outline-none text-lg text-slate-800 transition-all placeholder:text-slate-400"
            placeholder="Enter company name (e.g. 'Stripe' or 'Stripe vs PayPal')"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2.5 top-2.5 bottom-2.5 bg-[#8da5f5] hover:bg-[#7693f0] text-white font-semibold rounded-xl px-8 transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Analyze'
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-400 text-sm">
          Try: 
          <button onClick={() => handleTryClick("OpenAI")} className="mx-2 hover:text-blue-600 transition-colors">OpenAI</button> 
          • 
          <button onClick={() => handleTryClick("Stripe vs PayPal")} className="mx-2 hover:text-blue-600 transition-colors">Stripe vs PayPal</button> 
          • 
          <button onClick={() => handleTryClick("Databricks")} className="mx-2 hover:text-blue-600 transition-colors">Databricks</button>
        </div>
      </div>
    </div>
  );
};

export default Hero;