"use client"
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Logo from '@/components/Logo'
import { supabase } from '@/services/supabaseClient'
import { ArrowLeft, Chrome } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

function AuthPage() {
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        checkUser();
    }, []);

    const checkUser = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (mounted && user) {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error("Error checking user:", error);
        }
    };

    const signInWithGoogle = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            if (error) {
                console.log('Error signing in with Google:', error.message);
            }
        } catch (error) {
            console.error("Error signing in:", error);
        } finally {
            setLoading(false);
        }
    };

    // Don't render until mounted to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            </div>
        );
    }

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