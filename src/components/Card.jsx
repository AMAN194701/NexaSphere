export default function Card({ title, description, icon }) {
  return (
    // ✅ Fix: overflow-hidden prevents content bleed
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 hover:shadow-md transition-shadow">
      {icon && (
        <div className="mb-4 w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 text-gray-700">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-gray-900 truncate">{title}</h3>
      <p className="mt-2 text-sm text-gray-500 line-clamp-3">{description}</p>
    </div>
  );
}