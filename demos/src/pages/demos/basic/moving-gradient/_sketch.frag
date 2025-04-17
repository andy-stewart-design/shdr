#version 300 es
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

out vec4 outColor;

//https://iquilezles.org/articles/palettes/
vec3 palette(float t) {
    vec3 a = vec3(0.1f);
    vec3 b = vec3(0.8f);
    vec3 c = vec3(0.4f);
    vec3 d = vec3(0.0f, 0.1f, 0.2f);

    return a + b * cos(6.28318f * (c * t + d));
}

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898f, 4.1414f))) * 43758.5453f);
}

void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0f - u_resolution.xy) / u_resolution.y;

    uv *= 0.06f;
    uv -= 0.03f;

    float grain = rand(100.0f * uv);

    for(int n = 1; n < 2; n++) {
        float i = float(n);
        uv += vec2(sin(uv.x * 6.0f + sin(u_time + uv.y * 10.0f) * 0.2f), sin(uv.y * 6.0f + sin(u_time + uv.x * 10.0f) * 0.2f));
    }

    vec3 black = vec3(0.0f, 0.0f, 0.0f);

    vec3 colorGrained = palette(uv.x * sin(1.0f) + uv.y + grain);
    vec3 color = palette(uv.x * sin(1.0f) + uv.y);

    color = mix(colorGrained, color, 0.96f);
    color = mix(black, color, 0.9f);

    outColor = vec4(color, 1.0f);
}