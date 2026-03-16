"use client";

import React, { useState, useEffect } from "react";
import { 
  User as UserIcon, Info, Phone, Mail, Camera, Loader2, 
  Trophy, Wallet, GraduationCap, MapPin, Calendar, 
  ChevronRight, Star, Settings, CheckCircle2, UserCircle2
} from "lucide-react";
import { DashboardContent } from "@/components/dashboard-content";
import { dashboardApi, userApi, type User as UserType } from "@/lib/api-services";
import { CrudModal } from "@/components/admin/CrudModal";
import { FormInput } from "@/components/admin/form/FormInput";
import { FormTextarea } from "@/components/admin/form/FormTextarea";
import { FormSelect } from "@/components/admin/form/FormSelect";
import { toast } from "sonner";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    phone: "",
    sex: "other",
    avatar: ""
  });

  const { uploadFile, isUploading } = useCloudinaryUpload();

  const loadUser = async () => {
    try {
      const response = await dashboardApi.getUser();
      if (response.success && response.data) {
        const u = response.data;
        
        // Map grades to include names if they come as objects from Prisma
        if (u.grades) {
          u.grades = u.grades.map((g: any) => ({
            ...g,
            assignmentName: g.assignment?.title || g.assignmentName,
            courseName: g.assignment?.course?.name || g.courseName,
            // Convert string grade to number if needed
            grade: typeof g.grade === 'string' ? parseFloat(g.grade) : g.grade,
            maxGrade: g.maxGrade || 100, // Default if not provided
            submittedAt: g.gradedAt || g.submittedAt
          }));
        }

        setUser(u);
        setForm({
          username: u.username || "",
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          bio: u.bio || "",
          phone: u.phone || "",
          sex: u.sex || "other",
          avatar: u.avatar || ""
        });
      }
    } catch (error) {
      console.error("Failed to load user:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setSubmitting(true);
    try {
      // 1. Update User model (username)
      if (form.username !== user.username) {
        const userRes = await userApi.updateProfile(user.id, { username: form.username });
        if (!userRes.success) {
          toast.error(userRes.message || "Failed to update username");
          setSubmitting(false);
          return;
        }
      }

      // 2. Update UserDetails model
      const detailsRes = await userApi.updateDetails({
        firstName: form.firstName,
        lastName: form.lastName,
        bio: form.bio,
        phone: form.phone,
        sex: form.sex,
        avatar: form.avatar
      });

      if (detailsRes.success) {
        toast.success("Profile updated successfully");
        setIsEditModalOpen(false);
        router.refresh();
        loadUser();
      } else {
        toast.error(detailsRes.message || "Failed to update profile details");
      }
    } catch (error) {
      toast.error("An error occurred while saving changes");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading("Uploading image...");
    try {
      const url = await uploadFile(file);
      if (url) {
        setForm(prev => ({ ...prev, avatar: url }));
        const response = await userApi.updateDetails({ avatar: url });
        toast.dismiss(loadingToast);
        if (response.success) {
          toast.success("Profile picture updated!");
          router.refresh();
          loadUser();
        } else {
          toast.error(response.message || "Failed to save profile picture");
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error("Upload failed");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("An error occurred during upload");
    }
  };

  if (loading) {
    return (
      <DashboardContent>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-brand-purple" />
        </div>
      </DashboardContent>
    );
  }

  const xpProgress = user?.xp ? (user.xp.xp % 1000) / 10 : 0; // Assuming 1000 XP per level for visual
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.username;

  return (
    <DashboardContent>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        {/* Profile Header Card */}
        <div className="relative overflow-hidden bg-card rounded-[2.5rem] border border-border/40 shadow-xl mb-8">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-brand-purple/20 via-brand-orange/10 to-brand-mint/20" />
          
          <div className="relative pt-16 px-8 pb-8 flex flex-col md:flex-row items-center md:items-end gap-6">
            <div className="relative group">
              <Avatar className="h-32 w-32 rounded-full border-4 border-card shadow-2xl transition-transform duration-300 group-hover:scale-105">
                <AvatarImage src={user?.avatar} className="object-cover" />
                <AvatarFallback className="bg-brand-purple text-white text-5xl font-bold">
                  {user?.firstName?.[0] ?? user?.username?.[0] ?? "U"}
                </AvatarFallback>
              </Avatar>
              <label 
                htmlFor="avatar-upload-header" 
                className="absolute bottom-1 right-1 bg-brand-purple text-white p-2.5 rounded-full cursor-pointer shadow-lg hover:bg-brand-purple/90 transition-all z-10 hover:scale-110 active:scale-95"
              >
                <Camera className="h-4 w-4" />
                <input 
                  type="file" 
                  id="avatar-upload-header" 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={isUploading}
                />
              </label>
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-black text-foreground tracking-tight">{displayName}</h1>
                <Badge className="bg-brand-purple/10 text-brand-purple border-none uppercase tracking-widest text-[10px] font-black h-5">
                  {user?.type}
                </Badge>
              </div>
              <p className="text-muted-foreground font-medium flex items-center justify-center md:justify-start gap-2">
                <span className="text-brand-purple/70">@{user?.username}</span>
                <span className="h-1 w-1 rounded-full bg-border" />
                <span>{user?.email}</span>
              </p>
            </div>

            <Button 
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
              className="rounded-2xl border-brand-purple/20 hover:bg-brand-purple/5 text-brand-purple font-bold h-12 px-6"
            >
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Stats & Progress */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card rounded-3xl border border-border/40 p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4 text-brand-orange" />
                Progress
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase">Level</p>
                    <p className="text-3xl font-black text-foreground">{user?.xp?.level || 1}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-xs font-bold text-muted-foreground uppercase">XP</p>
                    <p className="text-xl font-black text-brand-purple">{user?.xp?.xp || 0}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Progress value={xpProgress} className="h-3 bg-muted" />
                  <p className="text-[10px] text-center font-bold text-muted-foreground uppercase tracking-wider">
                    {Math.round(xpProgress)}% to next level
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                    <Wallet className="h-5 w-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Wallet</p>
                    <p className="font-black text-foreground">₹{user?.wallet?.balance || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-3xl border border-border/40 p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <Star className="h-4 w-4 text-brand-mint" />
                Achievements
              </h3>
              
              <div className="space-y-3">
                {user?.userAchievements && user.userAchievements.length > 0 ? (
                  user.userAchievements.map((ua, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/10">
                      <div className="h-10 w-10 rounded-lg bg-brand-mint/10 flex items-center justify-center text-lg">
                        {ua.achievement.icon || "🏆"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{ua.achievement.title}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{ua.achievement.description}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center py-4 text-sm text-muted-foreground italic">No achievements yet</p>
                )}
              </div>
            </div>
          </div>

          {/* Middle/Right Column: Details & Academic */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio Section */}
            <div className="bg-card rounded-3xl border border-border/40 p-6 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 flex items-center gap-2">
                <Info className="h-4 w-4 text-brand-purple" />
                About Me
              </h3>
              <p className={cn(
                "text-base leading-relaxed",
                user?.bio ? "text-foreground" : "text-muted-foreground italic"
              )}>
                {user?.bio || "No biography provided yet. Tell others about yourself!"}
              </p>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-card rounded-3xl border border-border/40 p-5 shadow-sm flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-brand-purple" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Phone</p>
                  <p className="font-bold text-foreground">{user?.phone || "Not provided"}</p>
                </div>
              </div>

              <div className="bg-card rounded-3xl border border-border/40 p-5 shadow-sm flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-brand-orange/10 flex items-center justify-center">
                  <UserCircle2 className="h-5 w-5 text-brand-orange" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Gender</p>
                  <p className="font-bold text-foreground capitalize">{user?.sex || "Other"}</p>
                </div>
              </div>
            </div>

            {/* Academic Performance */}
            <div className="bg-card rounded-3xl border border-border/40 p-6 shadow-sm space-y-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-brand-purple" />
                Academic Overview
              </h3>
              
              <div className="overflow-hidden rounded-2xl border border-border/20">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground tracking-widest">Course / Assignment</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-center">Grade</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-muted-foreground tracking-widest text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/10">
                    {user?.grades && user.grades.length > 0 ? (
                      user.grades.map((g, i) => (
                        <tr key={i} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <p className="text-sm font-bold text-foreground">{g.assignmentName}</p>
                            <p className="text-[10px] text-muted-foreground">{g.courseName}</p>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Badge className={cn(
                              "font-black border-none",
                              g.grade >= 90 ? "bg-green-500/10 text-green-600" :
                              g.grade >= 75 ? "bg-blue-500/10 text-blue-600" :
                              "bg-brand-orange/10 text-brand-orange"
                            )}>
                              {g.grade}/{g.maxGrade}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-xs text-muted-foreground">
                              {new Date(g.submittedAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-sm text-muted-foreground italic">
                          No grades recorded yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CrudModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Customize Your Profile"
        onSubmit={handleUpdateProfile}
        submitting={submitting}
      >
        <div className="space-y-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="Username"
              value={form.username}
              onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))}
              placeholder="CoolUser123"
              className="font-mono bg-muted/30"
              required
            />
            <FormSelect
              label="Gender Identity"
              value={form.sex}
              onChange={(val) => setForm(prev => ({ ...prev, sex: val }))}
              options={[
                { value: "male", label: "Male" },
                { value: "female", label: "Female" },
                { value: "other", label: "Other / Prefer not to say" }
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label="First Name"
              value={form.firstName}
              onChange={(e) => setForm(prev => ({ ...prev, firstName: e.target.value }))}
              placeholder="John"
              required
            />
            <FormInput
              label="Last Name"
              value={form.lastName}
              onChange={(e) => setForm(prev => ({ ...prev, lastName: e.target.value }))}
              placeholder="Doe"
              required
            />
          </div>

          <FormInput
            label="Phone Number"
            value={form.phone}
            onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
            placeholder="+1 234 567 890"
          />

          <FormTextarea
            label="Biography"
            value={form.bio}
            onChange={(val) => setForm(prev => ({ ...prev, bio: val }))}
            placeholder="Tell the community about yourself, your goals, and interests..."
            rows={5}
            className="resize-none"
          />
        </div>
      </CrudModal>
    </DashboardContent>
  );
}
