// tests/Shdr.test.ts
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import Shdr from "../index";
import {
  camelCaseUniformFrag,
  customUniformFrag,
  shadertoyUniformFrag,
  tick,
} from "./_test-assets";

describe("Shdr", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.style.width = "800px"; // Set initial size
    container.style.height = "600px";
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should initialize without errors", () => {
    const shdr = new Shdr({ container });
    expect(shdr).toBeDefined();
  });

  it("should initialize using OpenGL ES 1.0", () => {
    const shdr = new Shdr({ container, glVersion: 1 });
    expect(shdr).toBeDefined();
  });

  it("should initialize with custom uniforms", () => {
    const uniforms = { test: 1 };
    const shdr = new Shdr({
      container,
      frag: customUniformFrag,
      uniforms,
    });
    expect(shdr.uniforms["u_test"]).toEqual(1);
  });

  it("should initialize with camelcase uniforms", () => {
    const shdr = new Shdr({
      container,
      frag: camelCaseUniformFrag,
      uniformCase: "camel",
    });
    expect(shdr.uniforms["uMouse"]).toBeDefined();
    expect(shdr.uniforms["uResolution"]).toBeDefined();
    expect(shdr.uniforms["uTime"]).toBeDefined();
  });

  it("should initialize with custom uniform prefix", () => {
    const shdr = new Shdr({
      container,
      frag: shadertoyUniformFrag,
      uniformPrefix: "i",
      uniformCase: "camel",
    });
    expect(shdr.uniforms["iMouse"]).toBeDefined();
    expect(shdr.uniforms["iResolution"]).toBeDefined();
    expect(shdr.uniforms["iTime"]).toBeDefined();
  });

  it("should play and pause correctly", () => {
    const shdr = new Shdr({ container });
    shdr.play();
    expect(shdr.paused).toBe(false);
    shdr.pause();
    expect(shdr.paused).toBe(true);
  });

  it("should update the time unform while playing", async () => {
    const shdr = new Shdr({ container });
    shdr.play();
    await tick(1000);
    expect(shdr.uniforms["u_time"]).toBeGreaterThan(0.5);
  });

  it("should update the resolution unform when the container is resized", async () => {
    const shdr = new Shdr({ container });
    shdr.play();
    container.style.width = "1200px";
    container.style.height = "900px";
    await tick(100);
    expect(shdr.uniforms["u_resolution"]).toEqual([1200, 900]);
  });

  it("should update uniforms correctly", () => {
    const shdr = new Shdr({ container });
    shdr.updateUniform("mouse", [14, 12]);
    expect(shdr.uniforms["u_mouse"]).toEqual([14, 12]);
  });

  it("should destroy without errors", () => {
    const shdr = new Shdr({ container });
    expect(() => shdr.destroy()).not.toThrow();
  });
});
