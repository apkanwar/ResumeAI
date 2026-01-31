import { useEffect, useState } from "react";
import { getUserProfile, saveUserProfile } from "@/lib/firebase-profile";
import Inputs_Select from "@/components/select";

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean);
  }
  return [];
}

const EMPTY_PROFILE = {
  targetRole: "",
  seniority: "",
  industries: [],
  mustHaveKeywords: [],
  niceToHaveKeywords: [],
  locations: [],
  notes: "",
};

export default function DashboardProfileSection() {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(EMPTY_PROFILE);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setError("");
        const loaded = await getUserProfile();
        if (!active) return;
        setProfile({
          targetRole: loaded?.targetRole || "",
          seniority: loaded?.seniority || "",
          industries: Array.isArray(loaded?.industries) ? loaded.industries : [],
          mustHaveKeywords: Array.isArray(loaded?.mustHaveKeywords) ? loaded.mustHaveKeywords : [],
          niceToHaveKeywords: Array.isArray(loaded?.niceToHaveKeywords) ? loaded.niceToHaveKeywords : [],
          locations: Array.isArray(loaded?.locations) ? loaded.locations : [],
          notes: loaded?.notes || "",
        });
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load profile");
        setProfile(EMPTY_PROFILE);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleChange = (field, value) => setProfile((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (event) => {
    event?.preventDefault?.();
    try {
      setSaving(true);
      setError("");
      const payload = {
        ...profile,
        industries: toArray(profile.industries),
        mustHaveKeywords: toArray(profile.mustHaveKeywords),
        niceToHaveKeywords: toArray(profile.niceToHaveKeywords),
        locations: toArray(profile.locations),
      };
      await saveUserProfile(payload);
    } catch (err) {
      setError(err?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="xl:mx-auto max-w-5xl">
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-8 font-main">
        <h2 className="text-2xl font-headings font-semibold">Job Profile</h2>
        <p className="mt-3 text-slate-700">
          Update your target role, seniority, keywords, and preferences to personalize your analysis.
        </p>
        <div className="mt-6">
          {error && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-red-700">{error}</div>
          )}

          {loading ? (
            <div className="text-sm text-slate-500">Loading profile...</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-sm font-headings">Target Role</label>
                  <input
                    type="text"
                    className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-slate-900 ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-top-orange sm:text-sm sm:leading-6 rounded-lg"
                    value={profile.targetRole}
                    onChange={(e) => handleChange("targetRole", e.target.value)}
                    placeholder="e.g., Frontend Engineer"
                  />
                </div>
                <div>
                  <label className="block font-medium text-sm font-headings">Seniority</label>
                  <Inputs_Select
                    id="seniority"
                    value={profile.seniority}
                    onChange={(value) => handleChange("seniority", value)}
                    content={[
                      { name: "Junior", value: "junior" },
                      { name: "Mid", value: "mid" },
                      { name: "Senior", value: "senior" },
                      { name: "Lead", value: "lead" },
                    ]}
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-sm font-headings">Industries (comma-separated)</label>
                <input
                  type="text"
                  className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-slate-900 ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-top-orange sm:text-sm sm:leading-6 rounded-lg"
                  value={Array.isArray(profile.industries) ? profile.industries.join(", ") : profile.industries}
                  onChange={(e) => handleChange("industries", e.target.value)}
                  placeholder="e.g., fintech, saas"
                />
              </div>

              <div>
                <label className="block font-medium text-sm font-headings">Must-Have Keywords (comma-separated)</label>
                <input
                  type="text"
                  className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-slate-900 ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-top-orange sm:text-sm sm:leading-6 rounded-lg"
                  value={Array.isArray(profile.mustHaveKeywords) ? profile.mustHaveKeywords.join(", ") : profile.mustHaveKeywords}
                  onChange={(e) => handleChange("mustHaveKeywords", e.target.value)}
                  placeholder="e.g., React, TypeScript, CI/CD"
                />
              </div>

              <div>
                <label className="block font-medium text-sm font-headings">Nice-to-Have Keywords (comma-separated)</label>
                <input
                  type="text"
                  className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-slate-900 ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-top-orange sm:text-sm sm:leading-6 rounded-lg"
                  value={Array.isArray(profile.niceToHaveKeywords) ? profile.niceToHaveKeywords.join(", ") : profile.niceToHaveKeywords}
                  onChange={(e) => handleChange("niceToHaveKeywords", e.target.value)}
                  placeholder="e.g., GraphQL, Next.js"
                />
              </div>

              <div>
                <label className="block font-medium text-sm font-headings">Preferred Locations (comma-separated)</label>
                <input
                  type="text"
                  className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-slate-900 ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-top-orange sm:text-sm sm:leading-6 rounded-lg"
                  value={Array.isArray(profile.locations) ? profile.locations.join(", ") : profile.locations}
                  onChange={(e) => handleChange("locations", e.target.value)}
                  placeholder="e.g., Toronto, Remote"
                />
              </div>

              <div>
                <label className="block font-medium text-sm font-headings">Notes</label>
                <textarea
                  className="resize-none font-main block w-full outline-none border-0 p-3 bg-gray-200 text-slate-900 ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-top-orange sm:text-sm sm:leading-6 rounded-lg"
                  rows={3}
                  value={profile.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Any preferences or context for employer fit"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 font-main font-medium">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-top-orange/90 hover:bg-top-orange border border-top-orange text-white rounded-full py-1 px-6 hover:opacity-90 transition-opacity duration-300 w-fit"
                >
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
