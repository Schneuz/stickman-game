import type { Scene, Pose, Frame, Vec2, JointName } from "@stickman/schema";
import { SeededRandom, lerp, easeOut, easeIn } from "@stickman/utils";

// Constants
const CANVAS_WIDTH = 640;
const CANVAS_HEIGHT = 400;
const FLOOR_Y = 360;
const GRAVITY = 0.9;

// Helper function to create a basic standing pose
function createStandingPose(x: number, y: number): Pose {
  return {
    pelvis: { x, y },
    hipL: { x: x - 10, y: y + 5 },
    hipR: { x: x + 10, y: y + 5 },
    kneeL: { x: x - 12, y: y + 40 },
    kneeR: { x: x + 12, y: y + 40 },
    footL: { x: x - 12, y: y + 80 },
    footR: { x: x + 12, y: y + 80 },
    neck: { x, y: y - 50 },
    head: { x, y: y - 65 },
    shoulderL: { x: x - 20, y: y - 45 },
    shoulderR: { x: x + 20, y: y - 45 },
    elbowL: { x: x - 25, y: y - 20 },
    elbowR: { x: x + 25, y: y - 20 },
    handL: { x: x - 25, y: y + 5 },
    handR: { x: x + 25, y: y + 5 },
  };
}

// Helper to interpolate between poses
function interpolatePose(pose1: Pose, pose2: Pose, t: number): Pose {
  const result: Partial<Pose> = {};
  for (const joint in pose1) {
    const j = joint as JointName;
    result[j] = {
      x: lerp(pose1[j].x, pose2[j].x, t),
      y: lerp(pose1[j].y, pose2[j].y, t),
    };
  }
  return result as Pose;
}

