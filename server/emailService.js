import nodemailer from 'nodemailer';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';
import dotenv from 'dotenv';
dotenv.config();

// Create transporter if SMTP credentials are provided
function getTransporter() {
  const host = process.env.SMTP_HOST || (process.env.GMAIL_USER ? 'smtp.gmail.com' : null);
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (host && user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass }
    });
  }
  return null;
}

export async function sendOtpEmail(toEmail, otpCode, studentName = '') {
  const transporter = getTransporter();

  // 1. If custom SMTP / Gmail App Password is configured, use Nodemailer
  if (transporter) {
    const senderAddress = process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || 'no-reply@srmap.edu.in';

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #000000; color: #ffffff; padding: 20px; margin: 0; }
            .container { max-width: 500px; margin: 0 auto; background-color: #0c0c0e; border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 32px; }
            .header { text-align: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; }
            .title { font-size: 22px; font-weight: 900; color: #ffffff; margin: 8px 0 2px 0; letter-spacing: -0.5px; }
            .subtitle { font-size: 11px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: 1.5px; }
            .body-text { font-size: 14px; color: #d4d4d8; line-height: 1.6; margin: 24px 0 16px 0; }
            .otp-box { background-color: #18181b; border: 1px solid rgba(255,255,255,0.2); border-radius: 14px; text-align: center; padding: 18px; margin: 20px 0; }
            .otp-code { font-family: monospace; font-size: 32px; font-weight: 900; color: #ffffff; letter-spacing: 8px; }
            .footer { font-size: 11px; color: #71717a; text-align: center; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 16px; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="title">CYBEX D Portal</div>
              <div class="subtitle">SRM University AP • CSE Section D</div>
            </div>
            <div class="body-text">
              Hello <strong>${studentName || 'Student'}</strong>,<br><br>
              Your one-time verification code for accessing the <strong>CYBEX D Class Portal</strong> is:
            </div>
            <div class="otp-box">
              <div class="otp-code">${otpCode}</div>
            </div>
            <div class="body-text" style="font-size: 12px; color: #a1a1aa;">
              This verification code is valid for <strong>10 minutes</strong>. Do not share this OTP with anyone.
            </div>
            <div class="footer">
              Class Representative Portal • CYT - AVIGAYAN JANA CSE CS-D<br>
              SRM University AP - Andhra Pradesh
            </div>
          </div>
        </body>
      </html>
    `;

    try {
      const info = await transporter.sendMail({
        from: `"CYBEX D - SRM AP Portal" <${senderAddress}>`,
        to: toEmail,
        subject: `Your CYBEX D Verification Code: ${otpCode}`,
        text: `Your CYBEX D verification code is: ${otpCode}. Valid for 10 minutes.`,
        html: htmlContent
      });

      console.log(`[EMAIL DISPATCH] Real email sent via SMTP to ${toEmail}. ID: ${info.messageId}`);
      return {
        sent: true,
        provider: 'SMTP',
        message: `Verification code sent to ${toEmail}. Check your inbox / spam folder.`
      };
    } catch (err) {
      console.error(`[SMTP ERROR] Failed to send via SMTP to ${toEmail}:`, err);
    }
  }

  // 2. If Supabase is connected, trigger Supabase Auth email dispatch
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: toEmail,
        options: { shouldCreateUser: true }
      });

      if (!error) {
        console.log(`[EMAIL DISPATCH] Supabase Auth OTP triggered for ${toEmail}`);
        return {
          sent: true,
          provider: 'Supabase Auth',
          message: `Verification code dispatched by Supabase to ${toEmail}. Please check your SRM AP inbox (including Junk/Spam folder).`
        };
      } else {
        console.log(`[EMAIL DISPATCH NOTICE] Supabase Auth notice: ${error.message}`);
      }
    } catch (sbErr) {
      console.log('[SUPABASE AUTH NOTICE]', sbErr.message);
    }
  }

  console.log(`[EMAIL DISPATCH - DEV MODE] Target: ${toEmail} | Generated OTP: ${otpCode}`);
  return {
    sent: false,
    reason: 'SMTP_NOT_CONFIGURED',
    message: `Verification code generated for ${toEmail}.`
  };
}
