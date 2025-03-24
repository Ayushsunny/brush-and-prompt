
import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CanvasProps {
  imageUrl: string | null;
  onSelectionChange: (selection: ImageData | null) => void;
  className?: string;
}

const Canvas: React.FC<CanvasProps> = ({ 
  imageUrl, 
  onSelectionChange,
  className 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [selectionMode, setSelectionMode] = useState<"add" | "subtract">("add");
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [selectionLayer, setSelectionLayer] = useState<ImageData | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });

  // Initialize canvas context
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    
    if (context) {
      setCtx(context);
    }
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setCanvasSize({ width, height });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Load image when URL changes
  useEffect(() => {
    if (!imageUrl || !ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      setImage(img);
      
      // Calculate scale to fit image in canvas
      if (canvasRef.current && containerRef.current) {
        const containerWidth = containerRef.current.clientWidth;
        const containerHeight = containerRef.current.clientHeight;
        
        const imgAspect = img.width / img.height;
        const containerAspect = containerWidth / containerHeight;
        
        let newWidth, newHeight;
        
        if (imgAspect > containerAspect) {
          // Image is wider than container (relative to their heights)
          newWidth = containerWidth;
          newHeight = containerWidth / imgAspect;
        } else {
          // Image is taller than container (relative to their widths)
          newHeight = containerHeight;
          newWidth = containerHeight * imgAspect;
        }
        
        // Set canvas dimensions to match scaled image
        canvasRef.current.width = newWidth;
        canvasRef.current.height = newHeight;
        
        // Calculate scale factor
        const newScale = newWidth / img.width;
        setScale(newScale);
        
        // Draw image
        ctx.clearRect(0, 0, newWidth, newHeight);
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Initialize selection layer
        const newSelectionLayer = ctx.createImageData(newWidth, newHeight);
        setSelectionLayer(newSelectionLayer);
        
        toast.success("Image loaded successfully");
      }
    };
    
    img.onerror = () => {
      toast.error("Failed to load image");
    };
    
    img.src = imageUrl;
  }, [imageUrl, ctx, canvasSize]);

  // Draw function for brush
  const draw = (x: number, y: number) => {
    if (!ctx || !selectionLayer) return;
    
    // Create a temporary canvas for the brush stroke
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvasRef.current?.width || 0;
    tempCanvas.height = canvasRef.current?.height || 0;
    const tempCtx = tempCanvas.getContext("2d");
    
    if (!tempCtx) return;
    
    // Copy the current selection layer to the temp canvas
    tempCtx.putImageData(selectionLayer, 0, 0);
    
    // Set drawing style based on mode
    tempCtx.globalCompositeOperation = selectionMode === "add" ? "source-over" : "destination-out";
    
    // Draw the brush stroke
    tempCtx.beginPath();
    tempCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    tempCtx.fillStyle = "rgba(65, 105, 225, 0.5)";
    tempCtx.fill();
    
    // Get the updated selection layer
    const newSelectionLayer = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    setSelectionLayer(newSelectionLayer);
    
    // Redraw everything
    redraw();
    
    // Notify parent component of selection change
    onSelectionChange(newSelectionLayer);
  };

  // Redraw the canvas with the image and selection
  const redraw = () => {
    if (!ctx || !image || !canvasRef.current || !selectionLayer) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw the image
    ctx.drawImage(image, 0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Draw the selection overlay
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.putImageData(selectionLayer, 0, 0);
    ctx.restore();
  };

  // Mouse event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    setIsDrawing(true);
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setLastPos({ x, y });
    draw(x, y);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate the distance between the last and current position
    const dist = Math.sqrt((x - lastPos.x) ** 2 + (y - lastPos.y) ** 2);
    
    // If the distance is greater than the brush size, interpolate points
    if (dist > brushSize / 4) {
      const steps = Math.ceil(dist / (brushSize / 4));
      
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const interpX = lastPos.x + (x - lastPos.x) * t;
        const interpY = lastPos.y + (y - lastPos.y) * t;
        
        draw(interpX, interpY);
      }
    } else {
      draw(x, y);
    }
    
    setLastPos({ x, y });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleMouseLeave = () => {
    setIsDrawing(false);
  };

  // Handle brush size change
  const handleBrushSizeChange = (size: number) => {
    setBrushSize(size);
  };

  // Handle selection mode change
  const handleSelectionModeChange = (mode: "add" | "subtract") => {
    setSelectionMode(mode);
  };

  // Clear selection
  const clearSelection = () => {
    if (!ctx || !canvasRef.current) return;
    
    const width = canvasRef.current.width;
    const height = canvasRef.current.height;
    
    const newSelectionLayer = ctx.createImageData(width, height);
    setSelectionLayer(newSelectionLayer);
    
    // Redraw
    redraw();
    
    // Notify parent component
    onSelectionChange(null);
    
    toast.info("Selection cleared");
  };

  return (
    <div className={cn("relative flex flex-col", className)}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Brush Size:</span>
            <input
              type="range"
              min="5"
              max="100"
              value={brushSize}
              onChange={(e) => handleBrushSizeChange(parseInt(e.target.value))}
              className="w-24"
            />
            <span className="text-sm">{brushSize}px</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Mode:</span>
            <div className="flex items-center bg-secondary rounded-md p-1">
              <button
                onClick={() => handleSelectionModeChange("add")}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  selectionMode === "add" 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-muted-foreground hover:bg-white/50"
                )}
              >
                Add
              </button>
              <button
                onClick={() => handleSelectionModeChange("subtract")}
                className={cn(
                  "px-3 py-1 text-xs rounded-md transition-colors",
                  selectionMode === "subtract" 
                    ? "bg-white shadow-sm text-primary" 
                    : "text-muted-foreground hover:bg-white/50"
                )}
              >
                Erase
              </button>
            </div>
          </div>
        </div>
        
        <button
          onClick={clearSelection}
          className="text-xs px-3 py-1 bg-muted text-muted-foreground rounded-md hover:bg-muted/80 transition-colors"
        >
          Clear Selection
        </button>
      </div>
      
      <div 
        ref={containerRef}
        className="relative border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden w-full h-[500px]"
      >
        {imageUrl ? (
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            className="max-w-full max-h-full"
            style={{
              cursor: "crosshair",
            }}
          />
        ) : (
          <div className="text-muted-foreground text-center">
            <p>Upload an image to begin</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Canvas;
