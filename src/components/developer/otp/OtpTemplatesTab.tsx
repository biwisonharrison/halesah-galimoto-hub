"use client";

import { useEffect, useState } from "react";
import { PURPOSES, CHANNELS } from "./types";

const PLACEHOLDERS = ["{{OTP}}", "{{APP_NAME}}", "{{USER_NAME}}", "{{EXPIRY}}", "{{DATE}}", "{{TIME}}"];

interface TemplateRow {
  purpose: string;
  channel: string;
  subject: string | null;
  body: string;
}

export default function OtpTemplatesTab() {
  const [purpose, setPurpose] = useState<string>(PURPOSES[0]);
  const [channel, setChannel] = useState<string>(CHANNELS[0]);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/developer/otp/templates")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []));
  }, []);

  useEffect(() => {
    const existing = templates.find((t) => t.purpose === purpose && t.channel === channel);
    setSubject(existing?.subject ?? (channel === "EMAIL" ? "Verification Code" : ""));
    setBody(existing?.body ?? (channel === "EMAIL" ? "Your verification code is {{OTP}}.\nIt expires in {{EXPIRY}} minutes." : "Your verification code is {{OTP}}. It expires in {{EXPIRY}} minutes."));
  }, [purpose, channel, templates]);

  function insertPlaceholder(token: string) {
    setBody((b) => `${b}${token}`);
  }

  async function save() {
    setBusy(true);
    setMessage(null);
    const res = await fetch("/api/developer/otp/templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purpose, channel, subject: channel === "EMAIL" ? subject : undefined, body }),
    });
    setBusy(false);
    if (res.ok) {
      setMessage("Template saved.");
      const res2 = await fetch("/api/developer/otp/templates");
      setTemplates((await res2.json()).templates ?? []);
    } else {
      setMessage("Could not save template.");
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-gray-300">Purpose</span>
          <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white">
            {PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm">
          <span className="text-gray-300">Channel</span>
          <select value={channel} onChange={(e) => setChannel(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white">
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      </div>

      {channel === "EMAIL" && (
        <label className="block text-sm">
          <span className="text-gray-300">Email subject</span>
          <input value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white" />
        </label>
      )}

      <label className="block text-sm">
        <span className="text-gray-300">Message body</span>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-sm text-white"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        {PLACEHOLDERS.map((token) => (
          <button
            key={token}
            type="button"
            onClick={() => insertPlaceholder(token)}
            className="rounded-md border border-gray-700 px-2 py-1 text-xs text-gray-300 hover:bg-gray-800"
          >
            {token}
          </button>
        ))}
      </div>

      {message && <p className="text-sm text-emerald-400">{message}</p>}

      <button onClick={save} disabled={busy} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        Save Template
      </button>
    </div>
  );
}
