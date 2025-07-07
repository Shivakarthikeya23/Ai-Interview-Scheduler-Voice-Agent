"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Calendar, User, Star, TrendingUp, TrendingDown, Award, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

function FeedbackPage() {
    const [feedbackData, setFeedbackData] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Load feedback from localStorage (in production, fetch from database)
        const storedFeedback = localStorage.getItem('interviewFeedback');
        if (storedFeedback) {
            try {
                const parsed = JSON.parse(storedFeedback);
                setFeedbackData(parsed);
            } catch (error) {
                console.error('Error parsing feedback data:', error);
            }
        }
        setLoading(false);
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
                            Complete an interview session to view detailed feedback and analytics.
                        </p>
                        <Button onClick={() => router.push('/dashboard')}>
                            Go to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { feedback, candidateName, candidateEmail, jobPosition, timestamp } = feedbackData;
    const overallRating = getOverallRating(feedback?.rating);

    return (
        <div className="space-y-6">
            {/* Header */}
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

            {/* Interview Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Interview Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
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
                        <Button 
                            variant="outline"
                            onClick={() => {
                                const printContent = document.getElementById('feedback-content');
                                if (printContent) {
                                    window.print();
                                }
                            }}
                        >
                            Print Report
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => {
                                // Clear feedback data
                                localStorage.removeItem('interviewFeedback');
                                router.push('/dashboard');
                            }}
                        >
                            Clear Feedback
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default FeedbackPage;