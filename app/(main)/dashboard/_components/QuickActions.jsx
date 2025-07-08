"use client"
import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Users, Settings, BarChart3, Download, Share2, Zap } from 'lucide-react'
import Link from 'next/link'

function QuickActions() {
    const actions = [
        {
            title: "Create Interview",
            description: "Set up a new AI interview",
            icon: Plus,
            href: "/dashboard/create-interview",
            color: "bg-primary",
            hoverColor: "hover:bg-primary/90"
        },
        {
            title: "View Analytics",
            description: "Check interview performance",
            icon: BarChart3,
            href: "/analytics",
            color: "bg-blue-500",
            hoverColor: "hover:bg-blue-600"
        },
        {
            title: "Manage Candidates",
            description: "View candidate responses",
            icon: Users,
            href: "/candidates",
            color: "bg-green-500",
            hoverColor: "hover:bg-green-600"
        },
        {
            title: "Export Data",
            description: "Download interview reports",
            icon: Download,
            href: "/export",
            color: "bg-purple-500",
            hoverColor: "hover:bg-purple-600"
        }
    ];

    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                </CardTitle>
                <CardDescription>
                    Common tasks and shortcuts
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {actions.map((action, index) => (
                        <Link key={index} href={action.href}>
                            <Button
                                variant="outline"
                                className={`h-auto p-4 flex flex-col items-center gap-2 w-full ${action.hoverColor} hover:text-white transition-all duration-200`}
                            >
                                <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center text-white`}>
                                    <action.icon className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <p className="font-medium text-sm">{action.title}</p>
                                    <p className="text-xs text-gray-500">{action.description}</p>
                                </div>
                            </Button>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default QuickActions;