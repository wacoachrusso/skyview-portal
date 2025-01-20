export interface StatsDetails {
  users: any[];
  activeUsers: any[];
  notifications: any[];
  releaseNotes: any[];
  newUsers: any[];
  monthlySubUsers: any[];
  yearlySubUsers: any[];
  alphaTesters: any[];
  promoters: any[];
  messageFeedback: any[];
}

export interface StatsData {
  userCount: number;
  activeUserCount: number;
  notificationCount: number;
  releaseNoteCount: number;
  newUserCount: number;
  monthlySubCount: number;
  yearlySubCount: number;
  alphaTestersCount: number;
  promotersCount: number;
  messageFeedbackCount: number;
  details: StatsDetails;
}