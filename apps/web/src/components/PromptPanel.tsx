import React, { useState } from 'react';

export function PromptPanel({ onGenerate }: { onGenerate: (text: string) => void }): JSX.Element {
	const [text, setText] = useState('A wirft eine Vase auf B');
	return (
		<div style={{ display: 'flex', gap: 8 }}>
			<textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} style={{ flex: 1 }} />
			<button onClick={() => onGenerate(text)}>Generate</button>
		</div>
	);
}