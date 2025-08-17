import type { Scene, Frame, Pose, SceneObject, FrameObjectState } from '@stickman/schema';

export function drawStickman(ctx: CanvasRenderingContext2D, pose: Pose): void {
	ctx.save();
	ctx.lineWidth = 2;
	ctx.strokeStyle = '#111';

	const draw = (a: keyof Pose, b: keyof Pose) => {
		const p1 = pose[a];
		const p2 = pose[b];
		ctx.beginPath();
		ctx.moveTo(p1.x, p1.y);
		ctx.lineTo(p2.x, p2.y);
		ctx.stroke();
	};

	// Torso
	draw('neck', 'pelvis');
	// Arms
	draw('shoulderL', 'elbowL');
	draw('elbowL', 'handL');
	draw('shoulderR', 'elbowR');
	draw('elbowR', 'handR');
	// Shoulders to neck
	draw('neck', 'shoulderL');
	draw('neck', 'shoulderR');
	// Legs
	draw('pelvis', 'hipL');
	draw('hipL', 'kneeL');
	draw('kneeL', 'footL');
	draw('pelvis', 'hipR');
	draw('hipR', 'kneeR');
	draw('kneeR', 'footR');
	// Head
	const head = pose.head;
	ctx.beginPath();
	ctx.arc(head.x, head.y, 8, 0, Math.PI * 2);
	ctx.stroke();

	ctx.restore();
}

export function drawObject(
	ctx: CanvasRenderingContext2D,
	frameObj: FrameObjectState,
	catalog: SceneObject[],
): void {
	const obj = catalog.find((o) => o.id === frameObj.id);
	if (!obj) return;
	ctx.save();
	ctx.translate(frameObj.pos.x, frameObj.pos.y);
	if (frameObj.rot) ctx.rotate(frameObj.rot);
	ctx.fillStyle = obj.color ?? '#888';
	ctx.strokeStyle = obj.color ?? '#888';

	switch (obj.type) {
		case 'rect': {
			const w = obj.w ?? 10;
			const h = obj.h ?? 10;
			ctx.fillRect(-w / 2, -h / 2, w, h);
			break;
		}
		case 'circle': {
			const r = obj.r ?? 5;
			ctx.beginPath();
			ctx.arc(0, 0, r, 0, Math.PI * 2);
			ctx.fill();
			break;
		}
		case 'polygon': {
			const pts = obj.points ?? [
				{ x: -5, y: -5 },
				{ x: 5, y: -5 },
				{ x: 0, y: 5 },
			];
			ctx.beginPath();
			ctx.moveTo(pts[0].x, pts[0].y);
			for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
			ctx.closePath();
			ctx.fill();
			break;
		}
		case 'placeholder':
		default: {
			const w = obj.w ?? 12;
			const h = obj.h ?? 12;
			ctx.strokeRect(-w / 2, -h / 2, w, h);
			break;
		}
	}
	ctx.restore();
}

export class Player {
	private ctx: CanvasRenderingContext2D;
	private scene: Scene;
	private rafId: number | null = null;
	private lastTime = 0;
	private accumulatorMs = 0;
	private readonly frameMs = 1000 / 12;
	private index = 0;
	private running = false;
	private loop = true;
	public onionSkin = false;
	private frameListeners: ((i: number) => void)[] = [];

	constructor(ctx: CanvasRenderingContext2D, scene: Scene) {
		this.ctx = ctx;
		this.scene = scene;
	}

	onFrame(listener: (i: number) => void): void {
		this.frameListeners.push(listener);
	}

	private emitFrame(): void {
		for (const l of this.frameListeners) l(this.index);
	}

	play(loop = true): void {
		this.loop = loop;
		if (this.running) return;
		this.running = true;
		this.lastTime = performance.now();
		const tick = (time: number) => {
			if (!this.running) return;
			const dt = time - this.lastTime;
			this.lastTime = time;
			this.accumulatorMs += dt;
			while (this.accumulatorMs >= this.frameMs) {
				this.accumulatorMs -= this.frameMs;
				this.index++;
				if (this.index >= this.scene.frames.length) {
					this.index = this.loop ? 0 : this.scene.frames.length - 1;
					if (!this.loop) this.pause();
				}
				this.drawCurrent();
				this.emitFrame();
			}
			this.rafId = requestAnimationFrame(tick);
		};
		this.rafId = requestAnimationFrame(tick);
	}

	pause(): void {
		this.running = false;
		if (this.rafId !== null) cancelAnimationFrame(this.rafId);
		this.rafId = null;
	}

	goto(i: number): void {
		const clamped = Math.max(0, Math.min(this.scene.frames.length - 1, i));
		this.index = clamped;
		this.drawCurrent();
		this.emitFrame();
	}

	private drawCurrent(): void {
		this.drawFrame(this.index);
	}

	drawFrame(i: number): void {
		const frame = this.scene.frames[i];
		const ctx = this.ctx;
		ctx.clearRect(0, 0, this.scene.width, this.scene.height);

		if (this.onionSkin) {
			ctx.save();
			ctx.globalAlpha = 0.2;
			const prev = i > 0 ? i - 1 : null;
			const next = i < this.scene.frames.length - 1 ? i + 1 : null;
			if (prev !== null) this.drawFrameLayer(this.scene.frames[prev]);
			if (next !== null) this.drawFrameLayer(this.scene.frames[next]);
			ctx.restore();
		}

		this.drawFrameLayer(frame);
	}

	private drawFrameLayer(frame: Frame): void {
		// actors
		for (const actor of frame.actors) {
			drawStickman(this.ctx, actor.pose);
		}
		// objects
		for (const obj of frame.objects) {
			drawObject(this.ctx, obj, this.scene.catalog);
		}
		// effects
		if (frame.effects) {
			for (const eff of frame.effects) {
				this.ctx.save();
				this.ctx.fillStyle = '#f33';
				this.ctx.strokeStyle = '#f33';
				switch (eff.type) {
					case 'bang':
						this.ctx.beginPath();
						this.ctx.arc(eff.pos.x, eff.pos.y, 10, 0, Math.PI * 2);
						this.ctx.stroke();
						break;
					default:
						this.ctx.fillRect(eff.pos.x - 2, eff.pos.y - 2, 4, 4);
				}
				this.ctx.restore();
			}
		}
	}
}

export type { Scene, Frame, Pose, SceneObject, FrameObjectState };