import Stripe from "stripe";

let stripeClient;

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    const err = new Error("Missing STRIPE_SECRET_KEY");
    err.status = 500;
    throw err;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey, {
      apiVersion: "2024-06-20",
    });
  }

  return stripeClient;
}
