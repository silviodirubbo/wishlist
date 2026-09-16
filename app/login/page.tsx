"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center font-serif text-[26px] font-medium tracking-[-0.01em]">
          wishlist<span className="text-sienna">.</span>
        </div>

        {status === "sent" ? (
          <p className="text-center text-sm text-mocha">
            Check <span className="text-ink">{email}</span> for a magic link
            to sign in.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-full border border-sand bg-transparent px-5 py-3 text-sm text-ink outline-none focus:border-sienna"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="cursor-pointer rounded-full bg-ink px-5 py-3 text-sm font-medium text-paper transition-colors hover:bg-sienna disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : "Send magic link"}
            </button>
            {error && <p className="text-center text-sm text-sienna">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
