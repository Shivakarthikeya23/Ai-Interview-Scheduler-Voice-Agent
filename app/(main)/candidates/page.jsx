"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Search, Filter, User, Calendar, Star, Download, Eye, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

function CandidatesPage() {
    const [candidates, setCandidates] = useState([]);
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [sortBy, setSortBy] = useState('newest');
    const router = useRouter();

    useEffect(() => {
        fetchCandidates();
    }, []);

    useEffect(() => {
        filterAndSortCandidates();
    }, [candidates, searchTerm, filterStatus, sortBy]);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            // Mock data - in real app, this would come from your database
            const mockCandidates = [
                {
                    id: 1,
                    name: "John Smith",
                    email: "john.smith@email.com",
                    position: "Software Engineer",
                    interviewDate: "2024-01-15T10:00:00Z",
                    status: "completed",
                    rating: 8.5,
                    duration: 45,
                    feedback: "Strong technical skills, good communication",
                    recommendation: "Hire"
                },
                {
                    id: 2,
                    name: "Sarah Johnson",
                    email: "sarah.j@email.com",
                    position: "Product Manager",
                    interviewDate: "2024-01-14T14:30:00Z",
                    status: "completed",
                    rating: 7.2,
                    duration: 38,
                    feedback: "Good product sense, needs improvement in technical depth",
                    recommendation: "Consider"
                },
                {
                    id: 3,
                    name: "Mike Chen",
                    email: "mike.chen@email.com",
                    position: "Data Scientist",
                    interviewDate: "2024-01-13T09:15:00Z",
                    status: "pending",
                    rating: null,
                    duration: null,
                    feedback: null,
                    recommendation: null
                }
            ];
            
            setCandidates(mockCandidates);
        } catch (error) {
            console.error('Error fetching candidates:', error);
            toast.error('Failed to load candidates');
        } finally {
            setLoading(false);
        }
    };

    const filterAndSortCandidates = () => {
        let filtered = [...candidates];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(candidate =>
                candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                candidate.position.toLowerCase().includes(searchTerm.toLowerCase())
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
                    return new Date(b.interviewDate) - new Date(a.interviewDate);
                case 'oldest':
                    return new Date(a.interviewDate) - new Date(b.interviewDate);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

        setFilteredCandidates(filtered);
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
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

    const exportCandidates = () => {
        const exportData = filteredCandidates.map(candidate => ({
            name: candidate.name,
            email: candidate.email,
            position: candidate.position,
            interviewDate: candidate.interviewDate,
            status: candidate.status,
            rating: candidate.rating,
            duration: candidate.duration,
            recommendation: candidate.recommendation,
            feedback: candidate.feedback
        }));

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `candidates-export-${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        toast.success('Candidates data exported successfully');
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
                        <h1 className="text-3xl font-bold">Candidates</h1>
                        <p className="text-gray-600">Manage and review candidate interviews</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {filteredCandidates.length > 0 && (
                        <Button variant="outline" onClick={exportCandidates}>
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    )}
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
                                    placeholder="Search candidates by name, email, or position..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={filterStatus} onValueChange={setFilterStatus}>
                                <SelectTrigger className="w-40">
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
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
                </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="flex items-center justify-between">
                <p className="text-gray-600">
                    Showing {filteredCandidates.length} of {candidates.length} candidates
                </p>
                {searchTerm || filterStatus !== 'all' ? (
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('all');
                        }}
                    >
                        Clear Filters
                    </Button>
                ) : null}
            </div>

            {/* Candidates List */}
            {filteredCandidates.length === 0 ? (
                <Card className="border-dashed border-2 border-gray-300">
                    <CardContent className="p-12 text-center">
                        <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">
                            {searchTerm || filterStatus !== 'all' ? 'No candidates found' : 'No candidates yet'}
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || filterStatus !== 'all' 
                                ? 'Try adjusting your search or filter criteria'
                                : 'Candidates will appear here after they complete interviews'
                            }
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filteredCandidates.map((candidate) => (
                        <Card key={candidate.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold">
                                                {candidate.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">{candidate.name}</h3>
                                                <p className="text-gray-600">{candidate.email}</p>
                                            </div>
                                            <Badge className={getStatusColor(candidate.status)}>
                                                {candidate.status}
                                            </Badge>
                                        </div>
                                        
                                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Position</p>
                                                <p className="font-medium">{candidate.position}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Interview Date</p>
                                                <p className="font-medium">{formatDate(candidate.interviewDate)}</p>
                                            </div>
                                            {candidate.rating && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Rating</p>
                                                    <div className="flex items-center gap-2">
                                                        <Star className="w-4 h-4 text-yellow-500" />
                                                        <span className="font-medium">{candidate.rating}/10</span>
                                                    </div>
                                                </div>
                                            )}
                                            {candidate.duration && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Duration</p>
                                                    <p className="font-medium">{candidate.duration} minutes</p>
                                                </div>
                                            )}
                                        </div>

                                        {candidate.recommendation && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-1">Recommendation</p>
                                                <Badge className={getRecommendationColor(candidate.recommendation)}>
                                                    {candidate.recommendation}
                                                </Badge>
                                            </div>
                                        )}

                                        {candidate.feedback && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-1">Feedback</p>
                                                <p className="text-gray-700 text-sm">{candidate.feedback}</p>
                                            </div>
                                        )}

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => {
                                                    // Store candidate data for feedback page
                                                    const feedbackData = localStorage.getItem(candidate.id);
                                                    if (feedbackData) {
                                                        localStorage.setItem('interviewFeedback', feedbackData);
                                                        router.push('/feedback');
                                                    }
                                                }}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View Details
                                            </Button>
                                            <Button 
                                                size="sm" 
                                                variant="outline"
                                                onClick={() => {
                                                    if (candidate.email && candidate.email !== 'No email provided') {
                                                        window.open(`mailto:${candidate.email}`, '_blank');
                                                    } else {
                                                        toast.error('No email available for this candidate');
                                                    }
                                                }}
                                            >
                                                <Mail className="w-4 h-4 mr-1" />
                                                Contact
                                            </Button>
                                            {candidate.status === 'completed' && (
                                                <Button 
                                                    size="sm" 
                                                    variant="outline"
                                                    onClick={() => {
                                                        const feedbackData = localStorage.getItem(candidate.id);
                                                        if (feedbackData) {
                                                            const data = JSON.parse(feedbackData);
                                                            const exportData = {
                                                                candidateInfo: {
                                                                    name: data.candidateName,
                                                                    email: data.candidateEmail,
                                                                    interviewDate: data.timestamp
                                                                },
                                                                interviewDetails: {
                                                                    position: data.jobPosition,
                                                                    duration: data.duration,
                                                                    totalQuestions: data.totalQuestions
                                                                },
                                                                feedback: data.feedback,
                                                                overallRating: getOverallRating(data.feedback?.rating)
                                                            };
                                                            
                                                            const dataStr = JSON.stringify(exportData, null, 2);
                                                            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                                                            
                                                            const exportFileDefaultName = `${candidate.name}-interview-report-${new Date().toISOString().split('T')[0]}.json`;
                                                            
                                                            const linkElement = document.createElement('a');
                                                            linkElement.setAttribute('href', dataUri);
                                                            linkElement.setAttribute('download', exportFileDefaultName);
                                                            linkElement.click();
                                                            
                                                            toast.success('Report downloaded successfully');
                                                        }
                                                    }}
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Download Report
                                                </Button>
                                            )}
                                            {candidate.interviewId && (
                                                <Link href={`/interview-preview/${candidate.interviewId}`}>
                                                    <Button size="sm" variant="outline">
                                                        <Eye className="w-4 h-4 mr-1" />
                                                        View Interview
                                                    </Button>
                                                </Link>
                                            )}
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

export default CandidatesPage;