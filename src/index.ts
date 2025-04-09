// TODO: add demos for Basic, Uniform Updates, Static Textures, Dynamic Textures, Webcam Textures

import GlslAssetManager from "./glsl-asset-manager";
import GlslCanvas, { DEFAULT_VERTICES } from "./glsl-canvas";
import type {
  UniformMap,
  UniformConfigValue,
  UnstableUniformMap,
} from "./types";

export default class GlslRenderer extends GlslCanvas {
  private mousePos = [0, 0];
  private controller = new AbortController();
  private rafId: number | null = null;
  readonly assets: GlslAssetManager;

  constructor(
    container: HTMLElement,
    frag?: string,
    initialUniforms: UnstableUniformMap = {}
  ) {
    super(container, frag);
    this.assets = new GlslAssetManager(this.gl, this.program, initialUniforms);

    this.handleResize();
    this.addEventListeners();
  }

  private render(time: number) {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    // Pass uniforms
    const uTime = this.assets.uniforms.get("u_time");
    if (uTime) {
      this.gl.uniform1f(uTime.location, time * 0.001); // Time in seconds
    }
    const uMouse = this.assets.uniforms.get("u_mouse");
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

    const uRes = this.assets.uniforms.get("u_resolution") ?? null;

    if (!uRes) {
      console.warn(
        "Could not find resolution uniform (u_resolution) location when resizing canvas"
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

  public updateUniform(name: string, value: UniformConfigValue) {
    this.assets.setUniformValue(name, value);
  }

  public destroy() {
    super.destroy();
    this.assets.destroy();
    this.controller.abort();
  }
}
