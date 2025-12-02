import React from 'react';
import { ComparisonReport } from '../types';

interface Props {
  data: ComparisonReport;
}

const BattleTable: React.FC<Props> = ({ data }) => {
  return (
    <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-gradient-to-br from-white to-blue-50 rounded-3xl p-6 md:p-8 shadow-lg shadow-blue-100/50 border border-blue-100">
        
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Startup Battle
            </span>
            <span className="ml-2">⚔️</span>
          </h2>
          <p className="text-slate-500 text-lg">Comparing key career safety metrics side-by-side.</p>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto pb-4">
          <table className="w-full min-w-[600px] border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left text-sm font-bold text-slate-400 uppercase tracking-wider border-b-2 border-slate-100 w-1/4">
                  Feature
                </th>
                {data.companies.map((company, idx) => (
                  <th key={idx} className="p-4 text-center text-lg font-bold text-slate-900 border-b-2 border-slate-100 w-1/4 bg-blue-50/30 rounded-t-xl">
                    {company}
                  </th>
                ))}
                <th className="p-4 text-center text-sm font-bold text-slate-400 uppercase tracking-wider border-b-2 border-slate-100 w-1/4">
                  🏆 Winner
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, idx) => (
                <tr key={idx} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-5 text-sm font-bold text-slate-700 border-b border-slate-100 align-middle">
                    {row.feature}
                  </td>
                  {data.companies.map((company, cIdx) => {
                    const isWinner = row.winner === company;
                    return (
                      <td key={cIdx} className={`p-5 text-center border-b border-slate-100 align-middle ${isWinner ? 'bg-emerald-50/30' : ''}`}>
                        <div className="flex flex-col items-center justify-center gap-1">
                          <span className={`text-sm md:text-base font-medium ${isWinner ? 'text-emerald-900 font-bold' : 'text-slate-600'}`}>
                            {row.companyValues[company]}
                          </span>
                          {isWinner && (
                             <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                               Best
                             </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                  <td className="p-5 text-center border-b border-slate-100 align-middle">
                    <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg font-bold text-sm shadow-sm">
                      {row.winner === 'Tie' ? '🤝 Tie' : `👑 ${row.winner}`}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Verdict */}
        <div className="mt-8 bg-slate-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200">
           <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-3xl opacity-20 pointer-events-none -mr-20 -mt-20"></div>
           <h3 className="text-xl font-bold mb-3 flex items-center gap-2 relative z-10">
             🛡️ Guardian Verdict
           </h3>
           <p className="text-blue-100 leading-relaxed text-lg relative z-10">
             {data.guardianVerdict}
           </p>
        </div>

      </div>

      {/* Sources */}
      {data.sources && data.sources.length > 0 && (
        <div className="text-xs text-slate-400 pb-4 text-center">
          <p className="font-bold mb-2 uppercase tracking-wider opacity-50">Verified Sources:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {data.sources.map((s, i) => (
              <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="hover:text-blue-600 underline decoration-slate-300 hover:decoration-blue-400 underline-offset-2 transition-all">
                {s.title}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BattleTable;