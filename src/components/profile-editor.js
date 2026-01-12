"use client";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import ProfileForm from "@/components/profile-form";

const ProfileEditor = forwardRef(function ProfileEditor(_, ref) {
  const [open, setOpen] = useState(false);
  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
    close: () => setOpen(false),
  }), []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
      <div className="relative z-10 w-full max-w-xl rounded-xl bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold font-headings">Edit Profile</h2>
        </div>
        <ProfileForm
          showTitle={false}
          onSaved={() => setOpen(false)}
          onCancel={() => setOpen(false)}
        />
      </div>
    </div>
  );
});

export default ProfileEditor;
