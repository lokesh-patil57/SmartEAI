import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import logo from "../assets/logoName.png";

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [hoveredButton, setHoveredButton] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Resume", path: "/resume" },
    { name: "Applications", path: "/applications" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-md border-b border-white/40">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between relative">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 z-50">
          <img src={logo} alt="SmartEAI Logo" className="w-9 h-9" />
          <span className="text-3xl font-bold text-slate-900">
            Smart<span className="text-sky-600">EAI</span>
          </span>
        </Link>

        {/* Center Navigation (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-white/60 backdrop-blur-md px-3 py-2 rounded-full border border-white/40 absolute left-1/2 -translate-x-1/2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const isHovered = hoveredButton === item.name;
            const highlight = isHovered || isActive;

            return (
              <Link
                key={item.name}
                to={item.path}
                onMouseEnter={() => setHoveredButton(item.name)}
                onMouseLeave={() => setHoveredButton(null)}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all duration-300
                  ${
                    highlight
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                      : "text-slate-700 hover:text-slate-900"
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 ml-auto">
          <Link
            to="/login"
            className="hidden sm:inline-block px-5 py-2 text-sm font-semibold rounded-full
              border border-sky-500 text-sky-600
              hover:bg-gradient-to-r hover:from-sky-500 hover:to-blue-600 hover:text-white
              transition-all duration-300"
          >
            Login
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-md border-t py-4">
            <div className="flex flex-col space-y-2 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-base font-medium transition
                    ${
                      currentPath === item.path
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  {item.name}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-3 rounded-lg text-base font-semibold
                  border border-sky-500 text-sky-600
                  hover:bg-gradient-to-r hover:from-sky-500 hover:to-blue-600 hover:text-white
                  transition text-center"
              >
                Login
              </Link>
            </div>
          </div>
        )}

      </nav>
    </header>
  );
};

export default Navbar;
