import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Verdict, RiskLevel } from '../types';

interface Props {
  score: number;
  verdict: Verdict;
  risk: RiskLevel;
}

const ScoreGauge: React.FC<Props> = ({ score, verdict, risk }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  // Determine color based on score/risk
  let color = '#ef4444'; // Red
  if (score >= 50) color = '#eab308'; // Yellow
  if (score >= 75) color = '#22c55e'; // Green

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="70%"
              startAngle={180}
              endAngle={0}
              innerRadius={60}
              outerRadius={85}
              paddingAngle={0}
              dataKey="value"
            >
              <Cell key="cell-0" fill={color} stroke="none" />
              <Cell key="cell-1" fill="#e2e8f0" stroke="none" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <span className="text-4xl font-bold text-slate-800">{score}</span>
            <span className="text-sm text-slate-400 block">/100</span>
        </div>
      </div>
      
      <div className="text-center -mt-2">
        <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Risk Level: {risk}</div>
        <div className={`text-lg font-bold mt-1`} style={{ color }}>{verdict}</div>
      </div>
    </div>
  );
};

export default ScoreGauge;
