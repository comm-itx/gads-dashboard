import React from 'react';
import { Lead } from '../types';

interface KPIDashboardProps {
  leads: Lead[];
}

const KPIDashboard: React.FC<KPIDashboardProps> = ({ leads }) => {
  // Calculate KPIs
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'New').length;
  const qualifiedLeads = leads.filter(l => l.status === 'Qualified').length;
  const wonLeads = leads.filter(l => l.status === 'Won').length;
  const lostLeads = leads.filter(l => l.status === 'Lost').length;

  const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) : '0';
  const qualificationRate = totalLeads > 0 ? ((qualifiedLeads / totalLeads) * 100).toFixed(1) : '0';

  // Calculate total value
  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);
  const avgValue = totalLeads > 0 ? (totalValue / totalLeads).toFixed(0) : '0';

  // Recent leads (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentLeads = leads.filter(l => {
    const leadDate = new Date(l.createdAt || l.parsedAt);
    return leadDate >= sevenDaysAgo;
  }).length;

  const kpis = [
    {
      label: 'Total Leads',
      value: totalLeads.toLocaleString(),
      change: `+${recentLeads} this week`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'blue',
      trend: 'up',
    },
    {
      label: 'Conversion Rate',
      value: `${conversionRate}%`,
      change: `${wonLeads} won / ${lostLeads} lost`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      color: 'green',
      trend: 'up',
    },
    {
      label: 'New Leads',
      value: newLeads.toLocaleString(),
      change: 'Needs attention',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      color: 'purple',
      trend: 'neutral',
    },
    {
      label: 'Qualified Rate',
      value: `${qualificationRate}%`,
      change: `${qualifiedLeads} qualified leads`,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'yellow',
      trend: 'up',
    },
  ];

  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  const iconColorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${colorClasses[kpi.color as keyof typeof colorClasses]} border rounded-xl p-6 backdrop-blur-sm hover:scale-105 transition-transform duration-200`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 bg-[--content-dark] rounded-lg ${iconColorClasses[kpi.color as keyof typeof iconColorClasses]}`}>
              {kpi.icon}
            </div>
            {kpi.trend === 'up' && (
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
          <h3 className="text-sm font-medium text-[--text-secondary] mb-1">{kpi.label}</h3>
          <p className="text-3xl font-bold text-white mb-1">{kpi.value}</p>
          <p className="text-xs text-[--text-secondary]">{kpi.change}</p>
        </div>
      ))}
    </div>
  );
};

export default KPIDashboard;
