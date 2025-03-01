import GlslRenderer from "@/../../dist";
import frag from "./sketch.frag?raw";
import "@/styles/reset.css";
import "@/styles/demo.css";

const container = document.querySelector("#app") as HTMLElement;

const gl = new GlslRenderer(container, frag, {
  u_gridSize: {
    type: "float",
    value: 12,
  },
});
gl.play();

const input = document.querySelector("#size") as HTMLInputElement;
input.addEventListener("input", (e) => {
  const { target } = e;
  if (target instanceof HTMLInputElement) {
    gl.updateUniform("u_gridSize", parseFloat(target.value));
  }
});
