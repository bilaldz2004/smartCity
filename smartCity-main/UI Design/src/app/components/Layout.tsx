import { Outlet, Link, useLocation } from "react-router";
import { Menu, X, Lock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/report", label: "Report a Problem" },
    { path: "/explore", label: "Explore Reports" },
    { path: "/my-reports", label: "My Reports" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900 opacity-0 group-hover:opacity-20 blur-xl rounded-full transition-opacity"></div>
              </div>
              <img 
                src="logo.png" 
                alt="logo" 
                className="w-35 h-55 object-contain"
               />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isLocked = link.path === '/my-reports' && !isAuthenticated();
                return (
                  <Link
                    key={link.path}
                    to={isLocked ? '/login' : link.path}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all flex items-center gap-2 ${
                      location.pathname === link.path
                        ? "text-indigo-700 bg-indigo-50"
                        : isLocked
                        ? "text-slate-400 hover:text-slate-600"
                        : "text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                    }`}
                    title={isLocked ? 'Login required' : ''}
                  >
                    {link.label}
                    {isLocked && <Lock size={14} />}
                  </Link>
                );
              })}
            </div>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated() ? (
                <>
                  <Link
                    to={user?.role === 'admin' ? '/admin' : user?.role === 'worker' ? '/worker' : '/dashboard'}
                    className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={logout}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-xl hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-900/20"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-xl hover:from-slate-800 hover:via-blue-800 hover:to-indigo-800 transition-all shadow-lg shadow-indigo-900/20"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-5 border-t border-slate-200 bg-white/95 backdrop-blur-xl">
              <div className="flex flex-col space-y-2">
                {navLinks.map((link) => {
                  const isLocked = link.path === '/my-reports' && !isAuthenticated();
                  return (
                    <Link
                      key={link.path}
                      to={isLocked ? '/login' : link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`px-4 py-3 text-sm font-semibold rounded-xl transition-all flex items-center gap-2 ${
                        location.pathname === link.path
                          ? "text-indigo-700 bg-indigo-50"
                          : isLocked
                          ? "text-slate-400"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      {link.label}
                      {isLocked && <Lock size={14} />}
                    </Link>
                  );
                })}
                <div className="pt-3 border-t border-slate-200 space-y-2 mt-2">
                  {isAuthenticated() ? (
                    <>
                      <Link
                        to={user?.role === 'admin' ? '/admin' : user?.role === 'worker' ? '/worker' : '/dashboard'}
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-sm font-semibold text-center text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-xl shadow-lg"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-sm font-semibold text-center text-slate-700 border-2 border-slate-200 rounded-xl hover:bg-slate-50"
                      >
                        Login
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full px-4 py-3 text-sm font-semibold text-center text-white bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-xl shadow-lg"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white mt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-15 h-15 bg-gradient-to-br from-white/100 to-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10">
                  <img src="logo_icone.png" alt="icone" className="w-11 h-13"/>
                </div>
                <span className="text-2xl font-bold text-white">
                  UrbanFix
                </span>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                Making cities better, one report at a time. Report urban problems easily and help improve your community through civic engagement.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link to="/report" className="text-sm text-slate-300 hover:text-white transition-colors">Report Problem</Link></li>
                <li><Link to="/explore" className="text-sm text-slate-300 hover:text-white transition-colors">Explore Reports</Link></li>
                <li><Link to="/my-reports" className="text-sm text-slate-300 hover:text-white transition-colors">My Reports</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-white mb-4">Support</h3>
              <ul className="space-y-3">
                <li><Link to="/help" className="text-sm text-slate-300 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="text-sm text-slate-300 hover:text-white transition-colors">Contact Us</Link></li>
                <li><Link to="/privacy" className="text-sm text-slate-300 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-slate-400">
            © 2026 UrbanFix. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
