#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
out vec4 outColor;

const float cutoff = 0.5;
const vec3 color_1 = vec3(0.9, 0.6, 0.1);
const vec3 color_2 = vec3(0.7, 0.1, 0.4);
const vec3 white = vec3(1.0, 1.0, 1.0);

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1. - uv.y;
    uv = fract(uv * 2.) / 1.5;
    vec3 color = mix(color_1, color_2, min((uv.y + uv.x) / 2., 1.));

    // float dist = uv.y - cutoff;
    // float alpha = (sign(dist) + 1.0) / 2.0;
    // color = mix(color, white, alpha);

    outColor = vec4(color, 1.0);
}