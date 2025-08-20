import { Stethoscope } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full p-4 border-b border-border bg-background">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <div className="h-10 w-10 bg-primary/10 text-primary flex items-center justify-center rounded-lg">
          <Stethoscope className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">PainDrain</h1>
      </div>
    </header>
  );
}
