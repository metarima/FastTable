import nodemailer from 'nodemailer';

// Instructions:
// 1. Create a file named `.env.local` in your project root (if it doesn't exist).
// 2. Add the following lines and fill in your SMTP details:
//
// SMTP_HOST=smtp.yourprovider.com
// SMTP_PORT=587
// SMTP_USER=your@email.com
// SMTP_PASS=yourpassword
//
// 3. Save the file and restart your dev server if running.

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
  await transporter.sendMail({
    from: `"FastTable" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
} 