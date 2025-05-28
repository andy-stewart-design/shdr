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

## Instance Options

The following options can be passed to a `GlslRenderer` when it is intialized:

| Name          | Description                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| container     | The HTMLElement where the canvas should be appended                          |
| frag          | The fragment shader to be rendered                                           |
| vert          | The vertex shader to be rendered (By default, it’s a flat rectangle)         |
| uniforms      | Any custom uniforms that should be passed to the fragment shader (Read more) |
| uniformPrefix | The prefix that should be appended to uniform names (default to "u\_")       |
| glVersion     | The OpenGl version to use (can be either 3 or 1, default to 3)               |

## Custom Uniforms

TKTKTK

## Demos

Check out [some live demos](https://shdr.andystew.art/).
