import { getBaseEmailTemplate, getButtonStyle, getCardStyle } from './baseTemplate';

interface WelcomeEmailProps {
  fullName: string;
  email: string;
  temporaryPassword: string;
  loginUrl: string;
  isPromoter?: boolean;
}

export const getWelcomeEmailContent = ({
  fullName,
  email,
  temporaryPassword,
  loginUrl,
  isPromoter,
}: WelcomeEmailProps) => {
  const content = `
    <h1 style="color: #1a1f2c;">Welcome aboard, ${fullName}! 🎉</h1>
    
    <p>We're thrilled to have you join the SkyGuide ${isPromoter ? 'promoter' : 'alpha testing'} program!</p>
    
    <div style="${getCardStyle()}">
      <h3 style="color: #1a1f2c; margin-top: 0;">Your Login Credentials</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
      <p style="color: #dc2626;">Please change your password after your first login!</p>
      <p><a href="${loginUrl}" style="${getButtonStyle()}">Login to SkyGuide</a></p>
    </div>

    ${isPromoter ? `
      <div style="${getCardStyle()}">
        <h3 style="color: #1a365d; margin-top: 0;">Your Role as a Promoter</h3>
        <ul style="color: #1a365d;">
          <li>Early access to major feature releases</li>
          <li>Direct communication with our development team</li>
          <li>Opportunity to influence product direction</li>
          <li>Special recognition in our community</li>
        </ul>
      </div>
    ` : `
      <div style="${getCardStyle()}">
        <h3 style="color: #1a365d; margin-top: 0;">What to Expect</h3>
        <ul style="color: #1a365d;">
          <li>Weekly feedback requests</li>
          <li>Early access to new features</li>
          <li>Direct impact on product development</li>
          <li>Regular updates on improvements</li>
        </ul>
      </div>
    `}

    <p style="margin-top: 25px;">Have questions? Need help getting started? Our support team is here to help!</p>
  `;

  return getBaseEmailTemplate(content);
};