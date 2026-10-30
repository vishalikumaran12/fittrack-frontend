
export default function StatCard({
  title,
  value,
  unit,
  description,
  icon,
  color,
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">
          {title}
        </p>

        <div className={`rounded-xl p-3 ${color}`}>
          {icon}
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-2">
        <h2 className="text-2xl font-bold text-gray-900">
          {value}
        </h2>
        <span className="text-sm text-gray-500">{unit}</span>
      </div>

      <p className="mt-2 text-xs text-gray-500">
        {description}
      </p>
    </div>
  );
}
