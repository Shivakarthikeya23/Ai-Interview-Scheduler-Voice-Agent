"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Video, Calendar, Clock, User, Eye, Trash2, Share } from 'lucide-react';
import React, { useState, useEffect } from 'react'
import { supabase } from '@/services/supabaseClient';
import { useUser } from '@/app/Provider';
import Link from 'next/link';
import { toast } from 'sonner';

function LatestInterviewsList() {
    const [interviewList, setInterviewList] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useUser();

    useEffect(() => {
        if (user?.email) {
            fetchInterviews();
        }
    }, [user]);

    const fetchInterviews = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('Interviews')
                .select('*')
                .eq('userEmail', user.email)
                .order('created_at', { ascending: false })
                .limit(5);

            if (error) {
                console.error('Error fetching interviews:', error);
                toast.error('Failed to load interviews');
            } else {
                setInterviewList(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to load interviews');
        } finally {
            setLoading(false);
        }
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
                setInterviewList(prev => prev.filter(interview => interview.interviewId !== interviewId));
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete interview');
        }
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

    const getInterviewUrl = (interviewId) => {
        return `${window.location.origin}/interview/${interviewId}`;
    };

    const copyInterviewLink = async (interviewId) => {
        try {
            await navigator.clipboard.writeText(getInterviewUrl(interviewId));
            toast.success('Interview link copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const shareInterview = async (interview) => {
        const shareData = {
            title: `Interview - ${interview.jobPosition}`,
            text: `You're invited to an AI interview for ${interview.jobPosition}`,
            url: getInterviewUrl(interview.interviewId)
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

    if (loading) {
        return (
            <div className='my-5'>
                <h2 className='font-bold text-2xl mb-4'>Recently Created Interviews</h2>
                <div className='grid gap-4'>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className='p-4 bg-white border border-gray-200 rounded-lg animate-pulse'>
                            <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                            <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className='my-5'>
            <div className='flex justify-between items-center mb-4'>
                <h2 className='font-bold text-2xl'>Recently Created Interviews</h2>
                {interviewList.length > 0 && (
                    <Link href="/all-interview">
                        <Button variant="outline" size="sm">
                            View All ({interviewList.length > 5 ? '5+' : interviewList.length})
                        </Button>
                    </Link>
                )}
            </div>
            
            {interviewList?.length === 0 ? (
                <Card className='border-dashed border-2 border-gray-300'>
                    <CardContent className='p-8 flex flex-col gap-4 items-center justify-center text-center'>
                        <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
                            <Video className='h-8 w-8 text-primary' />
                        </div>
                        <div>
                            <CardTitle className='text-lg mb-2'>No Interviews Created Yet</CardTitle>
                            <CardDescription>
                                Create your first AI-powered interview to get started with intelligent candidate assessment.
                            </CardDescription>
                        </div>
                        <Link href="/dashboard/create-interview">
                            <Button className='mt-2'>
                                <Plus className='w-4 h-4 mr-2' /> 
                                Create New Interview
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className='grid gap-4'>
                    {interviewList.map((interview, index) => (
                        <Card key={interview.interviewId || index} className='hover:shadow-md transition-shadow'>
                            <CardContent className='p-4'>
                                <div className='flex justify-between items-start'>
                                    <div className='flex-1'>
                                        <div className='flex items-center gap-2 mb-2'>
                                            <h3 className='font-semibold text-lg'>{interview.jobPosition}</h3>
                                            <div className='flex gap-1'>
                                                {Array.isArray(interview.type) && interview.type.slice(0, 2).map((type, idx) => (
                                                    <Badge key={idx} variant="secondary" className='text-xs'>
                                                        {type}
                                                    </Badge>
                                                ))}
                                                {Array.isArray(interview.type) && interview.type.length > 2 && (
                                                    <Badge variant="secondary" className='text-xs'>
                                                        +{interview.type.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className='flex items-center gap-4 text-sm text-gray-600 mb-3'>
                                            <div className='flex items-center gap-1'>
                                                <Clock className='w-4 h-4' />
                                                {interview.duration} min
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <Calendar className='w-4 h-4' />
                                                {formatDate(interview.created_at)}
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <User className='w-4 h-4' />
                                                {interview.questionList?.length || 0} questions
                                            </div>
                                        </div>

                                        <p className='text-sm text-gray-700 line-clamp-2'>
                                            {interview.jobDescription?.substring(0, 150)}
                                            {interview.jobDescription?.length > 150 ? '...' : ''}
                                        </p>
                                    </div>

                                    <div className='flex flex-col gap-2 ml-4'>
                                        <Button
                                            size="sm"
                                            onClick={() => shareInterview(interview)}
                                            variant="outline"
                                        >
                                            <Share className='w-4 h-4 mr-1' />
                                            Share
                                        </Button>
                                        <Link href={`/interview/${interview.interviewId}`}>
                                            <Button size="sm" className='w-full'>
                                                <Eye className='w-4 h-4 mr-1' />
                                                Preview
                                            </Button>
                                        </Link>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => deleteInterview(interview.interviewId)}
                                            className="w-full"
                                        >
                                            <Trash2 className='w-4 h-4 mr-1' />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default LatestInterviewsList