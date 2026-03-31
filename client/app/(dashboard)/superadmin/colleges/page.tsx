"use client"

import { useEffect, useState } from "react"
import { getBaseUrl } from "@/services/api/client"
import { getAuthToken } from "@/services/api/client"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, Settings } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

interface College {
    id: number;
    name: string;
    email: string;
    regNo: string;
    features?: Record<string, boolean>;
}

const AVAILABLE_FEATURES = [
    { key: "marketplace", label: "Marketplace" },
    { key: "chat", label: "Chat" },
    { key: "gamification", label: "Gamification" },
    { key: "announcements", label: "Announcements" },
    { key: "manage_users", label: "Manage Users" },
    { key: "manage_teachers", label: "Manage Teachers" },
    { key: "assignments", label: "Assignments" }
];

export default function SuperadminCollegesPage() {
    const [colleges, setColleges] = useState<College[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedCollege, setSelectedCollege] = useState<College | null>(null)
    const [featuresForm, setFeaturesForm] = useState<Record<string, boolean>>({})
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchColleges()
    }, [])

    const fetchColleges = async () => {
        try {
            const token = await getAuthToken()
            const res = await fetch(`${getBaseUrl()}/superadmin/colleges`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to fetch colleges")
            const data = await res.json()
            setColleges(data.data || [])
        } catch (error) {
            toast.error("Error loading colleges")
        } finally {
            setIsLoading(false)
        }
    }

    const handleManageFeatures = async (college: College) => {
        setSelectedCollege(college)
        try {
            const token = await getAuthToken()
            const res = await fetch(`${getBaseUrl()}/superadmin/colleges/${college.id}/features`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            if (!res.ok) throw new Error("Failed to load features")
            const data = await res.json()
            setFeaturesForm(data.data || {})
        } catch (error) {
            toast.error("Error loading college features")
            setFeaturesForm({})
        }
    }

    const saveFeatures = async () => {
        if (!selectedCollege) return
        setIsSaving(true)
        try {
            const token = await getAuthToken()
            const res = await fetch(`${getBaseUrl()}/superadmin/colleges/${selectedCollege.id}/features`, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ features: featuresForm })
            })
            if (!res.ok) throw new Error("Failed to save features")

            toast.success("Features updated successfully")
            setSelectedCollege(null)
            fetchColleges()
        } catch (error) {
            toast.error("Failed to update features")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Colleges Management</h1>
            <p className="text-muted-foreground">Manage feature flags for individual colleges.</p>

            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-[100px] w-full" />
                    <Skeleton className="h-[100px] w-full" />
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {colleges.map((college) => (
                        <Card key={college.id}>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-medium truncate pr-2" title={college.name}>
                                    {college.name}
                                </CardTitle>
                                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">{college.email}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleManageFeatures(college)}
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Manage Features
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={!!selectedCollege} onOpenChange={(open) => !open && setSelectedCollege(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Features: {selectedCollege?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {AVAILABLE_FEATURES.map((feature) => (
                            <div key={feature.key} className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                                <Label htmlFor={`feature-${feature.key}`} className="flex flex-col space-y-1">
                                    <span>{feature.label}</span>
                                    <span className="font-normal text-xs text-muted-foreground">Enable or disable this module for the college.</span>
                                </Label>
                                <Switch
                                    id={`feature-${feature.key}`}
                                    checked={!!featuresForm[feature.key]}
                                    onCheckedChange={(checked) => setFeaturesForm(prev => ({ ...prev, [feature.key]: checked }))}
                                />
                            </div>
                        ))}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedCollege(null)}>Cancel</Button>
                        <Button onClick={saveFeatures} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Features"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
