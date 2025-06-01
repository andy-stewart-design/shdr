import GlslAssetManager from "./glsl-asset-manager";
import GlslCanvas, { DEFAULT_VERTICES } from "./glsl-canvas";
import type { UniformValue, UniformMap } from "./types";
import { getUniformType, type UniformCase } from "./utils";

interface ShdrConstructorProps {
  container: HTMLElement;
  frag?: string;
  uniforms?: UniformMap;
  uniformPrefix?: string;
  uniformCase?: UniformCase;
  glVersion?: 1 | 3;
}

export default class Shdr extends GlslCanvas {
  private mousePos = [0, 0];
  private controller = new AbortController();
  private resizeObserver: ResizeObserver | null = null;
  private rafId: number | null = null;
  private startTime: number | null = null;
  private pauseStartTime: number | null = null;
  private lastRenderTime: number = 0;
  private totalPausedTime: number = 0;
  private assets: GlslAssetManager;

  constructor({
    container,
    frag,
    uniforms = {},
    uniformPrefix = "u",
    uniformCase = "snake",
    glVersion = 3,
  }: ShdrConstructorProps) {
    super(container, glVersion, frag);
    this.assets = new GlslAssetManager(
      this.gl,
      this.program,
      uniforms,
      uniformPrefix,
      uniformCase
    );

    this.handleResize();
    this.addEventListeners();
  }

  private render(time: number, loop = true) {
    // if (this.paused || this.startTime === null) return;
    if (this.startTime === null) return;

    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.lastRenderTime = time;

    // Pass uniforms
    const uTime = this.assets.uniforms.get(this.assets.formatUniform("time"));
    if (uTime) {
      // Calculate elapsed time with pause compensation
      const adjustedTimestamp = time - this.totalPausedTime;
      const elapsedTime = adjustedTimestamp - this.startTime;
      this.gl.uniform1f(uTime.location, elapsedTime * 0.001); // Time in seconds
    }
    const uMouse = this.assets.uniforms.get(this.assets.formatUniform("mouse"));
    if (uMouse) {
      this.gl.uniform2f(uMouse.location, this.mousePos[0], this.mousePos[1]);
    }

    // render dynamic textures
    this.assets.renderDynamicTextures();

    // Draw
    this.gl.drawArrays(this.gl.TRIANGLES, 0, DEFAULT_VERTICES.length / 2);

    if (loop) {
      this.rafId = requestAnimationFrame((t) => this.render(t));
    }
  }

  private handleResize() {
    super.resizeCanvas();

    const resName = this.assets.formatUniform("resolution");
    const resUnif = this.assets.uniforms.get(resName) ?? null;

    if (!resUnif) {
      console.warn(
        `Could not find resolution uniform (${resName}) location when resizing canvas`
      );
      return;
    }

    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(resUnif.location, this.canvas.width, this.canvas.height);

    this.render(this.lastRenderTime, false);
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

    // window.addEventListener("resize", () => this.handleResize(), { signal });
    this.resizeObserver = new ResizeObserver(() => {
      this.handleResize();
    });
    this.resizeObserver.observe(this.container);
  }

  public play(loop = true) {
    if (!this.paused) return;

    if (this.pauseStartTime !== null) {
      this.totalPausedTime += performance.now() - this.pauseStartTime;
      this.pauseStartTime = null;
    } else {
      this.totalPausedTime = performance.now();
    }

    if (this.startTime === null) {
      this.startTime = performance.now();
    }

    if (this.assets.dynamicTextures.size > 0) {
      this.assets.dynamicTextures.forEach((texture) => {
        texture.video.play();
      });
    }

    if (loop) {
      this.rafId = requestAnimationFrame((t) => this.render(t, loop));
    } else {
      this.render(performance.now(), loop);
    }
  }

  public pause() {
    if (typeof this.rafId !== "number" || this.paused) return;

    this.pauseStartTime = performance.now();

    cancelAnimationFrame(this.rafId);
    this.rafId = null;

    if (this.assets.dynamicTextures.size > 0) {
      this.assets.dynamicTextures.forEach((texture) => {
        texture.video.pause();
      });
    }
  }

  public updateUniform(name: string, value: UniformValue) {
    const inferred = getUniformType(value);

    if (!inferred.valid) {
      console.warn(inferred.message);
      return;
    }

    this.assets.setUniformValue(name, inferred.value);
  }

  public destroy() {
    super.destroy();
    this.assets.destroy();
    this.controller.abort();
    this.resizeObserver?.unobserve(this.container);
    this.resizeObserver?.disconnect();
  }

  get paused() {
    return this.rafId === null;
  }

  get uniforms() {
    const _uniformData = Object.fromEntries(this.assets.uniforms);
    const uniformData = Object.entries(_uniformData);
    const uniformValuesArray = uniformData.map(([name, { location, type }]) => {
      switch (type) {
        case "vec2":
        case "vec3":
        case "vec4":
          const vecValue = this.gl.getUniform(this.program, location);
          return [name, Array.from(vecValue)];
        case "image":
          const imgValue = this.assets.staticTextures.get(name);
          return [name, imgValue?.asset];
        case "video":
        case "webcam":
          const vidValue = this.assets.dynamicTextures.get(name);
          return [name, vidValue?.asset];
        default:
          const value = this.gl.getUniform(this.program, location);
          return [name, value];
      }
    });
    return Object.fromEntries(uniformValuesArray);
  }
}
