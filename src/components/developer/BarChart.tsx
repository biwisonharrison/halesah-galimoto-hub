export default function BarChart({
  data,
  height = 160,
  color = "#34d399",
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div>
      <div className="flex items-end gap-1.5" style={{ height }}>
        {data.map((d) => (
          <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1">
            <span className="text-[10px] text-gray-500">{d.value}</span>
            <div
              className="w-full rounded-t"
              style={{ height: `${(d.value / max) * (height - 30)}px`, backgroundColor: color, minHeight: d.value > 0 ? 2 : 0 }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1.5 flex gap-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex-1 text-center text-[10px] text-gray-500">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
