import Stripe from "npm:stripe@18";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("Missing signature", { status: 400 });
  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET")!);
    const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.user_id;
      if (userId && session.subscription) await db.from("subscriptions").upsert({ user_id: userId, plan: session.metadata?.plan || "monthly", status: "active", stripe_subscription_id: String(session.subscription), stripe_customer_id: session.customer ? String(session.customer) : null }, { onConflict: "user_id" });
    }
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id;
      if (userId) await db.from("subscriptions").upsert({ user_id: userId, plan: subscription.metadata?.plan || "monthly", status: subscription.status, stripe_subscription_id: subscription.id, stripe_customer_id: String(subscription.customer) }, { onConflict: "user_id" });
    }
    return new Response("ok");
  } catch (e) { return new Response(`Webhook error: ${e.message}`, { status: 400 }); }
});
