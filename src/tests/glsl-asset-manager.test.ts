import { getContext } from "../utils";
import { fragmentShaderSourceV3, vertexShaderSourceV3 } from "../shaders";
import { customUniformFrag, tick } from "./_test-assets";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { UniformMap } from "../types";
import GlslAssetManager from "../glsl-asset-manager";

describe("GlslAssetManager", () => {
  it("should initialize built-in uniforms", () => {
    const { gl, program } = initWebGL(fragmentShaderSourceV3);
    const uniforms: UniformMap = {};
    const manager = new GlslAssetManager(gl, program, uniforms, "u", "snake");

    expect(manager.uniforms.get("u_time")).toBeDefined();
    expect(manager.uniforms.get("u_resolution")).toBeDefined();
    expect(manager.uniforms.get("u_mouse")).toBeDefined();
  });

  it("should initialize custom uniforms", () => {
    const { gl, program } = initWebGL(customUniformFrag);
    const uniforms: UniformMap = {
      test: 1,
      my_float: 1,
      my_vector: [1, 2],
    };
    const manager = new GlslAssetManager(gl, program, uniforms, "u", "snake");

    expect(manager.uniforms.get("u_test")).toBeDefined();
    expect(manager.uniforms.get("u_my_float")).toBeDefined();
    expect(manager.uniforms.get("u_my_vector")).toBeDefined();
  });

  it("should warn when setting a uniform that doesn't exist", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { gl, program } = initWebGL(customUniformFrag);
    const uniforms: UniformMap = { undefined_uniform: 1 };
    new GlslAssetManager(gl, program, uniforms, "u", "snake");

    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining("[GLSL.TS]: couldn't init uniform")
    );
  });

  it("should load an image", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { gl, program } = initWebGL(customUniformFrag);
    const uniforms: UniformMap = {
      my_texture: "https://picsum.photos/200/300.jpg",
    };
    new GlslAssetManager(gl, program, uniforms, "u", "snake");

    await tick(1000);

    expect(consoleError).not.toHaveBeenCalled();
  });

  it("should load a video", async () => {
    // const consoleError = vi
    //   .spyOn(console, "error")
    //   .mockImplementation(() => {});

    const { gl, program } = initWebGL(customUniformFrag);
    const uniforms: UniformMap = {
      my_texture:
        "https://res.cloudinary.com/andystewartdesign/video/upload/v1731963042/blobs-clean.mp4",
    };
    new GlslAssetManager(gl, program, uniforms, "u", "snake");

    await tick(1000);

    // expect(consoleError).not.toHaveBeenCalled();
  });

  it("should throw an error when trying to load a fake image", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { gl, program } = initWebGL(customUniformFrag);
    const uniforms: UniformMap = {
      my_texture: "https://example.com/fake-image.png",
    };
    new GlslAssetManager(gl, program, uniforms, "u", "snake");

    await tick(1000);

    expect(consoleError).toHaveBeenCalled();
  });

  it("should throw an error when trying to load a fake video", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { gl, program } = initWebGL(customUniformFrag);
    const uniforms: UniformMap = {
      my_texture: "https://example.com/fake-video.mp4",
    };
    new GlslAssetManager(gl, program, uniforms, "u", "snake");

    await tick(1000);

    expect(consoleError).toHaveBeenCalled();
  });
});

function initWebGL(frag: string) {
  const canvas = document.createElement("canvas");
  const gl = getContext(canvas);
  const vertexShader = compileShader(gl, vertexShaderSourceV3, "vert");
  const fragmentShader = compileShader(gl, frag, "frag");
  const program = createProgram(gl, vertexShader, fragmentShader);
  return { gl, program };
}

function createProgram(
  gl: WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program linking error: ${gl.getProgramInfoLog(program)}`);
  }

  return program;
}

function compileShader(
  gl: WebGL2RenderingContext,
  source: string,
  type: "frag" | "vert"
) {
  const shader = gl.createShader(
    type === "frag" ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER
  );
  if (!shader) throw new Error("Shader creation failed");

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = `Shader compilation error: ${gl.getShaderInfoLog(shader)}`;
    gl.deleteShader(shader);
    throw new Error(message);
  }

  return shader;
}
