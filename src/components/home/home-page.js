import HomeNav from "@/components/home/home-nav";
import HomeHero from "@/components/home/home-hero";
import HomeFeatures from "@/components/home/home-features";
import HomeSocialProof from "@/components/home/home-social-proof";
import HomeCTA from "@/components/home/home-cta";
import HomeFooter from "@/components/home/home-footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fff7ed] via-[#fdf2f8] to-[#e0f2fe] text-slate-900">
      <HomeNav />
      <HomeHero />
      <HomeFeatures />
      <HomeSocialProof />
      <HomeCTA />
      <HomeFooter />
    </div>
  );
}
