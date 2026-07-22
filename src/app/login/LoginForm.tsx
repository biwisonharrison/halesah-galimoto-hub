"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Step = "phone" | "code";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [devHint, setDevHint] = useState<string | null>(null);

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      if (data.skippedOtp) {
        router.push(redirectTo);
        router.refresh();
        return;
      }
      setPhone(data.phone);
      setStep("code");
      setDevHint(
        process.env.NODE_ENV !== "production"
          ? "Dev mode: the 6 digit code was printed in the server terminal running `npm run dev`."
          : null
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, name: name || undefined, rememberDevice }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "phone") {
    return (
      <form onSubmit={handleRequestOtp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-ink mb-1">Phone number</label>
          <input
            type="tel"
            required
            placeholder="e.g. 0991 234 567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {loading ? "Sending code..." : "Send verification code"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-4">
      <p className="text-sm text-gray-600">
        Enter the 6 digit code sent to <strong>{phone}</strong>.
      </p>
      {devHint && <p className="rounded-md bg-amber-50 p-3 text-xs text-amber-800">{devHint}</p>}
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Verification code</label>
        <input
          type="text"
          inputMode="numeric"
          required
          maxLength={6}
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base tracking-[0.5em] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-ink mb-1">Your name (first time only)</label>
        <input
          type="text"
          placeholder="Chikondi Phiri"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>
      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input type="checkbox" checked={rememberDevice} onChange={(e) => setRememberDevice(e.target.checked)} />
        Remember this device — skip the code next time I log in here
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {loading ? "Verifying..." : "Verify & continue"}
      </button>
      <button
        type="button"
        onClick={() => setStep("phone")}
        className="w-full text-sm text-gray-500 hover:text-gray-700"
      >
        Use a different number
      </button>
    </form>
  );
}
