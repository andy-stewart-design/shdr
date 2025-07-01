# Shdr: a lil WebGL library

Shdr is a small, zero-dependency shader renderer for the web, written in TypeScript. Check out [some live demos](https://shdr.andystew.art/).

To get started, install the library with your package manager of choice:

```bash
npm install shdr
pnpm add shdr
yarn add shdr
```

To render your first shader, create a new `Shdr` instance, passing in a reference to a fragment shader and a container (HTMLElement) in which to append the HTML canvas. You can set the size of the canvas by styling your container element with CSS—the generated canvas will automatically conform to the size its container.

```html
<section id="container" style="width: 100vw; height: 100svh;"></section>
```

```ts
import Shdr from "shdr";

const frag = `#version 300 es
    precision mediump float;

    out vec4 outColor;

    void main() {
        outColor = vec4(1.0,0.0,1.0,1.0);
    }`;

const container = document.querySelector("#container") as HTMLElement;
const shdr = new Shdr({ container, frag });
shdr.play();
```

## Instance Options

The following options can be passed to a `Shdr` when it is intialized:

| Name          | Description                                                                       |
| ------------- | --------------------------------------------------------------------------------- |
| container     | The HTMLElement where the canvas should be appended                               |
| frag          | The fragment shader to be rendered                                                |
| vert          | The vertex shader to be rendered (By default, it’s a flat rectangle)              |
| uniforms      | Custom uniforms that should be passed to the fragment shader. More on that below. |
| uniformPrefix | The prefix that should be appended to uniform names (default to "u\_")            |
| glVersion     | The OpenGl version to use (can be either 3 or 1, default to 3)                    |

## Instance Properties

### Shdr.paused

A readonly property (boolean) that indicates the current play state of the renderer.

### Shdr.uniforms

An object representing all of the active uniforms used in the program, where the keys are the uniform’s name and the values are the current value of the uniform. Please note that textures will be undefined until they finish loading.

```ts
shdr.onLoad = () => {
  console.log(shdr.uniforms);
  // Console output:
  // {
  //   u_threshold: 0.5,
  //   u_resolution: (2) [897, 951],
  //   u_texture: WebGLTexture {},
  //   u_texture_resolution: (2) [1920, 1200],
  //   etc..
  // }
};
```

### Shdr.currentTime

A readonly property (number) that represents the current elapsed time in seconds

## Instance Methods

### Shdr.play

Initiates or resumes playback of the shader. The function accepts one, optional argument: a boolean, which defaults to true, that determines whether or not to create an animation loop. However, if you would like to render the shader without creating a loop (for example, if you want to respect users’ motion preferences), pass false into the play function.

```ts
const shdr = new Shdr({ container, frag });
// will be true if the user has indicated that they prefer reduced motion
const prefersReduced = window.matchMedia("(prefers-reduced-motion)").matches;
// if the user prefers reduced motion, set "loop" argument to false
shdr.play(!prefersReduced);
```

### Shdr.pause

Pauses playback of the program. Can be used in conjunction with the `paused` property and `play` method to control playback.

```ts
function togglePaused {
    if (shdr.paused) shdr.play();
    else shdr.pause();
},
```

### Shdr.updateUniform

Used to update any uniforms that were [declared during initialization](https://github.com/andy-stewart-design/shdr?tab=readme-ov-file#adding-custom-uniforms). Shdr is designed to work well with popular gui libraries like lil-gui and leva, so you can use the same uniform object that you pass into your Shdr class to create your gui controls.

The `updateUniform` method requires two arguments: a string indicating the name of the uniform you want to update (which should match the key in your uniform object) and the updated value (which must match the initial value of the uniform.)

```ts
import GUI from "lil-gui";

const uniforms = { speed: 0.25 };

const gui = new GUI();
const shdr = new Shdr({ container, frag, uniforms });
shdr.play();

gui.add(uniforms, "speed", 0, 1, 0.01).onChange((value: number) => {
  shdr.updateUniform("speed", value);
});
```

### Shdr.destroy

When using this library in the context of a frontend framework like React, Svelte, or Solid, call the destroy method when a component is unmounted to clean up resources associated with the program.

```ts
useEffect(() => {
  const shdr = new Shdr({ container, frag });
  shdr.play();

  return () => shdr.destroy();
}, []);
```

## Instance Events

### Shdr.onLoad

Fired when all texture uniforms (images and videos) are loaded. For shaders that don’t rely on external assets, this function will be fired when the program has successfully initialized.

```ts
const shdr = new Shdr({ container, frag });

shdr.onLoad = () => {
  container.dataset.loaded = "true";
  shdr.play(); // This can also called outside of the load function—it doesn’t really matter
};
```

### Shdr.onError

Called if an external asset fails to load. One argument will be passed to the function—an object containing the `type` of error (`"image"` or `"video"`) and the original `src` of the errored asset.

```ts
const uniforms = { texture: "/assets/dancer.jpg" };

const shdr = new Shdr({ container, frag, uniforms });

shdr.onError = ({ type, src }) => {
  console.log({ type, src }); // Console output: { type: image, src: "/assets/dancer.jpg" }
};
```

```ts
const shdr = new Shdr({ container, frag });

shdr.onLoad = () => {
  container.dataset.loaded = "true";
  shdr.play(); // This can also called outside of the load function—it doesn’t really matter
};
```

## Uniforms

By default, the fragment shader receives three custom uniforms:

- **Time:** the current time (in seconds)
- **Resolution:** the current resolution of the canvas (in pixels), which is responsive to changes in the size of the canvas
- **Mouse:** the current position of the mouse (in pixels)

### Adding Custom Uniforms

Any custom uniforms that you need access to during the life of your program can be added by passing a `uniforms` object during initialization. For each item in this object, the key will be the name of the uniform (minus the prefix) and the value will be value assigned to the uniform.

```ts
const uniforms = { speed: 0.25 };

const shdr = new Shdr({ container, frag, uniforms });
```

Importantly, you **should not** add a prefix to the keys in the unform object. Instead, you should set a `uniformPrefix` during initialization (defaults to "u\_"), which will be prepended to each uniform before being passed to the shader.

### Uniform Types

The types assigned to each uniform will be automatically inferred by the library. By default all numbers will be treated as floats. If you specifically need a number to be an integer instead, pass it in as a string.

If you create a `sampler2D` texture uniform, Shdr will automatically create an associated resolution uniform for the asset. This will be of type `vec2` and will be the name of your uniform appended with the word "resolution." So, for example, if your uniform is named `u_image`, the corresponding uniform will be name `u_image_resolution`.

Here is a quick overview of how to initialize each type of variable:

- Floats: `0.25`, `12`, or `"0.25"`
- Ints: `"12"`
- Vec2: `[0, 1]`
- Vec3: `[0, 1, 1]`
- Vec4: `[0, 1, 1, 0.5]`
- Bool: `true` or `false`
- sampler2D: `"/path/to/your/file.(jpg|mp4|etc)"`, or `"webcam"`
  - images: a string ending in ".jpg", ".jpeg", ".png", ".webp", or "avif"
  - videos: a string ending in ".mp4", ".webm", or ".mov"
  - webcam: the keyword `"webcam"` ([read more](https://github.com/andy-stewart-design/shdr?tab=readme-ov-file#accessing-the-webcam))

And here is an example of working with each of these uniform types in practice, from initializing them in typescript to accessing them in glsl:

```ts
// Custom uniforms
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

const shdr = new Shdr({ container, frag, uniforms });
```

```glsl
// default uniforms
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// custom uniforms
uniform float u_speed
uniform float u_size
uniform int u_dpi
uniform vec2 u_position
uniform vec3 u_colorRGB
uniform vec4 u_colorRGBA
uniform bool u_invert
uniform sampler2D u_imageTxtr
uniform vec2 u_imageTxtr_resolution
uniform sampler2D u_VideoTxtr
uniform vec2 u_VideoTxtr_resolution
uniform sampler2D u_webcam
uniform vec2 u_webcam_resolution
```
