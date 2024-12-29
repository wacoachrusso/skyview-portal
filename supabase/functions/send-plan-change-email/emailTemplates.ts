import { EmailTemplate } from "./types.ts";

const formatPlanName = (plan: string): string => {
  switch (plan) {
    case 'monthly':
      return 'Monthly ($4.99/month)';
    case 'annual':
      return 'Annual ($49.99/year)';
    case 'free':
      return 'Free Trial';
    default:
      return plan;
  }
};

export const getEmailTemplate = (oldPlan: string, newPlan: string, fullName: string = "User"): EmailTemplate => {
  console.log(`Generating email template for plan change: ${oldPlan} -> ${newPlan}`);
  
  const formattedOldPlan = formatPlanName(oldPlan);
  const formattedNewPlan = formatPlanName(newPlan);
  
  if (oldPlan === "annual" && newPlan === "monthly") {
    return {
      subject: "Your SkyGuide Plan Change: Annual to Monthly",
      preheader: "Your subscription has been updated to our monthly plan",
      mainContent: `
        <p>We've processed your plan change from Annual to Monthly. Here's what you need to know:</p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>✓ Your new plan: ${formattedNewPlan}</li>
          <li>✓ Billing cycle: Monthly at $4.99</li>
          <li>✓ All premium features included</li>
        </ul>
      `,
      callToAction: "View Your Account"
    };
  } 
  
  if (oldPlan === "monthly" && newPlan === "annual") {
    return {
      subject: "Thanks for Choosing Our Annual Plan! 🎉",
      preheader: "You're now saving $10 annually with our best value plan",
      mainContent: `
        <p>Great choice on switching to our annual plan! Here's what you get:</p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>✓ $10 annual savings</li>
          <li>✓ All premium features</li>
          <li>✓ Priority support</li>
        </ul>
        <p>Your new billing cycle: $49.99/year</p>
      `,
      callToAction: "Explore Premium Features"
    };
  }
  
  if (oldPlan === "free") {
    return {
      subject: "Welcome to SkyGuide Premium! 🚀",
      preheader: "Your account has been upgraded to premium",
      mainContent: `
        <p>Welcome to premium! You now have access to:</p>
        <ul style="list-style-type: none; padding-left: 0;">
          <li>✓ Unlimited contract queries</li>
          <li>✓ Priority support</li>
          <li>✓ Advanced features</li>
        </ul>
        <p>Your selected plan: ${formattedNewPlan}</p>
      `,
      callToAction: "Start Using Premium"
    };
  }

  // Default template for any other plan change
  return {
    subject: "Your SkyGuide Plan Has Been Updated",
    preheader: `Your subscription has been changed from ${formattedOldPlan} to ${formattedNewPlan}`,
    mainContent: `
      <p>Your plan change has been processed successfully:</p>
      <ul style="list-style-type: none; padding-left: 0;">
        <li>✓ Previous plan: ${formattedOldPlan}</li>
        <li>✓ New plan: ${formattedNewPlan}</li>
      </ul>
    `,
    callToAction: "View Your Account"
  };
};