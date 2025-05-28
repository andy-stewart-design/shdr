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
    precision highp float;

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

| Name          | Description                                                                                                                                                |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| container     | The HTMLElement where the canvas should be appended                                                                                                        |
| frag          | The fragment shader to be rendered                                                                                                                         |
| vert          | The vertex shader to be rendered (By default, it’s a flat rectangle)                                                                                       |
| uniforms      | Custom uniforms that should be passed to the fragment shader ([Read more](https://github.com/andy-stewart-design/shdr?tab=readme-ov-file#custom-uniforms)) |
| uniformPrefix | The prefix that should be appended to uniform names (default to "u\_")                                                                                     |
| glVersion     | The OpenGl version to use (can be either 3 or 1, default to 3)                                                                                             |

## Instance Methods

TKTKTK (play, pause, updateUniform, destroy)

## Default/Custom Uniforms

By default, the fragment shader receives three custom uniforms:

- **Time:** the current time (in seconds)
- **Resolution:** the current resolution of the canvas (in pixels), which is responsive to changes in the size of the canvas
- **Mouse:** the current position of the mouse (in pixels)

Any custom uniforms that you need access to during the life of your program can be added by passing a `uniforms` object during initialization. For each item in this object, the key will be the name of the uniform (minus the prefix) and the value will be value assigned to the uniform.

```ts
const uniforms = {
  texture: "/dancer.jpg", // image texture
  speed: 0.25, //float
  dpi: "12", // int
  color: [0, 0.5, 1], // vec3
};

const gl = new GlslRenderer({ container, frag, uniforms });
```

Importantly, you **should not** add a prefix to you unform names. Instead, that should be set during initialization using the `uniformPrefix` option, which defaults to "u\_".

### Uniform Types

The types assigned to each uniform will be automatically inferred by the library. By default all numbers will be treated as floats. If you specifically need a number to be an interger instead, pass it in as a string.

- Floats: `0.25`, `12`, or `"0.25"`
- Ints: `"12"`
- Vec2: `[0, 1]`
- Vec3: `[0, 1, 1]`
- Vec4: `[0, 1, 1, 0.5]`
- Bool: `true` or `false`
- sampler2D (images): a string ending in ".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".svg", ".tiff", or ".ico"
- sampler2D (videos): a string ending in ".mp4", ".avi", ".mov", ".mkv", ".wmv", ".flv", ".webm", ".ts",
- sampler2D (webcam): the keyword `"webcam"` (read more)

### Updating Uniforms

TKTKTK

## Accessing the webcam

TKTKTK

## Library Todo

- Switch boolean uniforms to be actual booleans (rather than 1s and 0s)
- Add a uniformCase option to renderer class
- update name of default export to Shdr
- test if all of the specified image files actually render a texture
- test if all of the specified video files actually render a texture
