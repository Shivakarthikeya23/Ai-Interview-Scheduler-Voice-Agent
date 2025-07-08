"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Search, Filter, User, Calendar, Star, Download, Eye, Mail, Clock, MessageSquare } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'
import { useUser } from '@/app/Provider'
import { toast } from 'sonner'
import Link from 'next/link'

function InterviewPreviewPage() {
    const { interviewId } = useParams();
    const [interview, setInterview] = useState(null);
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (interviewId && user?.email) {
            fetchInterviewAndCandidates();
        }
    }, [interviewId, user]);

    useEffect(() => {
        filterAndSortCandidates();
    }, [candidates, searchTerm, filterStatus, sortBy]);

    const fetchInterviewAndCandidates = async () => {
        try {
            setLoading(true);
            
            // Fetch interview details
            const { data: interviewData, error: interviewError } = await supabase
                .from('Interviews')
                .select('*')
                .eq('interviewId', interviewId)
                .eq('userEmail', user.email)
                .single();

            if (interviewError) {
                console.error('Error fetching interview:', interviewError);
                toast.error('Interview not found');
                router.push('/all-interview');
                return;
            }

            setInterview(interviewData);

            // Fetch candidates who took this interview from localStorage
            // In a real app, this would be from a database table like 'InterviewSessions'
            const allFeedback = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith('interviewFeedback_')) {
                    try {
                        const feedbackData = JSON.parse(localStorage.getItem(key));
                        if (feedbackData.interviewId === interviewId) {
                            allFeedback.push({
                                id: key,
                                ...feedbackData,
                                status: 'completed'
                            });
                        }
                    } catch (error) {
                        console.error('Error parsing feedback data:', error);
                    }
                }
            }

            // Also check the main interviewFeedback key
            const mainFeedback = localStorage.getItem('interviewFeedback');
            if (mainFeedback) {
                try {
                    const feedbackData = JSON.parse(mainFeedback);
                    if (feedbackData.interviewId === interviewId) {
                        allFeedback.push({
                            id: 'main_feedback',
                            ...feedbackData,
                            status: 'completed'
                        });
                    }
                } catch (error) {
                    console.error('Error parsing main feedback data:', error);
                }
            }

            setCandidates(allFeedback);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load interview data');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortCandidates = () => {
        let filtered = [...candidates];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(candidate =>
                candidate.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.candidateEmail?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (filterStatus !== 'all') {
            filtered = filtered.filter(candidate => candidate.status === filterStatus);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.timestamp) - new Date(a.timestamp);
                case 'oldest':
                    return new Date(a.timestamp) - new Date(b.timestamp);
                case 'rating':
                    const aRating = getOverallRating(a.feedback?.rating) || 0;
                    const bRating = getOverallRating(b.feedback?.rating) || 0;
                    return bRating - aRating;
                case 'name':
                    return (a.candidateName || '').localeCompare(b.candidateName || '');
                default:
                    return 0;
            }
        });

        setFilteredCandidates(filtered);
    };

    const getOverallRating = (ratings) => {
        if (!ratings) return 0;
        const total = Object.values(ratings).reduce((sum, rating) => sum + rating, 0);
        return Math.round(total / Object.keys(ratings).length);
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

    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getRecommendationColor = (recommendation) => {
        switch (recommendation) {
            case 'Hire':
                return 'bg-green-100 text-green-800';
            case 'Consider':
                return 'bg-yellow-100 text-yellow-800';
            case 'Do Not Hire':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const exportCandidateData = (candidate) => {
        const exportData = {
            candidateInfo: {
                name: candidate.candidateName,
                email: candidate.candidateEmail,
                interviewDate: candidate.timestamp
            },
            interviewDetails: {
                position: candidate.jobPosition,
                duration: formatDuration(candidate.duration),
                totalQuestions: candidate.totalQuestions
            },
            feedback: candidate.feedback,
            overallRating: getOverallRating(candidate.feedback?.rating)
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `${candidate.candidateName}-interview-report-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toast.success('Candidate report exported successfully');
    };

    const viewCandidateDetails = (candidate) => {
        // Navigate to the specific feedback page
        router.push(`/feedback/${interviewId}/${candidate.id}`);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 bg-gray-200 rounded-lg h-32"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!interview) {
        return (
            <div className="space-y-6">
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
                    <h1 className="text-3xl font-bold">Interview Not Found</h1>
                </div>
                <Card>
                    <CardContent className="p-12 text-center">
                        <p className="text-gray-600">The requested interview could not be found.</p>
                    </CardContent>
                </Card>
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
                        <h1 className="text-3xl font-bold">Interview Preview</h1>
                        <p className="text-gray-600">{interview.jobPosition}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link href={`/interview/${interviewId}`}>
                        <Button variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            Take Interview
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Interview Details */}
            <Card>
                <CardHeader>
                    <CardTitle>Interview Details</CardTitle>
                    <CardDescription>Overview of this interview session</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Position</h3>
                            <p className="text-gray-700">{interview.jobPosition}</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Duration</h3>
                            <p className="text-gray-700">{interview.duration} minutes</p>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Questions</h3>
                            <p className="text-gray-700">{interview.questionList?.length || 0} questions</p>
                        </div>
                        <div className="md:col-span-3">
                            <h3 className="font-semibold mb-2">Interview Types</h3>
                            <div className="flex gap-2 flex-wrap">
                                {Array.isArray(interview.type) && interview.type.map((type, index) => (
                                    <Badge key={index} variant="secondary">
                                        {type}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                        <div className="md:col-span-3">
                            <h3 className="font-semibold mb-2">Job Description</h3>
                            <p className="text-gray-700 text-sm">{interview.jobDescription}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Candidates Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Candidates ({candidates.length})
                    </CardTitle>
                    <CardDescription>
                        People who have taken this interview
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Filters and Search */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search candidates by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="newest">Newest First</SelectItem>
                                    <SelectItem value="oldest">Oldest First</SelectItem>
                                    <SelectItem value="rating">Highest Rating</SelectItem>
                                    <SelectItem value="name">Name A-Z</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Candidates List */}
                    {filteredCandidates.length === 0 ? (
                        <div className="text-center py-12">
                            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                {candidates.length === 0 ? 'No candidates yet' : 'No candidates found'}
                            </h3>
                            <p className="text-gray-600 mb-4">
                                {candidates.length === 0 
                                    ? 'Candidates will appear here after they complete the interview'
                                    : 'Try adjusting your search criteria'
                                }
                            </p>
                            {candidates.length === 0 && (
                                <Link href={`/interview/${interviewId}`}>
                                    <Button>
                                        <Eye className="w-4 h-4 mr-2" />
                                        Take Interview
                                    </Button>
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredCandidates.map((candidate) => (
                                <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                                                        {candidate.candidateName?.charAt(0) || 'C'}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold">{candidate.candidateName || 'Anonymous'}</h3>
                                                        <p className="text-gray-600">{candidate.candidateEmail || 'No email provided'}</p>
                                                    </div>
                                                    <Badge className="bg-green-100 text-green-800">
                                                        {candidate.status}
                                                    </Badge>
                                                </div>
                                                
                                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm text-gray-600">Interview Date</p>
                                                        <p className="font-medium">{formatDate(candidate.timestamp)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Duration</p>
                                                        <p className="font-medium">{formatDuration(candidate.duration)}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Overall Rating</p>
                                                        <div className="flex items-center gap-2">
                                                            <Star className="w-4 h-4 text-yellow-500" />
                                                            <span className="font-medium">{getOverallRating(candidate.feedback?.rating)}/10</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {candidate.feedback?.Recommendation && (
                                                    <div className="mb-4">
                                                        <p className="text-sm text-gray-600 mb-1">Recommendation</p>
                                                        <Badge className={getRecommendationColor(candidate.feedback.Recommendation)}>
                                                            {candidate.feedback.Recommendation}
                                                        </Badge>
                                                    </div>
                                                )}

                                                {candidate.feedback?.summary && (
                                                    <div className="mb-4">
                                                        <p className="text-sm text-gray-600 mb-1">Summary</p>
                                                        <p className="text-gray-700 text-sm line-clamp-2">
                                                            {candidate.feedback.summary || candidate.feedback.summery}
                                                        </p>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Button 
                                                        size="sm" 
                                                        onClick={() => viewCandidateDetails(candidate)}
                                                    >
                                                        <MessageSquare className="w-4 h-4 mr-1" />
                                                        View Feedback
                                                    </Button>
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => exportCandidateData(candidate)}
                                                    >
                                                        <Download className="w-4 h-4 mr-1" />
                                                        Export Report
                                                    </Button>
                                                    {candidate.candidateEmail && (
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline"
                                                            onClick={() => window.open(`mailto:${candidate.candidateEmail}`, '_blank')}
                                                        >
                                                            <Mail className="w-4 h-4 mr-1" />
                                                            Contact
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default InterviewPreviewPage;