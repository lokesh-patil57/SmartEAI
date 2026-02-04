import { useEffect } from "react";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50
        rounded-md px-4 py-3 text-sm shadow-lg
        animate-toast
        ${
          type === "success"
            ? "bg-sky-600 text-white"
            : "bg-red-500 text-white"
        }
      `}
    >
      {message}
    </div>
  );
}
