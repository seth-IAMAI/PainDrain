import { Stethoscope } from 'lucide-react';

export function Header() {
  return (
    <header className="w-full p-4 border-b border-border bg-card shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <Stethoscope className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-primary font-headline tracking-tight">PainScribe</h1>
      </div>
    </header>
  );
}
