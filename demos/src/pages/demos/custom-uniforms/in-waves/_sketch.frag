#version 300 es
precision highp float;

#define PI 3.1415926535897932384626433832795

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_amplitude;
uniform float u_wavelength;
uniform float u_speed;
uniform float u_midline;
out vec4 outColor;

const float TWO_PI = 2. * PI;
const vec3 color_1 = vec3(0.9, 0.6, 0.1);
const vec3 color_2 = vec3(0.7, 0.1, 0.4);

const vec3 blue_3 = vec3(0.102, 0.208, 0.761);
const vec3 blue_2 = vec3(0.094, 0.502, 0.910);
const vec3 blue_1 = vec3(0.384, 0.827, 0.898);

float noise(float x, float time) {
    // Set up wave params
    float L = TWO_PI * u_wavelength; // wavelength
    float A = u_amplitude; // amplitude
    float S = u_speed * TWO_PI; // period/speed

    // Create a stack of sin waves
    float sum = 0.;
    sum += sin(x * (L / 1.000) + time * (0.90 * S)) * (A * 0.64);
    sum += sin(x * (L / 1.153) + time * (1.15 * S)) * (A * 0.40);
    sum += sin(x * (L / 1.622) + time * (-0.75 * S)) * (A * 0.48);
    sum += sin(x * (L / 1.871) + time * (0.65 * S)) * (A * 0.43);
    sum += sin(x * (L / 2.013) + time * (-1.05 * S)) * (A * 0.32);
    return sum;
}

float wave_alpha(vec2 uv, float time) {
    float sum = noise(uv.x, time);
    float dist = uv.y - u_midline + sum;
    float alpha = (sign(dist) + 1.0) / 2.0;
    return alpha;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv.y = 1. - uv.y;

    float bg_highpass = 0.;
    float foo = 0.5 - abs(u_midline - 0.5);
    float bg_lowpass = u_midline + foo / 2.;
    float fg_highpass = u_midline - foo / 2.;
    float fg_lowpass = 1.;

    vec3 bg_color = mix(color_1, color_2, max(min((uv.y - bg_highpass) / (bg_lowpass - bg_highpass), 1.0), 0.0));
    vec3 fg_color = mix(color_1, color_2, max(min((uv.y - fg_highpass) / (fg_lowpass - fg_highpass), 1.0), 0.0));

    // float blur = mix(0.0, (210. - u_blur), (1. - uv.x));
    // float alpha = clamp(dist, 0., 1.);

    float alpha = wave_alpha(uv, u_time);

    bg_color = mix(bg_color, fg_color, alpha);

    outColor = vec4(bg_color, 1.0);
}