
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { 
  Wand2, 
  Image as ImageIcon,
  RotateCcw, 
  Loader2,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface EditorControlsProps {
  onUpload: (file: File) => void;
  onGenerate: () => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  negativePrompt: string;
  setNegativePrompt: (prompt: string) => void;
  isLoading: boolean;
  className?: string;
  isImageUploaded: boolean;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  steps: number;
  setSteps: (steps: number) => void;
  cfg: number;
  setCfg: (cfg: number) => void;
  sampler: string;
  setSampler: (sampler: string) => void;
  scheduler: string;
  setScheduler: (scheduler: string) => void;
  seed: number;
  setSeed: (seed: number) => void;
  edgeStrength: number;
  setEdgeStrength: (strength: number) => void;
  colorStrength: number;
  setColorStrength: (strength: number) => void;
  inpaintStrength: number;
  setInpaintStrength: (strength: number) => void;
}

const EditorControls: React.FC<EditorControlsProps> = ({
  onUpload,
  onGenerate,
  prompt,
  setPrompt,
  negativePrompt,
  setNegativePrompt,
  isLoading,
  className,
  isImageUploaded,
  selectedModel,
  setSelectedModel,
  steps,
  setSteps,
  cfg,
  setCfg,
  sampler,
  setSampler,
  scheduler,
  setScheduler,
  seed,
  setSeed,
  edgeStrength,
  setEdgeStrength,
  colorStrength,
  setColorStrength,
  inpaintStrength,
  setInpaintStrength
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000000));
  };
  
  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid gap-4">
        <div className="flex flex-col">
          <Label htmlFor="prompt" className="mb-2">Prompt</Label>
          <div className="relative">
            <Input
              id="prompt"
              placeholder="Describe what you want to generate..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="glass-input pr-10"
            />
            <div className="absolute inset-y-0 right-3 flex items-center">
              <Wand2 className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        <div className="flex flex-col">
          <Label htmlFor="negative-prompt" className="mb-2">Negative Prompt (Optional)</Label>
          <Input
            id="negative-prompt"
            placeholder="Elements to avoid in the generation..."
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            className="glass-input"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger id="model" className="glass-input">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SD1.5/realisticVisionV60B1_v51VAE.safetensors">Realistic Vision v6</SelectItem>
                <SelectItem value="SD1.5/dreamshaper_8.safetensors">Dreamshaper 8</SelectItem>
                <SelectItem value="SD1.5/DreamShaper.safetensors">DreamShaper</SelectItem>
                <SelectItem value="SD1.5/openjourney_V4.ckpt">OpenJourney V4</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Label htmlFor="fine-edge">Fine Edge</Label>
            <Select defaultValue="enable">
              <SelectTrigger id="fine-edge" className="glass-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="enable">Enable</SelectItem>
                <SelectItem value="disable">Disable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Hide advanced settings
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show advanced settings
              </>
            )}
          </button>
          
          {showAdvanced && (
            <div className="mt-4 space-y-4 rounded-lg bg-slate-50 p-4 border border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Edge Strength: {edgeStrength.toFixed(2)}</Label>
                    </div>
                    <Slider
                      value={[edgeStrength]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(values) => setEdgeStrength(values[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Color Strength: {colorStrength.toFixed(2)}</Label>
                    </div>
                    <Slider
                      value={[colorStrength]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(values) => setColorStrength(values[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Inpaint Strength: {inpaintStrength.toFixed(2)}</Label>
                    </div>
                    <Slider
                      value={[inpaintStrength]}
                      min={0}
                      max={1}
                      step={0.01}
                      onValueChange={(values) => setInpaintStrength(values[0])}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>Steps: {steps}</Label>
                    </div>
                    <Slider
                      value={[steps]}
                      min={1}
                      max={50}
                      step={1}
                      onValueChange={(values) => setSteps(values[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label>CFG Scale: {cfg.toFixed(1)}</Label>
                    </div>
                    <Slider
                      value={[cfg]}
                      min={1}
                      max={20}
                      step={0.1}
                      onValueChange={(values) => setCfg(values[0])}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Sampler</Label>
                      <Select value={sampler} onValueChange={setSampler}>
                        <SelectTrigger className="glass-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="euler">Euler</SelectItem>
                          <SelectItem value="euler_ancestral">Euler Ancestral</SelectItem>
                          <SelectItem value="heun">Heun</SelectItem>
                          <SelectItem value="dpm_2">DPM 2</SelectItem>
                          <SelectItem value="dpm_2_ancestral">DPM 2 Ancestral</SelectItem>
                          <SelectItem value="lms">LMS</SelectItem>
                          <SelectItem value="dpm_fast">DPM Fast</SelectItem>
                          <SelectItem value="dpm_adaptive">DPM Adaptive</SelectItem>
                          <SelectItem value="dpmpp_2s_ancestral">DPMPP 2S Ancestral</SelectItem>
                          <SelectItem value="dpmpp_sde">DPMPP SDE</SelectItem>
                          <SelectItem value="dpmpp_sde_gpu">DPMPP SDE GPU</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Scheduler</Label>
                      <Select value={scheduler} onValueChange={setScheduler}>
                        <SelectTrigger className="glass-input">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="karras">Karras</SelectItem>
                          <SelectItem value="exponential">Exponential</SelectItem>
                          <SelectItem value="sgm_uniform">SGM Uniform</SelectItem>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="ddim_uniform">DDIM Uniform</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex items-end space-x-2">
                    <div className="flex-1 space-y-2">
                      <Label>Seed</Label>
                      <Input
                        type="number"
                        value={seed}
                        onChange={(e) => setSeed(parseInt(e.target.value) || 0)}
                        className="glass-input"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleRandomSeed}
                      className="glass-button"
                      title="Random Seed"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 pt-4">
          <div className="flex-1">
            <Label htmlFor="image-upload" className="w-full">
              <div className="relative w-full h-12 rounded-lg border-2 border-dashed border-slate-300 hover:border-primary/70 transition-colors flex items-center justify-center cursor-pointer bg-slate-50/50">
                <div className="flex items-center text-muted-foreground">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  <span>Upload Image</span>
                </div>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </Label>
          </div>
          
          <Button
            onClick={onGenerate}
            disabled={isLoading || !isImageUploaded || !prompt}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 rounded-lg button-hover h-12"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditorControls;
