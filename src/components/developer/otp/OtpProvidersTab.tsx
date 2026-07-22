"use client";

import { useState } from "react";
import type { CatalogProvider, ProviderConfig } from "./types";
import OtpProviderCard from "./OtpProviderCard";
import OtpProviderForm from "./OtpProviderForm";

const CHANNEL_LABELS: Record<string, string> = { SMS: "SMS", WHATSAPP: "WhatsApp", EMAIL: "Email" };

export default function OtpProvidersTab({
  catalog,
  providers,
  onChanged,
}: {
  catalog: CatalogProvider[];
  providers: ProviderConfig[];
  onChanged: () => void;
}) {
  const [addingChannel, setAddingChannel] = useState<"SMS" | "WHATSAPP" | "EMAIL" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {(["SMS", "WHATSAPP", "EMAIL"] as const).map((channel) => {
        const channelProviders = providers.filter((p) => p.channel === channel);
        const primary = channelProviders.filter((p) => p.chainRole === "PRIMARY");
        const backups = channelProviders.filter((p) => p.chainRole === "BACKUP").sort((a, b) => a.priority - b.priority);

        return (
          <div key={channel}>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">{CHANNEL_LABELS[channel]}</h2>
              <button
                onClick={() => setAddingChannel(channel)}
                className="rounded-lg border border-emerald-700 px-3 py-1.5 text-sm font-medium text-emerald-400 hover:bg-emerald-950"
              >
                + Add {CHANNEL_LABELS[channel]} provider
              </button>
            </div>

            {addingChannel === channel && (
              <OtpProviderForm
                catalog={catalog}
                channel={channel}
                onSaved={() => {
                  setAddingChannel(null);
                  onChanged();
                }}
                onCancel={() => setAddingChannel(null)}
              />
            )}

            {channelProviders.length === 0 && addingChannel !== channel ? (
              <p className="mt-3 text-sm text-gray-500">No {CHANNEL_LABELS[channel].toLowerCase()} provider configured yet.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {[...primary, ...backups].map((provider) =>
                  editingId === provider.id ? (
                    <OtpProviderForm
                      key={provider.id}
                      catalog={catalog}
                      channel={channel}
                      existing={provider}
                      onSaved={() => {
                        setEditingId(null);
                        onChanged();
                      }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <OtpProviderCard key={provider.id} provider={provider} onChanged={onChanged} onEdit={() => setEditingId(provider.id)} />
                  )
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
