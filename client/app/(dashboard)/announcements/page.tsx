import { announcementApi, dashboardApi } from "@/lib/api-services";
import { AnnouncementsContent } from "@/components/announcements/AnnouncementsContent";

export default async function AnnouncementsPage() {
  const [announcementsRes, userRes] = await Promise.all([
    announcementApi.getAnnouncements(),
    dashboardApi.getUser()
  ]);

  const announcements = announcementsRes.success ? announcementsRes.data || [] : [];
  const user = userRes.success ? (userRes.data ?? null) : null;

  return (
    <AnnouncementsContent 
      initialAnnouncements={announcements} 
      currentUser={user} 
    />
  );
}
