"use client"

import React, { useState, useEffect, useCallback } from "react"
import { 
    User, Lock, Wallet, Palette, Camera, Loader2, 
    Save, ShieldCheck, Check, AlertCircle, RefreshCcw,
    ChevronRight, KeyRound, Sparkles
} from "lucide-react"
import { DashboardContent } from "@/components/dashboard-content"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
    dashboardApi, userApi, walletApi, themeApi, libraryApi, 
    User as ApiUser, LibraryItem 
} from "@/lib/api-services"
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { supabase } from "@/integrations/supabase/client"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"

export default function SettingsPage() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [purchasedThemes, setPurchasedThemes] = useState<LibraryItem[]>([])
    const [activeThemeId, setActiveThemeId] = useState<string | null>(null)
    
    // Form States
    const [username, setUsername] = useState("")
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [oldPin, setOldPin] = useState("")
    const [newPin, setNewPin] = useState("")
    const [confirmPin, setConfirmPin] = useState("")
    const [isPinSetup, setIsPinSet] = useState(false)

    const { uploadFile, isUploading } = useCloudinaryUpload()

    const loadData = useCallback(async () => {
        try {
            setLoading(true)
            const [userRes, themeRes, libraryRes, walletRes] = await Promise.all([
                dashboardApi.getUser(),
                themeApi.getActiveTheme(),
                libraryApi.getLibrary('theme'),
                walletApi.getWallet()
            ])

            if (userRes.success && userRes.data) {
                const u: any = userRes.data
                setUser(u)
                setUsername(u.username || "")
                setFirstName(u.userDetails?.firstName || "")
                setLastName(u.userDetails?.lastName || "")
            }

            if (themeRes.success && themeRes.data) {
                setActiveThemeId(String(themeRes.data.id))
            }

            if (libraryRes.success && libraryRes.data) {
                setPurchasedThemes(libraryRes.data.data || [])
            }

            if (walletRes.success && walletRes.data) {
                setIsPinSet(!!walletRes.data.pinSet)
            }
        } catch (error) {
            console.error("Failed to load settings:", error)
            toast.error("Failed to sync settings")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        loadData()
    }, [loadData])

    const handleUpdateProfile = async () => {
        if (!user) return
        setUpdating(true)
        try {
            const res = await userApi.updateProfile(user.id, { username })
            const detailsRes = await userApi.updateDetails({ firstName, lastName })
            
            if (res.success && detailsRes.success) {
                toast.success("Profile updated successfully")
                loadData()
            } else {
                toast.error(res.message || detailsRes.message || "Update failed")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setUpdating(false)
        }
    }

    const handleUpdatePassword = async () => {
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        if (newPassword.length < 6) {
            toast.error("Password must be at least 6 characters")
            return
        }

        setUpdating(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword })
            if (error) throw error
            toast.success("Password updated successfully")
            setNewPassword("")
            setConfirmPassword("")
        } catch (error: any) {
            toast.error(error.message || "Failed to update password")
        } finally {
            setUpdating(false)
        }
    }

    const handleUpdatePin = async () => {
        if (newPin !== confirmPin) {
            toast.error("PINs do not match")
            return
        }
        if (newPin.length !== 6) {
            toast.error("PIN must be 6 digits")
            return
        }

        setUpdating(true)
        try {
            let res
            if (isPinSetup) {
                res = await walletApi.changePin(oldPin, newPin)
            } else {
                res = await walletApi.setupPin(newPin)
            }

            if (res.success) {
                toast.success(isPinSetup ? "PIN changed successfully" : "PIN set successfully")
                setOldPin("")
                setNewPin("")
                setConfirmPin("")
                setIsPinSet(true)
            } else {
                toast.error(res.message || "Failed to update PIN")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setUpdating(false)
        }
    }

    const handleApplyTheme = async (themeId: number) => {
        try {
            setUpdating(true)
            const res = await themeApi.applyTheme(themeId)
            if (res.success) {
                setActiveThemeId(String(themeId))
                toast.success("Theme applied! Reloading to take effect...")
                setTimeout(() => window.location.reload(), 1000)
            } else {
                toast.error(res.message || "Failed to apply theme")
            }
        } catch (error) {
            toast.error("Error applying theme")
        } finally {
            setUpdating(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            toast.loading("Uploading avatar...", { id: "avatar-upload" })
            const url = await uploadFile(file)
            if (url) {
                const res = await userApi.updateDetails({ avatar: url })
                if (res.success) {
                    toast.success("Avatar updated", { id: "avatar-upload" })
                    loadData()
                } else {
                    toast.error("Failed to save avatar", { id: "avatar-upload" })
                }
            }
        } catch (error) {
            toast.error("Upload failed", { id: "avatar-upload" })
        }
    }

    if (loading) {
        return (
            <DashboardContent>
                <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Initializing Control Center...</p>
                </div>
            </DashboardContent>
        )
    }

    return (
        <DashboardContent>
            <div className="w-full max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in duration-700">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 text-brand-orange">
                            <ShieldCheck className="w-6 h-6" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">System Preferences</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none">Settings</h1>
                        <p className="text-white/40 font-medium text-lg tracking-tight">Configure your identity and security protocols</p>
                    </div>
                </div>

                <Tabs defaultValue="profile" className="w-full">
                    <div className="flex flex-col lg:flex-row gap-10">
                        {/* Sidebar Navigation */}
                        <div className="lg:w-64 shrink-0">
                            <TabsList className="flex flex-col h-auto bg-transparent gap-2 p-0">
                                <SettingsTabTrigger value="profile" icon={<User />} label="Profile Identity" />
                                <SettingsTabTrigger value="security" icon={<Lock />} label="Security & Access" />
                                <SettingsTabTrigger value="wallet" icon={<Wallet />} label="Financial Security" />
                                <SettingsTabTrigger value="appearance" icon={<Palette />} label="Visual Interface" />
                            </TabsList>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 min-w-0">
                            {/* --- Profile Content --- */}
                            <TabsContent value="profile" className="mt-0 outline-none space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <Card className="rounded-[2.5rem] border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
                                    <CardHeader className="p-8 border-b border-white/5">
                                        <CardTitle className="text-2xl font-black tracking-tight">Avatar & Bio</CardTitle>
                                        <CardDescription className="text-white/40">Manage your public representation across the network</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-10">
                                        <div className="flex flex-col sm:flex-row items-center gap-8">
                                            <div className="relative group">
                                                <div className="absolute inset-0 bg-gradient-to-br from-brand-orange to-brand-purple rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
                                                <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-2xl rounded-full relative z-10">
                                                    <AvatarImage src={user?.userDetails?.avatar} className="object-cover" />
                                                    <AvatarFallback className="bg-brand-orange text-white text-5xl font-black">
                                                        {(user?.firstName?.[0] || user?.username?.[0] || "U").toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <label className="absolute bottom-2 right-2 z-20 h-10 w-10 rounded-full bg-brand-orange text-white flex items-center justify-center cursor-pointer shadow-xl hover:scale-110 transition-all border-4 border-background active:scale-90">
                                                    <Camera className="w-5 h-5" />
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                                                </label>
                                            </div>
                                            <div className="flex-1 space-y-4 text-center sm:text-left">
                                                <div>
                                                    <h3 className="text-xl font-black text-white">{user?.firstName} {user?.lastName}</h3>
                                                    <p className="text-sm text-white/40 font-medium">@{user?.username} • {user?.type}</p>
                                                </div>
                                                <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                                                    <Badge className="bg-white/5 hover:bg-white/10 text-white/60 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">UID: {user?.id.slice(0, 8)}...</Badge>
                                                    <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-1 text-[10px] font-black uppercase tracking-widest">Active Link</Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-white/5">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Public Username</label>
                                                <Input 
                                                    value={username} 
                                                    onChange={(e) => setUsername(e.target.value)} 
                                                    className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Email Identity (Read-only)</label>
                                                <Input 
                                                    value={user?.email} 
                                                    disabled 
                                                    className="h-12 rounded-xl bg-white/5 border-white/5 opacity-50 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">First Name</label>
                                                <Input 
                                                    value={firstName} 
                                                    onChange={(e) => setFirstName(e.target.value)} 
                                                    className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Last Name</label>
                                                <Input 
                                                    value={lastName} 
                                                    onChange={(e) => setLastName(e.target.value)} 
                                                    className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button 
                                                onClick={handleUpdateProfile} 
                                                disabled={updating}
                                                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-black px-8 rounded-xl h-12 shadow-lg shadow-brand-orange/20"
                                            >
                                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Commit Profile</>}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* --- Security Content --- */}
                            <TabsContent value="security" className="mt-0 outline-none space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <Card className="rounded-[2.5rem] border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
                                    <CardHeader className="p-8 border-b border-white/5">
                                        <CardTitle className="text-2xl font-black tracking-tight">Access Control</CardTitle>
                                        <CardDescription className="text-white/40">Update your cryptographic credentials</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-8">
                                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            <p className="text-xs font-bold uppercase tracking-widest">Frequent password rotations improve security profile</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">New Access Key</label>
                                                <Input 
                                                    type="password" 
                                                    value={newPassword} 
                                                    onChange={(e) => setNewPassword(e.target.value)} 
                                                    className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 font-bold"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">Confirm Access Key</label>
                                                <Input 
                                                    type="password" 
                                                    value={confirmPassword} 
                                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                                    className="h-12 rounded-xl bg-white/5 border-white/5 focus:border-brand-orange/50 font-bold"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <Button 
                                                onClick={handleUpdatePassword} 
                                                disabled={updating || !newPassword}
                                                className="bg-brand-purple hover:bg-brand-purple/90 text-white font-black px-8 rounded-xl h-12 shadow-lg shadow-brand-purple/20"
                                            >
                                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><KeyRound className="w-4 h-4 mr-2" /> Rotate Key</>}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* --- Wallet Content --- */}
                            <TabsContent value="wallet" className="mt-0 outline-none space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <Card className="rounded-[2.5rem] border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
                                    <CardHeader className="p-8 border-b border-white/5">
                                        <CardTitle className="text-2xl font-black tracking-tight">Financial Security PIN</CardTitle>
                                        <CardDescription className="text-white/40">Secure your B-Coins with a 6-digit cryptographic PIN</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-10 flex flex-col items-center">
                                        <div className="w-full space-y-8">
                                            {isPinSetup && (
                                                <div className="space-y-4 flex flex-col items-center">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Current Signature PIN</label>
                                                    <InputOTP maxLength={6} value={oldPin} onChange={setOldPin}>
                                                        <InputOTPGroup className="gap-2">
                                                            {[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} className="h-12 w-10 rounded-xl border-white/10 bg-white/5 font-black text-lg" />)}
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </div>
                                            )}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-4 flex flex-col items-center">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">{isPinSetup ? "New Signature PIN" : "Setup Signature PIN"}</label>
                                                    <InputOTP maxLength={6} value={newPin} onChange={setNewPin}>
                                                        <InputOTPGroup className="gap-2">
                                                            {[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} className="h-12 w-10 rounded-xl border-white/10 bg-white/5 font-black text-lg border-brand-orange/30" />)}
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </div>
                                                <div className="space-y-4 flex flex-col items-center">
                                                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Confirm PIN</label>
                                                    <InputOTP maxLength={6} value={confirmPin} onChange={setConfirmPin}>
                                                        <InputOTPGroup className="gap-2">
                                                            {[...Array(6)].map((_, i) => <InputOTPSlot key={i} index={i} className="h-12 w-10 rounded-xl border-white/10 bg-white/5 font-black text-lg" />)}
                                                        </InputOTPGroup>
                                                    </InputOTP>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full flex justify-end pt-10 border-t border-white/5">
                                            <Button 
                                                onClick={handleUpdatePin} 
                                                disabled={updating || newPin.length < 6}
                                                className="bg-brand-orange hover:bg-brand-orange/90 text-white font-black px-10 rounded-xl h-12 shadow-lg shadow-brand-orange/20"
                                            >
                                                {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ShieldCheck className="w-4 h-4 mr-2" /> Secure PIN</>}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* --- Appearance Content --- */}
                            <TabsContent value="appearance" className="mt-0 outline-none space-y-8 animate-in slide-in-from-right-4 duration-500">
                                <Card className="rounded-[2.5rem] border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden shadow-2xl">
                                    <CardHeader className="p-8 border-b border-white/5">
                                        <CardTitle className="text-2xl font-black tracking-tight">Visual Interface</CardTitle>
                                        <CardDescription className="text-white/40">Apply purchased themes to your workspace</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-8 space-y-8">
                                        {purchasedThemes.length === 0 ? (
                                            <div className="py-20 text-center space-y-4 rounded-[2rem] border-2 border-dashed border-white/5">
                                                <Palette className="w-12 h-12 text-white/10 mx-auto" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-black text-white/40 uppercase tracking-widest">No custom themes acquired</p>
                                                    <Button variant="link" className="text-brand-orange font-bold text-xs" onClick={() => window.location.href='/market/themes'}>Visit Theme Marketplace <ChevronRight className="w-3 h-3 ml-1" /></Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                {purchasedThemes.map((item) => (
                                                    <div 
                                                        key={item.id}
                                                        onClick={() => handleApplyTheme(item.productId)}
                                                        className={cn(
                                                            "group relative overflow-hidden rounded-[2rem] border transition-all duration-500 cursor-pointer p-1",
                                                            activeThemeId === String(item.productId) 
                                                                ? "border-brand-orange bg-brand-orange/5 shadow-[0_0_30px_rgba(249,115,22,0.2)]" 
                                                                : "border-white/5 bg-white/[0.02] hover:border-white/20"
                                                        )}
                                                    >
                                                        <div className="aspect-[16/9] relative rounded-[1.8rem] overflow-hidden bg-white/5">
                                                            {item.image ? (
                                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Palette className="w-10 h-10 text-white/10" />
                                                                </div>
                                                            )}
                                                            {activeThemeId === String(item.productId) && (
                                                                <div className="absolute inset-0 bg-brand-orange/20 flex items-center justify-center backdrop-blur-[2px]">
                                                                    <Badge className="bg-brand-orange text-white border-none px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">Active Engine</Badge>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-5 flex items-center justify-between">
                                                            <div>
                                                                <h4 className="font-black text-white tracking-tight">{item.name}</h4>
                                                                <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Version {String((item.themeConfig as any)?.version || "1.0")}</p>
                                                            </div>
                                                            {activeThemeId !== String(item.productId) && (
                                                                <Button size="sm" className="h-8 rounded-full bg-white/5 hover:bg-brand-orange text-[9px] font-black uppercase tracking-widest">Apply</Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </div>
                </Tabs>
            </div>
        </DashboardContent>
    )
}

function SettingsTabTrigger({ value, icon, label }: { value: string, icon: React.ReactNode, label: string }) {
    return (
        <TabsTrigger 
            value={value} 
            className={cn(
                "w-full flex items-center justify-start gap-4 px-6 py-4 rounded-2xl transition-all duration-300",
                "text-white/40 font-bold text-sm border border-transparent",
                "data-[state=active]:bg-white/5 data-[state=active]:text-brand-orange data-[state=active]:border-white/5 data-[state=active]:shadow-xl"
            )}
        >
            <span className="shrink-0 [&_svg]:w-5 [&_svg]:h-5">{icon}</span>
            <span className="truncate">{label}</span>
            <ChevronRight className={cn(
                "ml-auto w-4 h-4 transition-transform duration-300 opacity-0",
                "group-data-[state=active]:opacity-100 group-data-[state=active]:translate-x-1"
            )} />
        </TabsTrigger>
    )
}
