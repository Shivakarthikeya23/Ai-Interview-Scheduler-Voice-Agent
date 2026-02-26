"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Calendar, User, Star, TrendingUp, Award, AlertCircle, Clock, Download, Share2, BarChart3, Users, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

function FeedbackPage() {
    const [interviewsWithFeedback, setInterviewsWithFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const byInterview = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || (!key.startsWith('interviewFeedback_') && !key.startsWith('candidate_'))) continue;
            try {
                const data = JSON.parse(localStorage.getItem(key));
                if (data?.interviewId && data?.candidateName) {
                    const id = data.interviewId;
                    if (!byInterview[id]) byInterview[id] = { jobPosition: data.jobPosition, candidates: [] };
                    byInterview[id].candidates.push({ key, ...data });
                }
            } catch (e) { /* skip */ }
        }
        setInterviewsWithFeedback(Object.entries(byInterview).map(([id, v]) => ({ interviewId: id, ...v })));
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="grid gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-6 bg-gray-200 rounded-lg h-24"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Interview Feedback</h1>
                <p className="text-gray-600">Select an interview to view candidates and their feedback</p>
            </div>
            {interviewsWithFeedback.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Feedback Yet</h3>
                        <p className="text-gray-600 mb-4">Complete or preview interviews to see candidate feedback here.</p>
                        <Button onClick={() => router.push('/all-interview')}>View All Interviews</Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {interviewsWithFeedback.map(({ interviewId, jobPosition, candidates }) => (
                        <Card key={interviewId}>
                            <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold">{jobPosition || 'Interview'}</h3>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Users className="w-4 h-4" /> {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                                    </p>
                                </div>
                                <Link href={`/interview-preview/${interviewId}`}>
                                    <Button variant="outline" size="sm">
                                        <Eye className="w-4 h-4 mr-2" /> View candidates & feedback
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default FeedbackPage;