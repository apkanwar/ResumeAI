import { getStripe } from "@/lib/stripe";
import { requireUser } from "@/lib/requireUser";

const toInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getTokenCountFromMetadata = (metadata = {}) => {
  const source = metadata.tokens || metadata.token || metadata.credits;
  return source ? toInt(source) : 0;
};

const getBaseUrl = (req) => {
  const envUrl =
    process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "";
  if (envUrl) return envUrl.replace(/\/$/, "");

  const origin = req.headers?.origin;
  if (origin) return origin.replace(/\/$/, "");

  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (host) return `${proto}://${host}`.replace(/\/$/, "");

  return "";
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const me = await requireUser(req);
    const { priceId, quantity } = req.body || {};
    if (!priceId) {
      return res.status(400).json({ ok: false, error: "Missing priceId" });
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl(req);
    if (!baseUrl) {
      return res.status(400).json({
        ok: false,
        error: "Missing SITE_URL or request origin",
      });
    }

    const price = await stripe.prices.retrieve(priceId, { expand: ["product"] });
    if (!price?.active) {
      return res.status(400).json({ ok: false, error: "Inactive price" });
    }
    if (price.type !== "one_time") {
      return res.status(400).json({ ok: false, error: "Price must be one-time" });
    }

    const product =
      price.product && typeof price.product !== "string" ? price.product : null;
    if (product && product.active === false) {
      return res.status(400).json({ ok: false, error: "Inactive product" });
    }

    const metadata = {
      ...(product?.metadata || {}),
      ...(price?.metadata || {}),
    };
    const quantityInt = Number.isFinite(Number(quantity))
      ? Number(quantity)
      : 1;
    const tokensPerUnit = getTokenCountFromMetadata(metadata);
    const tokensTotal = tokensPerUnit * quantityInt;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      allow_promotion_codes: true,
      line_items: [
        {
          price: priceId,
          quantity: quantityInt,
        },
      ],
      client_reference_id: me.uid,
      customer_email: me.email || undefined,
      metadata: {
        uid: me.uid,
        tokens: String(tokensTotal || 0),
        priceId,
      },
      success_url: `${baseUrl}/store?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/store?checkout=cancelled`,
    });

    return res.status(200).json({ ok: true, url: session.url });
  } catch (err) {
    const status = err?.status || 500;
    return res.status(status).json({
      ok: false,
      error: err?.message || "Unable to create checkout session",
    });
  }
}
