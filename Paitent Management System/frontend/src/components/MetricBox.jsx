export default function MetricBox({ label, value, subtitle, tone = 'gray' }) {
  const toneStyles = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    cyan: 'bg-cyan-50 border-cyan-100 text-cyan-700',
    purple: 'bg-purple-50 border-purple-100 text-purple-700',
    sky: 'bg-sky-50 border-sky-100 text-sky-700',
    amber: 'bg-amber-50 border-amber-100 text-amber-700',
    rose: 'bg-rose-50 border-rose-100 text-rose-700',
    gray: 'bg-gray-50 border-gray-100 text-gray-700',
  };
  
  const colorClass = toneStyles[tone] || toneStyles.gray;
  
  return (
    <div className={`${colorClass} border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="text-slate-900 font-semibold text-lg">{value ?? '—'}</div>
      <div className="text-xs font-medium opacity-80">{label}</div>
      {subtitle && <div className="text-[10px] opacity-70 mt-0.5">{subtitle}</div>}
    </div>
  );
}
