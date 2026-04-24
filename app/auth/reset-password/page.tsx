"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-950 px-6 py-16 text-stone-50">
      <div className="w-full max-w-md rounded-3xl border border-stone-800 bg-stone-900/80 p-8 shadow-2xl shadow-black/30">
        <h1 className="font-serif text-3xl">Set a new password</h1>
        <p className="mt-3 text-sm text-stone-400">
          Choose a strong password for your Pravara account.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500">
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition-colors focus:border-haldi-500"
            />
          </div>

          <div>
            <label
              htmlFor="confirm-password"
              className="mb-2 block text-xs font-bold uppercase tracking-wider text-stone-500"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={8}
              required
              className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition-colors focus:border-haldi-500"
            />
          </div>

          {error ? (
            <p className="rounded-xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-haldi-600 px-4 py-3 font-semibold text-stone-950 transition hover:bg-haldi-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Update Password"}
          </button>
        </form>

        <p className="mt-6 text-sm text-stone-500">
          Need to start over? <Link href="/login" className="text-haldi-500">Return to login</Link>.
        </p>
      </div>
    </main>
  );
}
