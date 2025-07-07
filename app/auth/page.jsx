"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Logo from '@/components/Logo'
import { supabase } from '@/services/supabaseClient'
import { ArrowLeft, Chrome, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

function AuthPage() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Handle auth callback
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    toast.success('Successfully signed in!');
                    router.push('/dashboard');
                } else if (event === 'SIGNED_OUT') {
                    toast.info('Signed out successfully');
                }
            }
        );

        return () => subscription.unsubscribe();
    }, [router]);

    const signInWithGoogle = async () => {
        setLoading(true);
        
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                }
            });

            if (error) {
                console.error('OAuth Error:', error);
                toast.error(`Authentication failed: ${error.message}`);
            } else {
                toast.info('Redirecting to Google...');
            }
        } catch (error) {
            console.error("Error signing in:", error);
            toast.error(`Sign in failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex flex-col'>
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link href="/">
                            <Logo />
                        </Link>
                        <Link href="/">
                            <Button variant="ghost" className="flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Auth Content */}
            <div className='flex-1 flex items-center justify-center p-4'>
                <Card className='w-full max-w-md shadow-2xl border-0'>
                    <CardHeader className='text-center space-y-4'>
                        <div className="mx-auto">
                            <Logo size="large" />
                        </div>
                        <div>
                            <CardTitle className='text-2xl font-bold'>Welcome Back</CardTitle>
                            <CardDescription className='text-base mt-2'>
                                Sign in to access your AI-powered interview platform
                            </CardDescription>
                        </div>
                    </CardHeader>
                    
                    <CardContent className='space-y-6'>
                        <div className='space-y-4'>
                            <Button 
                                onClick={signInWithGoogle} 
                                disabled={loading}
                                className='w-full h-12 text-base font-medium bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 shadow-sm'
                                variant="outline"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                                ) : (
                                    <>
                                        <Chrome className='w-5 h-5 mr-3' />
                                        Continue with Google
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className='relative'>
                            <div className='absolute inset-0 flex items-center'>
                                <span className='w-full border-t border-gray-300' />
                            </div>
                            <div className='relative flex justify-center text-sm'>
                                <span className='px-2 bg-white text-gray-500'>
                                    Secure authentication powered by Supabase
                                </span>
                            </div>
                        </div>

                        <div className='text-center space-y-2'>
                            <p className='text-sm text-gray-600'>
                                By signing in, you agree to our{' '}
                                <Link href="#" className='text-primary hover:underline'>
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href="#" className='text-primary hover:underline'>
                                    Privacy Policy
                                </Link>
                            </p>
                        </div>

                        {/* Debug Info (remove in production) */}
                        <div className='text-xs text-gray-400 text-center space-y-1'>
                            <p>Environment: {process.env.NODE_ENV}</p>
                            <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configured' : 'Missing'}</p>
                            <p>Current URL: {typeof window !== 'undefined' ? window.location.origin : 'Server'}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Background decoration */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>
        </div>
    )
}

export default AuthPage