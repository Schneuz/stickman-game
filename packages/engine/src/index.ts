import type { Pose, FrameObjectState, SceneObject, Scene, Frame } from "@stickman/schema";

// Draw a stickman given a pose
export function drawStickman(ctx: CanvasRenderingContext2D, pose: Pose): void {
  ctx.strokeStyle = "#000000";
  ctx.lineWidth = 2;
  ctx.fillStyle = "#000000";

  // Draw head (circle)
  ctx.beginPath();
  ctx.arc(pose.head.x, pose.head.y, 8, 0, Math.PI * 2);
  ctx.fill();

  // Draw body lines
  const connections: Array<[keyof Pose, keyof Pose]> = [
    ["head", "neck"],
    ["neck", "shoulderL"],
    ["neck", "shoulderR"],
    ["shoulderL", "elbowL"],
    ["elbowL", "handL"],
    ["shoulderR", "elbowR"],
    ["elbowR", "handR"],
    ["neck", "pelvis"],
    ["pelvis", "hipL"],
    ["hipL", "kneeL"],
    ["kneeL", "footL"],
    ["pelvis", "hipR"],
    ["hipR", "kneeR"],
    ["kneeR", "footR"],
  ];

  connections.forEach(([from, to]) => {
    const p1 = pose[from];
    const p2 = pose[to];
    if (p1 && p2) {
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  });
}

// Draw an object based on its type and state
export function drawObject(
  ctx: CanvasRenderingContext2D,
  frameObj: FrameObjectState,
  catalog: Record<string, SceneObject>
): void {
  const obj = catalog[frameObj.id];
  if (!obj || !frameObj.visible) return;

  ctx.save();
  ctx.translate(frameObj.position.x, frameObj.position.y);
  ctx.rotate(frameObj.rotation);

  if (obj.color) {
    ctx.fillStyle = obj.color;
    ctx.strokeStyle = obj.color;
  } else {
    ctx.fillStyle = "#888888";
    ctx.strokeStyle = "#888888";
  }

  switch (obj.type) {
    case "rect":
      if (obj.width && obj.height) {
        ctx.fillRect(-obj.width / 2, -obj.height / 2, obj.width, obj.height);
      }
      break;

    case "circle":
      if (obj.radius) {
        ctx.beginPath();
        ctx.arc(0, 0, obj.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "polygon":
      if (obj.points && obj.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(obj.points[0]!.x, obj.points[0]!.y);
        for (let i = 1; i < obj.points.length; i++) {
          ctx.lineTo(obj.points[i]!.x, obj.points[i]!.y);
        }
        ctx.closePath();
        ctx.fill();
      }
      break;

    case "placeholder":
      // Draw a simple placeholder box
      ctx.strokeStyle = "#999999";
      ctx.lineWidth = 2;
      ctx.strokeRect(-15, -15, 30, 30);
      ctx.beginPath();
      ctx.moveTo(-15, -15);
      ctx.lineTo(15, 15);
      ctx.moveTo(15, -15);
      ctx.lineTo(-15, 15);
      ctx.stroke();
      break;
  }

  ctx.restore();
}

// Draw effects
function drawEffects(
  ctx: CanvasRenderingContext2D,
  effects: Frame["effects"]
): void {
  effects.forEach((effect) => {
    ctx.save();
    ctx.translate(effect.position.x, effect.position.y);

    switch (effect.type) {
      case "bang":
        // Draw explosion effect
        ctx.strokeStyle = "#FF6600";
        ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
          const angle = (i * Math.PI * 2) / 8;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(angle) * 20, Math.sin(angle) * 20);
          ctx.stroke();
        }
        break;

      default:
        // Generic effect placeholder
        ctx.fillStyle = "#FFFF00";
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        break;
    }

    ctx.restore();
  });
}

// Player class for animation playback
export class Player {
  private ctx: CanvasRenderingContext2D;
  private scene: Scene;
  private currentFrame: number = 0;
  private playing: boolean = false;
  private lastFrameTime: number = 0;
  private animationId: number | null = null;
  private onionSkin: boolean = false;
  private frameInterval: number;

  constructor(ctx: CanvasRenderingContext2D, scene: Scene) {
    this.ctx = ctx;
    this.scene = scene;
    this.frameInterval = 1000 / scene.fps; // 83.33ms for 12 FPS
  }

  private drawFrame(frameIndex: number, alpha: number = 1): void {
    if (frameIndex < 0 || frameIndex >= this.scene.frames.length) return;

    const frame = this.scene.frames[frameIndex]!;
    const prevAlpha = this.ctx.globalAlpha;
    this.ctx.globalAlpha = alpha;

    // Draw actors
    Object.values(frame.actors).forEach((pose) => {
      drawStickman(this.ctx, pose);
    });

    // Draw objects
    frame.objects.forEach((obj) => {
      drawObject(this.ctx, obj, this.scene.catalog.objects);
    });

    // Draw effects
    drawEffects(this.ctx, frame.effects);

    this.ctx.globalAlpha = prevAlpha;
  }

  private clearCanvas(): void {
    const canvas = this.ctx.canvas;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  private animate = (timestamp: number): void => {
    if (!this.playing) return;

    if (timestamp - this.lastFrameTime >= this.frameInterval) {
      this.clearCanvas();

      // Draw onion skin if enabled
      if (this.onionSkin) {
        if (this.currentFrame > 0) {
          this.drawFrame(this.currentFrame - 1, 0.2);
        }
        if (this.currentFrame < this.scene.frames.length - 1) {
          this.drawFrame(this.currentFrame + 1, 0.2);
        }
      }

      // Draw current frame
      this.drawFrame(this.currentFrame);

      // Move to next frame
      this.currentFrame = (this.currentFrame + 1) % this.scene.frames.length;
      this.lastFrameTime = timestamp;
    }

    this.animationId = requestAnimationFrame(this.animate);
  };

  play(): void {
    if (this.playing) return;
    this.playing = true;
    this.lastFrameTime = performance.now();
    this.animationId = requestAnimationFrame(this.animate);
  }

  pause(): void {
    this.playing = false;
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  goto(frameIndex: number): void {
    this.currentFrame = Math.max(0, Math.min(frameIndex, this.scene.frames.length - 1));
    this.clearCanvas();

    // Draw onion skin if enabled
    if (this.onionSkin) {
      if (this.currentFrame > 0) {
        this.drawFrame(this.currentFrame - 1, 0.2);
      }
      if (this.currentFrame < this.scene.frames.length - 1) {
        this.drawFrame(this.currentFrame + 1, 0.2);
      }
    }

    this.drawFrame(this.currentFrame);
  }

  setOnionSkin(enabled: boolean): void {
    this.onionSkin = enabled;
    this.goto(this.currentFrame); // Redraw with new setting
  }

  getCurrentFrame(): number {
    return this.currentFrame;
  }

  setScene(scene: Scene): void {
    this.scene = scene;
    this.currentFrame = 0;
    this.frameInterval = 1000 / scene.fps;
    this.goto(0);
  }
}