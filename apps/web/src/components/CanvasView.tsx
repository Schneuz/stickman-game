import { useEffect, useRef } from "react";
import type { Scene } from "@stickman/schema";
import { Player } from "@stickman/engine";

interface CanvasViewProps {
  scene: Scene | null;
  currentFrame: number;
  onionSkin: boolean;
}

function CanvasView({ scene, currentFrame, onionSkin }: CanvasViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !scene) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    if (!playerRef.current) {
      playerRef.current = new Player(ctx, scene);
    } else {
      playerRef.current.setScene(scene);
    }

    playerRef.current.setOnionSkin(onionSkin);
    playerRef.current.goto(currentFrame);

    return () => {
      if (playerRef.current) {
        playerRef.current.pause();
      }
    };
  }, [scene]);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.setOnionSkin(onionSkin);
      playerRef.current.goto(currentFrame);
    }
  }, [currentFrame, onionSkin]);

  if (!scene) {
    return (
      <div className="w-full h-[400px] bg-gray-700 rounded flex items-center justify-center">
        <p className="text-gray-400">No scene loaded. Generate or import a scene to begin.</p>
      </div>
    );
  }

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={400}
      className="w-full max-w-[640px] mx-auto bg-white rounded shadow-lg"
    />
  );
}

export default CanvasView;