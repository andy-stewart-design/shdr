import { test, expect } from "vitest";
import {
  vertexShaderSourceV1,
  vertexShaderSourceV3,
  fragmentShaderSourceV1,
  fragmentShaderSourceV3,
} from "../shaders";

test("vertexShaderSourceV1 compilation in real browser", () => {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");

  if (!gl) throw new Error("WebGL not supported");

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);

  if (!vertexShader) {
    throw new Error("Could not create a vertex shader using gl.createShader");
  }

  gl.shaderSource(vertexShader, vertexShaderSourceV1);
  gl.compileShader(vertexShader);

  const success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (!success) {
    const error = gl.getShaderInfoLog(vertexShader);
    throw new Error(`Vertex shader compilation failed: ${error}`);
  }

  expect(success).toBe(true);
});

test("vertexShaderSourceV3 compilation in real browser", () => {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");

  if (!gl) throw new Error("WebGL not supported");

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);

  if (!vertexShader) {
    throw new Error("Could not create a vertex shader using gl.createShader");
  }

  gl.shaderSource(vertexShader, vertexShaderSourceV3);
  gl.compileShader(vertexShader);

  const success = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
  if (!success) {
    const error = gl.getShaderInfoLog(vertexShader);
    throw new Error(`Vertex shader compilation failed: ${error}`);
  }

  expect(success).toBe(true);
});

test("fragmentShaderSourceV1 compilation in real browser", () => {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");

  if (!gl) throw new Error("WebGL not supported");

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  if (!fragmentShader) {
    throw new Error("Could not create a vertex shader using gl.createShader");
  }

  gl.shaderSource(fragmentShader, fragmentShaderSourceV1);
  gl.compileShader(fragmentShader);

  const success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (!success) {
    const error = gl.getShaderInfoLog(fragmentShader);
    throw new Error(`Vertex shader compilation failed: ${error}`);
  }

  expect(success).toBe(true);
});

test("fragmentShaderSourceV1 compilation in real browser", () => {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");

  if (!gl) throw new Error("WebGL not supported");

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

  if (!fragmentShader) {
    throw new Error("Could not create a vertex shader using gl.createShader");
  }

  gl.shaderSource(fragmentShader, fragmentShaderSourceV3);
  gl.compileShader(fragmentShader);

  const success = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
  if (!success) {
    const error = gl.getShaderInfoLog(fragmentShader);
    throw new Error(`Vertex shader compilation failed: ${error}`);
  }

  expect(success).toBe(true);
});
