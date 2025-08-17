import { parseScene, type Scene } from '@stickman/schema';
import { buildThrowScene } from '@stickman/patterns';

export async function generateSceneFromPrompt(prompt: string): Promise<Scene> {
	const url = import.meta.env.VITE_N8N_SCENE_URL as string | undefined;
	if (url) {
		const res = await fetch(url, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ prompt }),
		});
		if (!res.ok) {
			throw new Error(`n8n request failed: ${res.status} ${res.statusText}`);
		}
		const json = await res.json();
		return parseScene(json).data;
	}
	// fallback local pattern
	return parseScene(buildThrowScene(prompt)).data;
}