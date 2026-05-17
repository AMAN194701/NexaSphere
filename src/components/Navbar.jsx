import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 font-bold text-xl">NexaSphere</div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Home</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact</a>
            <button className="bg-black text-white text-sm px-4 py-2 rounded-lg hover:bg-gray-800">
              Get Started
            </button>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 flex flex-col gap-3">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Home</a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Features</a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Pricing</a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact</a>
          <button className="bg-black text-white text-sm px-4 py-2 rounded-lg w-full">
            Get Started
          </button>
        </div>
      )}
    </nav>
  );
}