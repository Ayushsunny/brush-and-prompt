import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import Canvas from "@/components/editor/Canvas";
import EditorControls from "@/components/editor/EditorControls";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, ArrowLeft, Sparkles, SplitSquareVertical } from "lucide-react";
import { cn } from "@/lib/utils";

// Define an interface for the API response
interface GradioResponse {
  data: string[];
  [key: string]: unknown;
}

const PROXY_API_URL = 'http://localhost:3000/api/process-image';

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selection, setSelection] = useState<ImageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState("SD1.5/realisticVisionV60B1_v51VAE.safetensors");
  const [steps, setSteps] = useState(20);
  const [cfg, setCfg] = useState(5.0);
  const [growSize, setGrowSize] = useState(15);
  const [sampler, setSampler] = useState("euler_ancestral");
  const [scheduler, setScheduler] = useState("karras");
  const [seed, setSeed] = useState(-1);
  const [edgeStrength, setEdgeStrength] = useState(0.55);
  const [colorStrength, setColorStrength] = useState(0.55);
  const [inpaintStrength, setInpaintStrength] = useState(1.0);
  const [showSideBySide, setShowSideBySide] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Update history when image changes
  useEffect(() => {
    if (generatedImage && !history.includes(generatedImage)) {
      const newHistory = [...history.slice(0, historyIndex + 1), generatedImage];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [generatedImage, history, historyIndex]);

  // Handle file upload
  const handleUpload = (file: File) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result as string;
      setUploadedImage(result);
      setGeneratedImage(null);

      // Reset selection and history when new image is uploaded
      setSelection(null);
      setHistory([]);
      setHistoryIndex(-1);
    };

    if (file.type.match('image.*')) {
      reader.readAsDataURL(file);
      toast.success("Image uploaded successfully");
    } else {
      toast.error("Please upload a valid image file");
    }
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
  const selectionToBase64 = (
    selection: ImageData,
    originalImageUrl: string,
    mimeType: string = "image/png"
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous"; // Ensure CORS is handled for data URLs
      img.onload = () => {
        console.log("Original image loaded for mask scaling:", img.width, "x", img.height);
        const origWidth = img.width;
        const origHeight = img.height;
        const scaledWidth = selection.width;
        const scaledHeight = selection.height;
        console.log("Scaled mask dimensions:", scaledWidth, "x", scaledHeight);
        console.log("Calculated scale factors: width =", origWidth / scaledWidth, ", height =", origHeight / scaledHeight);

        // Create an offscreen full-res canvas
        const offscreen = document.createElement("canvas");
        offscreen.width = origWidth;
        offscreen.height = origHeight;
        const offscreenCtx = offscreen.getContext("2d");
        if (!offscreenCtx) {
          console.error("Could not create offscreen canvas context");
          reject("Could not create offscreen context");
          return;
        }

        offscreenCtx.imageSmoothingEnabled = false;
        offscreenCtx.imageSmoothingQuality = "high";

        // Create a temporary canvas to hold the scaled mask
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = scaledWidth;
        tempCanvas.height = scaledHeight;
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) {
          console.error("Could not create temporary canvas context");
          reject("Could not create temporary context");
          return;
        }

        // Disable image smoothing in temp context
        tempCtx.imageSmoothingEnabled = false;
        tempCtx.imageSmoothingQuality = "high";

        tempCtx.putImageData(selection, 0, 0);
        console.log("Temporary canvas with mask drawn");

        // Upscale the mask to full original image resolution
        offscreenCtx.drawImage(
          tempCanvas,
          0,
          0,
          scaledWidth,
          scaledHeight,
          0,
          0,
          origWidth,
          origHeight
        );

        // Threshold alpha values to make a binary mask
        const imageData = offscreenCtx.getImageData(0, 0, origWidth, origHeight);
        const data = imageData.data;
        for (let i = 3; i < data.length; i += 4) {
          // Original: if drawn (alpha > 128) then 255, else 0.
          // Invert it: drawn area becomes 0 (to inpaint), and non-drawn becomes 255.
          const binary = data[i] > 128 ? 255 : 0;
          data[i] = 255 - binary;
        }
        offscreenCtx.putImageData(imageData, 0, 0);
        // document.body.appendChild(offscreen);
        console.log("Mask upscaled to original dimensions:", offscreen.width, "x", offscreen.height);

        const finalDataUrl = offscreen.toDataURL(mimeType);
        console.log("Final mask Data URL generated");
        resolve(finalDataUrl);
      };

      img.onerror = (e) => {
        console.error("Failed to load original image for mask scaling", originalImageUrl, e);
        reject("Failed to load original image in selectionToBase64");
      };

      img.src = originalImageUrl;
    });
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
      const uploadedMimeType = uploadedImage.startsWith("data:image/jpeg")
        ? "image/jpeg"
        : "image/png";

      console.log("Starting generation with uploadedMimeType:", uploadedMimeType);
      console.log("Selection dimensions:", selection.width, selection.height);
      // Use the async function to get properly sized mask
      const selectionDataUrl = await selectionToBase64(
        selection, uploadedImage, uploadedMimeType
      );

      const payload = {
        uploadedImage,
        selection: selectionDataUrl,
        prompt,
        negativePrompt,
        selectedModel,
        steps,
        cfg,
        growSize,
        sampler,
        scheduler,
        seed,
        edgeStrength,
        colorStrength,
        inpaintStrength
      };

      const response = await axios.post(PROXY_API_URL, payload);
      console.log("API Response:", JSON.stringify(response.data, null, 2));

      // Update the response handling in handleGenerate:
      if (response.data.success) {
        const receivedImage = response.data.generatedImage;

        if (typeof receivedImage === 'string') {
          if (receivedImage.startsWith('data:image')) {
            setGeneratedImage(receivedImage);
          } else {
            // Handle raw base64 string
            setGeneratedImage(`data:image/png;base64,${receivedImage}`);
          }
          toast.success("Image generated successfully");
        } else {
          console.error("Unexpected image format:", receivedImage);
          throw new Error("Server returned invalid image format");
        }
      }
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setGeneratedImage(history[historyIndex - 1]);
    }
  };

  // Handle redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setGeneratedImage(history[historyIndex + 1]);
    }
  };

  // Reset the current editing session
  const handleReset = () => {
    setGeneratedImage(null);
    setSelection(null);
    setPrompt("");
    setNegativePrompt("");
    toast.info("Editor reset");
  };

  // Use generated image as the source for further editing
  const handleUseGeneratedImage = () => {
    if (generatedImage) {
      setUploadedImage(generatedImage);
      setGeneratedImage(null);
      setSelection(null);
      toast.success("Generated image set as new source");
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium">Canvas</h2>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUndo}
                    disabled={historyIndex <= 0}
                    className="glass-button"
                    title="Undo"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRedo}
                    disabled={historyIndex >= history.length - 1}
                    className="glass-button"
                    title="Redo"
                  >
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </div>
              <Canvas
                imageUrl={uploadedImage}
                onSelectionChange={handleSelectionChange}
                onUpload={handleUpload}
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium">Result</h2>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className={cn("glass-button", !generatedImage && "opacity-50 cursor-not-allowed")}
                  disabled={!generatedImage}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUseGeneratedImage}
                  className={cn("glass-button", !generatedImage && "opacity-50 cursor-not-allowed")}
                  disabled={!generatedImage}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Edit This
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className={cn("glass-button", !generatedImage && "opacity-50 cursor-not-allowed")}
                  disabled={!generatedImage}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSideBySide}
                  className={cn("glass-button", (!uploadedImage || !generatedImage) && "opacity-50 cursor-not-allowed")}
                  disabled={!uploadedImage || !generatedImage}
                >
                  <SplitSquareVertical className="h-4 w-4 mr-2" />
                  {showSideBySide ? "Show Result Only" : "Compare"}
                </Button>
              </div>
            </div>

            {/* Status bar */}
            <div className="mb-4 h-6">
              {isLoading ? (
                <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                  <div className="bg-blue-500 h-2 rounded-full animate-loading-bar" style={{ width: '100%' }}></div>
                </div>
              ) : (
                <div className="w-full flex justify-between items-center text-xs text-muted-foreground">
                  <span>{generatedImage ? "Ready" : "Waiting for generation"}</span>
                  {prompt && <span className="truncate max-w-[80%]">Prompt: {prompt.substring(0, 60)}{prompt.length > 60 ? '...' : ''}</span>}
                </div>
              )}
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
