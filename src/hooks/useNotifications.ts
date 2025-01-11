import { useNotificationsList } from "./notifications/useNotificationsList";
import { useProfilesList } from "./notifications/useProfilesList";
import { useNotificationActions } from "./notifications/useNotificationActions";

export const useNotifications = () => {
  const { data: notifications, refetch: refetchNotifications } = useNotificationsList();
  const { data: profiles } = useProfilesList();
  const { sendNotification, deleteNotification } = useNotificationActions();

  return {
    notifications,
    profiles,
    sendNotification,
    deleteNotification,
    refetchNotifications,
  };
};