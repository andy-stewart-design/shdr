import {
  getContext,
  updateTexture,
  setTextureParams,
  getUniformType,
  setUniformWarning,
  formatUniform,
} from "../utils";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("getContext", () => {
  it("returns WebGL2 context if available", () => {
    const canvas = document.createElement("canvas");
    const gl = getContext(canvas);
    expect(gl).toBeInstanceOf(WebGL2RenderingContext);
  });

  it("throws if WebGL2 is not supported", () => {
    const canvas = document.createElement("canvas");
    vi.spyOn(canvas, "getContext").mockReturnValueOnce(null);
    expect(() => getContext(canvas)).toThrow("WebGL not supported");
  });
});

describe("updateTexture", () => {
  let gl: WebGL2RenderingContext;
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    canvas = document.createElement("canvas");
    gl = getContext(canvas);
    vi.spyOn(gl, "texImage2D");
  });

  it("uses fallback pixel if no texture provided", () => {
    updateTexture(gl);
    expect(gl.texImage2D).toHaveBeenCalledWith(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 255])
    );
  });

  it("uses texture if provided", () => {
    const image = new Image();
    vi.spyOn(gl, "texImage2D");
    updateTexture(gl, image);
    expect(gl.texImage2D).toHaveBeenCalledWith(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      image
    );
  });
});

describe("setTextureParams", () => {
  let gl: WebGL2RenderingContext;

  beforeEach(() => {
    const canvas = document.createElement("canvas");
    gl = getContext(canvas);
  });

  it("calls generateMipmap for power-of-2 texture", () => {
    const image = new Image();
    image.width = 128;
    image.height = 64;

    const spy = vi.spyOn(gl, "generateMipmap");
    setTextureParams(gl, image);
    expect(spy).toHaveBeenCalledWith(gl.TEXTURE_2D);
  });

  it("sets clamp and filter params for non-power-of-2 texture", () => {
    const image = new Image();
    image.width = 100;
    image.height = 60;

    const wrapS = vi.spyOn(gl, "texParameteri");
    setTextureParams(gl, image);
    expect(wrapS).toHaveBeenCalledWith(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_S,
      gl.CLAMP_TO_EDGE
    );
    expect(wrapS).toHaveBeenCalledWith(
      gl.TEXTURE_2D,
      gl.TEXTURE_WRAP_T,
      gl.CLAMP_TO_EDGE
    );
    expect(wrapS).toHaveBeenCalledWith(
      gl.TEXTURE_2D,
      gl.TEXTURE_MIN_FILTER,
      gl.LINEAR
    );
  });
});

describe("getUniformType", () => {
  it("infers float from decimal string", () => {
    expect(getUniformType("3.14")).toEqual({
      valid: true,
      type: "float",
      value: 3.14,
    });
  });

  it("infers int from integer string", () => {
    expect(getUniformType("42")).toEqual({
      valid: true,
      type: "int",
      value: 42,
    });
  });

  it("infers vec3 from array", () => {
    expect(getUniformType([1, 2, 3])).toEqual({
      valid: true,
      type: "vec3",
      value: [1, 2, 3],
    });
  });

  it("returns error on invalid array length", () => {
    expect(getUniformType([1])).toEqual({
      valid: false,
      message: "Invalid vector length: 1",
    });
  });

  it("infers bool", () => {
    expect(getUniformType(true)).toEqual({
      valid: true,
      type: "bool",
      value: true,
    });
  });

  it("handles unknown string", () => {
    expect(getUniformType("nonsense")).toEqual({
      valid: false,
      message: "Unknown uniform type: nonsense",
    });
  });
});

describe("setUniformWarning", () => {
  it("returns a formatted warning string", () => {
    expect(setUniformWarning("foo", "float")).toBe(
      "[GLSL.TS]: Couldn't update foo, value must be a float"
    );
  });
});

describe("formatUniform", () => {
  it("formats name in snake_case", () => {
    expect(formatUniform("myVar", "u", "snake")).toBe("u_myVar");
  });

  it("formats name in camelCase", () => {
    expect(formatUniform("myVar", "u", "camel")).toBe("uMyVar");
  });
});

it("infers webcam string", () => {
  expect(getUniformType("webcam")).toEqual({
    valid: true,
    type: "webcam",
    value: "webcam",
  });
});

it("infers float with decimal point and leading zero", () => {
  expect(getUniformType("0.5")).toEqual({
    valid: true,
    type: "float",
    value: 0.5,
  });
});

it("infers float when string includes dot but is not a number", () => {
  expect(getUniformType("NaN.123")).toEqual({
    valid: false,
    message: "Unknown uniform type: NaN.123",
  });
});

it("infers float from number", () => {
  expect(getUniformType(1.23)).toEqual({
    valid: true,
    type: "float",
    value: 1.23,
  });
});

it("formats camelCase when name is already capitalized", () => {
  expect(formatUniform("AlreadyCapital", "u", "camel")).toBe("uAlreadyCapital");
});
