import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });
  try {
    const body = await req.json();
    const name = String(body.customer_name || "").trim();
    const contact = String(body.customer_contact || "").trim();
    const productId = String(body.product_id || "");
    const notes = String(body.notes || "").trim();
    if (name.length < 1 || name.length > 100 || contact.length < 3 || contact.length > 160 || notes.length > 1000) {
      return new Response(JSON.stringify({ error: "Invalid request" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const db = createClient(url, key);
    const { data: product, error: productError } = await db.from("products").select("id,name,active").eq("id", productId).single();
    if (productError || !product || !product.active) return new Response(JSON.stringify({ error: "Product unavailable" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    const { data: order, error: insertError } = await db.from("orders").insert({
      customer_name: name, customer_contact: contact, product_id: product.id, product_name: product.name, notes
    }).select("id,created_at").single();
    if (insertError) throw insertError;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    const to = Deno.env.get("ORDER_NOTIFICATION_TO");
    const from = Deno.env.get("ORDERS_FROM_EMAIL");
    if (!resendKey || !to || !from) {
      console.error("Email secrets are not configured; order was saved without notification.");
      return new Response(JSON.stringify({ ok: true, email_sent: false }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    }
    const email = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": "Bearer " + resendKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        from, to: [to], subject: "New print request: " + product.name,
        text: "New print request\n\nProduct: " + product.name + "\nName: " + name + "\nContact: " + contact + "\nNotes: " + (notes || "(none)") + "\nOrder ID: " + order.id
      })
    });
    if (!email.ok) {
      console.error("Resend notification failed:", await email.text());
      return new Response(JSON.stringify({ ok: true, email_sent: false }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ ok: true, email_sent: true }), { status: 200, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Could not submit request" }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});