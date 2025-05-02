#version 300 es
precision highp float;

#define PI 3.1415926535897932384626433832795

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_blur;
uniform float u_amplitude;
uniform float u_wavelength;
uniform float u_speed;
out vec4 outColor;

const float TWO_PI = 2. * PI;
const float bg_highpass = 0.;
const float bg_lowpass = 0.875;
const float fg_highpass = 0.25;
const float fg_lowpass = 1.;
const float sineMidline = 0.5;
const vec3 color_1 = vec3(0.9, 0.6, 0.1);
const vec3 color_2 = vec3(0.7, 0.1, 0.4);

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1. - uv.y;
    // uv = fract(uv * 2.);
    vec3 bg_color = mix(color_1, color_2, max(min((uv.y - bg_highpass) / (bg_lowpass - bg_highpass), 1.0), 0.0));
    vec3 fg_color = mix(color_1, color_2, max(min((uv.y - fg_highpass) / (fg_lowpass - fg_highpass), 1.0), 0.0));

    float L = TWO_PI * u_wavelength;
    float A = u_amplitude;
    float S = u_speed * TWO_PI;
    // float sine_input = uv.x * frequency + u_time * to_phase;
    float sum = 0.;
    sum += sin(uv.x * (L / 1.000) + u_time * (0.90 * S)) * (A * 0.64);
    sum += sin(uv.x * (L / 1.153) + u_time * (1.15 * S)) * (A * 0.40);
    sum += sin(uv.x * (L / 1.622) + u_time * (-0.75 * S)) * (A * 0.48);
    sum += sin(uv.x * (L / 1.871) + u_time * (0.65 * S)) * (A * 0.43);
    sum += sin(uv.x * (L / 2.013) + u_time * (-1.05 * S)) * (A * 0.32);

    float dist = uv.y - sineMidline + sum;
    // float blur = mix(0.0, (210. - u_blur), (1. - uv.x));
    // float alpha = clamp(dist, 0., 1.);
    float alpha = (sign(dist) + 1.0) / 2.0;
    bg_color = mix(bg_color, fg_color, alpha);

    outColor = vec4(bg_color, 1.0);
    // outColor = vec4(fg_color, 1.0);
}