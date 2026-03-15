"use client"

import React, { useState, useEffect } from "react"
import { MessageSquarePlus, Send, Loader2, CheckCircle2, Clock, XCircle, Search, Trash2 } from "lucide-react"
import { DashboardContent } from "@/components/dashboard-content"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { suggestionApi, Suggestion } from "@/lib/api-services"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export default function SuggestionsPage() {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({ title: "", content: "" })

    const fetchSuggestions = async () => {
        try {
            setLoading(true)
            const res = await suggestionApi.getSuggestions()
            if (res.success) {
                setSuggestions(res.data)
            }
        } catch (error) {
            console.error("Failed to fetch suggestions:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSuggestions()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.title || !formData.content) return

        try {
            setSubmitting(true)
            const res = await suggestionApi.createSuggestion(formData)
            if (res.success) {
                toast.success("Suggestion submitted! Thank you for your feedback.")
                setFormData({ title: "", content: "" })
                fetchSuggestions()
            }
        } catch (error) {
            toast.error("Failed to submit suggestion")
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const res = await suggestionApi.deleteSuggestion(id)
            if (res.success) {
                toast.success("Suggestion removed")
                setSuggestions(prev => prev.filter(s => s.id !== id))
            }
        } catch (error) {
            toast.error("Failed to delete suggestion")
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'implemented': return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case 'reviewed': return <Search className="h-4 w-4 text-blue-500" />
            case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />
            default: return <Clock className="h-4 w-4 text-yellow-500" />
        }
    }

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'implemented': return "bg-green-500/10 text-green-500 border-green-500/20"
            case 'reviewed': return "bg-blue-500/10 text-blue-500 border-blue-500/20"
            case 'rejected': return "bg-red-500/10 text-red-500 border-red-500/20"
            default: return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
        }
    }

    return (
        <DashboardContent>
            <div className="max-w-5xl mx-auto space-y-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                        <MessageSquarePlus className="h-8 w-8 text-brand-orange" />
                        Suggestions & Feedback
                    </h1>
                    <p className="text-muted-foreground">Help us improve BBrains by sharing your ideas and reporting issues.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Submission Form */}
                    <Card className="lg:col-span-1 h-fit border-brand-orange/20 shadow-lg shadow-brand-orange/5">
                        <CardHeader>
                            <CardTitle className="text-lg">Submit New Idea</CardTitle>
                            <CardDescription>What's on your mind?</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</label>
                                    <Input 
                                        placeholder="Brief summary..." 
                                        className="rounded-xl"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        disabled={submitting}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Details</label>
                                    <Textarea 
                                        placeholder="Describe your suggestion in detail..." 
                                        className="rounded-xl min-h-[150px] resize-none"
                                        value={formData.content}
                                        onChange={e => setFormData({ ...formData, content: e.target.value })}
                                        required
                                        disabled={submitting}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button 
                                    className="w-full rounded-xl bg-brand-orange hover:bg-brand-orange/90 font-bold h-11"
                                    disabled={submitting || !formData.title || !formData.content}
                                >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                                    Submit Feedback
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>

                    {/* History List */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="font-bold text-sm uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Your History
                        </h2>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 rounded-3xl border border-dashed">
                                <Loader2 className="h-8 w-8 animate-spin mb-4 text-brand-orange" />
                                <p className="font-medium">Loading your suggestions...</p>
                            </div>
                        ) : suggestions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/20 rounded-3xl border border-dashed px-6 text-center">
                                <MessageSquarePlus className="h-12 w-12 mb-4 opacity-20" />
                                <p className="font-bold text-foreground">No suggestions yet</p>
                                <p className="text-sm mt-1">Be the first to share an idea to improve the platform!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {suggestions.map((s) => (
                                    <Card key={s.id} className="overflow-hidden border-none shadow-sm bg-card/50 hover:bg-card transition-colors group">
                                        <CardContent className="p-0">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-bold text-base leading-tight">{s.title}</h3>
                                                        <Badge variant="outline" className={cn("text-[10px] uppercase font-black px-2 py-0 h-5", getStatusClass(s.status))}>
                                                            <span className="mr-1">{getStatusIcon(s.status)}</span>
                                                            {s.status}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-sm text-muted-foreground line-clamp-2">{s.content}</p>
                                                    <p className="text-[10px] text-muted-foreground pt-1">Submitted on {format(new Date(s.createdAt), "PPP")}</p>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {s.status === 'pending' && (
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(s.id)}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardContent>
    )
}
