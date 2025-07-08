"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Download, FileText, Database, Calendar, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/services/supabaseClient'
import { useUser } from '@/app/Provider'
import { toast } from 'sonner'

function ExportPage() {
    const [interviews, setInterviews] = useState([]);
    const [selectedInterviews, setSelectedInterviews] = useState([]);
    const [exportFormat, setExportFormat] = useState('json');
    const [dateRange, setDateRange] = useState('all');
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const { user } = useUser();
    const router = useRouter();

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

    const getFilteredInterviews = () => {
        if (dateRange === 'all') return interviews;
        
        const now = new Date();
        let startDate;
        
        switch (dateRange) {
            case '7days':
                startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
                break;
            case '30days':
                startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
                break;
            case '90days':
                startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
                break;
            default:
                return interviews;
        }
        
        return interviews.filter(interview => 
            new Date(interview.created_at) >= startDate
        );
    };

    const handleSelectAll = (checked) => {
        if (checked) {
            setSelectedInterviews(getFilteredInterviews().map(interview => interview.interviewId));
        } else {
            setSelectedInterviews([]);
        }
    };

    const handleSelectInterview = (interviewId, checked) => {
        if (checked) {
            setSelectedInterviews(prev => [...prev, interviewId]);
        } else {
            setSelectedInterviews(prev => prev.filter(id => id !== interviewId));
        }
    };

    const exportData = async () => {
        if (selectedInterviews.length === 0) {
            toast.error('Please select at least one interview to export');
            return;
        }

        setExporting(true);
        
        try {
            const selectedData = interviews.filter(interview => 
                selectedInterviews.includes(interview.interviewId)
            );

            let exportContent;
            let fileName;
            let mimeType;

            if (exportFormat === 'json') {
                exportContent = JSON.stringify(selectedData, null, 2);
                fileName = `interviews-export-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
            } else if (exportFormat === 'csv') {
                // Convert to CSV
                const headers = ['Job Position', 'Duration', 'Type', 'Questions Count', 'Created At', 'Interview Link'];
                const csvRows = [
                    headers.join(','),
                    ...selectedData.map(interview => [
                        `"${interview.jobPosition || ''}"`,
                        interview.duration || '',
                        `"${Array.isArray(interview.type) ? interview.type.join('; ') : (interview.type || '')}"`,
                        interview.questionList?.length || 0,
                        interview.created_at || '',
                        `"${window.location.origin}/interview/${interview.interviewId}"`
                    ].join(','))
                ];
                exportContent = csvRows.join('\n');
                fileName = `interviews-export-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
            }

            const blob = new Blob([exportContent], { type: mimeType });
            const url = URL.createObjectURL(blob);
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', url);
            linkElement.setAttribute('download', fileName);
            linkElement.click();
            
            URL.revokeObjectURL(url);
            toast.success(`${selectedInterviews.length} interviews exported successfully`);
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export data');
        } finally {
            setExporting(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredInterviews = getFilteredInterviews();

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
                        <h1 className="text-3xl font-bold">Export Data</h1>
                        <p className="text-gray-600">Download your interview data and reports</p>
                    </div>
                </div>
            </div>

            {/* Export Options */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Database className="w-5 h-5" />
                        Export Configuration
                    </CardTitle>
                    <CardDescription>
                        Configure your export settings and select data to download
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Export Format</label>
                            <Select value={exportFormat} onValueChange={setExportFormat}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="json">JSON Format</SelectItem>
                                    <SelectItem value="csv">CSV Format</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-2 block">Date Range</label>
                            <Select value={dateRange} onValueChange={setDateRange}>
                                <SelectTrigger>
                                    <Filter className="w-4 h-4 mr-2" />
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="7days">Last 7 Days</SelectItem>
                                    <SelectItem value="30days">Last 30 Days</SelectItem>
                                    <SelectItem value="90days">Last 90 Days</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-end">
                            <Button 
                                onClick={exportData} 
                                disabled={selectedInterviews.length === 0 || exporting}
                                className="w-full"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                {exporting ? 'Exporting...' : `Export ${selectedInterviews.length} Selected`}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Data Selection */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <FileText className="w-5 h-5" />
                            Select Interviews ({filteredInterviews.length} available)
                        </span>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="select-all"
                                checked={selectedInterviews.length === filteredInterviews.length && filteredInterviews.length > 0}
                                onCheckedChange={handleSelectAll}
                            />
                            <label htmlFor="select-all" className="text-sm font-medium">
                                Select All
                            </label>
                        </div>
                    </CardTitle>
                    <CardDescription>
                        Choose which interviews to include in your export
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredInterviews.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No interviews found</h3>
                            <p className="text-gray-600">
                                No interviews match your selected date range. Try adjusting the filter.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {filteredInterviews.map((interview) => (
                                <div key={interview.interviewId} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                                    <Checkbox
                                        id={interview.interviewId}
                                        checked={selectedInterviews.includes(interview.interviewId)}
                                        onCheckedChange={(checked) => handleSelectInterview(interview.interviewId, checked)}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium">{interview.jobPosition}</h4>
                                                <p className="text-sm text-gray-600">
                                                    {formatDate(interview.created_at)} • {interview.duration} minutes
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                {Array.isArray(interview.type) && interview.type.slice(0, 2).map((type, index) => (
                                                    <Badge key={index} variant="secondary" className="text-xs">
                                                        {type}
                                                    </Badge>
                                                ))}
                                                {Array.isArray(interview.type) && interview.type.length > 2 && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        +{interview.type.length - 2}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Export Summary */}
            {selectedInterviews.length > 0 && (
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Export Summary</p>
                                <p className="text-sm text-gray-600">
                                    {selectedInterviews.length} interviews selected • {exportFormat.toUpperCase()} format
                                </p>
                            </div>
                            <Badge variant="secondary">
                                Ready to export
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

export default ExportPage;