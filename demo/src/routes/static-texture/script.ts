import GlslRenderer from "@/../../dist";
import frag from "./sketch.frag?raw";
import "@/styles/reset.css";
import "@/styles/demo.css";

const container = document.querySelector("#app") as HTMLElement;

const gl = new GlslRenderer(container, frag, {
  u_texture: {
    type: "image",
    value: "https://picsum.photos/1920/1080",
  },
});
gl.play();
