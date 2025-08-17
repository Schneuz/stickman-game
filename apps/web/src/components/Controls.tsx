import { useEffect, useRef } from "react";
import type { Scene } from "@stickman/schema";

interface ControlsProps {
  playing: boolean;
  onPlayPause: () => void;
  onStepForward: () => void;
  onStepBackward: () => void;
  onLoop: () => void;
  onionSkin: boolean;
  onToggleOnionSkin: () => void;
  scene: Scene;
  currentFrame: number;
  setCurrentFrame: (frame: number) => void;
  setPlaying: (playing: boolean) => void;
}

function Controls({
  playing,
  onPlayPause,
  onStepForward,
  onStepBackward,
  onLoop,
  onionSkin,
  onToggleOnionSkin,
  scene,
  currentFrame,
  setCurrentFrame,
  setPlaying,
}: ControlsProps) {
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (playing && scene) {
      const frameInterval = 1000 / scene.fps; // 83.33ms for 12 FPS
      
      intervalRef.current = window.setInterval(() => {
        setCurrentFrame((prev) => {
          const next = (prev + 1) % scene.frames.length;
          if (next === 0) {
            // Loop completed
            return 0;
          }
          return next;
        });
      }, frameInterval);
    } else {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playing, scene, setCurrentFrame]);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={onStepBackward}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          title="Step Backward"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8.445 14.832A1 1 0 0010 14v-8a1 1 0 00-1.555-.832L3 9.168V6a1 1 0 00-2 0v8a1 1 0 002 0v-3.168l5.445 4z" />
          </svg>
        </button>

        <button
          onClick={onPlayPause}
          className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full transition-colors"
          title={playing ? "Pause" : "Play"}
        >
          {playing ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <button
          onClick={onStepForward}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
          title="Step Forward"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11.555 5.168A1 1 0 0010 6v8a1 1 0 001.555.832L17 10.832V14a1 1 0 002 0V6a1 1 0 00-2 0v3.168l-5.445-4z" />
          </svg>
        </button>

        <button
          onClick={onLoop}
          className="p-2 bg-gray-700 hover:bg-gray-600 rounded transition-colors ml-4"
          title="Loop to Start"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        </button>

        <button
          onClick={onToggleOnionSkin}
          className={`p-2 rounded transition-colors ml-4 ${
            onionSkin 
              ? "bg-green-600 hover:bg-green-500" 
              : "bg-gray-700 hover:bg-gray-600"
          }`}
          title="Toggle Onion Skin"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      <div className="mt-3 text-center text-sm text-gray-400">
        {playing ? "Playing..." : "Paused"} | Onion Skin: {onionSkin ? "ON" : "OFF"}
      </div>
    </div>
  );
}

export default Controls;