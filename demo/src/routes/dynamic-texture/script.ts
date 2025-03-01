import GlslRenderer from "@/../../dist";
import frag from "./sketch.frag?raw";
import "@/styles/reset.css";
import "@/styles/demo.css";

const container = document.querySelector("#app") as HTMLElement;

const gl = new GlslRenderer(container, frag, {
  u_texture: {
    type: "video",
    value:
      "https://res.cloudinary.com/andystewartdesign/video/upload/v1736178932/playbook-animations/playbook-home-image-gallery.mp4",
  },
});
gl.play();
