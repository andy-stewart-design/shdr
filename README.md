# Shdr: a lil WebGL library

Shdr is a zero-dependency shader renderer for the web, written in TypeScript.

```ts
npm install shdr
pnpm add shdr
```

The simplest way to get started is to create a new Shdr instance, passing in a reference to a fragment shader and a container (HTMLElement) in which to render the shader:

```ts
import Shdr from "shdr";

const frag = `#version 300 es
    precision highp float;

    out vec4 outColor;

    void main() {
        outColor = vec4(1.0,0.0,1.0,1.0);
    }`;

const container = document.querySelector("#wrapper") as HTMLElement;
const gl = new Shdr({ container, frag });
gl.play();
```

Better documentation coming soon. In the meantime, you check out [some live demos](https://shdr.andystew.art/).
