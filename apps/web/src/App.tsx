import { useState, useCallback } from "react";
import type { Scene } from "@stickman/schema";
import { parseScene } from "@stickman/schema";
import { buildThrowScene } from "@stickman/patterns";
import CanvasView from "./components/CanvasView";
import Timeline from "./components/Timeline";
import Controls from "./components/Controls";
import PromptPanel from "./components/PromptPanel";

function App() {
  const [currentScene, setCurrentScene] = useState<Scene | null>(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [onionSkin, setOnionSkin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateScene = useCallback((prompt: string) => {
    try {
      setError(null);
      const scene = buildThrowScene(prompt, Math.floor(Math.random() * 1000));
      const result = parseScene(scene);
      if (result.ok) {
        setCurrentScene(result.data);
        setCurrentFrame(0);
        setPlaying(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate scene");
    }
  }, []);

  const handleImportScene = useCallback((json: string) => {
    try {
      setError(null);
      const data = JSON.parse(json);
      const result = parseScene(data);
      if (result.ok) {
        setCurrentScene(result.data);
        setCurrentFrame(0);
        setPlaying(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid scene JSON");
    }
  }, []);

  const handleExportScene = useCallback(() => {
    if (!currentScene) return;
    
    const json = JSON.stringify(currentScene, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scene.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [currentScene]);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Stickman Game Editor</h1>
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Canvas and Timeline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <CanvasView 
                scene={currentScene} 
                currentFrame={currentFrame}
                onionSkin={onionSkin}
              />
            </div>
            
            {currentScene && (
              <>
                <Timeline 
                  currentFrame={currentFrame}
                  totalFrames={36}
                  onFrameSelect={setCurrentFrame}
                />
                
                <Controls
                  playing={playing}
                  onPlayPause={() => setPlaying(!playing)}
                  onStepForward={() => setCurrentFrame((f) => Math.min(f + 1, 35))}
                  onStepBackward={() => setCurrentFrame((f) => Math.max(f - 1, 0))}
                  onLoop={() => setCurrentFrame(0)}
                  onionSkin={onionSkin}
                  onToggleOnionSkin={() => setOnionSkin(!onionSkin)}
                  scene={currentScene}
                  currentFrame={currentFrame}
                  setCurrentFrame={setCurrentFrame}
                  setPlaying={setPlaying}
                />
              </>
            )}
          </div>

          {/* Prompt Panel */}
          <div className="space-y-4">
            <PromptPanel 
              onGenerate={handleGenerateScene}
              onImport={handleImportScene}
              onExport={handleExportScene}
              hasScene={currentScene !== null}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;