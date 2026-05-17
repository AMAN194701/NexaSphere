export default function Hero() {
  return (
    <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900">
          Welcome to NexaSphere
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-gray-500 max-w-2xl mx-auto">
          The platform that powers your next big idea.
        </p>

        {/* ✅ Fix: flex-col on mobile, flex-row on sm+ */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button className="w-full sm:w-auto bg-black text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
            Get Started Free
          </button>
          <button className="w-full sm:w-auto border border-gray-300 text-gray-700 px-6 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
            See How It Works
          </button>
        </div>
      </div>
    </section>
  );
}