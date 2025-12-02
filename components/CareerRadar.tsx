import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CareerImpact } from '../types';

interface Props {
  data: CareerImpact;
}

const CareerRadar: React.FC<Props> = ({ data }) => {
  // Convert Low/Med/High to numbers for the chart
  const mapValue = (val: string) => {
    if (val === 'High') return 3;
    if (val === 'Med') return 2;
    return 1;
  };

  const chartData = [
    { subject: 'Learning', A: mapValue(data.learning), fullMark: 3 },
    { subject: 'Brand', A: mapValue(data.brand), fullMark: 3 },
    { subject: 'WLB', A: mapValue(data.wlb), fullMark: 3 },
    { subject: 'Job Security', A: mapValue(data.jobSecurity), fullMark: 3 },
    { subject: 'Comp Upside', A: mapValue(data.compUpside), fullMark: 3 },
    { subject: 'Visa Safety', A: mapValue(data.visaSafety), fullMark: 3 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} 
          />
          <PolarRadiusAxis angle={30} domain={[0, 3]} tick={false} axisLine={false} />
          <Radar
            name="Career Impact"
            dataKey="A"
            stroke="#2563eb"
            strokeWidth={2}
            fill="#3b82f6"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CareerRadar;
