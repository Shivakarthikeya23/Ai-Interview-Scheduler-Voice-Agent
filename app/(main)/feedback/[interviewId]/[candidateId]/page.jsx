"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Calendar, User, Star, TrendingUp, Award, AlertCircle, Clock, Download, Share2, BarChart3 } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

function FeedbackPage() {
    const { interviewId, candidateId } = useParams();
    const [feedbackData, setFeedbackData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (interviewId && candidateId) {
            loadFeedbackData();
        }
    }, [interviewId, candidateId]);

    const loadFeedbackData = () => {
        try {
            setLoading(true);
            
            // Try to get feedback data from localStorage using the candidateId
            let feedbackJson = localStorage.getItem(candidateId);
            
            // If not found, try the main feedback key
            if (!feedbackJson) {
                feedbackJson = localStorage.getItem('interviewFeedback');
            }
            
            // If still not found, search through all feedback keys
            if (!feedbackJson) {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('interviewFeedback_')) {
                        try {
                            const data = JSON.parse(localStorage.getItem(key));
                            if (data.interviewId === interviewId) {
                                feedbackJson = localStorage.getItem(key);
                                break;
                            }
                        } catch (error) {
                            console.error('Error parsing feedback data:', error);
                        }
                    }
                }
            }

            if (feedbackJson) {
                const parsed = JSON.parse(feedbackJson);
                // Verify this feedback belongs to the correct interview
                if (parsed.interviewId === interviewId) {
                    setFeedbackData(parsed);
                } else {
                    toast.error('Feedback data mismatch');
                    router.push('/dashboard');
                }
            } else {
                toast.error('Feedback data not found');
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Error loading feedback data:', error);
            toast.error('Error loading feedback data');
            router.push('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatDuration = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const getRatingColor = (rating) => {
        if (rating >= 8) return 'text-green-600';
        if (rating >= 6) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getRatingBg = (rating) => {
        if (rating >= 8) return 'bg-green-100';
        if (rating >= 6) return 'bg-yellow-100';
        return 'bg-red-100';
    };

    const getOverallRating = (ratings) => {
        if (!ratings) return 0;
        const total = Object.values(ratings).reduce((sum, rating) => sum + rating, 0);
        return Math.round(total / Object.keys(ratings).length);
    };

    const downloadReport = () => {
        if (!feedbackData) return;
        
        const reportData = {
            candidate: feedbackData.candidateName,
            position: feedbackData.jobPosition,
            date: feedbackData.timestamp,
            duration: feedbackData.duration,
            feedback: feedbackData.feedback,
            interviewId: feedbackData.interviewId
        };
        
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `interview-feedback-${feedbackData.candidateName}-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toast.success('Feedback report downloaded');
    };

    const shareReport = async () => {
        if (!feedbackData) return;
        
        const shareText = `Interview Feedback for ${feedbackData.candidateName}
Position: ${feedbackData.jobPosition}
Overall Rating: ${getOverallRating(feedbackData.feedback?.rating)}/10
Recommendation: ${feedbackData.feedback?.Recommendation || 'N/A'}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Interview Feedback Report',
                    text: shareText,
                });
                toast.success('Report shared successfully');
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            await navigator.clipboard.writeText(shareText);
            toast.success('Report details copied to clipboard');
        }
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

    if (!feedbackData) {
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
                    <h1 className="text-3xl font-bold">Interview Feedback</h1>
                </div>

                <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Feedback Available</h3>
                        <p className="text-gray-600 mb-4">
                            The requested feedback could not be found or has been removed.
                        </p>
                        <Button onClick={() => router.push('/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { feedback, candidateName, candidateEmail, jobPosition, timestamp, duration, totalQuestions } = feedbackData;
    const overallRating = getOverallRating(feedback?.rating);

    return (
        <div className="space-y-6" id="feedback-content">
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
                        <h1 className="text-3xl font-bold">Interview Feedback</h1>
                        <p className="text-gray-600">Detailed analysis and recommendations</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={shareReport}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="outline" onClick={downloadReport}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                    </Button>
                </div>
            </div>

            {/* Interview Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Interview Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div>
                            <h3 className="font-semibold mb-2">Candidate Information</h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Name:</span> {candidateName}</p>
                                <p><span className="font-medium">Email:</span> {candidateEmail}</p>
                                <p><span className="font-medium">Position:</span> {jobPosition}</p>
                                <p><span className="font-medium">Date:</span> {formatDate(timestamp)}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Interview Details</h3>
                            <div className="space-y-2 text-sm">
                                <p className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="font-medium">Duration:</span> {duration ? formatDuration(duration) : 'N/A'}
                                </p>
                                <p className="flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" />
                                    <span className="font-medium">Questions:</span> {totalQuestions || 'N/A'}
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="font-medium">Interview ID:</span> {interviewId}
                                </p>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">Overall Performance</h3>
                            <div className="flex items-center gap-4">
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${getRatingBg(overallRating)} ${getRatingColor(overallRating)}`}>
                                    {overallRating}
                                </div>
                                <div>
                                    <p className="text-lg font-semibold">
                                        {overallRating >= 8 ? 'Excellent' : overallRating >= 6 ? 'Good' : 'Needs Improvement'}
                                    </p>
                                    <p className="text-sm text-gray-600">Overall Rating</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Ratings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5" />
                        Detailed Assessment
                    </CardTitle>
                    <CardDescription>
                        Performance breakdown across key evaluation criteria
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                        {feedback?.rating && Object.entries(feedback.rating).map(([category, rating]) => (
                            <div key={category} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium capitalize">
                                        {category.replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <span className={`font-bold ${getRatingColor(rating)}`}>
                                        {rating}/10
                                    </span>
                                </div>
                                <Progress value={rating * 10} className="h-2" />
                                <p className="text-xs text-gray-600">
                                    {rating >= 8 ? 'Excellent performance' : 
                                     rating >= 6 ? 'Good performance' : 
                                     'Room for improvement'}
                                </p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Summary and Recommendation */}
            <div className="grid md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Interview Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 leading-relaxed">
                            {feedback?.summery || feedback?.summary || 'No summary available.'}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="w-5 h-5" />
                            Hiring Recommendation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge 
                                    variant={feedback?.Recommendation === 'Hire' ? 'default' : 'destructive'}
                                    className="text-sm"
                                >
                                    {feedback?.Recommendation || 'Not Available'}
                                </Badge>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                                {feedback?.RecommendationMsg || 'No recommendation message available.'}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button onClick={() => router.push('/dashboard')}>
                            Back to Dashboard
                        </Button>
                        <Button onClick={() => router.push(`/interview-preview/${interviewId}`)}>
                            View Interview
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => {
                                window.print();
                            }}
                        >
                            Print Report
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default FeedbackPage;