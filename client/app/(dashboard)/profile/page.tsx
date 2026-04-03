"use client";

import React, { useEffect, useState } from "react";
import type { Grade } from "@/services/api/client";
import {
  BookOpen,
  Camera,
  CheckCircle2,
  GraduationCap,
  Info,
  Loader2,
  Mail,
  Phone,
  Settings,
  Sparkles,
  Star,
  Trophy,
  UserCircle2,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard-content";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CrudModal } from "@/features/admin/components/CrudModal";
import { FormInput } from "@/features/admin/components/form/FormInput";
import { FormSelect } from "@/features/admin/components/form/FormSelect";
import { FormTextarea } from "@/features/admin/components/form/FormTextarea";
import { dashboardApi, userApi, type User as UserType } from "@/services/api/client";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { cn } from "@/lib/utils";
import { useUiMode } from "@/context/ui-mode";

type ExtendedUser = UserType & {
  userDetails?: {
    firstName?: string;
    lastName?: string;
    bio?: string;
    phone?: string;
    sex?: string;
    avatar?: string;
  };
};

type ExtendedGrade = Grade & {
  assignment?: {
    title?: string;
    course?: {
      name?: string;
    };
  };
  gradedAt?: string;
};

function getProfileField(user: ExtendedUser | null, key: "firstName" | "lastName" | "bio" | "phone" | "sex" | "avatar") {
  if (!user) return "";
  const detailValue = user.userDetails?.[key];
  const directValue = user[key];
  return String(detailValue ?? directValue ?? "");
}

function getInitials(user: ExtendedUser | null) {
  const firstName = getProfileField(user, "firstName");
  const lastName = getProfileField(user, "lastName");
  const username = user?.username || "U";

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  }

  return username.slice(0, 2).toUpperCase();
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function ProfilePage() {
  const { uiMode } = useUiMode();
  const router = useRouter();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    phone: "",
    sex: "other",
    avatar: "",
  });

  const { uploadFile, isUploading } = useCloudinaryUpload();

  const loadUser = async () => {
    try {
      const response = await dashboardApi.getUser();
      if (response.success && response.data) {
        const nextUser = response.data as ExtendedUser;

        if (nextUser.grades) {
          nextUser.grades = nextUser.grades.map((grade) => {
            const nextGrade = grade as ExtendedGrade;

            return {
            ...grade,
              assignmentName: nextGrade.assignment?.title || nextGrade.assignmentName,
              courseName: nextGrade.assignment?.course?.name || nextGrade.courseName,
              maxGrade: nextGrade.maxGrade || 100,
              submittedAt: nextGrade.gradedAt || nextGrade.submittedAt,
            };
          });
        }

        setUser(nextUser);
        setForm({
          username: nextUser.username || "",
          firstName: getProfileField(nextUser, "firstName"),
          lastName: getProfileField(nextUser, "lastName"),
          bio: getProfileField(nextUser, "bio"),
          phone: getProfileField(nextUser, "phone"),
          sex: getProfileField(nextUser, "sex") || "other",
          avatar: getProfileField(nextUser, "avatar"),
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
      if (form.username !== user.username) {
        const userRes = await userApi.updateProfile(user.id, { username: form.username });
        if (!userRes.success) {
          toast.error(userRes.message || "Failed to update username");
          setSubmitting(false);
          return;
        }
      }

      const detailsRes = await userApi.updateDetails({
        firstName: form.firstName,
        lastName: form.lastName,
        bio: form.bio,
        phone: form.phone,
        sex: form.sex,
        avatar: form.avatar,
      });

      if (detailsRes.success) {
        toast.success("Profile updated successfully");
        setIsEditModalOpen(false);
        router.refresh();
        loadUser();
      } else {
        toast.error(detailsRes.message || "Failed to update profile details");
      }
    } catch {
      toast.error("An error occurred while saving changes");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading("Uploading image...");
    try {
      const url = await uploadFile(file);
      if (!url) {
        toast.dismiss(loadingToast);
        toast.error("Upload failed");
        return;
      }

      setForm((prev) => ({ ...prev, avatar: url }));
      const response = await userApi.updateDetails({ avatar: url });
      toast.dismiss(loadingToast);

      if (response.success) {
        toast.success("Profile picture updated");
        router.refresh();
        loadUser();
      } else {
        toast.error(response.message || "Failed to save profile picture");
      }
    } catch {
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

  const xp = Number(user?.xp?.xp || 0);
  const level = Number(user?.xp?.level || 1);
  const xpProgress = Math.max(0, Math.min(100, (xp % 1000) / 10));
  const firstName = getProfileField(user, "firstName");
  const lastName = getProfileField(user, "lastName");
  const displayName = `${firstName} ${lastName}`.trim() || user?.username || "User";
  const bio = getProfileField(user, "bio");
  const phone = getProfileField(user, "phone");
  const sex = getProfileField(user, "sex") || "other";
  const avatar = getProfileField(user, "avatar");
  const walletBalance = Number(user?.wallet?.balance || 0);
  const achievementsCount = user?.userAchievements?.length || 0;
  const gradesCount = user?.grades?.length || 0;
  const enrolledCoursesCount = user?.enrollments?.length || (user?.classTeacherCourse ? 1 : 0);
  const roleLabel = user?.type ? user.type[0].toUpperCase() + user.type.slice(1) : "Member";
  const editModal = (
    <CrudModal
      open={isEditModalOpen}
      onClose={() => setIsEditModalOpen(false)}
      title="Customize Your Profile"
      onSubmit={handleUpdateProfile}
      submitting={submitting}
    >
      <div className="space-y-5 py-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            label="Username"
            value={form.username}
            onChange={(event) => setForm((prev) => ({ ...prev, username: event.target.value }))}
            placeholder="CoolUser123"
            className="font-mono bg-muted/30"
            required
          />
          <FormSelect
            label="Gender Identity"
            value={form.sex}
            onChange={(value) => setForm((prev) => ({ ...prev, sex: value }))}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "other", label: "Other / Prefer not to say" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormInput
            label="First Name"
            value={form.firstName}
            onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
            placeholder="John"
            required
          />
          <FormInput
            label="Last Name"
            value={form.lastName}
            onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
            placeholder="Doe"
          />
        </div>

        <FormInput
          label="Phone Number"
          value={form.phone}
          onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
          placeholder="+91 98765 43210"
        />

        <FormTextarea
          label="Biography"
          value={form.bio}
          onChange={(value) => setForm((prev) => ({ ...prev, bio: value }))}
          placeholder="Tell the community about your goals, interests, and personality."
          rows={5}
          className="resize-none"
        />
      </div>
    </CrudModal>
  );

  if (uiMode === "classic") {
    return (
      <DashboardContent>
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div className="relative mb-8 overflow-hidden rounded-[2.5rem] border border-border/40 bg-card shadow-xl">
            <div className="absolute left-0 top-0 h-32 w-full bg-gradient-to-r from-brand-purple/20 via-brand-orange/10 to-brand-mint/20" />

            <div className="relative flex flex-col items-center gap-6 px-8 pb-8 pt-16 md:flex-row md:items-end">
              <div className="group relative">
                <Avatar className="h-32 w-32 rounded-full border-4 border-card shadow-2xl transition-transform duration-300 group-hover:scale-105">
                  <AvatarImage src={avatar} className="object-cover" />
                  <AvatarFallback className="bg-brand-purple text-5xl font-bold text-white">
                    {firstName?.[0] ?? user?.username?.[0] ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="avatar-upload-header"
                  className="absolute bottom-1 right-1 z-10 cursor-pointer rounded-full bg-brand-purple p-2.5 text-white shadow-lg transition-all hover:scale-110 hover:bg-brand-purple/90 active:scale-95"
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

              <div className="flex-1 space-y-2 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                  <h1 className="text-3xl font-black tracking-tight text-foreground">{displayName}</h1>
                  <Badge className="h-5 border-none bg-brand-purple/10 text-[10px] font-black uppercase tracking-widest text-brand-purple">
                    {user?.type}
                  </Badge>
                </div>
                <p className="flex items-center justify-center gap-2 font-medium text-muted-foreground md:justify-start">
                  <span className="text-brand-purple/70">@{user?.username}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{user?.email}</span>
                </p>
              </div>

              <Button
                onClick={() => setIsEditModalOpen(true)}
                variant="outline"
                className="h-12 rounded-2xl border-brand-purple/20 px-6 font-bold text-brand-purple hover:bg-brand-purple/5"
              >
                <Settings className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-1">
              <div className="space-y-6 rounded-3xl border border-border/40 bg-card p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <Trophy className="h-4 w-4 text-brand-orange" />
                  Progress
                </h3>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase text-muted-foreground">Level</p>
                      <p className="text-3xl font-black text-foreground">{level}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-xs font-bold uppercase text-muted-foreground">XP</p>
                      <p className="text-xl font-black text-brand-purple">{xp}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Progress value={xpProgress} className="h-3 bg-muted" />
                    <p className="text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {Math.round(xpProgress)}% to next level
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-border/20 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange/10">
                      <Wallet className="h-5 w-5 text-brand-orange" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        Wallet
                      </p>
                      <p className="font-black text-foreground">{formatCurrency(walletBalance)}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-border/40 bg-card p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <Star className="h-4 w-4 text-brand-mint" />
                  Achievements
                </h3>

                <div className="space-y-3">
                  {user?.userAchievements && user.userAchievements.length > 0 ? (
                    user.userAchievements.map((entry, index) => (
                      <div
                        key={`${entry.achievement.title}-${index}`}
                        className="flex items-center gap-3 rounded-2xl border border-border/10 bg-muted/30 p-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-mint/10 text-lg">
                          {entry.achievement.icon || "🏆"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-foreground">
                            {entry.achievement.title}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {entry.achievement.description}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-center text-sm italic text-muted-foreground">
                      No achievements yet
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-sm">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <Info className="h-4 w-4 text-brand-purple" />
                  About Me
                </h3>
                <p className={cn("text-base leading-relaxed", bio ? "text-foreground" : "italic text-muted-foreground")}>
                  {bio || "No biography provided yet. Tell others about yourself!"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="flex items-center gap-4 rounded-3xl border border-border/40 bg-card p-5 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-purple/10">
                    <Phone className="h-5 w-5 text-brand-purple" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone</p>
                    <p className="font-bold text-foreground">{phone || "Not provided"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-3xl border border-border/40 bg-card p-5 shadow-sm">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-orange/10">
                    <UserCircle2 className="h-5 w-5 text-brand-orange" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Gender</p>
                    <p className="font-bold capitalize text-foreground">{sex || "Other"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 rounded-3xl border border-border/40 bg-card p-6 shadow-sm">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <GraduationCap className="h-4 w-4 text-brand-purple" />
                  Academic Overview
                </h3>

                <div className="overflow-hidden rounded-2xl border border-border/20">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Course / Assignment
                        </th>
                        <th className="px-4 py-3 text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Grade
                        </th>
                        <th className="px-4 py-3 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/10">
                      {user?.grades && user.grades.length > 0 ? (
                        user.grades.map((grade, index) => (
                          <tr key={`${grade.assignmentName}-${index}`} className="transition-colors hover:bg-muted/30">
                            <td className="px-4 py-3">
                              <p className="text-sm font-bold text-foreground">{grade.assignmentName}</p>
                              <p className="text-[10px] text-muted-foreground">{grade.courseName}</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge
                                className={cn(
                                  "border-none font-black",
                                  grade.grade >= 90
                                    ? "bg-green-500/10 text-green-600"
                                    : grade.grade >= 75
                                    ? "bg-blue-500/10 text-blue-600"
                                    : "bg-brand-orange/10 text-brand-orange"
                                )}
                              >
                                {grade.grade}/{grade.maxGrade}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <span className="text-xs text-muted-foreground">
                                {new Date(grade.submittedAt).toLocaleDateString()}
                              </span>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="px-4 py-8 text-center text-sm italic text-muted-foreground">
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

          {editModal}
        </div>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="max-w-6xl" className="space-y-8">
      <div className="relative overflow-hidden rounded-[42px] border-[3px] border-hand-pencil bg-hand-paper bg-paper-texture [background-size:18px_18px] p-5 shadow-[10px_10px_0px_0px_rgba(45,45,45,0.12)] md:p-8">
        <div className="absolute -left-10 top-20 h-40 w-40 rounded-full bg-hand-yellow/60 blur-3xl" />
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-hand-blue/10 blur-3xl" />

        <section className="relative mb-8 overflow-hidden rounded-[34px] border-[3px] border-hand-pencil bg-white/80 p-6 shadow-hard md:p-8">
          <div className="absolute inset-x-0 top-0 h-32 bg-[linear-gradient(120deg,rgba(255,249,196,0.95),rgba(237,245,255,0.88),rgba(255,77,77,0.10))]" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end">
            <div className="flex flex-1 flex-col gap-6 md:flex-row md:items-end">
              <div className="relative">
                <Avatar className="h-32 w-32 rounded-[32px] border-[4px] border-white bg-white shadow-[8px_8px_0px_0px_rgba(45,45,45,0.12)] md:h-40 md:w-40">
                  <AvatarImage src={avatar} className="object-cover" />
                  <AvatarFallback className="bg-hand-blue text-4xl font-bold text-white">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="profile-avatar-upload"
                  className="absolute -bottom-2 -right-2 flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-[3px] border-hand-pencil bg-hand-yellow text-hand-pencil shadow-hard-sm transition-transform hover:scale-105"
                >
                  <Camera className="h-5 w-5" />
                  <input
                    id="profile-avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploading}
                  />
                </label>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="border-0 bg-hand-yellow px-3 py-1 font-patrick text-sm text-hand-pencil">
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Personal profile
                  </Badge>
                  <Badge className="border-0 bg-hand-blue px-3 py-1 font-patrick text-sm text-white">
                    {roleLabel}
                  </Badge>
                </div>

                <div>
                  <h1 className="font-kalam text-4xl font-bold text-hand-pencil md:text-5xl">
                    {displayName}
                  </h1>
                  <p className="mt-2 flex flex-wrap items-center gap-3 font-patrick text-lg text-hand-pencil/70">
                    <span>@{user?.username}</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-hand-pencil/30" />
                    <span>{user?.email}</span>
                  </p>
                </div>

                <p className="max-w-2xl font-patrick text-xl leading-relaxed text-hand-pencil/80">
                  {bio || "Your public story has not been written yet. Add a short introduction so your profile feels complete and personal."}
                </p>
              </div>
            </div>

            <Button
              onClick={() => setIsEditModalOpen(true)}
              variant="outline"
              className="h-12 rounded-[18px] border-[3px] border-hand-pencil bg-white px-6 font-patrick text-base text-hand-pencil shadow-hard-sm hover:bg-hand-yellow"
            >
              <Settings className="mr-2 h-4 w-4" />
              Edit profile
            </Button>
          </div>
        </section>

        <section className="relative mb-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Current level",
              value: `Level ${level}`,
              note: `${xp.toLocaleString("en-IN")} XP in total`,
              icon: Trophy,
              tint: "bg-hand-yellow/40",
            },
            {
              label: "Wallet balance",
              value: formatCurrency(walletBalance),
              note: "Available for wallet activity",
              icon: Wallet,
              tint: "bg-emerald-50",
            },
            {
              label: "Achievements",
              value: achievementsCount.toString(),
              note: "Unlocked milestones",
              icon: Star,
              tint: "bg-blue-50",
            },
            {
              label: "Academic items",
              value: gradesCount.toString(),
              note: `${enrolledCoursesCount} active course${enrolledCoursesCount === 1 ? "" : "s"}`,
              icon: BookOpen,
              tint: "bg-rose-50",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-[28px] border-[3px] border-hand-pencil bg-white/85 p-5 shadow-hard"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-patrick text-sm uppercase tracking-[0.18em] text-hand-pencil/55">
                      {item.label}
                    </p>
                    <p className="mt-3 font-kalam text-3xl font-bold text-hand-pencil">
                      {item.value}
                    </p>
                  </div>
                  <div className={cn("rounded-full border-[3px] border-hand-pencil p-2.5", item.tint)}>
                    <Icon className="h-5 w-5 text-hand-pencil" />
                  </div>
                </div>
                <p className="font-patrick text-lg text-hand-pencil/70">{item.note}</p>
              </div>
            );
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="space-y-6">
            <div className="rounded-[32px] border-[3px] border-hand-pencil bg-white/85 p-6 shadow-hard">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full border-[3px] border-hand-pencil bg-hand-yellow p-2.5">
                  <Trophy className="h-5 w-5 text-hand-pencil" />
                </div>
                <div>
                  <h2 className="font-kalam text-3xl font-bold text-hand-pencil">
                    Progress snapshot
                  </h2>
                  <p className="font-patrick text-lg text-hand-pencil/70">
                    A quick look at how your learning profile is moving.
                  </p>
                </div>
              </div>

              <div className="rounded-[24px] border-2 border-dashed border-hand-pencil/20 bg-hand-paper p-5">
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-patrick text-sm uppercase tracking-[0.18em] text-hand-pencil/55">
                      XP progress
                    </p>
                    <p className="font-kalam text-4xl font-bold text-hand-pencil">
                      {xp.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-patrick text-sm uppercase tracking-[0.18em] text-hand-pencil/55">
                      Next step
                    </p>
                    <p className="font-kalam text-2xl font-bold text-hand-pencil">
                      {Math.max(0, 1000 - (xp % 1000))} XP
                    </p>
                  </div>
                </div>
                <Progress value={xpProgress} className="h-3 bg-hand-muted" />
                <p className="mt-3 text-center font-patrick text-base text-hand-pencil/65">
                  {Math.round(xpProgress)}% through your current level
                </p>
              </div>
            </div>

            <div className="rounded-[32px] border-[3px] border-hand-pencil bg-white/85 p-6 shadow-hard">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full border-[3px] border-hand-pencil bg-blue-50 p-2.5">
                  <Info className="h-5 w-5 text-hand-blue" />
                </div>
                <div>
                  <h2 className="font-kalam text-3xl font-bold text-hand-pencil">
                    Personal details
                  </h2>
                  <p className="font-patrick text-lg text-hand-pencil/70">
                    Core identity and contact information.
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {[
                  { label: "Email", value: user?.email || "Not available", icon: Mail, tint: "bg-blue-50" },
                  { label: "Phone", value: phone || "Not provided", icon: Phone, tint: "bg-emerald-50" },
                  { label: "Gender", value: sex || "Other", icon: UserCircle2, tint: "bg-amber-50" },
                  { label: "Role", value: roleLabel, icon: CheckCircle2, tint: "bg-rose-50" },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-4 rounded-[24px] border-2 border-hand-pencil/15 bg-white p-4"
                    >
                      <div className={cn("rounded-[18px] border-2 border-hand-pencil p-3", item.tint)}>
                        <Icon className="h-5 w-5 text-hand-pencil" />
                      </div>
                      <div>
                        <p className="font-patrick text-sm uppercase tracking-[0.16em] text-hand-pencil/55">
                          {item.label}
                        </p>
                        <p className="font-kalam text-2xl font-bold capitalize text-hand-pencil">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[32px] border-[3px] border-hand-pencil bg-white/85 p-6 shadow-hard">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full border-[3px] border-hand-pencil bg-hand-yellow p-2.5">
                  <Star className="h-5 w-5 text-hand-pencil" />
                </div>
                <div>
                  <h2 className="font-kalam text-3xl font-bold text-hand-pencil">
                    Achievement shelf
                  </h2>
                  <p className="font-patrick text-lg text-hand-pencil/70">
                    Highlights from your activity and progress inside the LMS.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {user?.userAchievements && user.userAchievements.length > 0 ? (
                  user.userAchievements.map((entry, index) => (
                    <div
                      key={`${entry.achievement.title}-${index}`}
                      className="rounded-[24px] border-2 border-hand-pencil/15 bg-hand-paper p-4"
                    >
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-[18px] border-2 border-hand-pencil bg-white text-xl">
                          {entry.achievement.icon || "*"}
                        </div>
                        <div>
                          <p className="font-kalam text-2xl font-bold text-hand-pencil">
                            {entry.achievement.title}
                          </p>
                          <p className="font-patrick text-sm uppercase tracking-[0.16em] text-hand-pencil/50">
                            Unlocked achievement
                          </p>
                        </div>
                      </div>
                      <p className="font-patrick text-lg leading-relaxed text-hand-pencil/70">
                        {entry.achievement.description}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full rounded-[26px] border-2 border-dashed border-hand-pencil/20 bg-hand-paper px-6 py-10 text-center">
                    <Star className="mx-auto mb-3 h-10 w-10 text-hand-pencil/25" />
                    <p className="font-kalam text-3xl font-bold text-hand-pencil">
                      No achievements yet
                    </p>
                    <p className="font-patrick text-lg text-hand-pencil/65">
                      Keep using the platform and your unlocked milestones will show up here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[32px] border-[3px] border-hand-pencil bg-white/85 p-6 shadow-hard">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-full border-[3px] border-hand-pencil bg-emerald-50 p-2.5">
                  <GraduationCap className="h-5 w-5 text-hand-pencil" />
                </div>
                <div>
                  <h2 className="font-kalam text-3xl font-bold text-hand-pencil">
                    Academic overview
                  </h2>
                  <p className="font-patrick text-lg text-hand-pencil/70">
                    Recent grades and learning performance at a glance.
                  </p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[24px] border-2 border-hand-pencil/15">
                <table className="w-full text-left">
                  <thead className="bg-hand-paper">
                    <tr>
                      <th className="px-4 py-3 font-patrick text-sm uppercase tracking-[0.16em] text-hand-pencil/55">
                        Assignment
                      </th>
                      <th className="px-4 py-3 text-center font-patrick text-sm uppercase tracking-[0.16em] text-hand-pencil/55">
                        Grade
                      </th>
                      <th className="px-4 py-3 text-right font-patrick text-sm uppercase tracking-[0.16em] text-hand-pencil/55">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hand-pencil/10 bg-white">
                    {user?.grades && user.grades.length > 0 ? (
                      user.grades.map((grade, index) => (
                        <tr key={`${grade.assignmentName}-${index}`} className="hover:bg-hand-yellow/10">
                          <td className="px-4 py-4">
                            <p className="font-kalam text-2xl font-bold text-hand-pencil">
                              {grade.assignmentName}
                            </p>
                            <p className="font-patrick text-base text-hand-pencil/60">
                              {grade.courseName || "General"}
                            </p>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <Badge
                              className={cn(
                                "border-0 px-3 py-1 font-patrick text-sm",
                                grade.grade >= 90
                                  ? "bg-emerald-100 text-emerald-800"
                                  : grade.grade >= 75
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              )}
                            >
                              {grade.grade}/{grade.maxGrade}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-right font-patrick text-base text-hand-pencil/65">
                            {new Date(grade.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-4 py-10 text-center">
                          <p className="font-kalam text-3xl font-bold text-hand-pencil">
                            No grades recorded yet
                          </p>
                          <p className="font-patrick text-lg text-hand-pencil/60">
                            Once assignments are graded, your academic summary will appear here.
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>

      {editModal}
    </DashboardContent>
  );
}
