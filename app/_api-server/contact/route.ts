import { NextResponse } from 'next/server'
import { contactSchema } from '@/lib/validations'
import { getResend } from '@/lib/resend'
import { escapeHtml } from '@/lib/escapeHtml'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    // Sanitize all user inputs for email HTML
    const safe = {
      name: escapeHtml(data.name),
      email: escapeHtml(data.email),
      phone: data.phone ? escapeHtml(data.phone) : undefined,
      message: escapeHtml(data.message),
    }

    const operatorEmail = process.env.OPERATOR_EMAIL || 'hello@iepandthrive.com'

    const typeLabels: Record<string, string> = {
      general: 'General Inquiry',
      'iep-review': 'IEP Review Request',
      'discovery-call': 'Discovery Call Request',
    }

    const resend = getResend()

    await resend.emails.send({
      from: 'IEP & Thrive <noreply@iepandthrive.com>',
      to: operatorEmail,
      subject: `New Contact — ${typeLabels[data.type] || data.type}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B4332;">${typeLabels[data.type] || 'New Contact'}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Name</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.email}</td>
            </tr>
            ${
              data.phone
                ? `<tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Phone</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.phone}</td>
            </tr>`
                : ''
            }
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Message</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.message}</td>
            </tr>
          </table>
          <p style="margin-top: 24px; color: #78716C; font-size: 13px;">
            This message was submitted via the IEP &amp; Thrive contact form.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        { success: false, error: 'Invalid form data' },
        { status: 400 }
      )
    }

    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
