import { NextResponse } from 'next/server'
import { enrollmentSchema } from '@/lib/validations'
import { getResend } from '@/lib/resend'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const data = enrollmentSchema.parse(body)

    const operatorEmail = process.env.OPERATOR_EMAIL || 'hello@iepandthrive.com'

    // Send notification email to program operator
    const resend = getResend()

    await resend.emails.send({
      from: 'IEP & Thrive <noreply@iepandthrive.com>',
      to: operatorEmail,
      subject: `New Enrollment Inquiry — ${data.programInterest}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B4332;">New Enrollment Inquiry</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Parent/Guardian</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${data.parentName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Phone</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${data.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Child&rsquo;s Grade</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${data.childGrade}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Program Interest</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${data.programInterest}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Primary Learning Challenge</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${data.learningChallenge}</td>
            </tr>
            ${
              data.notes
                ? `<tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Additional Notes</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${data.notes}</td>
            </tr>`
                : ''
            }
          </table>
          <p style="margin-top: 24px; color: #78716C; font-size: 13px;">
            This inquiry was submitted via the IEP &amp; Thrive enrollment form.
          </p>
        </div>
      `,
    })

    // Send confirmation email to parent
    await resend.emails.send({
      from: 'IEP & Thrive <noreply@iepandthrive.com>',
      to: data.email,
      subject: 'We received your enrollment inquiry — IEP & Thrive',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1B4332;">Thank you, ${data.parentName}!</h2>
          <p style="color: #1C1917; line-height: 1.6;">
            We&rsquo;ve received your enrollment inquiry for the <strong>${data.programInterest}</strong> program.
            Our team will review your submission and reach out within 24 hours to discuss
            program fit and next steps.
          </p>
          <p style="color: #1C1917; line-height: 1.6;">
            In the meantime, if you have any questions, feel free to reply to this email
            or book a free discovery call on our website.
          </p>
          <p style="color: #78716C; font-size: 13px; margin-top: 24px;">
            &mdash; The IEP &amp; Thrive Team<br/>
            A program of Cure Consulting Group
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

    console.error('Enrollment form error:', error)
    return NextResponse.json(
      { success: false, error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
