"use client"
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, User, Bell, Shield, Download, Trash2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/app/Provider'
import { supabase } from '@/services/supabaseClient'
import { toast } from 'sonner'

function SettingsPage() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState({
        emailNotifications: true,
        browserNotifications: false,
        weeklyReports: true,
        autoDeleteOldInterviews: false,
        dataRetentionDays: 90
    });
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
        loadUserSettings();
    }, [user]);

    const loadUserSettings = async () => {
        if (!user?.email) return;
        
        try {
            const { data, error } = await supabase
                .from('UserSettings')
                .select('*')
                .eq('userEmail', user.email)
                .single();

            if (data) {
                setSettings(prev => ({ ...prev, ...data.settings }));
            }
        } catch (error) {
            console.log('No existing settings found, using defaults');
        }
    };

    const saveSettings = async () => {
        if (!user?.email) return;
        
        setLoading(true);
        try {
            const { error } = await supabase
                .from('UserSettings')
                .upsert({
                    userEmail: user.email,
                    settings: settings,
                    updated_at: new Date().toISOString()
                });

            if (error) {
                console.error('Error saving settings:', error);
                toast.error('Failed to save settings');
            } else {
                toast.success('Settings saved successfully');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const exportData = async () => {
        if (!user?.email) return;
        
        try {
            const { data: interviews, error } = await supabase
                .from('Interviews')
                .select('*')
                .eq('userEmail', user.email);

            if (error) {
                toast.error('Failed to export data');
                return;
            }

            const exportData = {
                user: {
                    name: user.name,
                    email: user.email
                },
                interviews: interviews,
                settings: settings,
                exportDate: new Date().toISOString()
            };

            const dataStr = JSON.stringify(exportData, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const exportFileDefaultName = `ai-recruiter-data-${new Date().toISOString().split('T')[0]}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            toast.success('Data exported successfully');
        } catch (error) {
            console.error('Error exporting data:', error);
            toast.error('Failed to export data');
        }
    };

    const deleteAllData = async () => {
        if (!user?.email) return;
        
        const confirmed = confirm(
            'Are you sure you want to delete all your data? This action cannot be undone. This will delete all your interviews, settings, and account data.'
        );
        
        if (!confirmed) return;
        
        const doubleConfirm = confirm(
            'This is your final warning. All your data will be permanently deleted. Type "DELETE" in the next prompt to confirm.'
        );
        
        if (!doubleConfirm) return;
        
        const deleteConfirmation = prompt('Type "DELETE" to confirm deletion of all data:');
        
        if (deleteConfirmation !== 'DELETE') {
            toast.error('Deletion cancelled - confirmation text did not match');
            return;
        }
        
        setLoading(true);
        try {
            // Delete interviews
            const { error: interviewsError } = await supabase
                .from('Interviews')
                .delete()
                .eq('userEmail', user.email);

            // Delete user settings
            const { error: settingsError } = await supabase
                .from('UserSettings')
                .delete()
                .eq('userEmail', user.email);

            // Delete user record
            const { error: userError } = await supabase
                .from('Users')
                .delete()
                .eq('email', user.email);

            if (interviewsError || settingsError || userError) {
                console.error('Error deleting data:', { interviewsError, settingsError, userError });
                toast.error('Failed to delete some data');
            } else {
                toast.success('All data deleted successfully');
                // Sign out user
                await supabase.auth.signOut();
                router.push('/');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to delete data');
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            toast.success('Signed out successfully');
            router.push('/');
        } catch (error) {
            console.error('Error signing out:', error);
            toast.error('Failed to sign out');
        }
    };

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
                    <h1 className="text-3xl font-bold">Settings</h1>
                    <p className="text-gray-600">Manage your account and application preferences</p>
                </div>
            </div>

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>
                        Your account details and profile information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input 
                                id="name" 
                                value={user?.name || ''} 
                                disabled 
                                className="bg-gray-50"
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                value={user?.email || ''} 
                                disabled 
                                className="bg-gray-50"
                            />
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        Profile information is managed through your Google account and cannot be changed here.
                    </p>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Notification Preferences
                    </CardTitle>
                    <CardDescription>
                        Choose how you want to be notified about interview activities
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="email-notifications">Email Notifications</Label>
                            <p className="text-sm text-gray-500">Receive email updates about interviews</p>
                        </div>
                        <Switch
                            id="email-notifications"
                            checked={settings.emailNotifications}
                            onCheckedChange={(checked) => 
                                setSettings(prev => ({ ...prev, emailNotifications: checked }))
                            }
                        />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="browser-notifications">Browser Notifications</Label>
                            <p className="text-sm text-gray-500">Show browser notifications for real-time updates</p>
                        </div>
                        <Switch
                            id="browser-notifications"
                            checked={settings.browserNotifications}
                            onCheckedChange={(checked) => 
                                setSettings(prev => ({ ...prev, browserNotifications: checked }))
                            }
                        />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="weekly-reports">Weekly Reports</Label>
                            <p className="text-sm text-gray-500">Receive weekly summary of interview activities</p>
                        </div>
                        <Switch
                            id="weekly-reports"
                            checked={settings.weeklyReports}
                            onCheckedChange={(checked) => 
                                setSettings(prev => ({ ...prev, weeklyReports: checked }))
                            }
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Data Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Data Management
                    </CardTitle>
                    <CardDescription>
                        Manage your data retention and privacy settings
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="auto-delete">Auto-delete Old Interviews</Label>
                            <p className="text-sm text-gray-500">Automatically delete interviews after specified days</p>
                        </div>
                        <Switch
                            id="auto-delete"
                            checked={settings.autoDeleteOldInterviews}
                            onCheckedChange={(checked) => 
                                setSettings(prev => ({ ...prev, autoDeleteOldInterviews: checked }))
                            }
                        />
                    </div>
                    
                    {settings.autoDeleteOldInterviews && (
                        <div>
                            <Label htmlFor="retention-days">Data Retention (Days)</Label>
                            <Input
                                id="retention-days"
                                type="number"
                                min="30"
                                max="365"
                                value={settings.dataRetentionDays}
                                onChange={(e) => 
                                    setSettings(prev => ({ ...prev, dataRetentionDays: parseInt(e.target.value) }))
                                }
                                className="w-32"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Interviews older than this will be automatically deleted
                            </p>
                        </div>
                    )}
                    
                    <Separator />
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant="outline" onClick={exportData}>
                            <Download className="w-4 h-4 mr-2" />
                            Export My Data
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={deleteAllData}
                            disabled={loading}
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete All Data
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Save Settings */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 justify-between">
                        <Button 
                            onClick={saveSettings} 
                            disabled={loading}
                            className="flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Saving...' : 'Save Settings'}
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={signOut}
                        >
                            Sign Out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default SettingsPage;