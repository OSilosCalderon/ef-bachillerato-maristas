type ProgressBarProps = {
  value: number;
  label?: string;
  compact?: boolean;
};

export function ProgressBar({ value, label, compact = false }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      {label && (
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-slate-600">{label}</span>
          <span className="font-semibold text-slate-900">{safeValue}%</span>
        </div>
      )}
      <div className={`${compact ? "h-1.5" : "h-2.5"} overflow-hidden rounded-full bg-slate-100`}>
        <div className="h-full rounded-full bg-[#1e6b4f] transition-all" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
}
