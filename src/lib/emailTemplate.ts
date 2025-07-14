// FastTable branded email template generator
// Usage: import { emailTemplate } from './emailTemplate';
// const html = emailTemplate({ title: 'Welcome!', message: 'Thank you for joining...', action: { label: 'Verify Account', url: 'https://...' } });

export function emailTemplate({ title, message, action }: {
  title: string;
  message: string;
  action?: { label: string; url: string };
}) {
  return `
  <div style="background:#f4f6fb;padding:40px 0;font-family:sans-serif;">
    <table style="max-width:480px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 2px 12px #0001;overflow:hidden;">
      <tr>
        <td style="background:#3b82f6;padding:24px 0;text-align:center;">
          <img src='https://i.imgur.com/mPFuxyd.png' alt='FastTable' style='width:64px;height:64px;border-radius:12px;box-shadow:0 2px 8px #0002;background:#fff;padding:8px;'/>
          <h1 style="color:#fff;font-size:2rem;margin:16px 0 0 0;font-weight:800;letter-spacing:1px;">FastTable</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:32px 32px 16px 32px;">
          <h2 style="color:#2563eb;font-size:1.3rem;margin:0 0 12px 0;font-weight:700;">${title}</h2>
          <div style="color:#222;font-size:1rem;line-height:1.6;margin-bottom:24px;">${message}</div>
          ${action ? `<a href="${action.url}" style="display:inline-block;padding:12px 32px;background:#3b82f6;color:#fff;font-weight:600;border-radius:8px;text-decoration:none;font-size:1rem;box-shadow:0 1px 4px #0001;">${action.label}</a>` : ''}
        </td>
      </tr>
      <tr>
        <td style="padding:24px 32px 32px 32px;color:#888;font-size:0.95rem;text-align:center;">
          Se não foi você quem solicitou este email, pode ignorar com segurança.<br/>
          <span style="font-size:0.9em;">&copy; ${new Date().getFullYear()} FastTable</span>
        </td>
      </tr>
    </table>
  </div>
  `;
} 