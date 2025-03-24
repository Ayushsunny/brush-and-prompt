
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileWarning } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-slate-50 px-6">
      <div className="text-center max-w-md animate-fade-in">
        <div className="mx-auto w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <FileWarning className="h-10 w-10 text-slate-400" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
        
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="w-full sm:w-auto glass-button">
            <Link to="/">Go to Editor</Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full sm:w-auto glass-button">
            <Link to="/gallery">Browse Gallery</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
