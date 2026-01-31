import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";

import { useEffect } from "react";

/* 🔹 Scroll-aware navbar (no Navbar edits needed) */
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

/* 🔹 Layout wrapper */
function AppLayout({ children }) {
  const location = useLocation();
  useScrollNavbar();

  /* Routes where navbar/footer should be hidden */
  const hideNavbarRoutes = ["/login"];
  const hideFooterRoutes = ["/editor"];

  const hideNavbar = hideNavbarRoutes.includes(location.pathname);
  const hideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
      {!hideFooter && <Footer />}
    </>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout>
            <Landing />
          </AppLayout>
        }
      />

      <Route
        path="/home"
        element={
          <AppLayout>
            <Home />
          </AppLayout>
        }
      />

      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />

      <Route
        path="/editor"
        element={
          <AppLayout>
            <Editor />
          </AppLayout>
        }
      />

      {/* future */}
      {/* <Route path="/login" element={<Login />} /> */}
    </Routes>
  );
}

export default App;
