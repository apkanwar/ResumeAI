const PACKAGES = [
  {
    tokens: 1,
    price: "$0",
    title: "Trial Token",
    description: "Already included with every new account.",
    cta: "Included",
  },
  {
    tokens: 5,
    price: "$9",
    title: "Starter Pack",
    description: "Perfect for occasional resume updates.",
    cta: "Coming Soon",
    highlight: false,
  },
  {
    tokens: 15,
    price: "$19",
    title: "Career Boost",
    description: "Great for multiple roles or refinements.",
    cta: "Coming Soon",
    highlight: true,
  },
  {
    tokens: 40,
    price: "$39",
    title: "Pro Bundle",
    description: "For power users and recruiters.",
    cta: "Coming Soon",
    highlight: false,
  },
];

export default function StoreContent({ panelClassName = "bg-artic-blue" }) {
  return (
    <section className="mx-4 xl:mx-auto max-w-5xl pb-24">
      <div className={`${panelClassName} rounded-2xl p-8 md:p-12 font-main`}>
        <div className="max-w-2xl">
          <p className="text-top-orange uppercase tracking-wide font-semibold text-sm">Token Store</p>
          <h1 className="text-3xl md:text-4xl font-headings font-bold mt-2 mb-4">Top up your parse tokens</h1>
          <p className="text-gray-900 text-lg">
            Every user gets one free token to explore the Resume Analyzer. Need more? Choose a bundle below&mdash;payments
            are coming soon, so each button is disabled for now.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {PACKAGES.map((pkg) => (
            <article
              key={pkg.title}
              className={`rounded-2xl border border-white/40 bg-white/80 p-6 shadow-sm ${pkg.highlight ? "ring-2 ring-plum" : ""}`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-headings font-semibold">{pkg.title}</h2>
                <span className="text-2xl font-headings font-bold text-plum">{pkg.price}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2 mb-4">{pkg.description}</p>
              <div className="text-5xl font-headings font-bold mb-4 text-dm-black flex items-baseline gap-2">
                {pkg.tokens}
                <span className="text-base font-main font-medium text-gray-600">tokens</span>
              </div>
              <button
                type="button"
                className="w-full rounded-full border border-dm-black bg-dm-black text-white py-2 font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={pkg.cta !== "Buy now"}
              >
                {pkg.cta}
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
