import { getStripe } from "@/lib/stripe";
import { adminDb, adminFieldValue } from "@/lib/firebaseAdmin";

export const config = { api: { bodyParser: false } };

const toInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getTokenCountFromMetadata = (metadata = {}) => {
  const source = metadata.tokens || metadata.token || metadata.credits;
  return source ? toInt(source) : 0;
};

async function readRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function sumTokensFromLineItems(stripe, session) {
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ["data.price.product"],
  });

  return lineItems.data.reduce((total, item) => {
    const price = item.price || null;
    const product =
      price?.product && typeof price.product !== "string" ? price.product : null;
    const metadata = {
      ...(product?.metadata || {}),
      ...(price?.metadata || {}),
    };
    const perUnit = getTokenCountFromMetadata(metadata);
    const qty = Number.isFinite(Number(item.quantity)) ? Number(item.quantity) : 1;
    return total + perUnit * qty;
  }, 0);
}

async function creditTokens({ uid, sessionId, tokens }) {
  if (!uid || !tokens || tokens <= 0) return;

  const sessionRef = adminDb.collection("stripeSessions").doc(String(sessionId));
  const profileRef = adminDb.collection("profiles").doc(String(uid));

  await adminDb.runTransaction(async (tx) => {
    const sessionSnap = await tx.get(sessionRef);
    if (sessionSnap.exists) return;
    tx.set(sessionRef, {
      uid,
      tokens,
      createdAt: adminFieldValue.serverTimestamp(),
    });
    tx.set(
      profileRef,
      {
        parseTokens: adminFieldValue.increment(tokens),
        updatedAt: adminFieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  const stripe = getStripe();
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res
      .status(500)
      .json({ ok: false, error: "Missing STRIPE_WEBHOOK_SECRET" });
  }
  if (!signature) {
    return res.status(400).json({ ok: false, error: "Missing signature" });
  }

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return res.status(400).json({ ok: false, error: err?.message || "Bad signature" });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session?.payment_status !== "paid") break;
        const uid = session?.metadata?.uid || session?.client_reference_id;
        let tokens = toInt(session?.metadata?.tokens);
        if (!tokens) {
          tokens = await sumTokensFromLineItems(stripe, session);
        }
        await creditTokens({ uid, sessionId: session.id, tokens });
        break;
      }
      default:
        break;
    }
  } catch (err) {
    console.error("[/api/stripe/webhook]", err);
    return res.status(500).json({ ok: false, error: "Webhook handler failed" });
  }

  return res.status(200).json({ ok: true });
}
