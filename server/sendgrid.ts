import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export function createPasswordResetEmail(resetUrl: string, userEmail: string) {
  const subject = "Reset Your Hi-Vis Vending Password";
  
  const text = `
Hi there!

You requested a password reset for your Hi-Vis Vending account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this reset, you can safely ignore this email.

Thanks,
The Hi-Vis Vending Team
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #f97316, #eab308); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { color: #666; font-size: 14px; margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🦺 Hi-Vis Vending</h1>
    <p>Password Reset Request</p>
  </div>
  <div class="content">
    <h2>Reset Your Password</h2>
    <p>Hi there!</p>
    <p>You requested a password reset for your Hi-Vis Vending account. Click the button below to create a new password:</p>
    
    <a href="${resetUrl}" class="button">Reset My Password</a>
    
    <p>Or copy and paste this link into your browser:</p>
    <p style="word-break: break-all; background: #e5e5e5; padding: 10px; border-radius: 4px; font-family: monospace;">${resetUrl}</p>
    
    <div class="footer">
      <p><strong>Important:</strong> This link will expire in 1 hour for security reasons.</p>
      <p>If you didn't request this reset, you can safely ignore this email.</p>
      <p>Thanks,<br>The Hi-Vis Vending Team</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, text, html };
}