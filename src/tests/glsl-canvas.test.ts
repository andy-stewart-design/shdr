import { describe, it, expect, beforeEach } from "vitest";
import GlslCanvas from "../glsl-canvas";
import { fragmentShaderSourceV1, vertexShaderSourceV1 } from "../shaders";

describe("GlslCanvas", () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  it("initializes WebGL context and appends canvas", () => {
    const canvas = new GlslCanvas(container, 1);
    expect(container.querySelector("canvas")).toBeInstanceOf(HTMLCanvasElement);
    expect(canvas.gl).toBeInstanceOf(WebGL2RenderingContext);
  });

  it("resizes canvas to container dimensions", () => {
    container.style.width = "100px";
    container.style.height = "150px";
    const canvas = new GlslCanvas(container, 1);
    canvas.resizeCanvas();
    expect(canvas.canvas.width).toBe(100);
    expect(canvas.canvas.height).toBe(150);
  });

  it("destroys the canvas", () => {
    const canvas = new GlslCanvas(container, 1);
    canvas.destroy();
    expect(container.innerHTML).toBe("");
  });
});
