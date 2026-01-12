import { useState } from "react";
import Link from "next/link";
import { Upload, Zap, CheckCircle, ArrowRight } from "lucide-react";

export default function HomeHero() {
  const [isHovering, setIsHovering] = useState(false);

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-rose-50 border border-rose-200 rounded-full px-4 py-2 mb-8">
            <Zap className="w-4 h-4 text-rose-500" />
            <span className="text-rose-700 text-sm font-medium">AI-Powered Analysis</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
            Transform Your Resume
            <br />
            <span className="bg-gradient-to-r from-[#f97316] via-[#fb7185] to-[#f59e0b] bg-clip-text text-transparent animate-pulse">
              Land Your Dream Job
            </span>
          </h1>

          <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            Get instant, AI-powered feedback on your resume. Discover what recruiters really see and optimize your chances of getting hired.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/dashboard"
              className="group bg-gradient-to-r from-[#f97316] to-[#fb7185] text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-orange-200/70 transition-all transform hover:scale-105 flex items-center space-x-2"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              <Upload className="w-5 h-5" />
              <span>Analyze Your Resume Free</span>
              <ArrowRight className={`w-5 h-5 transition-transform ${isHovering ? "translate-x-1" : ""}`} />
            </Link>
          </div>

          <div className="mt-12 flex justify-center items-center space-x-8 text-slate-500">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-rose-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-rose-500" />
              <span>Instant results</span>
            </div>
          </div>
        </div>

        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#fdba74] to-[#fda4af] rounded-3xl blur-3xl opacity-30"></div>
          <div className="relative bg-slate-100 backdrop-blur-xl border border-slate-200 rounded-3xl p-8 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-4 bg-gradient-to-r from-[#fda4af]/50 to-transparent rounded"></div>
                <div className="h-4 bg-gradient-to-r from-[#fdba74]/40 to-transparent rounded w-3/4"></div>
                <div className="h-4 bg-gradient-to-r from-[#fde68a]/40 to-transparent rounded w-1/2"></div>
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                    92%
                  </div>
                  <div className="text-slate-600">Match Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
