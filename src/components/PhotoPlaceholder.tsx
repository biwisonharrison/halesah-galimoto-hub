import { gradientForSeed } from "@/lib/colorHash";

export default function PhotoPlaceholder({ seed, label }: { seed: string; label: string }) {
  const gradient = gradientForSeed(seed);
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient} px-3 text-center text-sm font-medium text-white/90`}
    >
      {label}
    </div>
  );
}
