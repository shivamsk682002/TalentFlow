import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

function RoleToggle() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 bg-blue-400/10 rounded px-2 py-1 font-medium">
        HR Portal
      </div>
    </div>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="w-full bg-white border-b border-blue-500/30 fixed z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Link
                to="/"
                className="text-xl font-bold text-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
              >
                TalentFlow
              </Link>
              <div className="hidden md:flex items-center gap-4 text-sm">
                <Link to="/jobs" className="hover:underline text-blue-900">
                  Jobs
                </Link>
                <Link to="/candidates" className="hover:underline text-blue-900">
                  Candidates
                </Link>
                <Link to="/about" className="hover:underline text-blue-900">
                  About
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <RoleToggle />
              <button
                className="md:hidden p-2 rounded hover:bg-blue-100"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-blue-200 shadow-sm">
            <div className="flex flex-col p-4 gap-3 text-sm">
              <Link
                to="/jobs"
                className="hover:underline text-blue-900"
                onClick={() => setMenuOpen(false)}
              >
                Jobs
              </Link>
              <Link
                to="/candidates"
                className="hover:underline text-blue-900"
                onClick={() => setMenuOpen(false)}
              >
                Candidates
              </Link>
              <Link
                to="/about"
                className="hover:underline text-blue-900"
                onClick={() => setMenuOpen(false)}
              >
                About
              </Link>
            </div>
          </div>
        )}
      </nav>
      <div className="h-16" />
    </>
  );
}
