export interface EmailRequest {
  email: string;
  oldPlan: string;
  newPlan: string;
  fullName?: string;
}

export interface EmailTemplate {
  subject: string;
  preheader: string;
  mainContent: string;
  callToAction: string;
}