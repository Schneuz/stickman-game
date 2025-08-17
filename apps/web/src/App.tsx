import React, { useEffect, useRef, useState } from 'react';
import type { Scene } from '@stickman/schema';
import { parseScene } from '@stickman/schema';
import { Player } from '@stickman/engine';
import { buildThrowScene } from '@stickman/patterns';
import { CanvasView } from './components/CanvasView';
import { Timeline } from './components/Timeline';
import { Controls } from './components/Controls';
import { PromptPanel } from './components/PromptPanel';
import { generateSceneFromPrompt } from './lib/generate';

export function App(): JSX.Element {
	const [scene, setScene] = useState<Scene | null>(null);
	const [currentFrame, setCurrentFrame] = useState(0);
	const [playing, setPlaying] = useState(false);
	const [loop, setLoop] = useState(true);
	const [onionSkin, setOnionSkin] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const playerRef = useRef<Player | null>(null);

	// Initialize with a default scene for convenience
	useEffect(() => {
		const s = buildThrowScene('A wirft eine Vase auf B');
		setScene(parseScene(s).data);
	}, []);

	useEffect(() => {
		if (playerRef.current) playerRef.current.onionSkin = onionSkin;
	}, [onionSkin]);

	const handleGenerate = async (text: string) => {
		setLoading(true);
		setError(null);
		try {
			const data = await generateSceneFromPrompt(text);
			setScene(data);
			setCurrentFrame(0);
			setPlaying(false);
			playerRef.current?.pause();
			playerRef.current?.goto(0);
		} catch (e: any) {
			setError(e?.message ?? 'Unbekannter Fehler');
		} finally {
			setLoading(false);
		}
	};

	const handleExport = () => {
		if (!scene) return;
		const blob = new Blob([JSON.stringify(scene, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'scene.json';
		a.click();
		URL.revokeObjectURL(url);
	};

	const handleImport = async (file: File) => {
		try {
			const text = await file.text();
			const json = JSON.parse(text);
			const { data } = parseScene(json);
			setScene(data);
			setCurrentFrame(0);
			setPlaying(false);
			playerRef.current?.pause();
			playerRef.current?.goto(0);
		} catch (e: any) {
			setError(e?.message ?? 'Import fehlgeschlagen');
		}
	};

	const onReadyPlayer = (player: Player) => {
		playerRef.current = player;
		player.onFrame((i) => setCurrentFrame(i));
		player.onionSkin = onionSkin;
	};

	useEffect(() => {
		if (!playerRef.current || !scene) return;
		playerRef.current.goto(currentFrame);
	}, [currentFrame, scene]);

	useEffect(() => {
		if (!playerRef.current) return;
		if (playing) playerRef.current.play(loop);
		else playerRef.current.pause();
	}, [playing, loop]);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 12 }}>
			<h1 style={{ margin: 0 }}>Stickman Editor</h1>
			{scene && (
				<CanvasView scene={scene} currentFrame={currentFrame} onReady={onReadyPlayer} />
			)}
			{error && (
				<div style={{ color: '#b00' }}>Fehler: {error}</div>
			)}
			<Controls
				playing={playing}
				onPlayPause={() => setPlaying((p) => !p)}
				onStep={(d) => setCurrentFrame((i) => Math.max(0, Math.min(35, i + d)))}
				loop={loop}
				onToggleLoop={() => setLoop((l) => !l)}
				onionSkin={onionSkin}
				onToggleOnionSkin={() => setOnionSkin((o) => !o)}
				onExport={handleExport}
				onImport={handleImport}
			/>
			<Timeline current={currentFrame} onSelect={setCurrentFrame} />
			<PromptPanel onGenerate={handleGenerate} loading={loading} />
			{loading && <div>Erzeuge Szene...</div>}
		</div>
	);
}