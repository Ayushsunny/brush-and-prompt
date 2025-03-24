
import React, { useState, useEffect } from "react";
import { client } from "@gradio/client";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import Canvas from "@/components/editor/Canvas";
import EditorControls from "@/components/editor/EditorControls";
import { Button } from "@/components/ui/button";
import { Download, Sparkles, SplitSquareVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selection, setSelection] = useState<ImageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("SD1.5/DreamShaper.safetensors");
  const [steps, setSteps] = useState(20);
  const [cfg, setCfg] = useState(7.0);
  const [sampler, setSampler] = useState("euler_ancestral");
  const [scheduler, setScheduler] = useState("karras");
  const [seed, setSeed] = useState(-1);
  const [edgeStrength, setEdgeStrength] = useState(0.55);
  const [colorStrength, setColorStrength] = useState(0.55);
  const [inpaintStrength, setInpaintStrength] = useState(1.0);
  const [showSideBySide, setShowSideBySide] = useState(false);
  
  // Handle file upload
  const handleUpload = (file: File) => {
    const reader = new FileReader();
    
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setGeneratedImage(null);
    };
    
    reader.readAsDataURL(file);
    toast.success("Image uploaded successfully");
  };
  
  // Handle selection change from canvas
  const handleSelectionChange = (newSelection: ImageData | null) => {
    setSelection(newSelection);
  };
  
  // Base64 encode data URL
  const dataURLToBase64 = (dataURL: string) => {
    // Remove the data URL prefix and return the base64 part
    return dataURL.split(",")[1];
  };
  
  // Convert selection mask to base64
  const selectionToBase64 = (selection: ImageData): string => {
    const canvas = document.createElement("canvas");
    canvas.width = selection.width;
    canvas.height = selection.height;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    
    ctx.putImageData(selection, 0, 0);
    
    // Get the data URL and convert to base64
    return dataURLToBase64(canvas.toDataURL("image/png"));
  };
  
  // Handle generate image
  const handleGenerate = async () => {
    if (!uploadedImage || !prompt) {
      toast.error("Please upload an image and enter a prompt");
      return;
    }
    
    if (!selection) {
      toast.error("Please select an area using the brush tool");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Base64 encode the uploaded image and selection mask
      const base64Image = dataURLToBase64(uploadedImage);
      const base64Mask = selectionToBase64(selection);
      
      // Create a combined input for the API
      const apiInput = {
        x: prompt,
        ckpt_name: selectedModel,
        negative_prompt: negativePrompt,
        fine_edge: "enable",
        grow_size: 15,
        edge_strength: edgeStrength,
        color_strength: colorStrength,
        inpaint_strength: inpaintStrength,
        seed: seed,
        steps: steps,
        cfg: cfg,
        sampler_name: sampler,
        scheduler: scheduler,
        // Additional fields would go here if needed
      };
      
      console.log("API Input:", apiInput);
      
      // Connect to the Gradio client
      const gradioClient = await client("AI4Editing/MagicQuill");
      
      // Make the API request
      const result = await gradioClient.predict("/generate_image_handler", apiInput);
      
      console.log("API Result:", result);
      
      // Check if the result contains the generated image data
      if (result.data) {
        // Assuming the result.data is a base64 image or URL
        setGeneratedImage(`data:image/png;base64,${result.data}`);
        toast.success("Image generated successfully");
      } else {
        throw new Error("No image data returned from the API");
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle download generated image
  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = `brush-and-prompt-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("Image downloaded successfully");
  };
  
  // Toggle side-by-side view
  const toggleSideBySide = () => {
    setShowSideBySide(!showSideBySide);
  };
  
  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8 animate-fade-in">
        <div className="flex flex-col space-y-1 mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Image Editor</h1>
          <p className="text-muted-foreground">
            Upload an image, select an area with the brush, and transform it with a prompt
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Canvas and Controls */}
          <div className="space-y-8">
            <div className="glass-panel rounded-xl p-6 shadow-sm">
              <Canvas
                imageUrl={uploadedImage}
                onSelectionChange={handleSelectionChange}
                className="mb-6"
              />
            </div>
            
            <div className="glass-panel rounded-xl p-6 shadow-sm">
              <EditorControls
                onUpload={handleUpload}
                onGenerate={handleGenerate}
                prompt={prompt}
                setPrompt={setPrompt}
                negativePrompt={negativePrompt}
                setNegativePrompt={setNegativePrompt}
                isLoading={isLoading}
                isImageUploaded={!!uploadedImage}
                selectedModel={selectedModel}
                setSelectedModel={setSelectedModel}
                steps={steps}
                setSteps={setSteps}
                cfg={cfg}
                setCfg={setCfg}
                sampler={sampler}
                setSampler={setSampler}
                scheduler={scheduler}
                setScheduler={setScheduler}
                seed={seed}
                setSeed={setSeed}
                edgeStrength={edgeStrength}
                setEdgeStrength={setEdgeStrength}
                colorStrength={colorStrength}
                setColorStrength={setColorStrength}
                inpaintStrength={inpaintStrength}
                setInpaintStrength={setInpaintStrength}
              />
            </div>
          </div>
          
          {/* Right Column: Results */}
          <div className="glass-panel rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium">Result</h2>
              
              <div className="flex items-center space-x-2">
                {generatedImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownload}
                    className="glass-button"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
                
                {uploadedImage && generatedImage && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSideBySide}
                    className="glass-button"
                  >
                    <SplitSquareVertical className="h-4 w-4 mr-2" />
                    {showSideBySide ? "Show Result Only" : "Compare"}
                  </Button>
                )}
              </div>
            </div>
            
            <div className={cn(
              "border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-center overflow-hidden w-full h-[500px]",
              showSideBySide ? "flex-row" : "flex-col"
            )}>
              {showSideBySide && uploadedImage ? (
                <>
                  <div className="flex-1 h-full flex items-center justify-center p-4 border-r border-slate-200">
                    <img 
                      src={uploadedImage} 
                      alt="Original" 
                      className="max-w-full max-h-full object-contain rounded-md"
                    />
                  </div>
                  <div className="flex-1 h-full flex items-center justify-center p-4">
                    {generatedImage ? (
                      <img 
                        src={generatedImage} 
                        alt="Generated" 
                        className="max-w-full max-h-full object-contain rounded-md"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground flex flex-col items-center">
                        <Sparkles className="h-8 w-8 mb-2 text-slate-300 animate-pulse-soft" />
                        <p>Generated image will appear here</p>
                      </div>
                    )}
                  </div>
                </>
              ) : generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="Generated" 
                  className="max-w-full max-h-full object-contain rounded-md animate-scale-in"
                />
              ) : (
                <div className="text-center text-muted-foreground flex flex-col items-center">
                  <Sparkles className="h-16 w-16 mb-4 text-slate-300 animate-pulse-soft" />
                  <p className="text-lg">Generated image will appear here</p>
                  <p className="text-sm mt-2">
                    Select an area on your image and click "Generate"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
