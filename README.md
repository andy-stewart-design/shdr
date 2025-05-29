# Shdr: a lil WebGL library

Shdr is a small, zero-dependency shader renderer for the web, written in TypeScript. Get started by installing it with your package manager of choice:

```bash
npm install shdr
pnpm add shdr
yarn add shdr
```

To render your first shader, create a new `GlslRenderer` instance, passing in a reference to a fragment shader and a container (HTMLElement) in which to append the HTML canvas. You can set the size of the canvas by styling your container element with CSS—the generated canvas will automatically conform to the size its container.

```html
<section id="container" style="width: 100vw; height: 100svh;"></section>
```

```ts
import GlslRenderer from "shdr";

const frag = `#version 300 es
    precision mediump float;

    out vec4 outColor;

    void main() {
        outColor = vec4(1.0,0.0,1.0,1.0);
    }`;

const container = document.querySelector("#container") as HTMLElement;
const gl = new GlslRenderer({ container, frag });
gl.play();
```

Check out [some live demos](https://shdr.andystew.art/).

## Instance Options

The following options can be passed to a `GlslRenderer` when it is intialized:

| Name          | Description                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| container     | The HTMLElement where the canvas should be appended                               |
| frag          | The fragment shader to be rendered                                                |
| vert          | The vertex shader to be rendered (By default, it’s a flat rectangle)              |
| uniforms      | Custom uniforms that should be passed to the fragment shader. More on that below. |
| uniformPrefix | The prefix that should be appended to uniform names (default to "u\_")            |
| glVersion     | The OpenGl version to use (can be either 3 or 1, default to 3)                    |

## Instance Properties

### Paused

A readonly property (boolean) that indicates the current play state of the renderer.

## Instance Methods

### Play

Initiates or resumes playback of the shader. The function accepts one, optional argument: a boolean, which defaults to true, that determines whether or not to create an animation loop. However, if you would like to render the shader without creating a loop (for example, if you want to respect users’ motion preferences), pass false into the play function.

```ts
const gl = new GlslRenderer({ container, frag });
// will be true if the user has indicated that they prefer reduced motion
const prefersReduced = window.matchMedia("(prefers-reduced-motion)").matches;
// if the user prefers reduced motion, set "loop" argument to false
gl.play(!prefersReduced);
```

### Pause

Pauses playback of the program. Can be used in conjunction with the `paused` property and `play` method to control playback.

```ts
function togglePaused {
    if (gl.paused) gl.play();
    else gl.pause();
},
```

### updateUniform

Used to update any uniforms that were [declared during initialization](https://github.com/andy-stewart-design/shdr?tab=readme-ov-file#custom-uniforms). Shdr is designed to work well with popular gui libraries like lil-gui and leva, so you can use the same uniform object that you pass into your Shdr class to create your gui controls.

The `updateUniform` method requires two arguments: a string indicating the name of the uniform you want to update (which should match the key in your uniform object) and the updated value (which must match the initial value of the uniform.)

```ts
import GUI from "lil-gui";

const uniforms = { speed: 0.25 };

const gui = new GUI();
const gl = new GlslRenderer({ container, frag, uniforms });
gl.play();

gui.add(uniforms, "speed", 0, 1, 0.01).onChange((value: number) => {
  gl.updateUniform("speed", value);
});
```

### Destroy

When using this library in the context of a frontend framework like React, Svelte, or Solid, call the destroy method when a component is unmounted to clean up resources associated with the program.

```ts
useEffect(() => {
  const gl = new GlslRenderer({ container, frag });
  gl.play();

  return () => gl.destroy();
}, []);
```

## Uniforms

By default, the fragment shader receives three custom uniforms:

- **Time:** the current time (in seconds)
- **Resolution:** the current resolution of the canvas (in pixels), which is responsive to changes in the size of the canvas
- **Mouse:** the current position of the mouse (in pixels)

### Custom Uniforms

Any custom uniforms that you need access to during the life of your program can be added by passing a `uniforms` object during initialization. For each item in this object, the key will be the name of the uniform (minus the prefix) and the value will be value assigned to the uniform.

```ts
const uniforms = { speed: 0.25 };

const gl = new GlslRenderer({ container, frag, uniforms });
```

Importantly, you **should not** add a prefix to the keys in the unform object. Instead, you should set a `uniformPrefix` during initialization (defaults to "u\_"), which will be prepended to each uniform before being passed to the shader.

### Uniform Types

The types assigned to each uniform will be automatically inferred by the library. By default all numbers will be treated as floats. If you specifically need a number to be an integer instead, pass it in as a string.

- Floats: `0.25`, `12`, or `"0.25"`
- Ints: `"12"`
- Vec2: `[0, 1]`
- Vec3: `[0, 1, 1]`
- Vec4: `[0, 1, 1, 0.5]`
- Bool: `true` or `false`
- sampler2D: `"/assets/dancer.(jpg|mp4|etc)"`, or `"webcam"`
  - images: a string ending in ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".tiff", or ".ico"
  - videos: a string ending in ".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm", ".ts",
  - webcam: the keyword `"webcam"` ([read more](https://github.com/andy-stewart-design/shdr?tab=readme-ov-file#accessing-the-webcam))

```ts
const uniforms = {
  speed: 0.25, // float
  size: "0.75", // also a float
  dpi: "12", // int
  position: [0, 0.25], // vec2 float
  colorRGB: [0, 0.5, 1], // vec3 float
  colorRGBA: [0, 0.5, 1, 1], // vec4 float
  invert: false, // bool
  imageTxtr: "/assets/dancer.jpg", // sampler2D (image)
  VideoTxtr: "/assets/dancer.mp4", // sampler2D (video)
  webcam: "webcam", // sampler2D (webcam)
};

const gl = new GlslRenderer({ container, frag, uniforms });
```

### Updating Uniforms

Shdr is designed to work well with popular gui libraries like lil-gui and leva.

```ts
import GUI from "lil-gui";

const uniforms = { speed: 0.25 };

const gui = new GUI();
const gl = new GlslRenderer({ container, frag, uniforms });

gui.add(uniforms, "speed", 0, 1, 0.01).onChange((value: number) => {
  gl.updateUniform("speed", value);
});
```

## Accessing the webcam

TKTKTK

## Library Todo

- Add a uniformCase option to renderer class
- update name of default export to Shdr
- test if all of the specified image files actually render a texture
- test if all of the specified video files actually render a texture
