import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})
const WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const SLOTS_BY_PRODUCT: Record<string, number> = {
  pack:  3,
  addon: 1,
}

Deno.serve(async (req) => {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, WEBHOOK_SECRET)
  } catch (err) {
    return new Response(`Webhook signature error: ${(err as Error).message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId  = session.metadata?.user_id
    const product = session.metadata?.product

    if (!userId || !product || !(product in SLOTS_BY_PRODUCT)) {
      console.error('Missing or invalid metadata', { userId, product })
      return new Response('ok', { status: 200 }) // return 200 so Stripe doesn't retry
    }

    const slotsToAdd = SLOTS_BY_PRODUCT[product]

    const { error } = await supabase.rpc('increment_group_slots', {
      p_user_id: userId,
      p_slots: slotsToAdd,
    })

    if (error) {
      console.error('increment_group_slots error:', error)
      // Still return 200 — log and investigate; don't let Stripe retry forever
    }
  }

  return new Response('ok', { status: 200 })
})
