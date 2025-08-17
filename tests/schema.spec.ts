import { describe, it, expect } from 'vitest';
import { parseScene, type Scene } from '@stickman/schema';

function makeValidScene(): Scene {
	const frame = {
		actors: [
			{
				name: 'A',
				pose: {
					head: { x: 120, y: 300 },
					neck: { x: 120, y: 315 },
					shoulderL: { x: 106, y: 315 },
					shoulderR: { x: 134, y: 315 },
					elbowL: { x: 96, y: 330 },
					elbowR: { x: 144, y: 330 },
					handL: { x: 100, y: 345 },
					handR: { x: 140, y: 345 },
					pelvis: { x: 120, y: 360 },
					hipL: { x: 112, y: 360 },
					hipR: { x: 128, y: 360 },
					kneeL: { x: 112, y: 382 },
					kneeR: { x: 128, y: 382 },
					footL: { x: 112, y: 405 },
					footR: { x: 128, y: 405 },
				},
			},
		],
		objects: [{ id: 'obj1', pos: { x: 0, y: 0 }, status: 'idle' as const }],
	} as const;

	const frames = Array.from({ length: 36 }, () => ({ ...frame }));

	const scene: Scene = {
		width: 640,
		height: 400,
		fps: 12,
		catalog: [{ id: 'obj1', type: 'placeholder', w: 10, h: 10 }],
		frames: frames as unknown as Scene['frames'],
	};
	return scene;
}

describe('schema.parseScene', () => {
	it('parseScene(validScene) → ok', () => {
		const s = makeValidScene();
		expect(parseScene(s).data).toBeTruthy();
	});

	it('frames Länge != 36 → Fehler', () => {
		const s = makeValidScene();
		// @ts-expect-error
		s.frames = s.frames.slice(0, 35) as any;
		expect(() => parseScene(s as any)).toThrow();
	});

	it('unbekannte object.id im Frame → Fehler', () => {
		const s = makeValidScene();
		// introduce wrong id
		(s.frames[0].objects[0] as any).id = 'does-not-exist';
		expect(() => parseScene(s as any)).toThrow(/Unknown object.id/);
	});
});