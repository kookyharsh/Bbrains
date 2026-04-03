"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronRight,
  KeyRound,
  Loader2,
  Lock,
  Palette,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { DashboardContent } from "@/components/dashboard-content";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  dashboardApi,
  getBaseUrl,
  libraryApi,
  themeApi,
  userApi,
  walletApi,
  type LibraryItem,
  type User as ApiUser,
} from "@/services/api/client";
import { useCloudinaryUpload } from "@/hooks/use-cloudinary-upload";
import { cn } from "@/lib/utils";
import { useTheme } from "@/context/theme";
import { UiModeToggle } from "@/components/ui-mode-toggle";
import { useUiMode } from "@/context/ui-mode";

type SettingsUser = ApiUser & {
  userDetails?: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
};

function readUserName(user: SettingsUser | null, key: "firstName" | "lastName" | "avatar") {
  if (!user) return "";
  return String(user.userDetails?.[key] ?? user[key] ?? "");
}

function getInitials(user: SettingsUser | null) {
  const firstName = readUserName(user, "firstName");
  const lastName = readUserName(user, "lastName");

  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }

  if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  }

  return (user?.username || "U").slice(0, 2).toUpperCase();
}

function SettingsTabTrigger({
  value,
  icon,
  label,
  note,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
  note: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "w-full justify-start rounded-[24px] border-2 border-transparent bg-white/60 px-4 py-4 text-left shadow-sm transition-all",
        "data-[state=active]:border-hand-pencil data-[state=active]:bg-hand-yellow data-[state=active]:shadow-hard-sm"
      )}
    >
      <div className="flex w-full items-center gap-4">
        <div className="rounded-[16px] border-2 border-hand-pencil bg-white p-2.5 text-hand-pencil">
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-kalam text-2xl font-bold text-hand-pencil">{label}</p>
          <p className="truncate font-patrick text-base text-hand-pencil/65">{note}</p>
        </div>
        <ChevronRight className="h-4 w-4 text-hand-pencil/45" />
      </div>
    </TabsTrigger>
  );
}

function SettingsSection({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-[30px] border-[3px] border-hand-pencil bg-white/85 shadow-hard">
      <CardHeader className="border-b-2 border-dashed border-hand-pencil/15 pb-5">
        <div className="flex items-start gap-4">
          <div className="rounded-full border-[3px] border-hand-pencil bg-hand-yellow p-3 text-hand-pencil">
            {icon}
          </div>
          <div>
            <CardTitle className="font-kalam text-4xl font-bold text-hand-pencil">
              {title}
            </CardTitle>
            <CardDescription className="mt-1 font-patrick text-lg text-hand-pencil/70">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">{children}</CardContent>
    </Card>
  );
}

function FieldGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div>
        <label className="font-patrick text-sm uppercase tracking-[0.18em] text-hand-pencil/55">
          {label}
        </label>
        {hint ? (
          <p className="mt-1 font-patrick text-sm text-hand-pencil/55">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { uiMode } = useUiMode();
  const [user, setUser] = useState<SettingsUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [purchasedThemes, setPurchasedThemes] = useState<LibraryItem[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isPinSetup, setIsPinSet] = useState(false);

  const { uploadFile } = useCloudinaryUpload();
  const { addTheme, setTheme } = useTheme();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [userRes, activeThemeRes, libraryRes, walletRes] = await Promise.all([
        dashboardApi.getUser(),
        themeApi.getActiveTheme(),
        libraryApi.getLibrary("theme"),
        walletApi.getWallet(),
      ]);

      if (userRes.success && userRes.data) {
        const nextUser = userRes.data as SettingsUser;
        setUser(nextUser);
        setUsername(nextUser.username || "");
        setFirstName(readUserName(nextUser, "firstName"));
        setLastName(readUserName(nextUser, "lastName"));
      }

      if (activeThemeRes.success && activeThemeRes.data) {
        setActiveThemeId(String(activeThemeRes.data.id));
      } else {
        setActiveThemeId(null);
      }

      if (libraryRes.success && libraryRes.data) {
        setPurchasedThemes(libraryRes.data);
      } else {
        setPurchasedThemes([]);
      }

      if (walletRes.success && walletRes.data) {
        setIsPinSet(Boolean(walletRes.data.pinSet));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to sync settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const profileRes = await userApi.updateProfile(user.id, { username });
      const detailsRes = await userApi.updateDetails({ firstName, lastName });

      if (profileRes.success && detailsRes.success) {
        toast.success("Profile updated successfully");
        loadData();
      } else {
        toast.error(profileRes.message || detailsRes.message || "Update failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      toast.error("Enter your current password");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`${getBaseUrl()}/auth/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: "include",
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update password");
      }

      toast.success("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password");
    } finally {
      setUpdating(false);
    }
  };

  const handleUpdatePin = async () => {
    if (newPin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }

    if (newPin.length !== 6) {
      toast.error("PIN must be 6 digits");
      return;
    }

    setUpdating(true);
    try {
      const response = isPinSetup
        ? await walletApi.changePin(oldPin, newPin)
        : await walletApi.setupPin(newPin);

      if (response.success) {
        toast.success(isPinSetup ? "PIN changed successfully" : "PIN set successfully");
        setOldPin("");
        setNewPin("");
        setConfirmPin("");
        setIsPinSet(true);
      } else {
        toast.error(response.message || "Failed to update PIN");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setUpdating(false);
    }
  };

  const handleApplyTheme = async (themeId: number) => {
    try {
      setUpdating(true);
      const response = await themeApi.applyTheme(themeId);
      if (response.success) {
        addTheme(String(themeId));
        setTheme(String(themeId));
        setActiveThemeId(String(themeId));
        toast.success("Theme applied");
      } else {
        toast.error(response.message || "Failed to apply theme");
      }
    } catch {
      toast.error("Error applying theme");
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      toast.loading("Uploading avatar...", { id: "avatar-upload" });
      const url = await uploadFile(file);
      if (!url) {
        toast.error("Upload failed", { id: "avatar-upload" });
        return;
      }

      const response = await userApi.updateDetails({ avatar: url });
      if (response.success) {
        toast.success("Avatar updated", { id: "avatar-upload" });
        loadData();
      } else {
        toast.error("Failed to save avatar", { id: "avatar-upload" });
      }
    } catch {
      toast.error("Upload failed", { id: "avatar-upload" });
    }
  };

  if (loading) {
    return (
      <DashboardContent>
        <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-brand-orange" />
          <p className="font-patrick text-lg text-hand-pencil/65">
            Initializing your settings workspace...
          </p>
        </div>
      </DashboardContent>
    );
  }

  const fullName = `${readUserName(user, "firstName")} ${readUserName(user, "lastName")}`.trim();
  const displayName = fullName || user?.username || "User";
  const roleLabel = user?.type ? user.type[0].toUpperCase() + user.type.slice(1) : "Member";
  const avatar = readUserName(user, "avatar");

  if (uiMode === "classic") {
    return (
      <SettingsPageClassicView
        user={user}
        username={username}
        firstName={firstName}
        lastName={lastName}
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        oldPin={oldPin}
        newPin={newPin}
        confirmPin={confirmPin}
        isPinSetup={isPinSetup}
        purchasedThemes={purchasedThemes}
        activeThemeId={activeThemeId}
        updating={updating}
        avatar={avatar}
        setUsername={setUsername}
        setFirstName={setFirstName}
        setLastName={setLastName}
        setCurrentPassword={setCurrentPassword}
        setNewPassword={setNewPassword}
        setConfirmPassword={setConfirmPassword}
        setOldPin={setOldPin}
        setNewPin={setNewPin}
        setConfirmPin={setConfirmPin}
        handleAvatarUpload={handleAvatarUpload}
        handleUpdateProfile={handleUpdateProfile}
        handleUpdatePassword={handleUpdatePassword}
        handleUpdatePin={handleUpdatePin}
        handleApplyTheme={handleApplyTheme}
      />
    );
  }

  return (
    <DashboardContent maxWidth="max-w-6xl" className="space-y-8">
      <div className="relative overflow-hidden rounded-[42px] border-[3px] border-hand-pencil bg-hand-paper bg-paper-texture [background-size:18px_18px] p-5 shadow-[10px_10px_0px_0px_rgba(45,45,45,0.12)] md:p-8">
        <div className="absolute -left-10 top-20 h-40 w-40 rounded-full bg-hand-yellow/60 blur-3xl" />
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-hand-blue/10 blur-3xl" />

        <section className="relative mb-8 rounded-[34px] border-[3px] border-hand-pencil bg-white/80 p-6 shadow-hard md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-1 flex-col gap-6 md:flex-row md:items-center">
              <div className="relative">
                <Avatar className="h-28 w-28 rounded-[30px] border-[4px] border-white bg-white shadow-[8px_8px_0px_0px_rgba(45,45,45,0.12)] md:h-32 md:w-32">
                  <AvatarImage src={avatar} className="object-cover" />
                  <AvatarFallback className="bg-hand-blue text-3xl font-bold text-white">
                    {getInitials(user)}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="settings-avatar-upload"
                  className="absolute -bottom-2 -right-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-[3px] border-hand-pencil bg-hand-yellow shadow-hard-sm"
                >
                  <Camera className="h-4 w-4 text-hand-pencil" />
                  <input
                    id="settings-avatar-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                  />
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="border-0 bg-hand-yellow px-3 py-1 font-patrick text-sm text-hand-pencil">
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Settings control center
                  </Badge>
                  <Badge className="border-0 bg-hand-blue px-3 py-1 font-patrick text-sm text-white">
                    {roleLabel}
                  </Badge>
                </div>
                <div>
                  <h1 className="font-kalam text-4xl font-bold text-hand-pencil md:text-5xl">
                    Settings
                  </h1>
                  <p className="mt-2 font-patrick text-xl text-hand-pencil/75">
                    Manage identity, passwords, wallet protection, and workspace theme from one place.
                  </p>
                </div>
                <p className="font-patrick text-lg text-hand-pencil/65">
                  Signed in as <span className="font-semibold text-hand-pencil">{displayName}</span> @{user?.username}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Profile", value: "Editable", tint: "bg-hand-yellow/35" },
                { label: "Security", value: "Protected", tint: "bg-blue-50" },
                { label: "Themes", value: `${purchasedThemes.length} owned`, tint: "bg-emerald-50" },
              ].map((item) => (
                <div
                  key={item.label}
                  className={cn("rounded-[22px] border-[3px] border-hand-pencil px-4 py-3 shadow-hard-sm", item.tint)}
                >
                  <p className="font-patrick text-sm uppercase tracking-[0.18em] text-hand-pencil/55">
                    {item.label}
                  </p>
                  <p className="mt-2 font-kalam text-2xl font-bold text-hand-pencil">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Tabs defaultValue="profile" className="w-full">
          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div className="space-y-5">
              <div className="rounded-[30px] border-[3px] border-hand-pencil bg-white/85 p-5 shadow-hard">
                <p className="font-patrick text-sm uppercase tracking-[0.18em] text-hand-pencil/55">
                  Navigation
                </p>
                <h2 className="mt-2 font-kalam text-3xl font-bold text-hand-pencil">
                  Choose a panel
                </h2>
                <p className="mt-2 font-patrick text-lg text-hand-pencil/70">
                  Each section keeps one job clear and easy to manage.
                </p>
              </div>

              <TabsList className="flex h-auto flex-col gap-3 bg-transparent p-0">
                <SettingsTabTrigger
                  value="profile"
                  icon={<User className="h-5 w-5" />}
                  label="Profile"
                  note="Username, name, and avatar"
                />
                <SettingsTabTrigger
                  value="security"
                  icon={<Lock className="h-5 w-5" />}
                  label="Security"
                  note="Password and account access"
                />
                <SettingsTabTrigger
                  value="wallet"
                  icon={<Wallet className="h-5 w-5" />}
                  label="Wallet PIN"
                  note="Protect payment actions"
                />
                <SettingsTabTrigger
                  value="appearance"
                  icon={<Palette className="h-5 w-5" />}
                  label="Appearance"
                  note="Theme and workspace style"
                />
              </TabsList>
            </div>

            <div className="min-w-0">
              <TabsContent value="profile" className="mt-0 space-y-6">
                <SettingsSection
                  title="Identity and profile"
                  description="Update the public identity your classmates, staff, and dashboard use."
                  icon={<User className="h-5 w-5" />}
                >
                  <div className="grid gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
                    <div className="rounded-[26px] border-2 border-hand-pencil/15 bg-hand-paper p-5 text-center">
                      <Avatar className="mx-auto h-28 w-28 rounded-[28px] border-[4px] border-white bg-white shadow-[6px_6px_0px_0px_rgba(45,45,45,0.10)]">
                        <AvatarImage src={avatar} className="object-cover" />
                        <AvatarFallback className="bg-hand-blue text-3xl font-bold text-white">
                          {getInitials(user)}
                        </AvatarFallback>
                      </Avatar>
                      <p className="mt-4 font-kalam text-3xl font-bold text-hand-pencil">
                        {displayName}
                      </p>
                      <p className="font-patrick text-base text-hand-pencil/65">@{user?.username}</p>
                      <label
                        htmlFor="profile-tab-avatar"
                        className="mt-4 inline-flex cursor-pointer items-center rounded-[16px] border-[3px] border-hand-pencil bg-white px-4 py-2 font-patrick text-base text-hand-pencil shadow-hard-sm"
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Change avatar
                        <input
                          id="profile-tab-avatar"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                        />
                      </label>
                    </div>

                    <div className="grid gap-5">
                      <div className="grid gap-5 md:grid-cols-2">
                        <FieldGroup label="Public username">
                          <Input
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            className="h-12 rounded-[18px] border-2 border-hand-pencil/20 bg-white font-patrick text-base shadow-none"
                          />
                        </FieldGroup>

                        <FieldGroup label="Email address" hint="Read-only identity for login">
                          <Input
                            value={user?.email || ""}
                            disabled
                            className="h-12 rounded-[18px] border-2 border-hand-pencil/15 bg-hand-paper font-patrick text-base opacity-70 shadow-none"
                          />
                        </FieldGroup>
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        <FieldGroup label="First name">
                          <Input
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            className="h-12 rounded-[18px] border-2 border-hand-pencil/20 bg-white font-patrick text-base shadow-none"
                          />
                        </FieldGroup>

                        <FieldGroup label="Last name">
                          <Input
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            className="h-12 rounded-[18px] border-2 border-hand-pencil/20 bg-white font-patrick text-base shadow-none"
                          />
                        </FieldGroup>
                      </div>

                      <div className="rounded-[24px] border-2 border-dashed border-hand-pencil/20 bg-hand-yellow/20 p-4">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 text-hand-pencil" />
                          <p className="font-patrick text-lg text-hand-pencil/75">
                            These details update the identity shown across the LMS, dashboards, and profile surfaces.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={updating}
                          className="h-12 rounded-[18px] border-[3px] border-hand-pencil bg-hand-yellow px-6 font-patrick text-base text-hand-pencil shadow-hard-sm hover:bg-hand-yellow/90"
                        >
                          {updating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save profile
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </SettingsSection>
              </TabsContent>

              <TabsContent value="security" className="mt-0 space-y-6">
                <SettingsSection
                  title="Password and access"
                  description="Use a strong current password and rotate credentials when you need to secure your account."
                  icon={<Lock className="h-5 w-5" />}
                >
                  <div className="rounded-[24px] border-2 border-hand-pencil/15 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />
                      <p className="font-patrick text-lg text-hand-pencil/75">
                        Password change now uses your actual current password for verification before saving a new one.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <FieldGroup label="Current password">
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(event) => setCurrentPassword(event.target.value)}
                        placeholder="Enter current password"
                        className="h-12 rounded-[18px] border-2 border-hand-pencil/20 bg-white font-patrick text-base shadow-none"
                      />
                    </FieldGroup>

                    <FieldGroup label="New password" hint="Minimum 6 characters">
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="Create a stronger password"
                        className="h-12 rounded-[18px] border-2 border-hand-pencil/20 bg-white font-patrick text-base shadow-none"
                      />
                    </FieldGroup>
                  </div>

                  <FieldGroup label="Confirm new password">
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Repeat the new password"
                      className="h-12 rounded-[18px] border-2 border-hand-pencil/20 bg-white font-patrick text-base shadow-none"
                    />
                  </FieldGroup>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleUpdatePassword}
                      disabled={updating || !currentPassword || !newPassword || !confirmPassword}
                      className="h-12 rounded-[18px] border-[3px] border-hand-pencil bg-hand-blue px-6 font-patrick text-base text-white shadow-hard-sm hover:bg-hand-blue/90"
                    >
                      {updating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <KeyRound className="mr-2 h-4 w-4" />
                          Update password
                        </>
                      )}
                    </Button>
                  </div>
                </SettingsSection>
              </TabsContent>

              <TabsContent value="wallet" className="mt-0 space-y-6">
                <SettingsSection
                  title="Wallet protection"
                  description="Lock transfers and purchases behind a six-digit PIN that only you know."
                  icon={<ShieldCheck className="h-5 w-5" />}
                >
                  <div className="grid gap-8">
                    {isPinSetup ? (
                      <FieldGroup label="Current PIN">
                        <InputOTP maxLength={6} value={oldPin} onChange={setOldPin}>
                          <InputOTPGroup className="gap-2">
                            {Array.from({ length: 6 }, (_, index) => (
                              <InputOTPSlot
                                key={index}
                                index={index}
                                className="h-12 w-11 rounded-[14px] border-2 border-hand-pencil/20 bg-white font-bold text-hand-pencil"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FieldGroup>
                    ) : (
                      <div className="rounded-[24px] border-2 border-dashed border-hand-pencil/20 bg-hand-yellow/20 p-4">
                        <p className="font-patrick text-lg text-hand-pencil/75">
                          No PIN is set yet. Create one now to protect wallet actions across the LMS.
                        </p>
                      </div>
                    )}

                    <div className="grid gap-8 md:grid-cols-2">
                      <FieldGroup label={isPinSetup ? "New PIN" : "Create PIN"}>
                        <InputOTP maxLength={6} value={newPin} onChange={setNewPin}>
                          <InputOTPGroup className="gap-2">
                            {Array.from({ length: 6 }, (_, index) => (
                              <InputOTPSlot
                                key={index}
                                index={index}
                                className="h-12 w-11 rounded-[14px] border-2 border-hand-pencil/20 bg-white font-bold text-hand-pencil"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FieldGroup>

                      <FieldGroup label="Confirm PIN">
                        <InputOTP maxLength={6} value={confirmPin} onChange={setConfirmPin}>
                          <InputOTPGroup className="gap-2">
                            {Array.from({ length: 6 }, (_, index) => (
                              <InputOTPSlot
                                key={index}
                                index={index}
                                className="h-12 w-11 rounded-[14px] border-2 border-hand-pencil/20 bg-white font-bold text-hand-pencil"
                              />
                            ))}
                          </InputOTPGroup>
                        </InputOTP>
                      </FieldGroup>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleUpdatePin}
                        disabled={updating || newPin.length < 6 || confirmPin.length < 6}
                        className="h-12 rounded-[18px] border-[3px] border-hand-pencil bg-hand-yellow px-6 font-patrick text-base text-hand-pencil shadow-hard-sm hover:bg-hand-yellow/90"
                      >
                        {updating ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <ShieldCheck className="mr-2 h-4 w-4" />
                            {isPinSetup ? "Update PIN" : "Set PIN"}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </SettingsSection>
              </TabsContent>

              <TabsContent value="appearance" className="mt-0 space-y-6">
                <SettingsSection
                  title="Workspace appearance"
                  description="Apply purchased themes so the dashboard feels personal without losing consistency."
                  icon={<Palette className="h-5 w-5" />}
                >
                  <UiModeToggle />

                  {purchasedThemes.length === 0 ? (
                    <div className="rounded-[26px] border-2 border-dashed border-hand-pencil/20 bg-hand-paper px-6 py-12 text-center">
                      <Palette className="mx-auto mb-3 h-10 w-10 text-hand-pencil/25" />
                      <p className="font-kalam text-3xl font-bold text-hand-pencil">
                        No themes purchased yet
                      </p>
                      <p className="mt-2 font-patrick text-lg text-hand-pencil/65">
                        Visit the marketplace to unlock custom looks for your workspace.
                      </p>
                      <Button
                        asChild
                        variant="outline"
                        className="mt-5 h-11 rounded-[18px] border-[3px] border-hand-pencil bg-white px-5 font-patrick text-base text-hand-pencil shadow-hard-sm hover:bg-hand-yellow"
                      >
                        <Link href="/market/themes">Open theme marketplace</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-5 md:grid-cols-2">
                      {purchasedThemes.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => handleApplyTheme(item.productId)}
                          className={cn(
                            "overflow-hidden rounded-[28px] border-[3px] p-3 text-left transition-transform hover:-translate-y-1",
                            activeThemeId === String(item.productId)
                              ? "border-hand-pencil bg-hand-yellow/35 shadow-hard"
                              : "border-hand-pencil/20 bg-white shadow-sm"
                          )}
                        >
                          <div className="relative aspect-[16/10] overflow-hidden rounded-[22px] border-2 border-hand-pencil/10 bg-hand-paper">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                sizes="(max-width: 768px) 100vw, 50vw"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center">
                                <Palette className="h-10 w-10 text-hand-pencil/20" />
                              </div>
                            )}

                            {activeThemeId === String(item.productId) ? (
                              <div className="absolute inset-0 flex items-center justify-center bg-hand-blue/15 backdrop-blur-[2px]">
                                <Badge className="border-0 bg-hand-blue px-4 py-1 font-patrick text-sm text-white">
                                  Active theme
                                </Badge>
                              </div>
                            ) : null}
                          </div>

                          <div className="flex items-center justify-between gap-4 p-3">
                            <div>
                              <p className="font-kalam text-3xl font-bold text-hand-pencil">
                                {item.name}
                              </p>
                              <p className="font-patrick text-base text-hand-pencil/60">
                                Version {String((item.themeConfig as { version?: string } | null)?.version || "1.0")}
                              </p>
                            </div>
                            {activeThemeId === String(item.productId) ? (
                              <Badge className="border-0 bg-emerald-100 px-3 py-1 font-patrick text-sm text-emerald-800">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="border-0 bg-hand-yellow px-3 py-1 font-patrick text-sm text-hand-pencil">
                                Apply
                              </Badge>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </SettingsSection>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </DashboardContent>
  );
}

type SettingsPageClassicViewProps = {
  user: SettingsUser | null;
  username: string;
  firstName: string;
  lastName: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  oldPin: string;
  newPin: string;
  confirmPin: string;
  isPinSetup: boolean;
  purchasedThemes: LibraryItem[];
  activeThemeId: string | null;
  updating: boolean;
  avatar: string;
  setUsername: React.Dispatch<React.SetStateAction<string>>;
  setFirstName: React.Dispatch<React.SetStateAction<string>>;
  setLastName: React.Dispatch<React.SetStateAction<string>>;
  setCurrentPassword: React.Dispatch<React.SetStateAction<string>>;
  setNewPassword: React.Dispatch<React.SetStateAction<string>>;
  setConfirmPassword: React.Dispatch<React.SetStateAction<string>>;
  setOldPin: React.Dispatch<React.SetStateAction<string>>;
  setNewPin: React.Dispatch<React.SetStateAction<string>>;
  setConfirmPin: React.Dispatch<React.SetStateAction<string>>;
  handleAvatarUpload: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleUpdateProfile: () => Promise<void>;
  handleUpdatePassword: () => Promise<void>;
  handleUpdatePin: () => Promise<void>;
  handleApplyTheme: (themeId: number) => Promise<void>;
};

function SettingsPageClassicView({
  user,
  username,
  firstName,
  lastName,
  currentPassword,
  newPassword,
  confirmPassword,
  oldPin,
  newPin,
  confirmPin,
  isPinSetup,
  purchasedThemes,
  activeThemeId,
  updating,
  avatar,
  setUsername,
  setFirstName,
  setLastName,
  setCurrentPassword,
  setNewPassword,
  setConfirmPassword,
  setOldPin,
  setNewPin,
  setConfirmPin,
  handleAvatarUpload,
  handleUpdateProfile,
  handleUpdatePassword,
  handleUpdatePin,
  handleApplyTheme,
}: SettingsPageClassicViewProps) {
  return (
    <DashboardContent>
      <div className="mx-auto w-full max-w-5xl space-y-10 pb-20">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="space-y-2">
            <div className="flex items-center gap-3 text-brand-orange">
              <ShieldCheck className="h-6 w-6" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                System Preferences
              </span>
            </div>
            <h1 className="text-4xl font-black leading-none tracking-tighter text-foreground md:text-6xl">
              Settings
            </h1>
            <p className="text-lg font-medium tracking-tight text-muted-foreground">
              Configure your identity, security, and workspace behavior.
            </p>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <div className="flex flex-col gap-10 lg:flex-row">
            <div className="shrink-0 lg:w-64">
              <TabsList className="flex h-auto flex-col gap-2 bg-transparent p-0">
                <ClassicSettingsTabTrigger value="profile" icon={<User />} label="Profile Identity" />
                <ClassicSettingsTabTrigger value="security" icon={<Lock />} label="Security & Access" />
                <ClassicSettingsTabTrigger value="wallet" icon={<Wallet />} label="Financial Security" />
                <ClassicSettingsTabTrigger value="appearance" icon={<Palette />} label="Visual Interface" />
              </TabsList>
            </div>

            <div className="min-w-0 flex-1">
              <TabsContent value="profile" className="mt-0 space-y-8 outline-none">
                <Card className="overflow-hidden rounded-[2.5rem] border border-border/40 bg-card shadow-2xl">
                  <CardHeader className="border-b border-border/20 p-8">
                    <CardTitle className="text-2xl font-black tracking-tight">Avatar & Bio</CardTitle>
                    <CardDescription>Manage your public representation across the network</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-10 p-8">
                    <div className="flex flex-col items-center gap-8 sm:flex-row">
                      <div className="group relative">
                        <Avatar className="relative z-10 h-32 w-32 rounded-full border-4 border-background shadow-2xl md:h-40 md:w-40">
                          <AvatarImage src={avatar} className="object-cover" />
                          <AvatarFallback className="bg-brand-orange text-5xl font-black text-white">
                            {(firstName?.[0] || user?.username?.[0] || "U").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <label className="absolute bottom-2 right-2 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border-4 border-background bg-brand-orange text-white shadow-xl transition-all hover:scale-110 active:scale-90">
                          <Camera className="h-5 w-5" />
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                        </label>
                      </div>
                      <div className="flex-1 space-y-4 text-center sm:text-left">
                        <div>
                          <h3 className="text-xl font-black text-foreground">
                            {firstName} {lastName}
                          </h3>
                          <p className="text-sm font-medium text-muted-foreground">
                            @{user?.username} • {user?.type}
                          </p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                          <Badge className="border-none bg-muted px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            UID: {user?.id?.slice(0, 8)}...
                          </Badge>
                          <Badge className="border-none bg-emerald-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                            Active Link
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 border-t border-border/20 pt-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Public Username
                        </label>
                        <Input
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          className="h-12 rounded-xl bg-background font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Email Identity
                        </label>
                        <Input value={user?.email || ""} disabled className="h-12 rounded-xl bg-muted font-bold opacity-60" />
                      </div>
                      <div className="space-y-2">
                        <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          First Name
                        </label>
                        <Input
                          value={firstName}
                          onChange={(event) => setFirstName(event.target.value)}
                          className="h-12 rounded-xl bg-background font-bold"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Last Name
                        </label>
                        <Input
                          value={lastName}
                          onChange={(event) => setLastName(event.target.value)}
                          className="h-12 rounded-xl bg-background font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleUpdateProfile}
                        disabled={updating}
                        className="h-12 rounded-xl bg-brand-orange px-8 font-black text-white shadow-lg shadow-brand-orange/20 hover:bg-brand-orange/90"
                      >
                        {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Commit Profile</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="mt-0 space-y-8 outline-none">
                <Card className="overflow-hidden rounded-[2.5rem] border border-border/40 bg-card shadow-2xl">
                  <CardHeader className="border-b border-border/20 p-8">
                    <CardTitle className="text-2xl font-black tracking-tight">Access Control</CardTitle>
                    <CardDescription>Update your account credentials safely</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 p-8">
                    <div className="flex items-center gap-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-amber-600">
                      <AlertCircle className="h-5 w-5 shrink-0" />
                      <p className="text-xs font-bold uppercase tracking-widest">
                        Frequent password rotations improve your security profile
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Current Access Key
                        </label>
                        <Input
                          type="password"
                          value={currentPassword}
                          onChange={(event) => setCurrentPassword(event.target.value)}
                          className="h-12 rounded-xl bg-background font-bold"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          New Access Key
                        </label>
                        <Input
                          type="password"
                          value={newPassword}
                          onChange={(event) => setNewPassword(event.target.value)}
                          className="h-12 rounded-xl bg-background font-bold"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="ml-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        Confirm Access Key
                      </label>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(event) => setConfirmPassword(event.target.value)}
                        className="h-12 rounded-xl bg-background font-bold"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button
                        onClick={handleUpdatePassword}
                        disabled={updating || !currentPassword || !newPassword || !confirmPassword}
                        className="h-12 rounded-xl bg-brand-purple px-8 font-black text-white shadow-lg shadow-brand-purple/20 hover:bg-brand-purple/90"
                      >
                        {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><KeyRound className="mr-2 h-4 w-4" /> Rotate Key</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="wallet" className="mt-0 space-y-8 outline-none">
                <Card className="overflow-hidden rounded-[2.5rem] border border-border/40 bg-card shadow-2xl">
                  <CardHeader className="border-b border-border/20 p-8">
                    <CardTitle className="text-2xl font-black tracking-tight">Financial Security PIN</CardTitle>
                    <CardDescription>Secure your wallet with a 6-digit PIN</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center space-y-10 p-8">
                    <div className="w-full space-y-8">
                      {isPinSetup && (
                        <div className="flex flex-col items-center space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                            Current Signature PIN
                          </label>
                          <InputOTP maxLength={6} value={oldPin} onChange={setOldPin}>
                            <InputOTPGroup className="gap-2">
                              {Array.from({ length: 6 }, (_, index) => (
                                <InputOTPSlot key={index} index={index} className="h-12 w-10 rounded-xl bg-background font-black text-lg" />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
                        <div className="flex flex-col items-center space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-orange">
                            {isPinSetup ? "New Signature PIN" : "Setup Signature PIN"}
                          </label>
                          <InputOTP maxLength={6} value={newPin} onChange={setNewPin}>
                            <InputOTPGroup className="gap-2">
                              {Array.from({ length: 6 }, (_, index) => (
                                <InputOTPSlot key={index} index={index} className="h-12 w-10 rounded-xl border-brand-orange/30 bg-background font-black text-lg" />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <div className="flex flex-col items-center space-y-4">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                            Confirm PIN
                          </label>
                          <InputOTP maxLength={6} value={confirmPin} onChange={setConfirmPin}>
                            <InputOTPGroup className="gap-2">
                              {Array.from({ length: 6 }, (_, index) => (
                                <InputOTPSlot key={index} index={index} className="h-12 w-10 rounded-xl bg-background font-black text-lg" />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                      </div>
                    </div>

                    <div className="flex w-full justify-end border-t border-border/20 pt-10">
                      <Button
                        onClick={handleUpdatePin}
                        disabled={updating || newPin.length < 6}
                        className="h-12 rounded-xl bg-brand-orange px-10 font-black text-white shadow-lg shadow-brand-orange/20 hover:bg-brand-orange/90"
                      >
                        {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldCheck className="mr-2 h-4 w-4" /> Secure PIN</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appearance" className="mt-0 space-y-8 outline-none">
                <Card className="overflow-hidden rounded-[2.5rem] border border-border/40 bg-card shadow-2xl">
                  <CardHeader className="border-b border-border/20 p-8">
                    <CardTitle className="text-2xl font-black tracking-tight">Visual Interface</CardTitle>
                    <CardDescription>Apply purchased themes and choose your UI mode</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-8 p-8">
                    <UiModeToggle
                      title="UI mode"
                      description="Switch this settings page and other converted surfaces between classic and new UI."
                    />

                    {purchasedThemes.length === 0 ? (
                      <div className="space-y-4 rounded-[2rem] border-2 border-dashed border-border/30 py-20 text-center">
                        <Palette className="mx-auto h-12 w-12 text-muted-foreground/30" />
                        <div className="space-y-1">
                          <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                            No custom themes acquired
                          </p>
                          <Button asChild variant="link" className="text-brand-orange">
                            <Link href="/market/themes">
                              Visit Theme Marketplace <ChevronRight className="ml-1 h-3 w-3" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        {purchasedThemes.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleApplyTheme(item.productId)}
                            className={cn(
                              "group relative cursor-pointer overflow-hidden rounded-[2rem] border p-1 transition-all duration-500",
                              activeThemeId === String(item.productId)
                                ? "border-brand-orange bg-brand-orange/5 shadow-[0_0_30px_rgba(249,115,22,0.2)]"
                                : "border-border/30 bg-card hover:border-border"
                            )}
                          >
                            <div className="relative aspect-[16/9] overflow-hidden rounded-[1.8rem] bg-muted/30">
                              {item.image ? (
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Palette className="h-10 w-10 text-muted-foreground/30" />
                                </div>
                              )}
                              {activeThemeId === String(item.productId) && (
                                <div className="absolute inset-0 flex items-center justify-center bg-brand-orange/20 backdrop-blur-[2px]">
                                  <Badge className="rounded-full border-none bg-brand-orange px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
                                    Active Engine
                                  </Badge>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center justify-between p-5">
                              <div>
                                <h4 className="font-black tracking-tight text-foreground">{item.name}</h4>
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                  Version {String((item.themeConfig as { version?: string } | null)?.version || "1.0")}
                                </p>
                              </div>
                              {activeThemeId !== String(item.productId) && (
                                <Button size="sm" className="h-8 rounded-full bg-muted text-[9px] font-black uppercase tracking-widest hover:bg-brand-orange hover:text-white">
                                  Apply
                                </Button>
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
  );
}

function ClassicSettingsTabTrigger({
  value,
  icon,
  label,
}: {
  value: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "w-full justify-start gap-4 rounded-2xl border border-transparent px-6 py-4 text-sm font-bold text-muted-foreground transition-all duration-300",
        "data-[state=active]:border-border data-[state=active]:bg-card data-[state=active]:text-brand-orange data-[state=active]:shadow-xl"
      )}
    >
      <span className="shrink-0 [&_svg]:h-5 [&_svg]:w-5">{icon}</span>
      <span className="truncate">{label}</span>
      <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
    </TabsTrigger>
  );
}
