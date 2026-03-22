/**
 * Stripe Webhook Email Templates — IEP & Thrive
 *
 * Email templates for payment confirmations and operator notifications
 * triggered by Stripe webhook events.
 *
 * Brand colors:
 * - Forest green: #1B4332
 * - Gold: #D4860B
 * - Cream: #FDFAF4
 * - Sage: #D8F3DC
 */

import { escapeHtml } from "./email-service";

// ─── Shared Layout ───

function emailLayout(content: string): string {
  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFAF4; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-family: Georgia, serif; font-size: 22px; font-weight: bold;">
          <span style="color: #1B4332;">IEP</span>
          <span style="color: #D4860B;"> & </span>
          <span style="color: #1B4332;">Thrive</span>
        </span>
      </div>
      <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid rgba(27,67,50,0.12);">
        ${content}
      </div>
      <p style="text-align: center; color: #78716C; font-size: 12px; margin-top: 24px;">
        IEP & Thrive · Special Education Summer Intensive<br/>
        Long Island, NY · <a href="https://iep-and-thrive.web.app" style="color: #1B4332;">iep-and-thrive.web.app</a>
      </p>
    </div>
  `;
}

// ─── Deposit Confirmation (to parent) ───

export function depositConfirmationTemplate(data: {
  name: string;
  program: string;
  amount: string;
}): { subject: string; html: string } {
  const safe = {
    name: escapeHtml(data.name),
    program: escapeHtml(data.program),
    amount: escapeHtml(data.amount),
  };

  return {
    subject: "Your spot is reserved — IEP & Thrive Summer 2026",
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 8px;">
        Your Spot is Reserved!
      </h1>
      <p style="color: #78716C; font-size: 14px; margin-bottom: 24px;">
        Hi ${safe.name}, thank you for your deposit. Your child's spot in the
        <strong>${safe.program}</strong> is now secured.
      </p>
      <div style="background: #D8F3DC; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Program:</strong> ${safe.program}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Deposit Paid:</strong> ${safe.amount}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Program Dates:</strong> July 7 &ndash; August 14, 2026</p>
        <p style="margin: 0; font-size: 14px;"><strong>Schedule:</strong> Mon&ndash;Thu, 9am&ndash;1pm ET</p>
      </div>
      <h2 style="font-family: Georgia, serif; color: #1B4332; font-size: 18px; margin-bottom: 12px;">
        What Happens Next
      </h2>
      <ol style="color: #1C1917; line-height: 1.8; padding-left: 20px;">
        <li><strong>IEP Review</strong> &mdash; We&rsquo;ll reach out within 48 hours to request your child&rsquo;s current IEP so we can map their goals to our summer curriculum.</li>
        <li><strong>Cohort Placement</strong> &mdash; Once we review the IEP, we&rsquo;ll confirm your child&rsquo;s cohort placement based on their learning profile.</li>
        <li><strong>Balance Due</strong> &mdash; The remaining balance is due by <strong>June 23, 2026</strong>. We&rsquo;ll send a payment link closer to the date.</li>
        <li><strong>Program Start</strong> &mdash; First day is <strong>July 7, 2026</strong>. You&rsquo;ll receive a welcome packet with location details and what to bring.</li>
      </ol>
      <p style="color: #78716C; font-size: 13px; margin-top: 24px; line-height: 1.6;">
        Questions? Reply to this email or book a free discovery call on our website.
      </p>
      <p style="color: #78716C; font-size: 13px; margin-top: 16px;">
        &mdash; The IEP &amp; Thrive Team<br/>
        A program of Cure Consulting Group
      </p>
    `),
  };
}

// ─── Balance Confirmation (to parent) ───

export function balanceConfirmationTemplate(data: {
  name: string;
  program: string;
  amount: string;
}): { subject: string; html: string } {
  const safe = {
    name: escapeHtml(data.name),
    program: escapeHtml(data.program),
    amount: escapeHtml(data.amount),
  };

  return {
    subject: "Payment complete — You're all set for Summer 2026!",
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 8px;">
        You're All Set!
      </h1>
      <p style="color: #78716C; font-size: 14px; margin-bottom: 24px;">
        Hi ${safe.name}, your balance payment has been received. You&rsquo;re fully enrolled
        in the <strong>${safe.program}</strong> for Summer 2026.
      </p>
      <div style="background: #D8F3DC; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Program:</strong> ${safe.program}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Balance Paid:</strong> ${safe.amount}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Status:</strong> Paid in Full</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>Program Dates:</strong> July 7 &ndash; August 14, 2026</p>
        <p style="margin: 0; font-size: 14px;"><strong>Schedule:</strong> Mon&ndash;Thu, 9am&ndash;1pm ET</p>
      </div>
      <h2 style="font-family: Georgia, serif; color: #1B4332; font-size: 18px; margin-bottom: 12px;">
        Getting Ready for Summer
      </h2>
      <ul style="color: #1C1917; line-height: 1.8; padding-left: 20px;">
        <li>Exact location details will be shared in your welcome packet (sent late June).</li>
        <li>Your child&rsquo;s cohort placement and schedule will be confirmed via email.</li>
        <li>All curriculum materials and supplies are included &mdash; no need to purchase anything.</li>
        <li>A home practice guide (15 min/night) will be provided on day one.</li>
      </ul>
      <p style="color: #78716C; font-size: 13px; margin-top: 24px; line-height: 1.6;">
        We&rsquo;re looking forward to a great summer with your child. Questions? Reply to this email anytime.
      </p>
      <p style="color: #78716C; font-size: 13px; margin-top: 16px;">
        &mdash; The IEP &amp; Thrive Team<br/>
        A program of Cure Consulting Group
      </p>
    `),
  };
}

// ─── Operator Payment Notification ───

export function operatorPaymentNotificationTemplate(data: {
  name: string;
  email: string;
  program: string;
  type: string;
  amount: string;
  sessionId: string;
}): { subject: string; html: string } {
  const safe = {
    name: escapeHtml(data.name),
    email: escapeHtml(data.email),
    program: escapeHtml(data.program),
    type: escapeHtml(data.type),
    amount: escapeHtml(data.amount),
    sessionId: escapeHtml(data.sessionId),
  };

  const typeLabel = safe.type === "balance" ? "Balance Payment" : "Deposit Payment";

  return {
    subject: `New ${typeLabel} — ${safe.program} — ${safe.name}`,
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 16px;">
        New ${typeLabel} Received
      </h1>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Parent/Guardian</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Program</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.program}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Payment Type</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${typeLabel}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Amount</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.amount}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Stripe Session</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-size: 12px; word-break: break-all;">${safe.sessionId}</td>
        </tr>
      </table>
      <p style="margin-top: 16px; color: #78716C; font-size: 13px;">
        Payment processed via Stripe. View details in the
        <a href="https://dashboard.stripe.com" style="color: #1B4332;">Stripe Dashboard</a>.
      </p>
    `),
  };
}
