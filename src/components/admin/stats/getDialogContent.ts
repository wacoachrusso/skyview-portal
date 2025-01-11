import { format } from "date-fns";

interface StatsDetails {
  users?: any[];
  activeUsers?: any[];
  notifications?: any[];
  releaseNotes?: any[];
  newUsers?: any[];
  monthlySubUsers?: any[];
  yearlySubUsers?: any[];
  alphaTesters?: any[];
  promoters?: any[];
  messageFeedback?: any[];
}

export const getDialogContent = (details: StatsDetails | undefined, selectedMetric: string | null) => {
  if (!details || !selectedMetric) return null;

  const content = {
    users: {
      title: "User Details",
      data: details.users?.map((user) => ({
        label: user.full_name || "Unnamed User",
        info: `Email: ${user.email || "N/A"} | Type: ${user.user_type || "N/A"}`,
        date: format(new Date(user.created_at), "MMM d, yyyy"),
      })),
    },
    activeUsers: {
      title: "Active User Details",
      data: details.activeUsers?.map((user) => ({
        label: user.full_name || "Unnamed User",
        info: `Email: ${user.email || "N/A"} | Last Active: ${
          user.last_query_timestamp
            ? format(new Date(user.last_query_timestamp), "MMM d, yyyy")
            : "N/A"
        }`,
        date: format(new Date(user.created_at), "MMM d, yyyy"),
      })),
    },
    notifications: {
      title: "Notification Details",
      data: details.notifications?.map((notif) => ({
        label: notif.title,
        info: notif.message,
        date: format(new Date(notif.created_at), "MMM d, yyyy"),
      })),
    },
    releaseNotes: {
      title: "Release Notes Details",
      data: details.releaseNotes?.map((note) => ({
        label: note.title,
        info: `Version: ${note.version}`,
        date: format(new Date(note.created_at), "MMM d, yyyy"),
      })),
    },
    newUsers: {
      title: "New Users (Last 30 Days)",
      data: details.newUsers?.map((user) => ({
        label: user.full_name || "Unnamed User",
        info: `Email: ${user.email || "N/A"} | Type: ${user.user_type || "N/A"}`,
        date: format(new Date(user.created_at), "MMM d, yyyy"),
      })),
    },
    monthlySubUsers: {
      title: "Monthly Subscription Users",
      data: details.monthlySubUsers?.map((user) => ({
        label: user.full_name || "Unnamed User",
        info: `Email: ${user.email || "N/A"}`,
        date: `Joined: ${format(new Date(user.created_at), "MMM d, yyyy")}`,
      })),
    },
    yearlySubUsers: {
      title: "Yearly Subscription Users",
      data: details.yearlySubUsers?.map((user) => ({
        label: user.full_name || "Unnamed User",
        info: `Email: ${user.email || "N/A"}`,
        date: `Joined: ${format(new Date(user.created_at), "MMM d, yyyy")}`,
      })),
    },
    alphaTesters: {
      title: "Active Alpha Testers",
      data: details.alphaTesters?.map((tester) => ({
        label: tester.profiles?.full_name || "Unnamed Tester",
        info: `Email: ${tester.profiles?.email || "N/A"}`,
        date: format(new Date(tester.created_at), "MMM d, yyyy"),
      })),
    },
    promoters: {
      title: "Active Promoters",
      data: details.promoters?.map((promoter) => ({
        label: promoter.profiles?.full_name || "Unnamed Promoter",
        info: `Email: ${promoter.profiles?.email || "N/A"}`,
        date: format(new Date(promoter.created_at), "MMM d, yyyy"),
      })),
    },
    messageFeedback: {
      title: "Message Feedback",
      data: details.messageFeedback?.map((feedback) => ({
        label: feedback.messages?.content?.substring(0, 100) + "..." || "Message Content",
        info: `From: ${feedback.profiles?.full_name || "Anonymous"}`,
        date: format(new Date(feedback.created_at), "MMM d, yyyy"),
        rating: feedback.rating,
        isIncorrect: feedback.is_incorrect,
      })),
    },
  };

  return content[selectedMetric as keyof typeof content];
};