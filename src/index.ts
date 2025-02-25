import GlslAssetManager from "./glsl-asset-manager";
import GlslCanvas, { DEFAULT_VERTICES } from "./glsl-canvas";
import type { UniformConfig, UniformValue } from "./types";

export default class GlslRenderer extends GlslCanvas {
  private mousePosition = [0, 0];
  readonly assets: GlslAssetManager;
  private controller = new AbortController();
  private rafId: number | null = null;

  constructor(
    container: HTMLElement,
    frag?: string,
    initialUniforms: UniformConfig = {}
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
    const uTime = this.assets.uniforms.get("u_time") ?? null;
    this.gl.uniform1f(uTime, time * 0.001); // Time in seconds
    const uMouse = this.assets.uniforms.get("u_mouse") ?? null;
    this.gl.uniform2f(uMouse, this.mousePosition[0], this.mousePosition[1]);

    // render dynamic textures
    this.assets.renderDynamicTextures();

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, DEFAULT_VERTICES.length / 2);

    requestAnimationFrame((t) => this.render(t));
  }

  private handleResize() {
    super.resizeCanvas();

    const uRes = this.assets.uniforms.get("u_resolution") ?? null;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(uRes, this.canvas.width, this.canvas.height);
  }

  private addEventListeners() {
    const { signal } = this.controller;

    this.canvas.addEventListener(
      "mousemove",
      (event) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition[0] = event.clientX - rect.left;
        this.mousePosition[1] = rect.height - (event.clientY - rect.top); // Flip Y-axis
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

  public updateUniform(name: string, config: UniformValue) {
    this.assets.setUniform(name, config);
  }

  public destroy() {
    super.destroy();
    this.assets.destroy();
    this.controller.abort();
  }
}
