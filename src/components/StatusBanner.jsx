const tones = {
  blue: "border-sky-200 bg-sky-50 text-sky-900",
  green: "border-emerald-200 bg-emerald-50 text-emerald-900",
  amber: "border-amber-200 bg-amber-50 text-amber-900",
  red: "border-red-200 bg-red-50 text-red-900",
};

export default function StatusBanner({ children, icon: Icon, tone = "blue" }) {
  return (
    <div className={`flex gap-3 rounded-md border px-4 py-3 ${tones[tone]}`}>
      {Icon ? <Icon className="mt-0.5 h-5 w-5 shrink-0" /> : null}
      <div className="text-sm leading-6">{children}</div>
    </div>
  );
}
