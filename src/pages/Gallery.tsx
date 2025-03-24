
import React, { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, Heart, Share2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Sample gallery images
const sampleImages = [
  {
    id: 1,
    title: "Mountain Landscape",
    prompt: "Transform mountains into a magical fantasy scene with glowing crystals and floating islands",
    originalUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    generatedUrl: "https://images.unsplash.com/photo-1520808663317-647b476a81b9",
    date: "2023-05-15",
    likes: 124,
  },
  {
    id: 2,
    title: "Urban Street",
    prompt: "Turn the city into a cyberpunk neon-lit futuristic metropolis",
    originalUrl: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b",
    generatedUrl: "https://images.unsplash.com/photo-1544726982-65ef36d249eb",
    date: "2023-05-12",
    likes: 89,
  },
  {
    id: 3,
    title: "Portrait",
    prompt: "Transform portrait into digital art with abstract geometric elements",
    originalUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    generatedUrl: "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb",
    date: "2023-05-08",
    likes: 56,
  },
  {
    id: 4,
    title: "Coffee Cup",
    prompt: "Make the coffee cup scene surreal with melting elements and vibrant colors",
    originalUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd",
    generatedUrl: "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb",
    date: "2023-05-01",
    likes: 42,
  }
];

interface GalleryItemProps {
  item: typeof sampleImages[0];
  showOriginal: boolean;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ item, showOriginal }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div 
      className="overflow-hidden rounded-lg bg-white shadow-md transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setShowDetails(true)}
      onMouseLeave={() => setShowDetails(false)}
    >
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={showOriginal ? item.originalUrl : item.generatedUrl} 
          alt={item.title}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        
        {/* Overlay with details */}
        <div 
          className={cn(
            "absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-4 flex flex-col justify-end text-white transition-opacity duration-300",
            showDetails ? "opacity-100" : "opacity-0"
          )}
        >
          <h3 className="text-lg font-medium mb-1">{item.title}</h3>
          <p className="text-sm text-white/80 line-clamp-2">{item.prompt}</p>
          
          <div className="flex justify-between items-center mt-3">
            <div className="text-xs text-white/70">{item.date}</div>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Heart 
                  className={cn(
                    "h-4 w-4 transition-colors", 
                    isLiked ? "fill-red-500 text-red-500" : "text-white"
                  )} 
                />
              </button>
              
              <button 
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Share2 className="h-4 w-4" />
              </button>
              
              <button 
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Gallery = () => {
  const [showOriginals, setShowOriginals] = useState(false);
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col space-y-1 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Gallery</h1>
          <p className="text-muted-foreground">
            Browse your previous creations and transformations
          </p>
        </div>
        
        <Tabs defaultValue="all" className="mb-8">
          <div className="flex justify-between items-center">
            <TabsList className="glass-panel">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOriginals(!showOriginals)}
              className="glass-button"
            >
              {showOriginals ? "Show Generated" : "Show Originals"}
            </Button>
          </div>
          
          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sampleImages.map((item) => (
                <GalleryItem 
                  key={item.id} 
                  item={item} 
                  showOriginal={showOriginals}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sampleImages.slice(0, 2).map((item) => (
                <GalleryItem 
                  key={item.id} 
                  item={item}
                  showOriginal={showOriginals}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="favorites" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {sampleImages.slice(1, 3).map((item) => (
                <GalleryItem 
                  key={item.id} 
                  item={item}
                  showOriginal={showOriginals}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Empty state - Will be shown when there are no images */}
        {false && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No images yet</h3>
            <p className="text-muted-foreground max-w-md">
              Your gallery is empty. Start creating amazing transformations in the editor to see them here.
            </p>
            <Button className="mt-6">Go to Editor</Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Gallery;
