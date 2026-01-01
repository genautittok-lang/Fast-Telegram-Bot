import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6 animate-pulse">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      
      <h1 className="text-4xl font-display font-bold text-white mb-2">404</h1>
      <p className="text-muted-foreground font-mono mb-8">System Error: Route not found</p>
      
      <Link href="/" className="px-6 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground font-medium transition-colors font-mono text-sm">
        Return to Base
      </Link>
    </div>
  );
}
