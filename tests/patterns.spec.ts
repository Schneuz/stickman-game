import { describe, it, expect } from 'vitest';
import { parseScene } from '@stickman/schema';
import { buildThrowScene } from '@stickman/patterns';

describe('patterns.buildThrowScene', () => {
	it('buildThrowScene("A wirft eine Vase auf B") → parseScene ok', () => {
		const scene = buildThrowScene('A wirft eine Vase auf B');
		expect(parseScene(scene).data).toBeTruthy();
	});

	it('Frame 17 hat mindestens einen effect "bang" und vase01.status="destroyed"', () => {
		const scene = buildThrowScene('A wirft eine Vase auf B');
		const f17 = scene.frames[17];
		expect(f17.effects?.some((e) => e.type === 'bang')).toBe(true);
		const vase = f17.objects.find((o) => o.id === 'vase01');
		expect(vase?.status).toBe('destroyed');
	});

	it('shards existieren ab Frame 17 und erreichen status "fallen" bis Frame 35', () => {
		const scene = buildThrowScene('A wirft eine Vase auf B');
		for (let i = 17; i < scene.frames.length; i++) {
			const f = scene.frames[i];
			const shards = f.objects.filter((o) => o.id.startsWith('vase01_shard'));
			expect(shards.length).toBeGreaterThanOrEqual(1);
		}
		const last = scene.frames[35];
		const shardsLast = last.objects.filter((o) => o.id.startsWith('vase01_shard'));
		for (const s of shardsLast) {
			expect(s.status === 'fallen' || s.pos.y >= scene.height - 1).toBe(true);
		}
	});
});