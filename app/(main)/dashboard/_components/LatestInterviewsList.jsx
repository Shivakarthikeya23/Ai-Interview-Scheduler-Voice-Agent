"use client"
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Plus, Video, Calendar, Clock, User, Eye } from 'lucide-react';
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

    if (loading) {
        return (
            <div className='my-5'>
                <h2 className='font-bold text-2xl mb-4'>Previously Created Interviews</h2>
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
                <h2 className='font-bold text-2xl'>Previously Created Interviews</h2>
                {interviewList.length > 0 && (
                    <Link href="/all-interview">
                        <Button variant="outline" size="sm">
                            View All
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
                                            <Badge variant="secondary" className='text-xs'>
                                                {interview.type?.join(', ') || 'General'}
                                            </Badge>
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
                                            {interview.jobDescription?.substring(0, 150)}...
                                        </p>
                                    </div>

                                    <div className='flex flex-col gap-2 ml-4'>
                                        <Button
                                            size="sm"
                                            onClick={() => copyInterviewLink(interview.interviewId)}
                                            variant="outline"
                                        >
                                            <Eye className='w-4 h-4 mr-1' />
                                            Share
                                        </Button>
                                        <Link href={`/interview/${interview.interviewId}`}>
                                            <Button size="sm" className='w-full'>
                                                <Video className='w-4 h-4 mr-1' />
                                                Preview
                                            </Button>
                                        </Link>
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