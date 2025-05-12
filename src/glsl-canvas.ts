import { getContext } from "./utils";
import {
  fragmentShaderSourceV1,
  vertexShaderSourceV1,
  fragmentShaderSourceV3,
  vertexShaderSourceV3,
} from "./shaders";

const DEFAULT_VERTICES = new Float32Array([
  -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
]);

class GlslCanvas {
  readonly container: HTMLElement;
  readonly canvas: HTMLCanvasElement;
  readonly gl: WebGL2RenderingContext;
  readonly program: WebGLProgram;

  constructor(container: HTMLElement, version: 1 | 3, frag?: string) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.canvas.style.display = "block";
    this.canvas.style.width = this.canvas.style.height = "100%";
    this.container.appendChild(this.canvas);

    this.gl = getContext(this.canvas);

    this.gl.clearColor(0, 0, 0, 1);
    if ("drawingBufferColorSpace" in this.gl) {
      this.gl.drawingBufferColorSpace = "display-p3";
    }
    if ("unpackColorSpace" in this.gl) {
      this.gl.unpackColorSpace = "display-p3";
    }

    const fShader =
      version === 3 ? fragmentShaderSourceV3 : fragmentShaderSourceV1;
    const vShader = version === 3 ? vertexShaderSourceV3 : vertexShaderSourceV1;

    const vertexShader = this.compileShader(vShader, "vert");
    const fragmentShader = this.compileShader(frag ?? fShader, "frag");

    this.program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);
    this.createBuffer(DEFAULT_VERTICES);

    const a_Position = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.enableVertexAttribArray(a_Position);
    this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, 0, 0);
  }

  private compileShader(source: string, type: "frag" | "vert") {
    const shader = this.gl.createShader(
      type === "frag" ? this.gl.FRAGMENT_SHADER : this.gl.VERTEX_SHADER
    );
    if (!shader) throw new Error("Shader creation failed");

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const message = `Shader compilation error: ${this.gl.getShaderInfoLog(
        shader
      )}`;
      this.gl.deleteShader(shader);
      throw new Error(message);
    }

    return shader;
  }

  private createProgram(
    vertexShader: WebGLShader,
    fragmentShader: WebGLShader
  ) {
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(
        `Program linking error: ${this.gl.getProgramInfoLog(program)}`
      );
    }

    return program;
  }

  private createBuffer(data: Float32Array) {
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buffer;
  }

  public resizeCanvas() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }

  public destroy() {
    this.container.innerHTML = "";
  }
}

export default GlslCanvas;
export { DEFAULT_VERTICES };