export function buildThrowScene(text: string, seed: number = 0): Scene {
  const rng = new SeededRandom(seed);
  const frames: Frame[] = [];

  // Actor positions
  const A_X = 120;
  const B_X = 320;

  // Vase initial velocity with variance
  const vaseVx = 5 + rng.range(-0.5, 0.5);
  const vaseVy = -10 + rng.range(-1, 1);

  // Create poses for different states
  const aIdle = createStandingPose(A_X, FLOOR_Y);
  const bIdle = createStandingPose(B_X, FLOOR_Y);

  // A's wind-up pose
  const aWindup: Pose = {
    ...aIdle,
    shoulderR: { x: A_X + 15, y: FLOOR_Y - 55 },
    elbowR: { x: A_X + 5, y: FLOOR_Y - 65 },
    handR: { x: A_X - 10, y: FLOOR_Y - 60 },
  };

  // A's throw pose
  const aThrow: Pose = {
    ...aIdle,
    shoulderR: { x: A_X + 20, y: FLOOR_Y - 45 },
    elbowR: { x: A_X + 35, y: FLOOR_Y - 35 },
    handR: { x: A_X + 50, y: FLOOR_Y - 30 },
  };

  // B's reaction poses
  const bHit: Pose = {
    ...bIdle,
    head: { x: B_X - 5, y: FLOOR_Y - 70 },
    neck: { x: B_X - 3, y: FLOOR_Y - 52 },
  };

  const bStumble: Pose = {
    ...bHit,
    pelvis: { x: B_X - 5, y: FLOOR_Y + 5 },
    footL: { x: B_X - 20, y: FLOOR_Y + 80 },
    footR: { x: B_X + 5, y: FLOOR_Y + 80 },
  };

  // Vase trajectory
  let vaseX = A_X + 25;
  let vaseY = FLOOR_Y - 30;
  let vaseVxCurrent = vaseVx;
  let vaseVyCurrent = vaseVy;

  // Build frames
  for (let i = 0; i < 36; i++) {
    const frame: Frame = {
      actors: {},
      objects: [],
      effects: [],
    };

    // Actor A animation
    if (i <= 5) {
      // Attached phase - slight crouch
      const t = i / 5;
      frame.actors["A"] = interpolatePose(aIdle, aWindup, t * 0.3);
      frame.objects.push({
        id: "vase01",
        position: { x: frame.actors["A"].handR.x, y: frame.actors["A"].handR.y },
        rotation: 0,
        status: "attached",
        visible: true,
      });
    } else if (i <= 10) {
      // Wind-up
      const t = (i - 6) / 4;
      frame.actors["A"] = interpolatePose(aWindup, aWindup, 1);
      frame.objects.push({
        id: "vase01",
        position: { x: frame.actors["A"].handR.x, y: frame.actors["A"].handR.y },
        rotation: 0,
        status: "attached",
        visible: true,
      });
    } else if (i === 11) {
      // Release
      frame.actors["A"] = aThrow;
      vaseX = frame.actors["A"].handR.x;
      vaseY = frame.actors["A"].handR.y;
      frame.objects.push({
        id: "vase01",
        position: { x: vaseX, y: vaseY },
        rotation: 0,
        status: "flying",
        visible: true,
      });
    } else if (i <= 16) {
      // Follow through
      const t = (i - 12) / 4;
      frame.actors["A"] = interpolatePose(aThrow, aIdle, easeOut(t));
    } else {
      // Return to idle
      frame.actors["A"] = aIdle;
    }

    // Actor B animation
    if (i < 17) {
      frame.actors["B"] = bIdle;
    } else if (i === 17) {
      // Impact
      frame.actors["B"] = bHit;
    } else if (i <= 20) {
      // Stumble
      const t = (i - 17) / 3;
      frame.actors["B"] = interpolatePose(bHit, bStumble, t);
    } else if (i <= 25) {
      // Hold stumble
      frame.actors["B"] = bStumble;
    } else {
      // Recover
      const t = (i - 26) / 9;
      frame.actors["B"] = interpolatePose(bStumble, bIdle, easeOut(t));
    }

    // Vase physics (if not already handled)
    if (i >= 12 && i < 17) {
      // Flying phase
      vaseX += vaseVxCurrent;
      vaseY += vaseVyCurrent;
      vaseVyCurrent += GRAVITY;
      
      frame.objects.push({
        id: "vase01",
        position: { x: vaseX, y: vaseY },
        rotation: (i - 12) * 0.3,
        status: "flying",
        visible: true,
      });
    } else if (i === 17) {
      // Impact - spawn shards
      frame.objects.push({
        id: "vase01",
        position: { x: B_X, y: FLOOR_Y - 65 },
        rotation: 0,
        status: "destroyed",
        visible: false,
      });

      // Add impact effect
      frame.effects.push({
        type: "bang",
        position: { x: B_X, y: FLOOR_Y - 65 },
      });

      // Spawn 6 shards
      for (let j = 0; j < 6; j++) {
        frame.objects.push({
          id: `shard${j}`,
          position: { x: B_X, y: FLOOR_Y - 65 },
          rotation: rng.range(0, Math.PI * 2),
          status: "flying",
          visible: true,
        });
      }
    } else if (i > 17) {
      // Shards physics
      for (let j = 0; j < 6; j++) {
        const shardId = `shard${j}`;
        const t = i - 17;
        
        // Each shard has different trajectory
        const angle = (j / 6) * Math.PI * 2;
        const speed = 3 + rng.range(0, 2);
        const shardVx = Math.cos(angle) * speed;
        const shardVy = Math.sin(angle) * speed - 5;
        
        const shardX = B_X + shardVx * t;
        const shardY = FLOOR_Y - 65 + shardVy * t + 0.5 * GRAVITY * t * t;
        
        const status = shardY >= FLOOR_Y ? "fallen" : "flying";
        
        frame.objects.push({
          id: shardId,
          position: { 
            x: shardX, 
            y: Math.min(shardY, FLOOR_Y) 
          },
          rotation: t * 0.5,
          status,
          visible: true,
        });
      }
    }

    frames.push(frame);
  }

  // Create scene
  const scene: Scene = {
    fps: 12,
    frames,
    catalog: {
      objects: {
        vase01: {
          id: "vase01",
          type: "placeholder",
          color: "#8B4513",
        },
        shard0: {
          id: "shard0",
          type: "polygon",
          color: "#8B4513",
          points: [
            { x: -3, y: -3 },
            { x: 3, y: -2 },
            { x: 1, y: 3 },
            { x: -2, y: 2 },
          ],
        },
        shard1: {
          id: "shard1",
          type: "polygon",
          color: "#8B4513",
          points: [
            { x: -2, y: -4 },
            { x: 4, y: -1 },
            { x: 2, y: 2 },
            { x: -3, y: 1 },
          ],
        },
        shard2: {
          id: "shard2",
          type: "polygon",
          color: "#8B4513",
          points: [
            { x: -4, y: -2 },
            { x: 2, y: -3 },
            { x: 3, y: 2 },
            { x: -1, y: 3 },
          ],
        },
        shard3: {
          id: "shard3",
          type: "polygon",
          color: "#8B4513",
          points: [
            { x: -3, y: -1 },
            { x: 1, y: -3 },
            { x: 3, y: 1 },
            { x: 0, y: 3 },
          ],
        },
        shard4: {
          id: "shard4",
          type: "polygon",
          color: "#8B4513",
          points: [
            { x: -2, y: -2 },
            { x: 3, y: -3 },
            { x: 2, y: 3 },
            { x: -3, y: 2 },
          ],
        },
        shard5: {
          id: "shard5",
          type: "polygon",
          color: "#8B4513",
          points: [
            { x: -1, y: -4 },
            { x: 4, y: 0 },
            { x: 1, y: 3 },
            { x: -2, y: 1 },
          ],
        },
      },
    },
  };

  return scene;
}