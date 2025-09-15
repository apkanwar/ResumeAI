"use client";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { getUserProfile, saveUserProfile } from "@/lib/firebase-profile";
import Inputs_Select from "@/components/select";

function toArray(v) {
  if (Array.isArray(v)) return v;
  if (typeof v === "string") return v.split(",").map(s => s.trim()).filter(Boolean);
  return [];
}

const EMPTY = {
  targetRole: "",
  seniority: "",
  industries: [],
  mustHaveKeywords: [],
  niceToHaveKeywords: [],
  locations: [],
  notes: "",
};

const ProfileEditor = forwardRef(function ProfileEditor(_, ref) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(EMPTY);

  useImperativeHandle(ref, () => ({
    open: async () => {
      try {
        setError("");
        const p = await getUserProfile();
        setProfile({
          targetRole: p?.targetRole || "",
          seniority: p?.seniority || "",
          industries: Array.isArray(p?.industries) ? p.industries : [],
          mustHaveKeywords: Array.isArray(p?.mustHaveKeywords) ? p.mustHaveKeywords : [],
          niceToHaveKeywords: Array.isArray(p?.niceToHaveKeywords) ? p.niceToHaveKeywords : [],
          locations: Array.isArray(p?.locations) ? p.locations : [],
          notes: p?.notes || "",
        });
      } catch (e) {
        setError(e?.message || "Failed to load profile");
        setProfile(EMPTY);
      } finally {
        setOpen(true);
      }
    },
    close: () => setOpen(false),
  }), []);

  const handleChange = (field, value) => setProfile(prev => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e?.preventDefault?.();
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
      setOpen(false);
    } catch (e) {
      setError(e?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold font-headings">Edit Profile</h2>
        </div>

        {error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-2 text-red-700">{error}</div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-sm font-headings">Target Role</label>
              <input
                type="text"
                className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-custom-black ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 rounded-lg"
                value={profile.targetRole}
                onChange={(e) => handleChange('targetRole', e.target.value)}
                placeholder="e.g., Frontend Engineer"
              />
            </div>
            <div>
              <label className="block font-medium text-sm font-headings">Seniority</label>
              <Inputs_Select
                id={"seniority"}
                value={profile.seniority}
                onChange={(val) => handleChange('seniority', val)}
                content={[
                  { name: 'Junior', value: 'junior' },
                  { name: 'Mid', value: 'mid' },
                  { name: 'Senior', value: 'senior' },
                  { name: 'Lead', value: 'lead' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-sm font-headings">Industries (comma-separated)</label>
            <input
              type="text"
              className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-custom-black ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 rounded-lg"
              value={Array.isArray(profile.industries) ? profile.industries.join(', ') : profile.industries}
              onChange={(e) => handleChange('industries', e.target.value)}
              placeholder="e.g., fintech, saas"
            />
          </div>

          <div>
            <label className="block font-medium text-sm font-headings">Must-Have Keywords (comma-separated)</label>
            <input
              type="text"
              className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-custom-black ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 rounded-lg"
              value={Array.isArray(profile.mustHaveKeywords) ? profile.mustHaveKeywords.join(', ') : profile.mustHaveKeywords}
              onChange={(e) => handleChange('mustHaveKeywords', e.target.value)}
              placeholder="e.g., React, TypeScript, CI/CD"
            />
          </div>

          <div>
            <label className="block font-medium text-sm font-headings">Nice-to-Have Keywords (comma-separated)</label>
            <input
              type="text"
              className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-custom-black ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 rounded-lg"
              value={Array.isArray(profile.niceToHaveKeywords) ? profile.niceToHaveKeywords.join(', ') : profile.niceToHaveKeywords}
              onChange={(e) => handleChange('niceToHaveKeywords', e.target.value)}
              placeholder="e.g., GraphQL, Next.js"
            />
          </div>

          <div>
            <label className="block font-medium text-sm font-headings">Preferred Locations (comma-separated)</label>
            <input
              type="text"
              className="font-main block w-full outline-none border-0 p-3 bg-gray-200 text-custom-black ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 rounded-lg"
              value={Array.isArray(profile.locations) ? profile.locations.join(', ') : profile.locations}
              onChange={(e) => handleChange('locations', e.target.value)}
              placeholder="e.g., Toronto, Remote"
            />
          </div>

          <div>
            <label className="block font-medium text-sm font-headings">Notes</label>
            <textarea
              className="resize-none font-main block w-full outline-none border-0 p-3 bg-gray-200 text-custom-black ring-1 ring-inset ring-transparent placeholder:text-gray-600 placeholder:italic focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 rounded-lg"
              rows={3}
              value={profile.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Any preferences or context for employer fit"
            />
          </div>

          <div className="mt-4 flex justify-end gap-2 font-main font-medium">
            <button type="button" onClick={() => setOpen(false)} className="text-dm-black rounded-full py-1 px-6 hover:bg-gray-300 transition-opacity duration-300 w-fit bg-gray-100 border border-dm-black">Cancel</button>
            <button type="submit" disabled={saving} className="bg-plum/90 border border-plum/90 text-white rounded-full py-1 px-6 hover:bg-plum transition-opacity duration-300 w-fit">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default ProfileEditor;
