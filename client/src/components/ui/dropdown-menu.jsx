import * as React from "react";

const DropdownContext = React.createContext(null);

/* ================= ROOT ================= */

export function DropdownMenu({ children, disabled = false }) {
  const [open, setOpen] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const menuRef = React.useRef(null);

  /* Outside click + ESC */
  React.useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }

    function handleKeyDown(e) {
      if (!open) return;

      if (e.key === "Escape") {
        setOpen(false);
        setActiveIndex(-1);
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => i + 1);
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      }

      if (e.key === "Enter") {
        const items = menuRef.current?.querySelectorAll("[data-item]");
        items?.[activeIndex]?.click();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, activeIndex]);

  return (
    <DropdownContext.Provider
      value={{
        open,
        setOpen,
        disabled,
        activeIndex,
        setActiveIndex,
      }}
    >
      <div ref={menuRef} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

/* ================= TRIGGER ================= */

export function DropdownMenuTrigger({ children }) {
  const { open, setOpen, disabled } = React.useContext(DropdownContext);
  const trigger = React.Children.only(children);

  return React.cloneElement(trigger, {
    disabled,
    onClick: (e) => {
      e.stopPropagation();
      if (disabled) return;
      setOpen(!open);
    },
  });
}

/* ================= CONTENT ================= */

export function DropdownMenuContent({ children, align = "end" }) {
  const { open } = React.useContext(DropdownContext);

  if (!open) return null;

  return (
    <div
      className={`
        absolute z-50 mt-2 min-w-[160px]
        rounded-md border border-slate-200
        bg-white shadow-lg
        animate-dropdown
        ${
          align === "end"
            ? "right-0 origin-top-right"
            : "left-0 origin-top-left"
        }
      `}
    >
      {children}
    </div>
  );
}

/* ================= ITEM ================= */

export function DropdownMenuItem({ children, onClick, disabled = false }) {
  const { setOpen, activeIndex, setActiveIndex } =
    React.useContext(DropdownContext);
  const indexRef = React.useRef(null);

  React.useEffect(() => {
    if (indexRef.current === activeIndex) {
      indexRef.current?.focus();
    }
  }, [activeIndex]);

  return (
    <button
      ref={(el) => (indexRef.current = el)}
      data-item
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (disabled) return;
        onClick?.();
        setOpen(false);
        setActiveIndex(-1);
      }}
      onMouseEnter={() => setActiveIndex(indexRef.current?.dataset?.index)}
      className={`
        w-full px-3 py-2 text-left text-sm
        transition
        ${
          disabled
            ? "text-slate-400 cursor-not-allowed"
            : "text-slate-700 hover:bg-slate-100 focus:bg-slate-100"
        }
        focus:outline-none
      `}
    >
      {children}
    </button>
  );
}
