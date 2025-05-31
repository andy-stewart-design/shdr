import type { UniformType, UniformValue } from "./types";
import { isImageFile, isVideoFile } from "./validators";

function getContext(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2");

  if (!gl) throw new Error("WebGL not supported");

  return gl;
}

function updateTexture(
  gl: WebGL2RenderingContext,
  texture?: HTMLImageElement | HTMLVideoElement
) {
  const { TEXTURE_2D, RGBA, UNSIGNED_BYTE } = gl;
  const pixel = new Uint8Array([0, 0, 0, 255]);

  if (!texture) {
    gl.texImage2D(TEXTURE_2D, 0, RGBA, 1, 1, 0, RGBA, UNSIGNED_BYTE, pixel);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, RGBA, RGBA, UNSIGNED_BYTE, texture);
  }
}

function setTextureParams(
  gl: WebGL2RenderingContext,
  texture: HTMLImageElement | HTMLVideoElement
) {
  if (isPowerOf2(texture.width) && isPowerOf2(texture.height)) {
    // Set parameters for power-of-2 textures
    gl.generateMipmap(gl.TEXTURE_2D);
  } else {
    // Set parameters for non-power-of-2 textures
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
}

// Helper function to check if a number is a power of 2
function isPowerOf2(value: number): boolean {
  return value > 0 && (value & (value - 1)) === 0;
}

interface ValidInferredUniform {
  valid: true;
  type: UniformType;
  value: UniformValue;
}

interface InvalidInferredUniform {
  valid: false;
  message: string;
}

type InferredUniform = ValidInferredUniform | InvalidInferredUniform;

function getUniformType(uniform: unknown): InferredUniform {
  if (typeof uniform === "string") {
    if (isImageFile(uniform)) {
      return { valid: true, type: "image", value: uniform };
    } else if (isVideoFile(uniform)) {
      return { valid: true, type: "video", value: uniform };
    } else if (uniform === "webcam") {
      return { valid: true, type: "webcam", value: uniform };
    } else if (!isNaN(Number(uniform)) && uniform.includes(".")) {
      return { valid: true, type: "float", value: parseFloat(uniform) };
    } else if (!isNaN(Number(uniform)) && !uniform.includes(".")) {
      return { valid: true, type: "int", value: parseInt(uniform) };
    } else {
      return { valid: false, message: `Unknown uniform type: ${uniform}` };
    }
  } else if (Array.isArray(uniform)) {
    if (uniform.length >= 2 && uniform.length <= 4) {
      const type = `vec${uniform.length}` as "vec2" | "vec3" | "vec4";
      return { valid: true, type, value: uniform };
    } else {
      return {
        valid: false,
        message: `Invalid vector length: ${uniform.length}`,
      };
    }
  } else if (typeof uniform === "number") {
    return { valid: true, type: "float", value: uniform };
  } else if (typeof uniform === "boolean") {
    return { valid: true, type: "bool", value: uniform };
  } else {
    return { valid: false, message: `Unknown uniform type: ${uniform}` };
  }
}

function setUniformWarning(name: string, type: string) {
  return `[GLSL.TS]: Couldn't update ${name}, value must be a ${type}`;
}

type UniformCase = "snake" | "camel";

function formatUniform(name: string, prefix: string, textCase: UniformCase) {
  if (textCase === "snake") {
    return `${prefix}_${name}`;
  } else {
    const ccName = name.charAt(0).toUpperCase() + name.slice(1);
    return `${prefix}${ccName}`;
  }
}

export {
  getContext,
  updateTexture,
  setTextureParams,
  getUniformType,
  formatUniform,
  setUniformWarning,
  type UniformCase,
};
