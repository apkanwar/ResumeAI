import Link from "next/link";

export default function HomeCTA() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
          Ready to Stand Out?
        </h2>
        <p className="text-xl text-slate-600 mb-8">
          Join thousands of successful job seekers who have already begun optimizing their resumes with AI
        </p>
        <Link
          href="/dashboard"
          className="bg-gradient-to-r from-[#f97316] to-[#fb7185] text-white px-12 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-orange-200/70 transition-all transform hover:scale-105"
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
}
