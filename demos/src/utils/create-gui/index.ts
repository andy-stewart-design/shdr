import GUI from "lil-gui";
import GlslRenderer from "@glsl-ts";

interface CreateGuiArgs {
  gl?: GlslRenderer;
  dialogClass?: string;
  setup?: (gui: GUI) => void;
}

export function createGui(args: CreateGuiArgs = {}) {
  const gui = new GUI();

  args.setup?.(gui);

  const buttons = {
    togglePlay: () => {
      if (args.gl?.paused) args.gl.play();
      else args.gl?.pause();
    },
    showCode: () => {
      if (!args.dialogClass) return;
      const dialog = document.querySelector<HTMLDialogElement>(
        `dialog.${args.dialogClass}`
      );
      dialog?.showModal();
    },
  };

  if (args.gl) gui.add(buttons, "togglePlay").name("Play/pause");
  if (args.dialogClass) gui.add(buttons, "showCode").name("Show code");
}
