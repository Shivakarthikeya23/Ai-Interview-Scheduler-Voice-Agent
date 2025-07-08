"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Calendar, Clock, User, Video, Search, Filter, Eye, Trash2, Plus, Share, Download } from 'lucide-react'
import { supabase } from '@/services/supabaseClient'
import { useUser } from '@/app/Provider'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function AllInterviews() {
    const [interviews, setInterviews] = useState([]);
    const [filteredInterviews, setFilteredInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (user?.email) {
            fetchAllInterviews();
        }
    }, [user]);

    useEffect(() => {
        filterAndSortInterviews();
    }, [interviews, searchTerm, filterType, sortBy]);

    const fetchAllInterviews = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('Interviews')
                .select('*')
                .eq('userEmail', user.email)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching interviews:', error);
                toast.error('Failed to load interviews');
            } else {
                setInterviews(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load interviews');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortInterviews = () => {
        let filtered = [...interviews];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(interview =>
                interview.jobPosition?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                interview.jobDescription?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Type filter
        if (filterType !== 'all') {
            filtered = filtered.filter(interview =>
                interview.type?.includes(filterType)
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at) - new Date(a.created_at);
                case 'oldest':
                    return new Date(a.created_at) - new Date(b.created_at);
                case 'position':
                    return a.jobPosition?.localeCompare(b.jobPosition) || 0;
                case 'duration':
                    return parseInt(b.duration) - parseInt(a.duration);
                default:
                    return 0;
            }
        });

        setFilteredInterviews(filtered);
    };

    const deleteInterview = async (interviewId) => {
        if (!confirm('Are you sure you want to delete this interview? This action cannot be undone.')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('Interviews')
                .delete()
                .eq('interviewId', interviewId);

            if (error) {
                console.error('Error deleting interview:', error);
                toast.error('Failed to delete interview');
            } else {
                toast.success('Interview deleted successfully');
                setInterviews(prev => prev.filter(interview => interview.interviewId !== interviewId));
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete interview');
        }
    };

    const copyInterviewLink = async (interviewId) => {
        try {
            const url = `${window.location.origin}/interview/${interviewId}`;
            await navigator.clipboard.writeText(url);
            toast.success('Interview link copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const shareInterview = async (interview) => {
        const url = `${window.location.origin}/interview/${interview.interviewId}`;
        const shareData = {
            title: `Interview - ${interview.jobPosition}`,
            text: `You're invited to an AI interview for ${interview.jobPosition}`,
            url: url
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                toast.success('Interview shared successfully');
            } catch (error) {
                if (error.name !== 'AbortError') {
                    copyInterviewLink(interview.interviewId);
                }
            }
        } else {
            copyInterviewLink(interview.interviewId);
        }
    };

    const exportInterviews = () => {
        const exportData = filteredInterviews.map(interview => ({
            jobPosition: interview.jobPosition,
            duration: interview.duration,
            type: Array.isArray(interview.type) ? interview.type.join(', ') : interview.type,
            questionsCount: interview.questionList?.length || 0,
            createdAt: interview.created_at,
            interviewLink: `${window.location.origin}/interview/${interview.interviewId}`
        }));

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `interviews-export-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toast.success('Interviews exported successfully');
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
                </div>
                <div className="grid gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="p-6 bg-white border border-gray-200 rounded-lg animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
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
                        <h1 className="text-3xl font-bold">All Interviews</h1>
                        <p className="text-gray-600">Manage and view all your created interviews</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {filteredInterviews.length > 0 && (
                        <Button variant="outline" onClick={exportInterviews}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    )}
                    <Link href="/dashboard/create-interview">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Interview
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Filters and Search */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search interviews by position or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={filterType} onValueChange={setFilterType}>
                                <SelectTrigger className="w-40">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="Technical">Technical</SelectItem>
                                    <SelectItem value="Behavioral">Behavioral</SelectItem>
                                    <SelectItem value="Experience">Experience</SelectItem>
                                    <SelectItem value="Problem-Solving">Problem-Solving</SelectItem>
                                    <SelectItem value="System Design">System Design</SelectItem>
                                    <SelectItem value="Leadership">Leadership</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="position">Position A-Z</SelectItem>
                                    <SelectItem value="duration">Duration</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <p className="text-gray-600">
                    Showing {filteredInterviews.length} of {interviews.length} interviews
                </p>
                {searchTerm || filterType !== 'all' ? (
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                            setSearchTerm('');
                            setFilterType('all');
                        }}
                    >
                        Clear Filters
                    </Button>
                ) : null}
            </div>

            {/* Interviews List */}
            {filteredInterviews.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="p-12 text-center">
                        <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                            {searchTerm || filterType !== 'all' ? 'No interviews found' : 'No interviews created yet'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || filterType !== 'all' 
                                ? 'Try adjusting your search or filter criteria'
                                : 'Create your first AI-powered interview to get started'
                            }
                        </p>
                        {(!searchTerm && filterType === 'all') && (
                            <Link href="/dashboard/create-interview">
                                <Button>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create New Interview
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredInterviews.map((interview) => (
                        <Card key={interview.interviewId} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <h3 className="text-xl font-semibold">{interview.jobPosition}</h3>
                                            <div className="flex gap-1">
                                                {Array.isArray(interview.type) && interview.type.slice(0, 3).map((type, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {type}
                                                    </Badge>
                                                ))}
                                                {Array.isArray(interview.type) && interview.type.length > 3 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{interview.type.length - 3}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                {interview.duration} minutes
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                {formatDate(interview.created_at)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <User className="w-4 h-4" />
                                                {interview.questionList?.length || 0} questions
                                            </div>
                                        </div>

                                        <p className="text-gray-700 line-clamp-2 mb-4">
                                            {interview.jobDescription}
                                        </p>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => shareInterview(interview)}
                                            >
                                                <Share className="w-4 h-4 mr-1" />
                                                Share
                                            </Button>
                                            <Link href={`/interview-preview/${interview.interviewId}`}>
                                                <Button size="sm">
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    Preview
                                                </Button>
                                            </Link>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => deleteInterview(interview.interviewId)}
                                            >
                                                <Trash2 className="w-4 h-4 mr-1" />
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default AllInterviews;