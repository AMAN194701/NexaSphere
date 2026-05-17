export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ✅ Fix: flex-col on mobile, flex-row on md+ */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

          <div className="flex-shrink-0">
            <span className="font-bold text-lg text-gray-900">NexaSphere</span>
            <p className="mt-1 text-sm text-gray-500">© 2026 NexaSphere Inc.</p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Privacy</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Terms</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Blog</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-900">Careers</a>
          </div>

        </div>
      </div>
    </footer>
  );
}