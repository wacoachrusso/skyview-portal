export const getBaseEmailTemplate = (content: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>SkyGuide Notification</title>
  </head>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
      <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" style="width: 200px;">
    </div>
    
    ${content}
    
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
      <p>Thank you for being part of SkyGuide!</p>
      <p style="color: #1a365d; font-weight: bold;">The SkyGuide Team</p>
      <div style="margin-top: 20px; font-size: 12px;">
        <p>SkyGuide™ - Your Aviation Career Partner</p>
        <p>© ${new Date().getFullYear()} SkyGuide. All rights reserved.</p>
        <p>Need help? <a href="mailto:support@skyguide.site" style="color: #666; text-decoration: underline;">Contact Support</a></p>
      </div>
    </div>
  </body>
</html>
`;

export const getButtonStyle = () => `
  display: inline-block;
  background-color: #1a365d;
  color: white;
  padding: 12px 24px;
  text-decoration: none;
  border-radius: 5px;
  margin-top: 20px;
`;

export const getCardStyle = () => `
  background-color: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
`;