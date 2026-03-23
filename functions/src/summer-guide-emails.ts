/**
 * Summer Guide Drip Email Templates — IEP & Thrive
 *
 * 3-email sequence for the free IEP Summer Guide PDF download:
 *   #1 Guide delivery (immediate)
 *   #2 Value + social proof (day 2)
 *   #3 Urgency + offer (day 5)
 */

// ─── Shared Layout (matches email-templates.ts) ───

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
        IEP & Thrive &middot; Special Education Summer Intensive<br/>
        Long Island, NY &middot; <a href="https://iepandthrive.com" style="color: #1B4332;">iepandthrive.com</a>
      </p>
    </div>
  `;
}

function ctaButton(text: string, href: string): string {
  return `
    <div style="text-align: center; margin: 28px 0;">
      <a href="${href}" style="display: inline-block; background: #1B4332; color: #FFFFFF; font-family: 'DM Sans', Arial, sans-serif; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 100px; text-decoration: none;">
        ${text}
      </a>
    </div>
  `;
}

// ─── Email #1 — Guide Delivery (Immediate) ───

export function summerGuideDeliveryTemplate(data: {
  name: string;
}): { subject: string; html: string } {
  return {
    subject: "Your IEP Summer Guide Is Here",
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 8px;">
        Hi ${data.name}, your guide is ready.
      </h1>
      <p style="color: #1C1917; line-height: 1.6;">
        Here's the guide you requested &mdash; <strong>5 Questions Every IEP Parent Should Ask Before Summer Begins.</strong>
      </p>
      ${ctaButton("Download Your Free Guide &rarr;", "https://iepandthrive.com/summer-guide.pdf")}
      <p style="color: #1C1917; line-height: 1.6;">
        This guide was written by a credentialed NYC SPED interventionist with 8+ years inside
        the system. The questions are designed to help you evaluate any summer program &mdash;
        including ours.
      </p>
      <p style="color: #1C1917; line-height: 1.6;">
        If you'd like to learn more about our Summer 2026 program, visit
        <a href="https://iepandthrive.com" style="color: #1B4332; font-weight: 600;">iepandthrive.com</a>
        or <a href="https://iepandthrive.com/contact" style="color: #1B4332; font-weight: 600;">book a free 20-minute discovery call</a>.
      </p>
      <p style="color: #78716C; font-size: 13px; margin-top: 24px;">
        &mdash; The IEP &amp; Thrive Team<br/>
        A program of Cure Consulting Group
      </p>
    `),
  };
}

// ─── Email #2 — Day 2: Value + Social Proof ───

