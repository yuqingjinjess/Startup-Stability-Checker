import React, { useState, useEffect, useMemo } from 'react';
import Hero from './components/Hero';
import ScoreGauge from './components/ScoreGauge';
import CareerRadar from './components/CareerRadar';
import PillarList from './components/PillarList';
import AnalysisLoader from './components/AnalysisLoader';
import WeightAdjuster from './components/WeightAdjuster';
import BattleTable from './components/BattleTable';
import { generateSafetyReport } from './services/geminiService';
import { AppState, SafetyReport, ComparisonReport, RiskLevel, Verdict, StatusColor } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppState>('idle');
  
  // State for Single Mode
  const [report, setReport] = useState<SafetyReport | null>(null);
  
  // State for Battle Mode
  const [battleReport, setBattleReport] = useState<ComparisonReport | null>(null);

  const [ambiguousOptions, setAmbiguousOptions] = useState<string[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  
  // Custom Weights State (Only for Single Mode)
  const [customWeights, setCustomWeights] = useState<Record<number, number>>({});
  const [isAdjustingWeights, setIsAdjustingWeights] = useState(false);
  const [isUsingCustomScore, setIsUsingCustomScore] = useState(false);

  // Initialize weights when report loads
  useEffect(() => {
    if (report && !isUsingCustomScore) {
      const initial: Record<number, number> = {};
      report.pillars.forEach(p => {
        initial[p.id] = parseInt(p.weight) || 0;
      });
      setCustomWeights(initial);
    }
  }, [report, isUsingCustomScore]);

  const handleSearch = async (term: string) => {
    setStatus('loading');
    setReport(null);
    setBattleReport(null);
    setErrorMsg('');
    setIsUsingCustomScore(false);
    
    try {
      const result = await generateSafetyReport(term);
      
      if (result.mode === 'ambiguous') {
        setAmbiguousOptions(result.data.options || []);
        setStatus('ambiguous');
      } else if (result.mode === 'battle') {
        setBattleReport(result.data);
        setStatus('success');
      } else {
        // Single Mode
        setReport(result.data);
        setStatus('success');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to analyze company. Please try again later or check your API key.');
      setStatus('error');
    }
  };

  const resetSearch = () => {
    setReport(null);
    setBattleReport(null);
    setStatus('idle');
    setAmbiguousOptions([]);
    setIsUsingCustomScore(false);
  };

  const handleWeightChange = (id: number, val: number) => {
    setCustomWeights(prev => ({ ...prev, [id]: val }));
    setIsUsingCustomScore(true);
  };

  const handleResetWeights = () => {
    if (report) {
      const initial: Record<number, number> = {};
      report.pillars.forEach(p => {
        initial[p.id] = parseInt(p.weight) || 0;
      });
      setCustomWeights(initial);
      setIsUsingCustomScore(false); // Revert to AI score
    }
  };

  // Derived Score Calculation (Only for Single Mode)
  const { score, risk, verdict } = useMemo(() => {
    if (!report) return { score: 0, risk: RiskLevel.High, verdict: Verdict.Caution };

    // If not customized, use AI's values
    if (!isUsingCustomScore) {
      return {
        score: report.stabilityScore.score,
        risk: report.stabilityScore.riskLevel,
        verdict: report.stabilityScore.verdict
      };
    }

    // Calculate custom score
    let totalScore = 0;
    let totalWeight = 0;

    report.pillars.forEach(p => {
      const w = customWeights[p.id] || 0;
      let val = 0;
      // Approximate values for calculation
      if (p.status === StatusColor.Green) val = 90;
      if (p.status === StatusColor.Yellow) val = 50;
      if (p.status === StatusColor.Red) val = 10;
      
      totalScore += val * w;
      totalWeight += w;
    });

    const finalScore = Math.round(totalScore / (totalWeight || 1));

    // Determine Risk & Verdict based on custom score
    let finalRisk = RiskLevel.High;
    let finalVerdict = Verdict.Caution;

    if (finalScore >= 50) {
      finalRisk = RiskLevel.Medium;
      finalVerdict = Verdict.ReasonableBet;
    }
    if (finalScore >= 75) {
      finalRisk = RiskLevel.Low;
      finalVerdict = Verdict.StrongBuy;
    }

    return { score: finalScore, risk: finalRisk, verdict: finalVerdict };

  }, [report, customWeights, isUsingCustomScore]);

  const hasResults = (report || battleReport) && status === 'success';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Header */}
      <header className="w-full border-b border-blue-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <button onClick={resetSearch} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-sm shadow-blue-200">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.081-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
               </svg>
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Startup<span className="text-blue-600">CareerGuide</span></span>
          </button>
          <div className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold border border-blue-100 shadow-sm">
            Powered by Gemini 2.5
          </div>
        </div>
      </header>

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-8">
        
        {/* Only show Hero if no report is showing and not loading/ambiguous */}
        {(!hasResults && status !== 'loading' && status !== 'ambiguous') && (
            <Hero onSearch={handleSearch} isLoading={false} />
        )}
        
        {/* Error State */}
        {status === 'error' && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-center mt-8 shadow-sm">
            {errorMsg}
            <button onClick={resetSearch} className="ml-4 underline font-bold hover:text-red-800">Try Again</button>
          </div>
        )}

        {/* Loading State */}
        {status === 'loading' && (
            <AnalysisLoader />
        )}

        {/* Ambiguous State */}
        {status === 'ambiguous' && (
          <div className="bg-white p-10 rounded-3xl shadow-xl shadow-blue-100/50 border border-blue-100 text-center mt-12 max-w-2xl mx-auto">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤔</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Did you mean...</h2>
            <p className="text-slate-500 mb-8">We found multiple companies matching that name.</p>
            <div className="flex flex-wrap justify-center gap-4">
              {ambiguousOptions.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSearch(opt)}
                  className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all border border-blue-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {opt}
                </button>
              ))}
            </div>
            <button onClick={resetSearch} className="mt-8 text-slate-400 hover:text-slate-600 text-sm font-medium">Cancel Search</button>
          </div>
        )}

        {/* SUCCESS: Battle Mode Report */}
        {status === 'success' && battleReport && (
           <div className="mt-4">
             <button onClick={resetSearch} className="mb-6 text-slate-500 hover:text-blue-600 flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-colors">
               ← New Search
            </button>
            <BattleTable data={battleReport} />
             {/* Disclaimer for Battle Mode */}
             <div className="mt-8 pt-4 pb-8 text-center border-t border-slate-100">
                <p className="text-[11px] leading-relaxed text-slate-400 max-w-3xl mx-auto">
                    ⚠️ <strong>Disclaimer:</strong> This comparison is generated by AI using real-time public search data. Scores and winners are estimates only. Verify all details with HR.
                </p>
            </div>
           </div>
        )}

        {/* SUCCESS: Single Mode Report */}
        {status === 'success' && report && (
          <div className="space-y-8 mt-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <button onClick={resetSearch} className="mb-2 text-slate-500 hover:text-blue-600 flex items-center gap-1 text-sm font-bold uppercase tracking-wider transition-colors">
               ← New Search
            </button>
            
            {/* Header / Glance */}
            <div className="bg-gradient-to-br from-white via-white to-blue-50 rounded-3xl p-6 md:p-8 shadow-lg shadow-blue-100/50 border border-blue-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-transparent rounded-bl-full -mr-16 -mt-16 pointer-events-none"></div>
              
              <div className="flex flex-col md:flex-row justify-between md:items-start gap-8 relative z-10">
                <div className="flex-grow">
                  <div className="flex flex-col gap-2 mb-4">
                    <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">{report.companyProfile.name}</h2>
                    <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1">
                            📍 {report.companyProfile.location}
                        </span>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1">
                            🗓️ Est. {report.companyProfile.founded}
                        </span>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100 flex items-center gap-1">
                            💰 {report.companyProfile.lastFunding}
                        </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                    <p className="text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide mb-1 text-blue-500">What they do</span> 
                        {report.companyProfile.product}
                    </p>
                    <div className="h-px bg-slate-200 w-full"></div>
                    <p className="text-slate-700 leading-relaxed">
                        <span className="font-bold text-slate-900 block text-xs uppercase tracking-wide mb-1 text-blue-500">Major Use Case</span> 
                        {report.companyProfile.useCase}
                    </p>
                  </div>
                </div>
                
                {/* Visual Score Card */}
                <div className="bg-gradient-to-b from-white to-blue-50/50 rounded-2xl p-5 min-w-[260px] border border-blue-100 shadow-md shadow-blue-50 flex flex-col justify-center relative group">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center flex-grow">Stability Score</h3>
                    </div>
                    
                    <ScoreGauge 
                        score={score} 
                        verdict={verdict}
                        risk={risk}
                    />
                    
                    {isUsingCustomScore && (
                      <div className="text-center mt-2">
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                          Customized
                        </span>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Main Grid: Career Impact & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Career Radar */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 shadow-md shadow-blue-50 border border-blue-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <span className="p-1.5 bg-blue-100 rounded-lg text-blue-600">💼</span> Career Impact
                        </h3>
                        <div className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded">Radar View</div>
                    </div>
                    
                    <CareerRadar data={report.careerImpact} />
                    
                    <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
                        <div className={`p-3 rounded-xl border ${report.visaSafety.h1bSponsor === 'Yes' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-orange-50 border-orange-100 text-orange-800'}`}>
                            <strong className="block mb-1 opacity-70">Visa Safety</strong> 
                            <span className="text-sm font-bold">{report.visaSafety.h1bSponsor === 'Yes' ? '✅ H1B Safe' : '⚠️ H1B Risky'}</span>
                        </div>
                        <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-800">
                            <strong className="block mb-1 opacity-70">Comp Upside</strong> 
                            <span className="text-sm font-bold">{report.careerImpact.compUpside} Potential</span>
                        </div>
                    </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 shadow-md shadow-blue-50 border border-blue-100 flex flex-col h-full">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                        <span className="p-1.5 bg-purple-100 rounded-lg text-purple-600">📝</span> Executive Summary
                    </h3>
                    
                    <div className="space-y-4 flex-grow px-2">
                        <div className="flex gap-4 items-start">
                            <span className="text-emerald-500 font-bold shrink-0 text-lg mt-0.5">↑</span>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Upside</span>
                                <span className="text-slate-700 font-medium">{report.summary.upside}</span>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <span className="text-rose-500 font-bold shrink-0 text-lg mt-0.5">↓</span>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Red Flags</span>
                                <span className="text-slate-700 font-medium">{report.summary.redFlags}</span>
                            </div>
                        </div>
                        <div className="flex gap-4 items-start">
                            <span className="text-amber-500 font-bold shrink-0 text-lg mt-0.5">?</span>
                            <div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Unknowns</span>
                                <span className="text-slate-700 font-medium">{report.summary.unknowns}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl transform -rotate-1 opacity-10"></div>
                        <div className="relative p-5 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl text-white shadow-lg shadow-blue-200">
                            <div className="flex items-start gap-3">
                                <div className="text-3xl opacity-50 font-serif leading-none">"</div>
                                <div className="text-sm font-medium leading-relaxed italic opacity-95">
                                    {report.summary.guardianTake}
                                </div>
                            </div>
                            <div className="mt-3 text-xs font-bold text-blue-200 flex justify-end items-center gap-1">
                                — Startup Guardian Take <span className="text-lg leading-none">🛡️</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recommended Reads Pre-Interview */}
            {report.recommendedReads && report.recommendedReads.length > 0 && (
              <div className="mt-8">
                <h3 className="text-xl font-extrabold text-slate-900 mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shadow-sm text-sm">📚</span>
                  Recommended Pre-Interview Reads
                </h3>
                <p className="text-slate-500 text-sm mb-5 ml-10">
                  Understand the culture, vision, and working style before you step in the room.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {report.recommendedReads.map((item, idx) => (
                    <a 
                      key={idx} 
                      href={item.uri} 
                      target="_blank" 
                      rel="noreferrer"
                      className="group block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-slate-100 px-2 py-0.5 rounded bg-slate-50 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                           {item.source}
                        </span>
                        <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 10 Pillars */}
            <PillarList pillars={report.pillars} onCustomize={() => setIsAdjustingWeights(true)} />

            {/* Transparency & Visa Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                        🔍 Transparency Check
                    </h3>
                    <div className="flex items-center gap-6 mb-2">
                        <div>
                            <span className="block text-xs text-slate-400 mb-1">Data Penalty</span>
                            <div className={`text-2xl font-bold ${report.transparency.penalty === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {report.transparency.penalty > 0 ? `-${report.transparency.penalty}` : '0'} pts
                            </div>
                        </div>
                        <div className="h-10 w-px bg-slate-100"></div>
                        <div>
                            <span className="block text-xs text-slate-400 mb-1">Status</span>
                            {report.transparency.missingData.length > 0 ? (
                                <span className="text-sm font-bold text-amber-600">Missing Key Data</span>
                            ) : (
                                <span className="text-sm font-bold text-emerald-600">High Transparency</span>
                            )}
                        </div>
                    </div>
                    {report.transparency.missingData.length > 0 && (
                         <div className="mt-3 bg-slate-50 p-3 rounded-lg">
                            <p className="text-xs text-slate-500 font-medium mb-1">Missing:</p>
                            <div className="flex flex-wrap gap-2">
                                {report.transparency.missingData.map((m, i) => (
                                    <span key={i} className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-600">{m}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                     <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                        🛂 Visa Safety Details
                     </h3>
                     <div className="grid grid-cols-3 gap-3 text-center h-full">
                         <div className="p-3 bg-blue-50/50 rounded-2xl flex flex-col justify-center border border-blue-50">
                             <div className="text-xs text-blue-400 font-semibold mb-1">H1B</div>
                             <div className="font-bold text-slate-800">{report.visaSafety.h1bSponsor}</div>
                         </div>
                         <div className="p-3 bg-blue-50/50 rounded-2xl flex flex-col justify-center border border-blue-50">
                             <div className="text-xs text-blue-400 font-semibold mb-1">Green Card</div>
                             <div className="font-bold text-slate-800">{report.visaSafety.greenCard}</div>
                         </div>
                         <div className="p-3 bg-blue-50/50 rounded-2xl flex flex-col justify-center border border-blue-50">
                             <div className="text-xs text-blue-400 font-semibold mb-1">E-Verify</div>
                             <div className="font-bold text-slate-800">{report.visaSafety.eVerify}</div>
                         </div>
                     </div>
                </div>
            </div>

            {/* Sources */}
            {report.sources && report.sources.length > 0 && (
              <div className="text-xs text-slate-400 mt-8 pb-4 pt-6 border-t border-slate-200">
                <p className="font-bold mb-3 uppercase tracking-wider opacity-50">Verified Sources:</p>
                <div className="flex flex-wrap gap-3">
                  {report.sources.map((s, i) => (
                    <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="bg-white px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-colors shadow-sm truncate max-w-xs flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                      {s.title}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-8 pt-4 pb-8 text-center border-t border-slate-100">
                <p className="text-[11px] leading-relaxed text-slate-400 max-w-3xl mx-auto">
                    ⚠️ <strong>Disclaimer:</strong> This report is generated by AI using real-time public search data. All scores, risk levels, and career insights are estimates only and may contain inaccuracies. This tool does not provide financial or legal advice. You must verify all critical details—including financial runway, equity terms, and visa policies—directly with the company's HR department or official documentation before making any career decisions.
                </p>
            </div>

            {/* Modals */}
            {isAdjustingWeights && (
              <WeightAdjuster 
                pillars={report.pillars}
                weights={customWeights}
                onWeightChange={handleWeightChange}
                onReset={handleResetWeights}
                onClose={() => setIsAdjustingWeights(false)}
              />
            )}

          </div>
        )}
      </main>
    </div>
  );
};

export default App;