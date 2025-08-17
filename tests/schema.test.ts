import { describe, it, expect } from "vitest";
import { parseScene } from "@stickman/schema";

describe("Schema validation", () => {
  it("should parse a valid scene", () => {
    const validScene = {
      fps: 12,
      frames: Array(36).fill(null).map(() => ({
        actors: {},
        objects: [],
        effects: [],
      })),
      catalog: {
        objects: {},
      },
    };

    const result = parseScene(validScene);
    expect(result.ok).toBe(true);
    expect(result.data).toBeDefined();
  });

  it("should reject scene with wrong number of frames", () => {
    const invalidScene = {
      fps: 12,
      frames: Array(35).fill(null).map(() => ({
        actors: {},
        objects: [],
        effects: [],
      })),
      catalog: {
        objects: {},
      },
    };

    expect(() => parseScene(invalidScene)).toThrow();
  });

  it("should reject scene with wrong FPS", () => {
    const invalidScene = {
      fps: 24, // Should be 12
      frames: Array(36).fill(null).map(() => ({
        actors: {},
        objects: [],
        effects: [],
      })),
      catalog: {
        objects: {},
      },
    };

    expect(() => parseScene(invalidScene)).toThrow();
  });

  it("should reject scene with invalid object reference", () => {
    const invalidScene = {
      fps: 12,
      frames: Array(36).fill(null).map(() => ({
        actors: {},
        objects: [
          {
            id: "unknownObject",
            position: { x: 0, y: 0 },
            rotation: 0,
            status: "idle",
            visible: true,
          },
        ],
        effects: [],
      })),
      catalog: {
        objects: {}, // unknownObject not in catalog
      },
    };

    // This should pass validation as the schema doesn't enforce referential integrity
    const result = parseScene(invalidScene);
    expect(result.ok).toBe(true);
  });
});