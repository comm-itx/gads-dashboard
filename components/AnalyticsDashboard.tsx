import React, { useMemo, useState, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Lead, AiInsights, ApiConfig } from '../types';
import { getLeadInsights } from '../services/aiService';
import { WandSparklesIcon, UsersIcon, TargetIcon, PieChartIcon } from './icons';

interface AnalyticsDashboardProps {
  leads: Lead[];
  apiConfig: ApiConfig;
  onConfigureApi: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-[--content-dark] p-6 rounded-xl border border-[--border-dark] flex items-center">
        <div className="p-3 rounded-full bg-blue-500/10 text-blue-400 mr-4">
            {icon}
        </div>
        <div>
            <h3 className="text-[--text-secondary] font-medium text-sm">{title}</h3>
            <p className="mt-1 text-3xl font-bold text-[--text-primary]">{value}</p>
        </div>
    </div>
);

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f97316', '#ef4444', '#eab308'];

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ leads, apiConfig, onConfigureApi }) => {
    const [insights, setInsights] = useState<AiInsights | null>(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [insightsError, setInsightsError] = useState<string | null>(null);
    const isApiConfigured = apiConfig.apiKey.trim() !== '';

    const analyticsData = useMemo(() => {
        const statusCounts = leads.reduce((acc, lead) => {
            acc[lead.status] = (acc[lead.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
        
        const totalLeads = leads.length;
        const wonLeads = statusCounts['Won'] || 0;
        const conversionRate = totalLeads > 0 ? ((wonLeads / totalLeads) * 100).toFixed(1) + '%' : '0%';

        const qualifiedLeads = (statusCounts['Qualified'] || 0) + (statusCounts['Negotiation'] || 0) + (statusCounts['Won'] || 0);

        const pageCounts = leads.reduce((acc, lead) => {
            try {
                const url = new URL(lead.pageUrl);
                const simpleUrl = `${url.hostname}${url.pathname}`;
                acc[simpleUrl] = (acc[simpleUrl] || 0) + 1;
            } catch (e) {
                // Ignore invalid URLs
            }
            return acc;
        }, {} as Record<string, number>);

        const topPages = Object.keys(pageCounts)
            .map((name) => ({name, count: pageCounts[name]}))
            .sort((a,b) => b.count - a.count)
            .slice(0, 5);

        return { pieData, totalLeads, conversionRate, wonLeads, qualifiedLeads, topPages };
    }, [leads]);

    const handleGenerateInsights = useCallback(async () => {
        if (!isApiConfigured) {
            setInsightsError("API is not configured. Please add your API key in the settings.");
            return;
        }
        setIsLoadingInsights(true);
        setInsightsError(null);
        setInsights(null);
        const result = await getLeadInsights(leads, apiConfig);
        if (result) {
            setInsights(result);
        } else {
            setInsightsError("Failed to generate insights. Check your API key or try again.");
        }
        setIsLoadingInsights(false);
    }, [leads, apiConfig, isApiConfigured]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Leads" value={analyticsData.totalLeads} icon={<UsersIcon className="w-6 h-6"/>} />
                <StatCard title="Qualified Leads" value={analyticsData.qualifiedLeads} icon={<PieChartIcon className="w-6 h-6"/>} />
                <StatCard title="Deals Won" value={analyticsData.wonLeads} icon={<TargetIcon className="w-6 h-6"/>} />
                <StatCard title="Conversion Rate" value={analyticsData.conversionRate} icon={<TargetIcon className="w-6 h-6"/>} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-[--content-dark] p-6 rounded-xl border border-[--border-dark] lg:col-span-1">
                    <h3 className="text-lg font-bold text-[--text-primary] mb-4">Status Funnel</h3>
                    {leads.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={analyticsData.pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8">
                                    {analyticsData.pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                     ) : (
                        <div className="h-[300px] flex items-center justify-center text-[--text-secondary]">
                           No data to display.
                        </div>
                    )}
                </div>
                <div className="bg-[--content-dark] p-6 rounded-xl border border-[--border-dark] lg:col-span-2">
                    <h3 className="text-lg font-bold text-[--text-primary] mb-4">Top Performing Landing Pages</h3>
                    {leads.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={analyticsData.topPages} layout="vertical" margin={{ top: 5, right: 20, left: 80, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                <XAxis type="number" tick={{ fill: 'var(--text-secondary)' }} />
                                <YAxis dataKey="name" type="category" width={150} tick={{ fill: 'var(--text-primary)' }} tickFormatter={(value) => value.length > 25 ? `${value.substring(0,25)}...` : value } />
                                <Tooltip cursor={{fill: 'rgba(255, 255, 255, 0.05)'}}/>
                                <Bar dataKey="count" fill="var(--accent-blue)" name="Leads" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center text-[--text-secondary]">
                            No data to display. Add leads to see the chart.
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-[--content-dark] p-6 rounded-xl border border-[--border-dark]">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                    <h3 className="text-lg font-bold text-[--text-primary] flex items-center">
                        <WandSparklesIcon className="h-6 w-6 mr-2 text-purple-400"/>
                        AI-Powered DMS Insights
                    </h3>
                    <button
                        onClick={handleGenerateInsights}
                        disabled={isLoadingInsights || leads.length === 0 || !isApiConfigured}
                        className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                        {isLoadingInsights ? 'Generating...' : 'Generate Insights'}
                    </button>
                </div>
                {isLoadingInsights && (
                     <div className="flex justify-center items-center h-32">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
                     </div>
                )}
                {insightsError && <p className="text-red-500">{insightsError}</p>}
                {insights && (
                    <div className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-semibold text-[--text-primary]">Summary</h4>
                            <p className="mt-1 text-[--text-secondary]">{insights.summary}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-[--text-primary]">Suggestions</h4>
                            <ul className="mt-2 list-disc list-inside space-y-2 text-[--text-secondary]">
                                {insights.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                            </ul>
                        </div>
                    </div>
                )}
                {!insights && !isLoadingInsights && !insightsError && (
                    <p className="text-[--text-secondary]">
                        {leads.length === 0 ? "Add some leads first to generate insights." :
                         !isApiConfigured ? <>Please <button onClick={onConfigureApi} className="underline text-blue-400 hover:text-blue-300">configure your API key</button> to generate insights.</>
                                          : "Click 'Generate Insights' to analyze your lead data with AI."}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AnalyticsDashboard;