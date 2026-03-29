import { announcementApi, dashboardApi } from "@/services/api/client";
import { AnnouncementsContent } from "@/app/(dashboard)/announcements/_features/announcements/components/AnnouncementsContent";
import { DashboardContent } from "@/components/dashboard-content";

export default async function AnnouncementsPage() {
  const [announcementsRes, userRes] = await Promise.all([
    announcementApi.getAnnouncements(),
    dashboardApi.getUser()
  ]);

  const announcements = announcementsRes.success ? announcementsRes.data || [] : [];
  const user = userRes.success ? (userRes.data ?? null) : null;

  return (
    <DashboardContent>
      <AnnouncementsContent 
        initialAnnouncements={announcements} 
        currentUser={user} 
      />
    </DashboardContent>
  );
}
