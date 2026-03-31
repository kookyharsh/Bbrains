"use client"

import React, { useState, useEffect } from "react"
import { BigCalendar } from "@/app/(dashboard)/calendar/_components/BigCalendar"
import { EventCalender } from "@/app/(dashboard)/calendar/_components/EventCalender"
import { DashboardContent } from "@/components/dashboard-content"
import { eventApi, Event as ApiEvent } from "@/services/api/client"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Calendar as CalendarIcon, Info } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CalendarPage() {
    const [events, setEvents] = useState<ApiEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true)
            try {
                const response = await eventApi.getEvents()
                if (response.success && response.data) {
                    setEvents(response.data)
                }
            } catch (error) {
                console.error("Failed to fetch events:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEvents()
    }, [])

    const handleSelectEvent = (event: ApiEvent) => {
        setSelectedEvent(event)
        setIsDialogOpen(true)
    }

    const formatEventDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatEventTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <DashboardContent maxWidth="max-w-[1600px]">
            <div className="flex flex-col gap-6 h-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campus Calendar</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all academic and campus events</p>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Main Calendar View */}
                    <div className="lg:col-span-3 h-full">
                        {loading ? (
                            <div className="h-[700px] w-full bg-white dark:bg-gray-950 rounded-xl border border-dashed border-gray-200 dark:border-gray-800 flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                    <p className="text-sm text-gray-500">Loading calendar...</p>
                                </div>
                            </div>
                        ) : (
                            <BigCalendar 
                                events={events} 
                                onSelectEvent={handleSelectEvent} 
                            />
                        )}
                    </div>

                    {/* Sidebar: Mini Calendar & Event List */}
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <EventCalender events={events.slice(0, 5)} />
                    </div>
                </div>
            </div>

            {/* Event Details Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none">
                    {selectedEvent && (
                        <>
                            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                                <div className="absolute -bottom-6 left-6 p-3 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800">
                                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-none uppercase text-[10px] font-bold tracking-wider">
                                        {selectedEvent.type || "Event"}
                                    </Badge>
                                </div>
                            </div>
                            
                            <div className="p-8 pt-10">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {selectedEvent.title}
                                    </DialogTitle>
                                    <DialogDescription className="mt-2 text-gray-600 dark:text-gray-400">
                                        {selectedEvent.description || "No description provided for this event."}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="mt-8 space-y-4">
                                    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                            <CalendarIcon size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Date</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatEventDate(selectedEvent.startDate)}
                                                {new Date(selectedEvent.startDate).toDateString() !== new Date(selectedEvent.endDate).toDateString() && (
                                                    <span> to {formatEventDate(selectedEvent.endDate)}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                                            <Clock size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Time</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatEventTime(selectedEvent.startDate)} - {formatEventTime(selectedEvent.endDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600 dark:text-emerald-400">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">Location</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedEvent.location || "Campus"}</p>
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="mt-8">
                                    <Button 
                                        onClick={() => setIsDialogOpen(false)}
                                        className="w-full sm:w-auto"
                                    >
                                        Close
                                    </Button>
                                </DialogFooter>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardContent>
    )
}
