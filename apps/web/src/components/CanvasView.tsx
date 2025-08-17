import React, { useEffect, useRef } from 'react';
import type { Scene } from '@stickman/schema';
import { Player } from '@stickman/engine';

export function CanvasView({
	scene,
	currentFrame,
	onReady,
}: {
	scene: Scene;
	currentFrame: number;
	onReady: (player: Player) => void;
}): JSX.Element {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const playerRef = useRef<Player | null>(null);

	useEffect(() => {
		if (!canvasRef.current) return;
		const ctx = canvasRef.current.getContext('2d');
		if (!ctx) return;
		const p = new Player(ctx, scene);
		playerRef.current = p;
		onReady(p);
		p.goto(currentFrame);
		return () => {
			p.pause();
		};
	}, [scene]);

	useEffect(() => {
		playerRef.current?.goto(currentFrame);
	}, [currentFrame]);

	return (
		<canvas ref={canvasRef} width={scene.width} height={scene.height} style={{ border: '1px solid #ccc' }} />
	);
}