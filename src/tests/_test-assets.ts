import { vi } from "vitest";

const camelCaseUniformFrag = `#version 300 es
    precision mediump float;

    uniform float uTime;
    uniform vec2 uResolution;
    uniform vec2 uMouse;

    out vec4 outColor;

    void main() {
      vec2 st = gl_FragCoord.xy / uResolution;
      vec2 mouse = uMouse / uResolution;

      // Distance from the mouse
      float dist = distance(st, mouse);
      
      // Color based on time and distance
      vec3 color = vec3(0.5 + 0.5 * cos(uTime + dist * 10.0), dist, st.x);
      outColor = vec4(color, 1.0);
    }
  `;

const customUniformFrag = `#version 300 es
    precision mediump float;

    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform float u_test;
    uniform float u_my_float;
    uniform vec2 u_my_vector;
    uniform sampler2D u_my_texture;
    uniform vec2 u_my_texture_resolution;

    out vec4 outColor;

    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution;
      vec2 mouse = u_mouse / u_resolution;
      vec4 texColor = texture(u_my_texture, st);

      // Distance from the mouse
      float dist = distance(st, mouse) * u_test * u_my_float * u_my_vector.x * texColor.a * max(u_my_texture_resolution.x, 1.0);
      
      // Color based on time and distance
      vec3 color = vec3(0.5 + 0.5 * cos(u_time + dist * 10.0), dist, st.x);
      outColor = vec4(color, 1.0);
    }
  `;

const shadertoyUniformFrag = `#version 300 es
    precision mediump float;

    uniform float iTime;
    uniform vec2 iResolution;
    uniform vec2 iMouse;

    out vec4 outColor;

    void main() {
      vec2 st = gl_FragCoord.xy / iResolution;
      vec2 mouse = iMouse / iResolution;

      // Distance from the mouse
      float dist = distance(st, mouse);
      
      // Color based on time and distance
      vec3 color = vec3(0.5 + 0.5 * cos(iTime + dist * 10.0), dist, st.x);
      outColor = vec4(color, 1.0);
    }
  `;

function tick(n = 0) {
  return new Promise((r) =>
    setTimeout(() => {
      r(null);
    }, n)
  );
}

let videoElementMock: Partial<HTMLVideoElement>;

const mockVideoElement = () => {
  const originalCreateElement = document.createElement;

  vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
    if (tag === "video") {
      const element: Partial<HTMLVideoElement> = {
        set src(value: string) {
          setTimeout(() => {
            if (value.includes("fake-video")) {
              element.onerror?.call(
                element as GlobalEventHandlers,
                new Event("error")
              );
            } else {
              element.onloadeddata?.call(
                element as GlobalEventHandlers,
                new Event("loadeddata")
              );
            }
          }, 10);
        },
        get src() {
          return "";
        },
        play: vi.fn(),
        pause: vi.fn(),
        load: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        onloadeddata: null,
        onerror: null,
      };
      videoElementMock = element;
      return element as HTMLVideoElement;
    }

    return originalCreateElement.call(document, tag);
  });
};

export {
  camelCaseUniformFrag,
  customUniformFrag,
  shadertoyUniformFrag,
  tick,
  mockVideoElement,
};
