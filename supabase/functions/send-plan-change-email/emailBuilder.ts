import { EmailTemplate } from './types';

export const buildEmailHtml = (template: EmailTemplate, fullName: string = "User"): string => {
  console.log(`Building email HTML for user: ${fullName}`);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>${template.subject}</title>
        <meta name="description" content="${template.preheader}" />
      </head>
      <body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; font-size: 16px; line-height: 1.4; margin: 0; padding: 0; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body" style="border-collapse: separate; width: 100%; background-color: #f6f9fc;">
          <tr>
            <td style="font-family: sans-serif; font-size: 16px; vertical-align: top;">&nbsp;</td>
            <td class="container" style="font-family: sans-serif; font-size: 16px; vertical-align: top; display: block; max-width: 580px; padding: 10px; width: 580px; margin: 0 auto;">
              <div class="content" style="box-sizing: border-box; display: block; margin: 0 auto; max-width: 580px; padding: 10px;">
                <table role="presentation" class="main" style="border-collapse: separate; width: 100%; background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <tr>
                    <td class="wrapper" style="font-family: sans-serif; font-size: 16px; vertical-align: top; box-sizing: border-box; padding: 30px;">
                      <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%;">
                        <tr>
                          <td align="center" style="padding-bottom: 30px;">
                            <img src="https://skyguide.site/lovable-uploads/1dd682b4-7bc7-4b35-8220-f70f8ed54990.png" alt="SkyGuide Logo" width="200" style="border: none; -ms-interpolation-mode: bicubic; max-width: 100%;">
                          </td>
                        </tr>
                        <tr>
                          <td style="font-family: sans-serif; font-size: 16px; vertical-align: top;">
                            <h1 style="color: #2D3748; font-size: 24px; font-weight: bold; margin: 0 0 20px;">Hello ${fullName},</h1>
                            ${template.mainContent}
                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary" style="border-collapse: separate; width: 100%; box-sizing: border-box; margin-top: 30px;">
                              <tbody>
                                <tr>
                                  <td align="center" style="font-family: sans-serif; font-size: 16px; vertical-align: top; padding-bottom: 15px;">
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: auto;">
                                      <tbody>
                                        <tr>
                                          <td style="font-family: sans-serif; font-size: 16px; vertical-align: top; border-radius: 8px; text-align: center; background-color: #0F172A;">
                                            <a href="https://skyguide.site/dashboard" target="_blank" style="border: solid 1px #0F172A; border-radius: 8px; box-sizing: border-box; cursor: pointer; display: inline-block; font-size: 16px; font-weight: bold; margin: 0; padding: 12px 25px; text-decoration: none; background-color: #0F172A; border-color: #0F172A; color: #ffffff;">${template.callToAction}</a>
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p style="font-family: sans-serif; font-size: 14px; font-weight: normal; margin: 0; margin-top: 30px; color: #718096;">If you have any questions about your subscription, please don't hesitate to contact our support team.</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
                <div class="footer" style="clear: both; margin-top: 10px; text-align: center; width: 100%;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="border-collapse: separate; width: 100%;">
                    <tr>
                      <td class="content-block" style="font-family: sans-serif; vertical-align: top; padding-bottom: 10px; padding-top: 10px; color: #9ca3af; font-size: 12px; text-align: center;">
                        <span>© 2024 SkyGuide. All rights reserved.</span>
                      </td>
                    </tr>
                  </table>
                </div>
              </div>
            </td>
            <td style="font-family: sans-serif; font-size: 16px; vertical-align: top;">&nbsp;</td>
          </tr>
        </table>
      </body>
    </html>
  `;
};