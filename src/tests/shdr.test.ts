// tests/Shdr.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import Shdr from "../index";

describe("Shdr", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("should initialize without errors", () => {
    const shdr = new Shdr({ container });
    expect(shdr).toBeDefined();
  });

  it("should play and pause correctly", () => {
    const shdr = new Shdr({ container });
    shdr.play();
    expect(shdr.paused).toBe(false);
    shdr.pause();
    expect(shdr.paused).toBe(true);
  });

  it("should update uniforms correctly", () => {
    const shdr = new Shdr({ container });
    shdr.updateUniform("time", 1.0);
    expect(shdr.uniforms["u_time"]).toBeDefined();
  });

  it("should destroy without errors", () => {
    const shdr = new Shdr({ container });
    expect(() => shdr.destroy()).not.toThrow();
  });
});
