"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, Users, Clock, Star, Calendar, BarChart3 } from 'lucide-react'
import { supabase } from '@/services/supabaseClient'
import { useUser } from '@/app/Provider'

function InterviewStats() {
    const [stats, setStats] = useState({
        totalInterviews: 0,
        thisMonth: 0,
        avgDuration: 0,
        completionRate: 0,
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (user?.email) {
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { data: interviews, error } = await supabase
                .from('Interviews')
                .select('*')
                .eq('userEmail', user.email)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching stats:', error);
                return;
            }

            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            const thisMonthInterviews = interviews.filter(interview => 
                new Date(interview.created_at) >= thisMonth
            );

            const totalDuration = interviews.reduce((sum, interview) => 
                sum + (parseInt(interview.duration) || 0), 0
            );

            setStats({
                totalInterviews: interviews.length,
                thisMonth: thisMonthInterviews.length,
                avgDuration: interviews.length > 0 ? Math.round(totalDuration / interviews.length) : 0,
                completionRate: 85, // This would be calculated based on actual completion data
                recentActivity: interviews.slice(0, 5)
            });
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Interviews</p>
                            <p className="text-2xl font-bold">{stats.totalInterviews}</p>
                        </div>
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                    </div>
                    <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">All time</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">This Month</p>
                            <p className="text-2xl font-bold">{stats.thisMonth}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-500" />
                        </div>
                    </div>
                    <div className="flex items-center mt-2">
                        <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">+{stats.thisMonth} new</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Avg Duration</p>
                            <p className="text-2xl font-bold">{stats.avgDuration}m</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-500" />
                        </div>
                    </div>
                    <div className="flex items-center mt-2">
                        <BarChart3 className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm text-blue-600">Per interview</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Success Rate</p>
                            <p className="text-2xl font-bold">{stats.completionRate}%</p>
                        </div>
                        <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                            <Star className="w-6 h-6 text-green-500" />
                        </div>
                    </div>
                    <div className="flex items-center mt-2">
                        <Star className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">Completion rate</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default InterviewStats;