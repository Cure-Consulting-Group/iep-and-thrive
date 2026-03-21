import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const program = searchParams.get('program')

    const priceMap: Record<string, string | undefined> = {
      reading: process.env.STRIPE_READING_PRICE_ID,
      math: process.env.STRIPE_MATH_PRICE_ID,
      full: process.env.STRIPE_FULL_PRICE_ID,
    }

    if (!program || !priceMap[program]) {
      return NextResponse.json(
        { error: 'Invalid or missing program parameter. Use: full, reading, or math.' },
        { status: 400 }
      )
    }

    const priceId = priceMap[program]
    if (!priceId) {
      return NextResponse.json(
        { error: 'Stripe price ID not configured for this program.' },
        { status: 500 }
      )
    }

    const stripe = getStripe()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        program,
      },
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#program`,
    })

    if (!session.url) {
      return NextResponse.json(
        { error: 'Failed to create checkout session.' },
        { status: 500 }
      )
    }

    return NextResponse.redirect(session.url)
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session.' },
      { status: 500 }
    )
  }
}
