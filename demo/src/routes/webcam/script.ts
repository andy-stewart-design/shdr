import GlslRenderer from "@/../../dist";
import frag from "./sketch.frag?raw";
import "@/styles/reset.css";
import "@/styles/demo.css";

const container = document.querySelector("#app") as HTMLElement;

const gl = new GlslRenderer(container, frag, {
  u_webcam: {
    type: "webcam",
  },
});
gl.play();
