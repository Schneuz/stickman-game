import { parseScene, type Scene, type Pose, type Frame, type FrameObjectState, type Vec2, type SceneObject } from '@stickman/schema';

const CANVAS_W = 640;
const CANVAS_H = 400;
const FLOOR_Y = 360;
const GRAVITY = 0.9; // px/frame^2

function rng(seed: number): () => number {
	let s = (seed >>> 0) || 1;
	return () => {
		// xorshift32
		s ^= s << 13;
		s ^= s >>> 17;
		s ^= s << 5;
		return ((s >>> 0) % 1000) / 1000;
	};
}

function makePose(pelvisX: number, pelvisY: number, opts?: Partial<Pose>): Pose {
	const base: Pose = {
		head: { x: pelvisX, y: pelvisY - 60 },
		neck: { x: pelvisX, y: pelvisY - 45 },
		shoulderL: { x: pelvisX - 14, y: pelvisY - 45 },
		shoulderR: { x: pelvisX + 14, y: pelvisY - 45 },
		elbowL: { x: pelvisX - 24, y: pelvisY - 30 },
		elbowR: { x: pelvisX + 24, y: pelvisY - 30 },
		handL: { x: pelvisX - 20, y: pelvisY - 15 },
		handR: { x: pelvisX + 20, y: pelvisY - 15 },
		pelvis: { x: pelvisX, y: pelvisY },
		hipL: { x: pelvisX - 8, y: pelvisY },
		hipR: { x: pelvisX + 8, y: pelvisY },
		kneeL: { x: pelvisX - 8, y: pelvisY + 22 },
		kneeR: { x: pelvisX + 8, y: pelvisY + 22 },
		footL: { x: pelvisX - 8, y: pelvisY + 45 },
		footR: { x: pelvisX + 8, y: pelvisY + 45 },
	};
	return { ...base, ...(opts as Pose) };
}

function clonePose(p: Pose): Pose {
	return JSON.parse(JSON.stringify(p));
}

function makeFrame(actors: { name: string; pose: Pose }[], objects: FrameObjectState[], effects?: { type: 'bang' | 'dust' | string; pos: Vec2 }[]): Frame {
	return { actors, objects, effects } as Frame;
}

export function buildThrowScene(text: string, seed = 0): Scene {
	const rand = rng(seed);
	const A_X = 120;
	const B_X = 320;

	const catalog: SceneObject[] = [
		{ id: 'vase01', type: 'placeholder' as const, w: 16, h: 24, color: '#55c' },
		{ id: 'vase01_shard1', type: 'placeholder' as const, w: 6, h: 6, color: '#66f' },
		{ id: 'vase01_shard2', type: 'placeholder' as const, w: 6, h: 6, color: '#66f' },
		{ id: 'vase01_shard3', type: 'placeholder' as const, w: 6, h: 6, color: '#66f' },
		{ id: 'vase01_shard4', type: 'placeholder' as const, w: 6, h: 6, color: '#66f' },
		{ id: 'vase01_shard5', type: 'placeholder' as const, w: 6, h: 6, color: '#66f' },
		{ id: 'vase01_shard6', type: 'placeholder' as const, w: 6, h: 6, color: '#66f' },
	];

	const frames: Frame[] = [];

	let vase = { x: A_X + 20, y: FLOOR_Y - 15 };
	let vx = 5 + rand() * 1.0; // ~5
	let vy = -10 - rand() * 1.0; // ~-10
	let vaseStatus: 'attached' | 'flying' | 'destroyed' | 'fallen' = 'attached';
	let impactPos = { x: B_X, y: FLOOR_Y - 60 };

	const shards = new Array(6).fill(0).map((_, i) => ({
		id: `vase01_shard${i + 1}`,
		pos: { x: impactPos.x, y: impactPos.y },
		vx: (rand() - 0.5) * 8,
		vy: (rand() - 0.8) * 8,
		status: 'flying' as const,
	}));

	for (let i = 0; i < 36; i++) {
		// Actor poses
		let poseA = makePose(A_X, FLOOR_Y);
		let poseB = makePose(B_X, FLOOR_Y);

		if (i <= 5) {
			// slight bend, hold vase in right hand
			poseA.elbowR.x -= 6;
			poseA.handR.x = poseA.elbowR.x + 10;
			vase = { x: poseA.handR.x, y: poseA.handR.y };
			vaseStatus = 'attached';
		} else if (i <= 10) {
			// wind-up: arm goes back
			poseA.elbowR.x -= 10 + (i - 6) * 2;
			poseA.handR.x = poseA.elbowR.x - 6;
			poseA.handR.y -= 2;
			vase = { x: poseA.handR.x, y: poseA.handR.y };
			vaseStatus = 'attached';
		} else if (i === 11) {
			// release
			vaseStatus = 'flying';
		} else if (i >= 12 && i <= 16) {
			// flight
			vase.x += vx;
			vase.y += vy;
			vy += GRAVITY;
			vaseStatus = 'flying';
		} else if (i === 17) {
			// impact
			vaseStatus = 'destroyed';
			impactPos = { x: B_X + 0, y: FLOOR_Y - 60 };
			for (const s of shards) {
				s.pos = { ...impactPos };
			}
			// B reacts
			poseB.head.x += 6; // head back
			poseB.neck.x += 4;
		} else if (i > 17) {
			// shards physics
			for (const s of shards) {
				s.pos.x += s.vx!;
				s.pos.y += s.vy!;
				s.vy! += GRAVITY;
			}
			// end fall state later
		}

		// Follow-through and recovery for A, reaction for B
		if (i >= 12 && i <= 18) {
			poseA.elbowR.x += 4; // follow through
			poseA.handR.x += 6;
		}
		if (i >= 17 && i <= 25) {
			poseB.pelvis.x += (i - 17) * 0.8; // stumble to the right
			poseB.footR.x += (i - 17) * 0.5;
		}

		const actors = [
			{ name: 'A', pose: clonePose(poseA) },
			{ name: 'B', pose: clonePose(poseB) },
		];

		const objects: FrameObjectState[] = [];
		// vase
		objects.push({ id: 'vase01', pos: { x: vase.x, y: vase.y }, status: vaseStatus });

		// shards appear at and after impact
		if (i >= 17) {
			for (const s of shards) {
				const st: FrameObjectState = {
					id: s.id,
					pos: { x: s.pos.x, y: s.pos.y },
					vx: s.vx,
					vy: s.vy,
					status: i >= 21 ? (i >= 35 ? 'fallen' : 'flying') : 'flying',
				};
				objects.push(st);
			}
		}

		const effects = i === 17 ? [{ type: 'bang', pos: { ...impactPos } }] : undefined;

		frames.push(makeFrame(actors, objects, effects));
	}

	const scene: Scene = {
		width: CANVAS_W,
		height: CANVAS_H,
		fps: 12,
		catalog,
		frames: frames as unknown as Scene['frames'],
	};

	// Validate before returning for safety
	return parseScene(scene).data;
}

export { CANVAS_W as CANVAS, FLOOR_Y, GRAVITY };