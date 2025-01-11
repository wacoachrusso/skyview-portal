import { getBaseEmailTemplate, getCardStyle } from './baseTemplate';

interface AlphaStatusEmailProps {
  fullName: string;
  status: 'active' | 'inactive' | 'removed';
  isPromoterChange?: boolean;
  becamePromoter?: boolean;
  requiresPlan?: boolean;
}

const getStatusMessage = (status: string, isPromoter = false) => {
  const statusMessages = {
    active: `You have been ${isPromoter ? "reactivated" : "activated"} as a ${isPromoter ? "SkyGuide Promoter" : "SkyGuide Alpha Tester"}. Welcome ${isPromoter ? "back " : ""}to the program! ${
      isPromoter 
        ? "You can now continue promoting SkyGuide and earning rewards."
        : "You can now continue testing and providing valuable feedback."
    }`,
    inactive: `Your ${isPromoter ? "promoter" : "alpha tester"} status has been temporarily set to inactive. During this time, you won't receive feedback requests or ${isPromoter ? "promoter updates" : "testing notifications"}. If you believe this was done in error, please contact our support team.`,
    removed: `Your participation in the ${isPromoter ? "promoter" : "alpha tester"} program has been discontinued. We appreciate your contributions to SkyGuide.`,
  };
  return statusMessages[status as keyof typeof statusMessages];
};

const getPromoterChangeContent = (becamePromoter: boolean) => {
  if (becamePromoter) {
    return `
      <div style="${getCardStyle()}">
        <h3 style="color: #1a365d; margin-top: 0;">Welcome to the SkyGuide Promoter Program!</h3>
        <p>You've been selected to become a SkyGuide Promoter! This means:</p>
        <ul style="color: #1a365d;">
          <li>You can now promote SkyGuide to your colleagues</li>
          <li>You'll receive weekly updates and resources</li>
          <li>You can earn rewards for successful referrals</li>
          <li>You'll have early access to new features</li>
        </ul>
        <p>We'll send you more details about the promoter program in a separate email.</p>
      </div>
    `;
  }
  return `
    <div style="${getCardStyle()}">
      <h3 style="color: #1a365d; margin-top: 0;">Status Update: Regular Alpha Tester</h3>
      <p>Your status has been changed from Promoter to Alpha Tester. This means:</p>
      <ul style="color: #1a365d;">
        <li>You'll continue to have access to all alpha testing features</li>
        <li>You'll receive regular testing feedback requests</li>
        <li>You won't receive promoter-specific updates anymore</li>
      </ul>
      <p>Thank you for your participation in the promoter program!</p>
    </div>
  `;
};

const getPricingSection = () => `
  <div style="${getCardStyle()}">
    <h3 style="color: #1a365d; margin-top: 0;">Continue Using SkyGuide</h3>
    <p>To continue using SkyGuide, please select one of our paid plans:</p>
    <div style="margin: 20px 0;">
      <div style="margin-bottom: 15px;">
        <strong style="color: #1a365d;">Monthly Plan</strong>
        <p>$4.99/month - Perfect for trying out SkyGuide</p>
      </div>
      <div style="margin-bottom: 15px;">
        <strong style="color: #1a365d;">Annual Plan</strong>
        <p>$49.88/year - Best value, save $10 annually</p>
      </div>
    </div>
    <a href="https://skyguide.site/#pricing-section" 
       style="display: inline-block; background-color: #1a365d; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
      View Pricing Plans
    </a>
  </div>
`;

export const getAlphaStatusEmailContent = ({
  fullName,
  status,
  isPromoterChange,
  becamePromoter,
  requiresPlan,
}: AlphaStatusEmailProps) => {
  const statusMessage = getStatusMessage(status, isPromoterChange);
  const promoterChangeContent = isPromoterChange ? getPromoterChangeContent(becamePromoter!) : '';
  const pricingContent = requiresPlan ? getPricingSection() : '';

  const content = `
    <h1 style="color: #1a365d; text-align: center;">Status Update</h1>
    
    <p>Dear ${fullName || "Valued Member"},</p>
    
    <div style="${getCardStyle()}">
      <p>${statusMessage}</p>
    </div>

    ${promoterChangeContent}
    ${pricingContent}
  `;

  return getBaseEmailTemplate(content);
};