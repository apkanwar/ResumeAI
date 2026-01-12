import { getStripe } from "@/lib/stripe";

const truthy = (value) => {
  if (value === true) return true;
  const normalized = String(value || "").trim().toLowerCase();
  return ["true", "1", "yes", "y"].includes(normalized);
};

const toInt = (value) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : 0;
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ ok: false, error: "Method Not Allowed" });
  }

  try {
    const stripe = getStripe();
    const prices = await stripe.prices.list({
      active: true,
      limit: 100,
      expand: ["data.product"],
    });

    const items = prices.data
      .filter((price) => price.type === "one_time" && price.unit_amount != null)
      .map((price) => {
        const product = price.product && typeof price.product !== "string" ? price.product : null;
        if (!product || product.active === false) return null;

        const metadata = {
          ...(product.metadata || {}),
          ...(price.metadata || {}),
        };

        const tokenSource = metadata.tokens || metadata.token || metadata.credits;

        return {
          id: price.id,
          productId: product.id,
          name: product.name,
          description: product.description || "",
          image: product.images?.[0] || null,
          currency: price.currency,
          unitAmount: price.unit_amount,
          tokens: tokenSource ? toInt(tokenSource) : null,
          highlight: truthy(metadata.highlight || metadata.popular || metadata.featured),
          cta: metadata.cta || "Purchase",
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.unitAmount - b.unitAmount);

    return res.status(200).json({ ok: true, items });
  } catch (err) {
    const status = err?.status || 500;
    return res.status(status).json({
      ok: false,
      error: err?.message || "Unable to load Stripe products",
    });
  }
}
