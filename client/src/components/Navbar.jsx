import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu, X, User, LogOut, Settings, UserCircle } from "lucide-react";
import logo from "../assets/logoName.png";
import { useAuth } from "../hooks/useAuth";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const currentPath = location.pathname;
  const [hoveredButton, setHoveredButton] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Show all items when logged in, only Home when logged out
  const navItems = isLoggedIn
    ? [
        { name: "Home", path: "/home" },
        { name: "Dashboard", path: "/dashboard" },
        { name: "Match", path: "/match" },
        { name: "Resume", path: "/resume" },
        { name: "Applications", path: "/applications" },
      ]
    : [{ name: "Home", path: "/" }];

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout handler
  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate("/");
  };

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
          {!isLoggedIn ? (
            /* Login & Sign up on Landing Navbar */
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full
                  border border-sky-500 text-sky-600
                  hover:bg-sky-50 transition-all duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full
                  bg-gradient-to-r from-sky-500 to-blue-600 text-white
                  hover:from-sky-600 hover:to-blue-700 transition-all duration-300"
              >
                Sign up
              </Link>
            </div>
          ) : (
            /* User Menu (when logged in) */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full
                  bg-gradient-to-r from-sky-500 to-blue-600 text-white
                  hover:from-sky-600 hover:to-blue-700 transition-all duration-300"
              >
                <User size={18} />
                <span className="text-sm font-medium">User</span>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700
                      hover:bg-slate-50 hover:text-[#2369EB] transition-colors"
                  >
                    <UserCircle size={16} />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700
                      hover:bg-slate-50 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}

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

              {/* Mobile Login / Sign up / Profile / Logout */}
              {!isLoggedIn ? (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-base font-semibold
                      border border-sky-500 text-sky-600
                      hover:bg-sky-50 transition text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-base font-semibold
                      bg-gradient-to-r from-sky-500 to-blue-600 text-white
                      hover:from-sky-600 hover:to-blue-700 transition text-center"
                  >
                    Sign up
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-base font-semibold
                      border border-sky-500 text-sky-600
                      hover:bg-sky-50 transition text-center flex items-center justify-center gap-2"
                  >
                    <UserCircle size={18} />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-lg text-base font-semibold
                      border border-red-500 text-red-600
                      hover:bg-red-500 hover:text-white
                      transition text-center"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}

      </nav>
    </header>
  );
};

export default Navbar;
