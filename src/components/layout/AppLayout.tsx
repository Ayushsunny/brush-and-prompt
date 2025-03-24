
import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Brush, Sparkles, Github } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <Link 
            to="/" 
            className="flex items-center space-x-2 group animate-fade-in"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <Brush className="text-white w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-xl tracking-tight">Brush & Prompt</span>
              <span className="text-xs text-muted-foreground">AI-powered image editing</span>
            </div>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Editor
            </Link>
            <Link 
              to="/gallery" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
            >
              Gallery
            </Link>
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors flex items-center space-x-1"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </nav>
        </div>
      </header>
      
      <main className={cn("flex-1", className)}>
        {children}
      </main>
      
      <footer className="py-6 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary" />
              <span>Built with the MagicQuill API</span>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Brush & Prompt. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppLayout;
