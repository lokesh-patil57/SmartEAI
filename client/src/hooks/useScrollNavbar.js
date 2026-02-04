import { useEffect } from "react";

export function useScrollNavbar() {
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
