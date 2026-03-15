"use client"

import React from 'react'

interface DashboardContentProps {
    children: React.ReactNode
    className?: string
    maxWidth?: string
}

export function DashboardContent({ 
    children, 
    className = "", 
    maxWidth = "max-w-7xl" 
}: DashboardContentProps) {
    return (
        <div className="flex-1 overflow-y-auto">
            <div className={`${maxWidth} mx-auto w-full p-4 md:p-6 pb-24 md:pb-8 ${className}`}>
                {children}
            </div>
        </div>
    )
}
