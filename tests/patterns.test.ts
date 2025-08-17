import { describe, it, expect } from "vitest";
import { buildThrowScene } from "@stickman/patterns";
import { parseScene } from "@stickman/schema";

describe("Pattern: Throw Scene", () => {
  it("should generate a valid throw scene", () => {
    const scene = buildThrowScene("A wirft eine Vase auf B");
    const result = parseScene(scene);
    
    expect(result.ok).toBe(true);
    expect(result.data.frames).toHaveLength(36);
    expect(result.data.fps).toBe(12);
  });

  it("should have impact effect at frame 17", () => {
    const scene = buildThrowScene("A wirft eine Vase auf B");
    const frame17 = scene.frames[17];
    
    // Check for bang effect
    const bangEffect = frame17?.effects.find((e) => e.type === "bang");
    expect(bangEffect).toBeDefined();
    
    // Check vase is destroyed
    const vase = frame17?.objects.find((o) => o.id === "vase01");
    expect(vase?.status).toBe("destroyed");
  });

  it("should spawn shards after impact", () => {
    const scene = buildThrowScene("A wirft eine Vase auf B");
    const frame17 = scene.frames[17];
    
    // Check shards exist
    const shards = frame17?.objects.filter((o) => o.id.startsWith("shard"));
    expect(shards?.length).toBe(6);
    
    // All shards should be flying initially
    shards?.forEach((shard) => {
      expect(shard.status).toBe("flying");
    });
  });

  it("should have shards fallen by frame 35", () => {
    const scene = buildThrowScene("A wirft eine Vase auf B");
    const frame35 = scene.frames[35];
    
    // Check shards have fallen
    const shards = frame35?.objects.filter((o) => o.id.startsWith("shard"));
    expect(shards?.length).toBe(6);
    
    // Most shards should be fallen by the end
    const fallenShards = shards?.filter((s) => s.status === "fallen");
    expect(fallenShards?.length).toBeGreaterThan(0);
  });

  it("should have consistent seed behavior", () => {
    const scene1 = buildThrowScene("Test", 42);
    const scene2 = buildThrowScene("Test", 42);
    
    // Same seed should produce identical scenes
    expect(JSON.stringify(scene1)).toBe(JSON.stringify(scene2));
    
    const scene3 = buildThrowScene("Test", 43);
    // Different seed should produce different scenes
    expect(JSON.stringify(scene1)).not.toBe(JSON.stringify(scene3));
  });
});