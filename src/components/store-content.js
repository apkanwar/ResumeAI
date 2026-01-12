import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebaseConfig";

export default function PricingPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [checkoutId, setCheckoutId] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const formatPrice = (unitAmount, currency) => {
    if (!Number.isFinite(unitAmount)) return "";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: (currency || "usd").toUpperCase(),
        maximumFractionDigits: 0,
      }).format(unitAmount / 100);
    } catch {
      return `$${(unitAmount / 100).toFixed(0)}`;
    }
  };

  const normalizedPackages = packages.map((pkg) => ({
    id: pkg.id,
    tokens: pkg.tokens,
    price: formatPrice(pkg.unitAmount, pkg.currency),
    title: pkg.name,
    description: pkg.description,
    cta: pkg.cta || "Purchase",
    highlight: Boolean(pkg.highlight),
  }));

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setCurrentUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError("");
        const resp = await fetch("/api/stripe/products");
        const data = await resp.json();
        if (!resp.ok) {
          throw new Error(data?.error || "Unable to load products");
        }
        if (active) {
          setPackages(Array.isArray(data?.items) ? data.items : []);
        }
      } catch (err) {
        if (active) {
          setError(err?.message || "Unable to load products");
          setPackages([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      active = false;
    };
  }, []);

  const handleCheckout = async (priceId) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setError("Please sign in to purchase tokens.");
        return;
      }

      setCheckoutId(priceId);
      setError("");
      const idToken = await user.getIdToken();
      const headers = { "Content-Type": "application/json" };
      if (idToken) {
        headers.Authorization = `Bearer ${idToken}`;
      }
      const resp = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers,
        body: JSON.stringify({ priceId }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || "Unable to start checkout");
      }
      if (data?.url) {
        window.location.assign(data.url);
      } else {
        throw new Error("Missing checkout URL");
      }
    } catch (err) {
      setError(err?.message || "Unable to start checkout");
      setCheckoutId("");
    }
  };

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Choose Your
            <span className="bg-gradient-to-r from-[#f97316] to-[#fb7185] bg-clip-text text-transparent"> Perfect Plan</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            One-time token packs with the same bright, friendly ResumeAI experience.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading && (
          <div className="mb-10 text-center text-sm text-slate-500">
            Loading plans from Stripe...
          </div>
        )}

        {!loading && normalizedPackages.length === 0 && (
          <div className="mb-10 text-center text-sm text-slate-500">
            No active Stripe products found. Add one-time prices to your Stripe catalog.
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {normalizedPackages.map((pkg, index) => (
            <div
              key={pkg.id || index}
              className={`relative flex h-full flex-col rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                pkg.highlight
                  ? 'bg-gradient-to-br from-[#f97316] to-[#fb7185] text-white shadow-2xl ring-2 ring-rose-200/70'
                  : 'bg-white/80 border border-slate-200 text-slate-900 shadow-lg backdrop-blur-sm hover:border-rose-200 hover:shadow-rose-200/60'
              }`}
            >
              {pkg.highlight && (
                <div className="absolute -top-4">
                  <span className="bg-white/90 text-rose-600 text-sm font-bold px-4 py-1 rounded-full shadow-sm">
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="text-center mb-6 flex-1">
                <h3 className={`text-2xl font-bold mb-2 ${pkg.highlight ? 'text-white' : 'text-slate-900'}`}>
                  {pkg.title}
                </h3>
                <p className={`text-sm ${pkg.highlight ? 'text-rose-100' : 'text-slate-600'}`}>
                  {pkg.description}
                </p>
              </div>

              <div className="mt-auto">
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center">
                    <span className={`text-5xl font-extrabold ${pkg.highlight ? 'text-white' : 'text-slate-900'}`}>
                      {pkg.price}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm ${pkg.highlight ? 'text-rose-100' : 'text-slate-500'}`}>
                    one-time payment
                  </p>
                </div>

                <div className="mb-8">
                  <div className={`flex items-center justify-center py-3 px-4 rounded-lg ${
                    pkg.highlight ? 'bg-white/20' : 'bg-rose-50'
                  }`}>
                    <span className={`text-3xl font-bold ${pkg.highlight ? 'text-white' : 'text-rose-600'}`}>
                      {pkg.tokens ?? "—"}
                    </span>
                    <span className={`ml-2 ${pkg.highlight ? 'text-rose-100' : 'text-slate-600'}`}>
                      tokens
                    </span>
                  </div>
                </div>

                <button
                  className={`w-full py-3 px-6 rounded-full font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-70 ${
                    pkg.highlight
                      ? 'bg-white text-rose-600 hover:bg-rose-50 shadow-lg'
                      : 'bg-gradient-to-r from-[#f97316] to-[#fb7185] text-white hover:shadow-lg hover:shadow-orange-200/60'
                  }`}
                  disabled={!pkg.id || checkoutId === pkg.id || !currentUser}
                  onClick={() => handleCheckout(pkg.id)}
                >
                  {!currentUser ? "Sign in to purchase" : checkoutId === pkg.id ? "Redirecting..." : pkg.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="text-center mt-12">
          <p className="text-slate-600">
            All plans are one-time purchases. No recurring charges. Tokens never expire.
          </p>
        </div>
      </div>
    </div>
  );
}
