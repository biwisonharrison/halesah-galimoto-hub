import { gradientForSeed } from "@/lib/colorHash";

const BODY_FILL = "rgba(255,255,255,0.94)";
const GLASS_FILL = "rgba(15,23,42,0.32)";
const WHEEL_FILL = "rgba(15,23,42,0.8)";
const HUB_FILL = "rgba(255,255,255,0.65)";

function Wheel({ cx }: { cx: number }) {
  return (
    <>
      <circle cx={cx} cy={90} r={15} fill={WHEEL_FILL} />
      <circle cx={cx} cy={90} r={6} fill={HUB_FILL} />
    </>
  );
}

function CarBody({ bodyType }: { bodyType: string | null | undefined }) {
  switch (bodyType) {
    case "HATCHBACK":
      return (
        <>
          <path d="M30,76 Q30,60 46,60 L82,60 L98,38 L152,38 L166,60 L196,60 Q210,60 210,76 L210,80 L30,80 Z" fill={BODY_FILL} />
          <path d="M100,40 L92,58 L150,58 L146,40 Z" fill={GLASS_FILL} />
          <Wheel cx={68} />
          <Wheel cx={172} />
        </>
      );
    case "SUV":
      return (
        <>
          <path d="M26,76 Q26,52 44,52 L72,52 L86,32 L160,32 L176,52 L200,52 Q216,52 216,76 L216,80 L26,80 Z" fill={BODY_FILL} />
          <path d="M88,34 L78,50 L168,50 L160,34 Z" fill={GLASS_FILL} />
          <Wheel cx={66} />
          <Wheel cx={176} />
        </>
      );
    case "VAN":
    case "MINIBUS":
      return (
        <>
          <path d="M24,76 Q24,34 42,34 L198,34 Q216,34 216,76 L216,80 L24,80 Z" fill={BODY_FILL} />
          <path d="M40,38 L38,52 L64,52 L64,38 Z" fill={GLASS_FILL} />
          <path d="M74,38 L74,52 L108,52 L108,38 Z" fill={GLASS_FILL} />
          <path d="M118,38 L118,52 L152,52 L152,38 Z" fill={GLASS_FILL} />
          <path d="M162,38 L162,52 L196,52 L196,38 Z" fill={GLASS_FILL} />
          <Wheel cx={62} />
          <Wheel cx={178} />
        </>
      );
    case "PICKUP":
      return (
        <>
          <path d="M28,76 Q28,54 44,54 L64,54 L78,36 L128,36 L128,66 L206,66 Q214,66 214,76 L214,80 L28,80 Z" fill={BODY_FILL} />
          <path d="M80,38 L70,52 L124,52 L124,38 Z" fill={GLASS_FILL} />
          <rect x={134} y={54} width={64} height={12} fill={GLASS_FILL} rx={2} />
          <Wheel cx={64} />
          <Wheel cx={182} />
        </>
      );
    case "TRUCK":
      return (
        <>
          <path d="M26,76 Q26,50 42,50 L60,50 L72,34 L108,34 L108,52 L114,52 L114,44 Q114,36 122,36 L196,36 Q210,36 210,50 L210,76 L210,80 L26,80 Z" fill={BODY_FILL} />
          <path d="M74,36 L64,48 L104,48 L104,36 Z" fill={GLASS_FILL} />
          <Wheel cx={60} />
          <Wheel cx={110} />
          <Wheel cx={186} />
        </>
      );
    case "MOTORCYCLE":
      return (
        <>
          <path
            d="M52,90 L74,58 L104,58 L112,72 L146,72 Q158,72 162,62 L172,62"
            fill="none"
            stroke={BODY_FILL}
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M96,50 L118,50 L114,58 L100,58 Z" fill={BODY_FILL} />
          <Wheel cx={52} />
          <Wheel cx={172} />
        </>
      );
    case "COUPE":
      return (
        <>
          <path d="M32,76 Q32,62 48,62 L88,62 L104,42 L146,42 L164,62 L192,62 Q206,62 206,76 L206,80 L32,80 Z" fill={BODY_FILL} />
          <path d="M106,44 L94,60 L152,60 L146,44 Z" fill={GLASS_FILL} />
          <Wheel cx={68} />
          <Wheel cx={172} />
        </>
      );
    case "WAGON":
      return (
        <>
          <path d="M28,76 Q28,58 44,58 L70,58 L86,40 L150,40 L162,58 L198,58 Q212,58 212,76 L212,80 L28,80 Z" fill={BODY_FILL} />
          <path d="M88,42 L78,56 L156,56 L150,42 Z" fill={GLASS_FILL} />
          <Wheel cx={64} />
          <Wheel cx={178} />
        </>
      );
    case "SEDAN":
    default:
      return (
        <>
          <path d="M30,76 Q30,60 46,60 L76,60 L92,40 L148,40 L166,60 L204,60 Q214,60 214,76 L214,80 L30,80 Z" fill={BODY_FILL} />
          <path d="M94,42 L82,58 L152,58 L146,42 Z" fill={GLASS_FILL} />
          <Wheel cx={68} />
          <Wheel cx={178} />
        </>
      );
  }
}

export default function CarIllustration({
  bodyType,
  seed,
  label,
}: {
  bodyType: string | null | undefined;
  seed: string;
  label?: string;
}) {
  const gradient = gradientForSeed(seed);
  return (
    <div className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br ${gradient} px-3 py-4`}>
      <svg viewBox="0 0 240 120" className="h-auto w-full max-w-[220px]" role="img" aria-label={label ?? "Car illustration"}>
        <ellipse cx={120} cy={100} rx={92} ry={7} fill="rgba(0,0,0,0.15)" />
        <CarBody bodyType={bodyType} />
      </svg>
      {label && <p className="text-center text-sm font-medium text-white/90">{label}</p>}
    </div>
  );
}
