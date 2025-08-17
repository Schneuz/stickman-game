import { z } from "zod";

// Basic types
export type Vec2 = {
  x: number;
  y: number;
};

export type JointName = 
  | "head"
  | "neck"
  | "shoulderL"
  | "shoulderR"
  | "elbowL"
  | "elbowR"
  | "handL"
  | "handR"
  | "pelvis"
  | "hipL"
  | "hipR"
  | "kneeL"
  | "kneeR"
  | "footL"
  | "footR";

export type Pose = {
  [key in JointName]: Vec2;
};

export type ObjStatus = "idle" | "attached" | "flying" | "destroyed" | "fallen";

export type SceneObject = {
  id: string;
  type: "rect" | "circle" | "polygon" | "placeholder";
  color?: string;
  width?: number;
  height?: number;
  radius?: number;
  points?: Vec2[];
};

export type FrameObjectState = {
  id: string;
  position: Vec2;
  rotation: number;
  status: ObjStatus;
  visible: boolean;
};

export type Frame = {
  actors: {
    [actorId: string]: Pose;
  };
  objects: FrameObjectState[];
  effects: Array<{
    type: string;
    position: Vec2;
    params?: Record<string, unknown>;
  }>;
};

export type Scene = {
  fps: number;
  frames: Frame[];
  catalog: {
    objects: Record<string, SceneObject>;
  };
};

// Zod schemas
const Vec2Schema = z.object({
  x: z.number(),
  y: z.number(),
});

const JointNameSchema = z.enum([
  "head",
  "neck",
  "shoulderL",
  "shoulderR",
  "elbowL",
  "elbowR",
  "handL",
  "handR",
  "pelvis",
  "hipL",
  "hipR",
  "kneeL",
  "kneeR",
  "footL",
  "footR",
]);

const PoseSchema = z.record(JointNameSchema, Vec2Schema);

const ObjStatusSchema = z.enum(["idle", "attached", "flying", "destroyed", "fallen"]);

const SceneObjectSchema = z.object({
  id: z.string(),
  type: z.enum(["rect", "circle", "polygon", "placeholder"]),
  color: z.string().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  radius: z.number().optional(),
  points: z.array(Vec2Schema).optional(),
});

const FrameObjectStateSchema = z.object({
  id: z.string(),
  position: Vec2Schema,
  rotation: z.number(),
  status: ObjStatusSchema,
  visible: z.boolean(),
});

const FrameSchema = z.object({
  actors: z.record(z.string(), PoseSchema),
  objects: z.array(FrameObjectStateSchema),
  effects: z.array(
    z.object({
      type: z.string(),
      position: Vec2Schema,
      params: z.record(z.string(), z.unknown()).optional(),
    })
  ),
});

const SceneSchema = z.object({
  fps: z.literal(12),
  frames: z.array(FrameSchema).length(36),
  catalog: z.object({
    objects: z.record(z.string(), SceneObjectSchema),
  }),
});

// Parse function
export function parseScene(json: unknown): { ok: true; data: Scene } | never {
  try {
    const result = SceneSchema.parse(json);
    return { ok: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors
        .map((e) => `${e.path.join(".")}: ${e.message}`)
        .join(", ");
      throw new Error(`Scene validation failed: ${message}`);
    }
    throw error;
  }
}

// Optional skeleton length check
export function checkSkeletonLengths(
  scene: Scene,
  tolerancePx: number = 2
): { frame: number; actor: string; joint1: JointName; joint2: JointName; deviation: number }[] {
  const warnings: {
    frame: number;
    actor: string;
    joint1: JointName;
    joint2: JointName;
    deviation: number;
  }[] = [];

  // Define expected bone lengths (approximate)
  const expectedLengths: Array<[JointName, JointName, number]> = [
    ["head", "neck", 15],
    ["neck", "shoulderL", 20],
    ["neck", "shoulderR", 20],
    ["shoulderL", "elbowL", 30],
    ["shoulderR", "elbowR", 30],
    ["elbowL", "handL", 30],
    ["elbowR", "handR", 30],
    ["neck", "pelvis", 50],
    ["pelvis", "hipL", 15],
    ["pelvis", "hipR", 15],
    ["hipL", "kneeL", 40],
    ["hipR", "kneeR", 40],
    ["kneeL", "footL", 40],
    ["kneeR", "footR", 40],
  ];

  scene.frames.forEach((frame, frameIndex) => {
    Object.entries(frame.actors).forEach(([actorId, pose]) => {
      expectedLengths.forEach(([joint1, joint2, expectedLength]) => {
        const p1 = pose[joint1];
        const p2 = pose[joint2];
        if (p1 && p2) {
          const actualLength = Math.sqrt(
            Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)
          );
          const deviation = Math.abs(actualLength - expectedLength);
          if (deviation > tolerancePx) {
            warnings.push({
              frame: frameIndex,
              actor: actorId,
              joint1,
              joint2,
              deviation,
            });
          }
        }
      });
    });
  });

  return warnings;
}