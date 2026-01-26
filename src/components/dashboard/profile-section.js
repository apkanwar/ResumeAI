import ProfileForm from "@/components/profile-form";

export default function DashboardProfileSection() {
  return (
    <div className="mx-4 xl:mx-auto max-w-5xl">
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-8 font-main">
        <h2 className="text-2xl font-headings font-semibold">Job Profile</h2>
        <p className="mt-3 text-slate-700">
          Update your target role, seniority, keywords, and preferences to personalize your analysis.
        </p>
        <div className="mt-6">
          <ProfileForm showTitle={false} showCancel={false} submitLabel="Save Profile" />
        </div>
      </section>
    </div>
  );
}

