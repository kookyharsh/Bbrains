"use client"

import { useEffect, useState } from "react"
import { getBaseUrl } from "@/services/api/client"
import { getAuthToken } from "@/services/api/client"
import { toast } from "sonner"
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"

const GLOBAL_FEATURES = [
    { key: "maintenance_mode", label: "Maintenance Mode", description: "Put the entire system into maintenance mode. All user access will be temporarily disabled." },
    { key: "global_announcements", label: "Global Announcements", description: "Enable or disable global announcements across all colleges." },
    { key: "beta_features", label: "Beta Features", description: "Opt-in to system-wide experimental features." }
];

export default function SuperadminGlobalFeaturesPage() {
    const [features, setFeatures] = useState<Record<string, boolean>>({})
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    useEffect(() => {
        fetchGlobalFeatures()
    }, [])

    const fetchGlobalFeatures = async () => {
        try {
            const token = await getAuthToken()
            const res = await fetch(`${getBaseUrl()}/superadmin/features/global`, {
                headers: { 
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                }
            })
            if (!res.ok) throw new Error("Failed to fetch features")
            const data = await res.json()
            setFeatures(data.data || {})
        } catch (error) {
            toast.error("Error loading global features")
        } finally {
            setIsLoading(false)
        }
    }

    const saveFeatures = async () => {
        setIsSaving(true)
        try {
            const token = await getAuthToken()
            const res = await fetch(`${getBaseUrl()}/superadmin/features/global`, {
                method: "PUT",
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ features })
            })
            if (!res.ok) throw new Error("Failed to save features")

            toast.success("Global features updated successfully")
            fetchGlobalFeatures()
        } catch (error) {
            toast.error("Failed to update features")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="max-w-3xl space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Global Features Management</h1>
            <p className="text-muted-foreground">Manage system-wide feature flags that affect all colleges.</p>

            <Card>
                <CardHeader>
                    <CardTitle>System Config</CardTitle>
                    <CardDescription>Global variables and master feature flags.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-[60px] w-full" />
                            <Skeleton className="h-[60px] w-full" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {GLOBAL_FEATURES.map((feature) => (
                                <div key={feature.key} className="flex items-center justify-between rounded-lg border p-4 shadow-sm">
                                    <div className="space-y-0.5 max-w-[80%]">
                                        <Label htmlFor={`feature-${feature.key}`} className="text-base font-medium">{feature.label}</Label>
                                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                                    </div>
                                    <Switch
                                        id={`feature-${feature.key}`}
                                        checked={!!features[feature.key]}
                                        onCheckedChange={(checked) => setFeatures(prev => ({ ...prev, [feature.key]: checked }))}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
                <CardFooter>
                    <Button onClick={saveFeatures} disabled={isSaving || isLoading} className="ml-auto">
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
