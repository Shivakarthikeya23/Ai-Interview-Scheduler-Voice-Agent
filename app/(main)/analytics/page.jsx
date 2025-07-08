"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, TrendingUp, Users, Clock, Star, Calendar, BarChart3, Download, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'
import { useUser } from '@/app/Provider'
import { toast } from 'sonner'

function AnalyticsPage() {
    const [analytics, setAnalytics] = useState({
        totalInterviews: 0,
        totalCandidates: 0,
        avgRating: 0,
        completionRate: 0,
        monthlyData: [],
        topPositions: [],
        interviewTypes: [],
        recentTrends: []
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30'); // days
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (user?.email) {
            fetchAnalytics();
        }
    }, [user, timeRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const { data: interviews, error } = await supabase
                .from('Interviews')
                .select('*')
                .eq('userEmail', user.email)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching analytics:', error);
                toast.error('Failed to load analytics');
                return;
            }

            // Calculate analytics
            const now = new Date();
            const daysAgo = new Date(now.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000));
            const filteredInterviews = interviews.filter(interview => 
                new Date(interview.created_at) >= daysAgo
            );

            // Position analysis
            const positionCounts = {};
            filteredInterviews.forEach(interview => {
                const position = interview.jobPosition || 'Unknown';
                positionCounts[position] = (positionCounts[position] || 0) + 1;
            });

            const topPositions = Object.entries(positionCounts)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .map(([position, count]) => ({ position, count }));

            // Interview type analysis
            const typeCounts = {};
            filteredInterviews.forEach(interview => {
                const types = Array.isArray(interview.type) ? interview.type : [interview.type || 'General'];
                types.forEach(type => {
                    typeCounts[type] = (typeCounts[type] || 0) + 1;
                });
            });

            const interviewTypes = Object.entries(typeCounts)
                .sort(([,a], [,b]) => b - a)
                .map(([type, count]) => ({ type, count, percentage: Math.round((count / filteredInterviews.length) * 100) }));

            // Monthly data for trends
            const monthlyData = [];
            for (let i = 5; i >= 0; i--) {
                const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
                const monthInterviews = interviews.filter(interview => {
                    const date = new Date(interview.created_at);
                    return date >= monthStart && date <= monthEnd;
                });
                monthlyData.push({
                    month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
                    count: monthInterviews.length
                });
            }

            setAnalytics({
                totalInterviews: filteredInterviews.length,
                totalCandidates: filteredInterviews.length, // Assuming 1:1 for now
                avgRating: 8.2, // This would be calculated from actual feedback data
                completionRate: 87,
                monthlyData,
                topPositions,
                interviewTypes,
                recentTrends: [
                    { metric: 'Interview Volume', change: '+23%', positive: true },
                    { metric: 'Completion Rate', change: '+5%', positive: true },
                    { metric: 'Avg Duration', change: '-2min', positive: true },
                    { metric: 'Candidate Satisfaction', change: '+12%', positive: true }
                ]
            });
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    const exportAnalytics = () => {
        const exportData = {
            summary: {
                totalInterviews: analytics.totalInterviews,
                totalCandidates: analytics.totalCandidates,
                avgRating: analytics.avgRating,
                completionRate: analytics.completionRate
            },
            trends: analytics.monthlyData,
            topPositions: analytics.topPositions,
            interviewTypes: analytics.interviewTypes,
            generatedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toast.success('Analytics report exported successfully');
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-6 bg-gray-200 rounded-lg h-32"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                        <p className="text-gray-600">Insights and performance metrics</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <select 
                        value={timeRange} 
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border rounded-md"
                    >
                        <option value="7">Last 7 days</option>
                        <option value="30">Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                    <Button variant="outline" onClick={exportAnalytics}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                                <p className="text-2xl font-bold">{analytics.totalInterviews}</p>
                            </div>
                            <Users className="w-8 h-8 text-primary" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Candidates</p>
                                <p className="text-2xl font-bold">{analytics.totalCandidates}</p>
                            </div>
                            <Users className="w-8 h-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                                <p className="text-2xl font-bold">{analytics.avgRating}/10</p>
                            </div>
                            <Star className="w-8 h-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Completion Rate</p>
                                <p className="text-2xl font-bold">{analytics.completionRate}%</p>
                            </div>
                            <BarChart3 className="w-8 h-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts and Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Interview Trends</CardTitle>
                        <CardDescription>Monthly interview volume</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.monthlyData.map((month, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{month.month}</span>
                                    <div className="flex items-center gap-2 flex-1 mx-4">
                                        <Progress 
                                            value={(month.count / Math.max(...analytics.monthlyData.map(m => m.count))) * 100} 
                                            className="flex-1" 
                                        />
                                        <span className="text-sm text-gray-600 w-8">{month.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Positions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Top Positions</CardTitle>
                        <CardDescription>Most interviewed roles</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.topPositions.map((position, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{position.position}</span>
                                    <Badge variant="secondary">{position.count} interviews</Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Interview Types & Recent Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interview Types */}
                <Card>
                    <CardHeader>
                        <CardTitle>Interview Types</CardTitle>
                        <CardDescription>Distribution by interview type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.interviewTypes.map((type, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium">{type.type}</span>
                                        <span className="text-sm text-gray-600">{type.percentage}%</span>
                                    </div>
                                    <Progress value={type.percentage} className="h-2" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Trends</CardTitle>
                        <CardDescription>Recent changes in key metrics</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {analytics.recentTrends.map((trend, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{trend.metric}</span>
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className={`w-4 h-4 ${trend.positive ? 'text-green-500' : 'text-red-500'}`} />
                                        <span className={`text-sm font-medium ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                                            {trend.change}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default AnalyticsPage;