import { Target, Zap, TrendingUp } from "lucide-react";

const FEATURES = [
  {
    icon: <Target className="w-12 h-12 text-[#f97316]" />,
    title: "ATS Optimization",
    description: "Ensure your resume passes Applicant Tracking Systems with our advanced scanning technology.",
  },
  {
    icon: <Zap className="w-12 h-12 text-[#fb7185]" />,
    title: "Instant Feedback",
    description: "Get real-time suggestions on formatting, keywords, and content structure within seconds.",
  },
  {
    icon: <TrendingUp className="w-12 h-12 text-[#f97316]" />,
    title: "Industry Insights",
    description: "Compare your resume against industry standards and top performers in your field.",
  },
];

export default function HomeFeatures() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center text-slate-900 mb-16">
          Powerful Features to
          <span className="bg-gradient-to-r from-[#f97316] to-[#fb7185] bg-clip-text text-transparent"> Boost Your Career</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {FEATURES.map((feature, idx) => (
            <div
              key={idx}
              className="group bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl p-8 hover:border-rose-200 hover:bg-white transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-rose-200/60"
            >
              <div className="mb-4 transform group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
