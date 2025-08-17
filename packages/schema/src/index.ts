import { z } from 'zod';

// Types
export type Vec2 = { x: number; y: number };
export type JointName =
	| 'head'
	| 'neck'
	| 'shoulderL'
	| 'shoulderR'
	| 'elbowL'
	| 'elbowR'
	| 'handL'
	| 'handR'
	| 'pelvis'
	| 'hipL'
	| 'hipR'
	| 'kneeL'
	| 'kneeR'
	| 'footL'
	| 'footR';

export type Pose = Record<JointName, Vec2>;

export type ObjStatus = 'attached' | 'flying' | 'destroyed' | 'fallen' | 'idle';

export type SceneObject = {
	id: string;
	type: 'rect' | 'circle' | 'polygon' | 'placeholder';
	w?: number;
	h?: number;
	r?: number;
	points?: Vec2[];
	color?: string;
};

export type FrameObjectState = {
	id: string; // refers to catalog object id
	pos: Vec2;
	rot?: number;
	status?: ObjStatus;
	vx?: number;
	vy?: number;
};

export type Frame = {
	actors: { name: string; pose: Pose }[];
	objects: FrameObjectState[];
	effects?: { type: 'bang' | 'dust' | string; pos: Vec2 }[];
};

export type Scene = {
	width: number;
	height: number;
	fps: 12; // fixed
	catalog: SceneObject[];
	frames: [
		Frame, Frame, Frame, Frame, Frame, Frame,
		Frame, Frame, Frame, Frame, Frame, Frame,
		Frame, Frame, Frame, Frame, Frame, Frame,
		Frame, Frame, Frame, Frame, Frame, Frame,
		Frame, Frame, Frame, Frame, Frame, Frame,
		Frame, Frame, Frame, Frame, Frame, Frame
	]; // exactly 36
};

// Schemas
const vec2Schema = z.object({ x: z.number(), y: z.number() });

const jointNames: JointName[] = [
	'head',
	'neck',
	'shoulderL',
	'shoulderR',
	'elbowL',
	'elbowR',
	'handL',
	'handR',
	'pelvis',
	'hipL',
	'hipR',
	'kneeL',
	'kneeR',
	'footL',
	'footR',
];

const poseSchema: z.ZodType<Pose> = z.object(
	Object.fromEntries(jointNames.map((j) => [j, vec2Schema])) as Record<JointName, z.ZodTypeAny>,
);

const objStatusSchema = z.enum(['attached', 'flying', 'destroyed', 'fallen', 'idle']);

const sceneObjectSchema: z.ZodType<SceneObject> = z.object({
	id: z.string(),
	type: z.enum(['rect', 'circle', 'polygon', 'placeholder']),
	w: z.number().optional(),
	h: z.number().optional(),
	r: z.number().optional(),
	points: z.array(vec2Schema).optional(),
	color: z.string().optional(),
});

const frameObjectStateSchema: z.ZodType<FrameObjectState> = z.object({
	id: z.string(),
	pos: vec2Schema,
	rot: z.number().optional(),
	status: objStatusSchema.optional(),
	vx: z.number().optional(),
	vy: z.number().optional(),
});

const frameSchema: z.ZodType<Frame> = z.object({
	actors: z.array(
		z.object({
			name: z.string(),
			pose: poseSchema,
		}),
	),
	objects: z.array(frameObjectStateSchema),
	effects: z
		.array(
			z.object({
				type: z.string(),
				pos: vec2Schema,
			}),
		)
		.optional(),
});

const sceneSchema: z.ZodType<Scene> = z
	.object({
		width: z.number(),
		height: z.number(),
		fps: z.literal(12),
		catalog: z.array(sceneObjectSchema),
		frames: z.array(frameSchema).length(36) as unknown as z.ZodType<Scene['frames']>,
	})
	.superRefine((scene, ctx) => {
		const idSet = new Set(scene.catalog.map((o) => o.id));
		scene.frames.forEach((frame, idx) => {
			for (const fo of frame.objects) {
				if (!idSet.has(fo.id)) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: `Unknown object.id in frame ${idx}: ${fo.id}`,
						path: ['frames', idx, 'objects'],
					});
				}
			}
		});
	});

export function parseScene(json: unknown): { ok: true; data: Scene } {
	const parsed = sceneSchema.safeParse(json);
	if (!parsed.success) {
		const msg = parsed.error.issues
			.map((i) => `${i.path.join('.')} - ${i.message}`)
			.join('\n');
		throw new Error(`Scene validation failed:\n${msg}`);
	}
	return { ok: true, data: parsed.data };
}

export function checkSkeletonLengths(scene: Scene, tolerancePx = 2): {
	frame: number;
	actor: string;
	segment: string;
	delta: number;
}[] {
	const segments: [keyof Pose, keyof Pose, string][] = [
		['head', 'neck', 'head-neck'],
		['neck', 'shoulderL', 'neck-shoulderL'],
		['neck', 'shoulderR', 'neck-shoulderR'],
		['shoulderL', 'elbowL', 'upperArmL'],
		['elbowL', 'handL', 'forearmL'],
		['shoulderR', 'elbowR', 'upperArmR'],
		['elbowR', 'handR', 'forearmR'],
		['neck', 'pelvis', 'torso'],
		['pelvis', 'hipL', 'pelvis-hipL'],
		['hipL', 'kneeL', 'thighL'],
		['kneeL', 'footL', 'shinL'],
		['pelvis', 'hipR', 'pelvis-hipR'],
		['hipR', 'kneeR', 'thighR'],
		['kneeR', 'footR', 'shinR'],
	];
	const refLengths = new Map<string, number>();
	const warnings: { frame: number; actor: string; segment: string; delta: number }[] = [];

	for (let fi = 0; fi < scene.frames.length; fi++) {
		const frame = scene.frames[fi];
		for (const actor of frame.actors) {
			for (const [a, b, key] of segments) {
				const p1 = actor.pose[a];
				const p2 = actor.pose[b];
				const len = Math.hypot(p2.x - p1.x, p2.y - p1.y);
				if (!refLengths.has(`${actor.name}:${key}`)) {
					refLengths.set(`${actor.name}:${key}`, len);
				} else {
					const ref = refLengths.get(`${actor.name}:${key}`)!;
					const delta = Math.abs(len - ref);
					if (delta > tolerancePx) {
						warnings.push({ frame: fi, actor: actor.name, segment: key, delta });
					}
				}
			}
		}
	}
	return warnings;
}

export const Schemas = {
	vec2: vec2Schema,
	pose: poseSchema,
	objStatus: objStatusSchema,
	sceneObject: sceneObjectSchema,
	frameObjectState: frameObjectStateSchema,
	frame: frameSchema,
	scene: sceneSchema,
};