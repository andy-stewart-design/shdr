#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

vec3 rgb(float t) {
    return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}

vec2 rotate2D(vec2 p, float a) {
    float s = sin(a);
    float c = cos(a);
    return vec2(p.x * c - p.y * s, p.x * s + p.y * c);
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate normalized mouse position
    vec2 mouseNorm = u_mouse / u_resolution.xy;

    vec2 aspect = vec2(u_resolution.x / u_resolution.y, 1.0);
    uv = (uv - 0.5) * aspect;

    // Use the normalized uv for mouse distance calculation
    float mouseDistance = length(mouseNorm - (gl_FragCoord.xy / u_resolution.xy));
    // float scale = 8.0 + sin(u_time * 0.5) * 2.0 + mouseDistance * 5.0;
    float scale = 10.;

    // uv = rotate2D(uv, u_time * 0.2);
    vec2 grid = fract(uv * scale) - 0.5;
    float d = length(grid);

    float t = u_time * 0.5 + length(uv);
    vec3 color = rgb(t);

    float pulse = sin(u_time * 2.0) * 0.5 + 0.5;
    color *= smoothstep(0.5, 0.2, d + mouseDistance * 0.5);
    color += rgb(t + 0.2) * smoothstep(0.2, 0.1, d - pulse * 0.1);

    gl_FragColor = vec4(color, 1.0);
}