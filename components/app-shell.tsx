import { Sidebar } from "./sidebar";
import { TopProgressBar } from "./top-progress-bar";
import { ThemeToggle } from "./theme-toggle";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopProgressBar />
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="text-sm font-medium text-muted-foreground">
            Sentinel Migration Assistant
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-muted-foreground sm:inline">
              No tenant IDs or secrets are stored
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main className="min-w-0 flex-1 px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
