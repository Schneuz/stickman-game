import React, { useRef } from 'react';

export function Controls({
	playing,
	onPlayPause,
	onStep,
	loop,
	onToggleLoop,
	onionSkin,
	onToggleOnionSkin,
	onExport,
	onImport,
}: {
	playing: boolean;
	onPlayPause: () => void;
	onStep: (d: number) => void;
	loop: boolean;
	onToggleLoop: () => void;
	onionSkin: boolean;
	onToggleOnionSkin: () => void;
	onExport: () => void;
	onImport: (file: File) => void;
}): JSX.Element {
	const fileRef = useRef<HTMLInputElement | null>(null);
	return (
		<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
			<button onClick={onPlayPause}>{playing ? 'Pause' : 'Play'}</button>
			<button onClick={() => onStep(-1)}>-1</button>
			<button onClick={() => onStep(1)}>+1</button>
			<label style={{ display: 'inline-flex', gap: 4 }}>
				<input type="checkbox" checked={loop} onChange={onToggleLoop} /> Loop
			</label>
			<label style={{ display: 'inline-flex', gap: 4 }}>
				<input type="checkbox" checked={onionSkin} onChange={onToggleOnionSkin} /> Onion-Skin
			</label>
			<button onClick={onExport}>Export JSON</button>
			<button onClick={() => fileRef.current?.click()}>Import JSON</button>
			<input
				ref={fileRef}
				type="file"
				accept="application/json"
				style={{ display: 'none' }}
				onChange={(e) => {
					const f = e.target.files?.[0];
					if (f) onImport(f);
					e.currentTarget.value = '';
				}}
			/>
		</div>
	);
}