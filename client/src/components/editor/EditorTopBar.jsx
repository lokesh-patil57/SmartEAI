import { Button } from "@/components/ui/button";

export default function EditorTopBar() {
  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
      <input
        className="text-sm font-medium text-foreground bg-transparent outline-none"
        placeholder="Untitled document"
      />

      <Button
        className="bg-[var(--primary-dark)] text-white hover:bg-[var(--primary-dark)]/90"
      >
        Export
      </Button>
    </header>
  );
}
