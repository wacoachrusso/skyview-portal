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
      <h3 style="color: #1a1f2c; margin-top: 0;">Important First Steps</h3>
      <ol style="color: #1a365d;">
        <li>Log in using your credentials below</li>
        <li>Go to your Account page immediately to change your password</li>
        <li>Complete your profile information (required to use SkyGuide)</li>
      </ol>
    </div>

    <div style="${getCardStyle()}">
      <h3 style="color: #1a1f2c; margin-top: 0;">Your Login Credentials</h3>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
      <p style="color: #dc2626; font-weight: bold;">⚠️ You must change your password after logging in!</p>
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

    <div style="${getCardStyle()}">
      <h3 style="color: #1a365d; margin-top: 0;">Required Profile Information</h3>
      <p>To use SkyGuide, you must complete your profile with:</p>
      <ul style="color: #1a365d;">
        <li>Full Name</li>
        <li>Job Title</li>
        <li>Airline</li>
        <li>Employee ID</li>
      </ul>
      <p>You can add this information in your Account page after logging in.</p>
    </div>

    <p style="margin-top: 25px;">Have questions? Need help getting started? Our support team is here to help!</p>
  `;

  return getBaseEmailTemplate(content);
};