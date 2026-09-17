import Stripe from "npm:stripe@18";
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) throw new Error("Authentication required");
    const client = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await client.auth.getUser();
    if (!user?.email) throw new Error("Authentication required");
    const { plan } = await req.json();
    if (!["monthly", "yearly"].includes(plan)) throw new Error("Invalid plan");
    const price = plan === "yearly" ? Deno.env.get("STRIPE_YEARLY_PRICE_ID") : Deno.env.get("STRIPE_MONTHLY_PRICE_ID");
    if (!price) throw new Error("Stripe price is not configured");
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
    const site = Deno.env.get("SITE_URL") || "http://localhost:5173";
    const session = await stripe.checkout.sessions.create({ mode: "subscription", customer_email: user.email, client_reference_id: user.id, line_items: [{ price, quantity: 1 }], success_url: `${site}/dashboard?checkout=success`, cancel_url: `${site}/subscribe?checkout=cancelled`, metadata: { user_id: user.id, plan }, subscription_data: { metadata: { user_id: user.id, plan } } });
    return new Response(JSON.stringify({ url: session.url }), { headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } }); }
});
