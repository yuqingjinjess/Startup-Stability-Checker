import React, { useState } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Pillar, StatusColor } from '../types';

interface Props {
  pillars: Pillar[];
  onCustomize: () => void;
}

const StatusBadge: React.FC<{ status: StatusColor }> = ({ status }) => {
  const colors = {
    [StatusColor.Green]: 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm',
    [StatusColor.Yellow]: 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm',
    [StatusColor.Red]: 'bg-rose-100 text-rose-700 border-rose-200 shadow-sm',
  };

  return (
    <span className={`px-2.5 py-1 rounded-md text-xs font-extrabold border uppercase tracking-wider ${colors[status]}`}>
      {status}
    </span>
  );
};

const PillarItem: React.FC<{ pillar: Pillar }> = ({ pillar }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`border rounded-xl mb-3 overflow-hidden transition-all duration-300 ${isOpen ? 'border-blue-300 ring-4 ring-blue-50 shadow-md' : 'border-blue-100 shadow-sm hover:shadow-md hover:border-blue-200'} bg-gradient-to-r from-white to-blue-50/40`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-white/50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className={`h-10 w-10 flex items-center justify-center rounded-xl font-bold text-sm shadow-sm transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'}`}>
            {pillar.id}
          </div>
          <div>
            <span className="font-bold text-slate-800 block text-base sm:text-lg">{pillar.title}</span>
            <span className="text-blue-400 text-xs font-semibold tracking-wide uppercase">Weight: {pillar.weight}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge status={pillar.status} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-blue-100 text-blue-600' : 'text-slate-400'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="p-5 bg-gradient-to-b from-blue-50/30 to-white border-t border-blue-100/50">
           {/* If there is a summary, show it */}
           {pillar.summary && (
               <div className="bg-blue-50/50 p-3 rounded-lg mb-4 border border-blue-100">
                    <p className="text-sm text-blue-900 italic font-medium">"{pillar.summary}"</p>
               </div>
           )}
           
           {/* Revenue Chart - Only for pillars with revenueData (Typically Pillar 1) */}
           {pillar.revenueData && pillar.revenueData.length > 0 && (
             <div className="mb-6 mt-2 h-64 w-full bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Revenue Growth</p>
                   <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-100">Est. (Millions USD)</span>
               </div>
               <ResponsiveContainer width="100%" height="85%">
                 <AreaChart data={pillar.revenueData}>
                   <defs>
                     <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                        dataKey="year" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} 
                        dy={10}
                   />
                   <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 11}} 
                        tickFormatter={(value) => `$${value}M`} 
                        width={40}
                   />
                   <Tooltip
                       contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       formatter={(value) => [`$${value}M`, 'Revenue']}
                       labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                   />
                   <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#2563eb" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorRev)" 
                        animationDuration={1500}
                   />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
           )}

           {/* User Base Chart - Only for pillars with userBaseData (Typically Pillar 7) */}
           {pillar.userBaseData && pillar.userBaseData.length > 0 && (
             <div className="mb-6 mt-2 h-64 w-full bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
               <div className="flex items-center justify-between mb-4">
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">User Base Growth</p>
                   <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">Est. Count</span>
               </div>
               <ResponsiveContainer width="100%" height="85%">
                 <LineChart data={pillar.userBaseData}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                   <XAxis 
                        dataKey="year" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#64748b', fontSize: 11, fontWeight: 600}} 
                        dy={10}
                   />
                   <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fill: '#94a3b8', fontSize: 11}} 
                        tickFormatter={(value) => value >= 1000000 ? `${(value/1000000).toFixed(1)}M` : value >= 1000 ? `${(value/1000).toFixed(0)}k` : value}
                        width={40}
                   />
                   <Tooltip
                       contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                       formatter={(value: number) => [value.toLocaleString(), 'Users']}
                       labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                   />
                   <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#6366f1" 
                        strokeWidth={3} 
                        dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                        animationDuration={1500}
                   />
                 </LineChart>
               </ResponsiveContainer>
             </div>
           )}

           <ul className="space-y-3">
             {Object.entries(pillar.details).map(([key, value]) => (
               <li key={key} className="text-sm flex flex-col sm:flex-row sm:items-baseline gap-2 pb-2 border-b border-dashed border-slate-100 last:border-0 last:pb-0">
                 <strong className="text-slate-700 sm:w-1/3 shrink-0 font-bold">{key}</strong>
                 <span className="text-slate-600 leading-relaxed">{value}</span>
               </li>
             ))}
           </ul>
        </div>
      )}
    </div>
  );
};

const PillarList: React.FC<Props> = ({ pillars, onCustomize }) => {
  return (
    <div className="mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center shadow-sm">⭐</span> 
            The 10-Pillar Deep Dive
        </h3>
        
        <button 
            onClick={onCustomize}
            className="group flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500">
                <path fillRule="evenodd" d="M3 6a3 3 0 013-3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6zm14.25 6a.75.75 0 01-.22.53l-2.25 2.25a.75.75 0 11-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 111.06-1.06l2.25 2.25c.141.14.22.331.22.53zm-9 0a.75.75 0 01.22.53l2.25 2.25a.75.75 0 11-1.06 1.06L6.56 12l1.72-1.72a.75.75 0 11-1.06-1.06l-2.25 2.25A.75.75 0 015.25 12z" clipRule="evenodd" />
            </svg>
            Adjust Weights
        </button>
      </div>

      <div className="space-y-2">
        {pillars.map((pillar) => (
          <PillarItem key={pillar.id} pillar={pillar} />
        ))}
      </div>
    </div>
  );
};

export default PillarList;