import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ThemeProvider } from "./contexts/ThemeContext";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Resume from "./pages/Resume";
import Applications from "./pages/Applications";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Match from "./pages/Match";
import Profile from "./pages/Profile";
import Restructure from "./pages/Restructure";

import { ProtectedRoute, GuestRoute } from "./components/auth/ProtectedRoute";

/* Scroll-aware navbar */
function useScrollNavbar() {
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 20) {
        document.body.classList.add("navbar-scrolled");
      } else {
        document.body.classList.remove("navbar-scrolled");
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

/* Layout wrapper */
function AppLayout({ children }) {
  const location = useLocation();
  useScrollNavbar();

  const path = location.pathname;

  /* Navbar visibility rules */
  const hideNavbarRoutes = ["/login", "/signup"];
  const hideFooterRoutes = ["/editor"];

  const hideNavbar = hideNavbarRoutes.includes(path);
  const hideFooter = hideFooterRoutes.includes(path);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="smarteai-ui-theme">
      <Routes>
        {/* Guest Routes - Only accessible when NOT logged in */}
        <Route
          path="/login"
          element={
            <GuestRoute>
              <AppLayout>
                <Login />
              </AppLayout>
            </GuestRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <GuestRoute>
              <AppLayout>
                <Signup />
              </AppLayout>
            </GuestRoute>
          }
        />

        {/* Landing - Public; logged-in users can still see or redirect to /home */}
        <Route
          path="/"
          element={
            <AppLayout>
              <Landing />
            </AppLayout>
          }
        />

        {/* Protected Routes - Require authentication */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Home />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/resume"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Resume />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/match"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Match />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/restructure"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Restructure />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Applications />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/editor"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Editor />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all route - redirect to home */}
        <Route
          path="*"
          element={
            <AppLayout>
              <Landing />
            </AppLayout>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}
