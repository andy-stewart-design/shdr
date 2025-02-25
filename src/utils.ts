function getContext(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl");

  if (!gl) throw new Error("WebGL not supported");

  return gl;
}

function updateTexture(
  gl: WebGLRenderingContext,
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
  gl: WebGLRenderingContext,
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

export { getContext, updateTexture, setTextureParams };
