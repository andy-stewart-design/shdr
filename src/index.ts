import GlslAssetManager from "./glsl-asset-manager";
import GlslCanvas, { DEFAULT_VERTICES } from "./glsl-canvas";
import type { UniformValue, UniformMap } from "./types";

interface GlslRendererConstructorProps {
  container: HTMLElement;
  frag?: string;
  uniforms?: UniformMap;
  uniformPrefix?: string;
  glVersion?: 1 | 3;
}

export default class GlslRenderer extends GlslCanvas {
  private mousePos = [0, 0];
  private controller = new AbortController();
  private rafId: number | null = null;
  readonly assets: GlslAssetManager;

  constructor({
    container,
    frag,
    uniforms = {},
    uniformPrefix = "u_",
    glVersion = 3,
  }: GlslRendererConstructorProps) {
    super(container, glVersion, frag);
    this.assets = new GlslAssetManager(
      this.gl,
      this.program,
      uniforms,
      uniformPrefix
    );

    this.handleResize();
    this.addEventListeners();
  }

  private render(time: number) {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Pass uniforms
    const uTime = this.assets.uniforms.get(`${this.assets.uniformPrefix}time`);
    if (uTime) {
      this.gl.uniform1f(uTime.location, time * 0.001); // Time in seconds
    }
    const uMouse = this.assets.uniforms.get(
      `${this.assets.uniformPrefix}mouse`
    );
    if (uMouse) {
      this.gl.uniform2f(uMouse.location, this.mousePos[0], this.mousePos[1]);
    }

    // render dynamic textures
    this.assets.renderDynamicTextures();

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, DEFAULT_VERTICES.length / 2);

    requestAnimationFrame((t) => this.render(t));
  }

  private handleResize() {
    super.resizeCanvas();

    const uRes =
      this.assets.uniforms.get(`${this.assets.uniformPrefix}resolution`) ??
      null;

    if (!uRes) {
      console.warn(
        `Could not find resolution uniform (${this.assets.uniformPrefix}resolution) location when resizing canvas`
      );
      return;
    }

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(uRes.location, this.canvas.width, this.canvas.height);
  }

  private addEventListeners() {
    const { signal } = this.controller;

    this.canvas.addEventListener(
      "mousemove",
      (event) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos[0] = event.clientX - rect.left;
        this.mousePos[1] = rect.height - (event.clientY - rect.top); // Flip Y-axis
      },
      { signal }
    );

    this.canvas.addEventListener(
      "touchmove",
      (event) => {
        const { clientX, clientY } = event.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos[0] = clientX - rect.left;
        this.mousePos[1] = rect.height - (clientY - rect.top); // Flip Y-axis
      },
      { signal }
    );

    window.addEventListener("resize", () => this.handleResize(), { signal });
  }

  public play() {
    this.rafId = requestAnimationFrame((t) => this.render(t));
  }

  public pause() {
    if (typeof this.rafId === "number") {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  public updateUniform(name: string, value: UniformValue) {
    this.assets.setUniformValue(name, value);
  }

  public destroy() {
    super.destroy();
    this.assets.destroy();
    this.controller.abort();
  }
}
