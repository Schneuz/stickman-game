import { useState, useRef } from "react";

interface PromptPanelProps {
  onGenerate: (prompt: string) => void;
  onImport: (json: string) => void;
  onExport: () => void;
  hasScene: boolean;
}

function PromptPanel({ onGenerate, onImport, onExport, hasScene }: PromptPanelProps) {
  const [prompt, setPrompt] = useState("A wirft eine Vase auf B");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onImport(content);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-3">Generate Scene</h3>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter a scene description..."
          className="w-full h-32 p-3 bg-gray-700 text-white rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleGenerate}
          className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium transition-colors"
        >
          Generate Scene
        </button>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-lg font-semibold mb-3">Import/Export</h3>
        
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors"
          >
            Import JSON
          </button>
          
          <button
            onClick={onExport}
            disabled={!hasScene}
            className={`w-full py-2 rounded font-medium transition-colors ${
              hasScene
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            Export JSON
          </button>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm font-semibold mb-2 text-gray-400">Quick Examples</h3>
        <div className="space-y-1">
          <button
            onClick={() => setPrompt("A wirft eine Vase auf B")}
            className="w-full text-left text-sm py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Throw vase
          </button>
          <button
            onClick={() => setPrompt("Stickman A throws object at B")}
            className="w-full text-left text-sm py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Throw object
          </button>
          <button
            onClick={() => setPrompt("Character interaction scene")}
            className="w-full text-left text-sm py-1 px-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          >
            Interaction
          </button>
        </div>
      </div>
    </div>
  );
}

export default PromptPanel;