export function summerGuideDripEmail2Template(data: {
  name: string;
}): { subject: string; html: string } {
  return {
    subject: "The summer regression problem nobody talks about",
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 8px;">
        The summer regression problem nobody talks about
      </h1>
      <p style="color: #1C1917; line-height: 1.6;">
        Hi ${data.name}, a quick follow-up from the team at IEP &amp; Thrive.
      </p>
      <div style="background: #FFF3CD; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="color: #1C1917; line-height: 1.6; margin: 0; font-size: 15px;">
          <strong style="color: #D4860B;">Students with IEPs lose skills at 2&ndash;3&times; the rate of their peers over summer.</strong>
          By September, months of school-year progress can disappear.
        </p>
      </div>
      <p style="color: #1C1917; line-height: 1.6;">
        Most districts deny ESY. And generic tutoring doesn't speak the language of IEPs &mdash;
        no goal alignment, no progress data, no documentation for fall CSE meetings.
      </p>
      <h2 style="font-family: Georgia, serif; color: #1B4332; font-size: 18px; margin-top: 28px; margin-bottom: 12px;">
        What makes IEP &amp; Thrive different
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; vertical-align: top;">
            <span style="color: #40916C; font-weight: 700; margin-right: 8px;">&#10003;</span>
            <span style="color: #1C1917;">Every session mapped to your child's <strong>actual IEP goals</strong></span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; border-bottom: 1px solid #eee; vertical-align: top;">
            <span style="color: #40916C; font-weight: 700; margin-right: 8px;">&#10003;</span>
            <span style="color: #1C1917;"><strong>Weekly progress reports</strong> you can bring to September meetings</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; vertical-align: top;">
            <span style="color: #40916C; font-weight: 700; margin-right: 8px;">&#10003;</span>
            <span style="color: #1C1917;"><strong>Small groups (max 6)</strong> led by a credentialed SPED interventionist</span>
          </td>
        </tr>
      </table>
      ${ctaButton("See Our Summer 2026 Programs &rarr;", "https://iepandthrive.com/program")}
      <p style="color: #78716C; font-size: 13px; line-height: 1.6;">
        <strong>P.S.</strong> Cohorts are limited to 6 students and filling now.
        Early enrollment closes April 30.
      </p>
      <p style="color: #78716C; font-size: 13px; margin-top: 16px;">
        &mdash; The IEP &amp; Thrive Team
      </p>
    `),
  };
}

// ─── Email #3 — Day 5: Urgency + Offer ───

export function summerGuideDripEmail3Template(data: {
  name: string;
}): { subject: string; html: string } {
  return {
    subject: "A few spots left for Summer 2026",
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 8px;">
        A few spots left for Summer 2026
      </h1>
      <p style="color: #1C1917; line-height: 1.6;">
        Hi ${data.name}, one last note from us.
      </p>
      <p style="color: #1C1917; line-height: 1.6;">
        We know choosing a summer program is a big decision &mdash; especially for a child with an IEP.
        You want to know it's run by someone who actually understands the system.
      </p>
      <div style="background: #D8F3DC; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="color: #1B4332; line-height: 1.6; margin: 0 0 8px 0; font-weight: 600;">
          About the founder
        </p>
        <p style="color: #1C1917; line-height: 1.6; margin: 0;">
          Our program was built by a NYS-certified Special Education Teacher with 8+ years as a SPED
          Interventionist at the NYC DOE. She's sat at hundreds of CSE tables, written IEPs, and fought
          for kids who deserved more.
        </p>
      </div>
      <h2 style="font-family: Georgia, serif; color: #1B4332; font-size: 18px; margin-top: 28px; margin-bottom: 12px;">
        What families get
      </h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top;">
            <span style="color: #40916C; font-weight: 700; margin-right: 8px;">&#10003;</span>
            <span style="color: #1C1917;">4 hrs/day, Mon&ndash;Thu, 6 weeks of structured intervention</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top;">
            <span style="color: #40916C; font-weight: 700; margin-right: 8px;">&#10003;</span>
            <span style="color: #1C1917;">All curriculum materials &amp; supplies included</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top;">
            <span style="color: #40916C; font-weight: 700; margin-right: 8px;">&#10003;</span>
            <span style="color: #1C1917;">Weekly progress reports + CSE-ready final report</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; vertical-align: top;">
            <span style="color: #40916C; font-weight: 700; margin-right: 8px;">&#10003;</span>
            <span style="color: #1C1917;">Max 6 students per cohort</span>
          </td>
        </tr>
      </table>
      <div style="background: #FDFAF4; border: 1px solid rgba(27,67,50,0.12); border-radius: 12px; padding: 20px; margin: 24px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; color: #1C1917;"><strong>Program dates:</strong></td>
            <td style="padding: 4px 0; color: #1C1917;">July 7 &ndash; August 15, 2026</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; color: #1C1917;"><strong>Pricing:</strong></td>
            <td style="padding: 4px 0; color: #1C1917;">Starting at $875 deposit (25%). FSA/HSA may apply.</td>
          </tr>
        </table>
      </div>
      ${ctaButton("Reserve Your Child's Spot &rarr;", "https://iepandthrive.com/enroll")}
      <p style="color: #1C1917; line-height: 1.6; text-align: center;">
        Not ready yet?
        <a href="https://iepandthrive.com/contact" style="color: #1B4332; font-weight: 600;">
          Book a free 20-minute discovery call
        </a>
        &mdash; no commitment, just a real conversation.
      </p>
      <p style="color: #78716C; font-size: 13px; margin-top: 24px; line-height: 1.6;">
        We hope the guide was helpful regardless of which path you choose for your child this summer.
      </p>
      <p style="color: #78716C; font-size: 13px; margin-top: 16px;">
        &mdash; The IEP &amp; Thrive Team<br/>
        A program of Cure Consulting Group
      </p>
    `),
  };
}
