const vertexShaderSourceV1 = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

const vertexShaderSourceV3 = `#version 300 es
    in vec2 a_position;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;

const fragmentShaderSourceV1 = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution;
      vec2 mouse = u_mouse / u_resolution;

      // Distance from the mouse
      float dist = distance(st, mouse);
      
      // Color based on time and distance
      vec3 color = vec3(0.5 + 0.5 * cos(u_time + dist * 10.0), dist, st.x);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

const fragmentShaderSourceV3 = `#version 300 es
    precision mediump float;

    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    out vec4 outColor;

    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution;
      vec2 mouse = u_mouse / u_resolution;

      // Distance from the mouse
      float dist = distance(st, mouse);
      
      // Color based on time and distance
      vec3 color = vec3(0.5 + 0.5 * cos(u_time + dist * 10.0), dist, st.x);
      outColor = vec4(color, 1.0);
    }
  `;

export {
  vertexShaderSourceV1,
  fragmentShaderSourceV1,
  vertexShaderSourceV3,
  fragmentShaderSourceV3,
};
