import React, { useEffect, useState } from 'react';
import { Pillar } from '../types';

interface Props {
  pillars: Pillar[];
  weights: Record<number, number>;
  onWeightChange: (id: number, val: number) => void;
  onReset: () => void;
  onClose: () => void;
}

const WeightAdjuster: React.FC<Props> = ({ pillars, weights, onWeightChange, onReset, onClose }) => {
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const isValid = totalWeight === 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-blue-100 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Customize Scoring</h3>
            <p className="text-sm text-slate-500">Adjust what matters most to you.</p>
          </div>
          <div className="flex flex-col items-end">
             <span className={`text-2xl font-bold ${isValid ? 'text-blue-600' : 'text-amber-500'}`}>
               {totalWeight}%
             </span>
             <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Weight</span>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="overflow-y-auto p-6 space-y-6 flex-grow">
          {pillars.map((pillar) => (
            <div key={pillar.id} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0">
                {pillar.id}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-slate-700">{pillar.title}</label>
                    <span className="text-sm font-semibold text-blue-600">{weights[pillar.id] || 0}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={weights[pillar.id] || 0}
                  onChange={(e) => onWeightChange(pillar.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>
          ))}
          
          {!isValid && (
            <div className="p-4 bg-amber-50 text-amber-800 rounded-xl text-sm flex items-center gap-3">
              <span className="text-xl">⚠️</span>
              Weights must sum to exactly 100% for an accurate score.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <button 
            onClick={onReset}
            className="text-slate-500 hover:text-blue-600 font-semibold text-sm transition-colors"
          >
            Reset Defaults
          </button>
          <button 
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm shadow-blue-200 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeightAdjuster;
