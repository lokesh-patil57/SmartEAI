import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { Menu, X, User, LogOut, Settings, UserCircle, Sun, Moon, Laptop } from "lucide-react";
import logo from "../assets/logoName.png";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../contexts/ThemeContext";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

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

  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const ThemeIcon = () => {
    if (theme === 'light') return <Sun size={20} className="text-amber-500" />;
    if (theme === 'dark') return <Moon size={20} className="text-indigo-400" />;
    return <Laptop size={20} className="text-slate-500 dark:text-slate-400" />;
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-white/40 dark:border-slate-800/40 transition-colors duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between relative">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 z-50">
          <img
            src={logo}
            alt="SmartEAI Logo"
            className="w-9 h-9 dark:invert dark:brightness-200 transition-all duration-300"
          />
          <span className="text-xl font-bold text-slate-900 dark:text-white transition-colors">
            Smart<span className="text-sky-600 dark:text-sky-400">EAI</span>
          </span>
        </Link>

        {/* Center Navigation (Desktop) */}
        <div className="hidden lg:flex items-center gap-1 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-3 py-2 rounded-full border border-white/40 dark:border-slate-800 absolute left-1/2 -translate-x-1/2 transition-all duration-300">
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
                className={`px-3 py-1 text-[13px] font-medium rounded-full transition-all duration-300
                  ${highlight
                    ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/20"
                    : "text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-3 ml-auto">

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-transparent dark:border-slate-700"
            title={`Current Theme: ${theme}`}
          >
            <ThemeIcon />
          </button>

          {!isLoggedIn ? (
            /* Login & Sign up on Landing Navbar */
            <div className="hidden sm:flex items-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full
                  border border-sky-500 text-sky-600 dark:text-sky-400 dark:border-sky-400
                  hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-all duration-300"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-full
                  bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30
                  hover:from-sky-600 hover:to-blue-700 hover:shadow-sky-600/40 transition-all duration-300"
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
                  bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/20
                  hover:from-sky-600 hover:to-blue-700 transition-all duration-300 border border-transparent"
              >
                <User size={18} />
                <span className="text-sm font-medium">User</span>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-800 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300
                      hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-[#2369EB] dark:hover:text-sky-400 transition-colors"
                  >
                    <UserCircle size={16} />
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300
                      hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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
            className="lg:hidden p-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 py-4 shadow-xl">
            <div className="flex flex-col space-y-2 px-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition
                    ${currentPath === item.path
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                    className="px-4 py-3 rounded-lg text-sm font-semibold
                      border border-sky-500 text-sky-600 dark:text-sky-400 dark:border-sky-400
                      hover:bg-sky-50 dark:hover:bg-sky-950/30 transition text-center"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-semibold
                      bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/30
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
                    className="px-4 py-3 rounded-lg text-sm font-semibold
                      border border-sky-500 text-sky-600 dark:text-sky-400 dark:border-sky-400
                      hover:bg-sky-50 dark:hover:bg-sky-950/30 transition text-center flex items-center justify-center gap-2"
                  >
                    <UserCircle size={18} />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-3 rounded-lg text-sm font-semibold
                      border border-red-500 text-red-600 dark:text-red-400 dark:border-red-400
                      hover:bg-red-500 hover:text-white dark:hover:bg-red-500/20
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
