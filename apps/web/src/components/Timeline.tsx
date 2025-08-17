import React from 'react';

export function Timeline({ current, onSelect }: { current: number; onSelect: (i: number) => void }): JSX.Element {
	return (
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4 }}>
			{Array.from({ length: 36 }).map((_, i) => (
				<button
					key={i}
					onClick={() => onSelect(i)}
					style={{
						padding: '6px 4px',
						background: i === current ? '#0af' : '#eee',
						border: '1px solid #ccc',
						cursor: 'pointer',
					}}
				>
					{i}
				</button>
			))}
		</div>
	);
}