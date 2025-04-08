#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;
uniform float u_threshold;
uniform float u_stepCount;
uniform float u_offset;
uniform int u_noise;
uniform float u_noiseAmount;

vec4 desaturate(vec4 color) {
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);
    float gray = dot(color.rgb, luma);
    return vec4(vec3(gray), color.a);
}

vec2 adjustUV(float textureAR, float canvasAR, vec2 uv) {
    if(canvasAR < textureAR) {
        // Canvas is wider than texture - crop sides
        float scale = canvasAR / textureAR;
        return vec2((uv.x - 0.5) * scale + 0.5, uv.y);
    } else {
        // Canvas is taller than texture - crop top/bottom
        float scale = textureAR / canvasAR;
        return vec2(uv.x, (uv.y - 0.5) * scale + 0.5);
    }
}

float threshold(float color) {
    return floor(color * u_stepCount - u_offset) / (u_stepCount - 1.);
}

float rand(vec2 uv) {
    return fract(sin(dot(uv.xy, vec2(12.9898, 78.233))) * 43758.5453);
}

float grainMultiplier = 1.2;

void main() {
    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float textureAR = u_texture_size.x / u_texture_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;
    vec2 adjustedUV = adjustUV(textureAR, canvasAR, uv);

    vec4 texColor = texture2D(u_texture, adjustedUV);
    vec4 gray = desaturate(texColor);
    float inColor = u_noise == 1 ? gray.r + rand(adjustedUV) * u_noiseAmount : gray.r;
    vec3 outRgb = vec3(threshold(inColor));

    gl_FragColor = vec4(outRgb, 1.);
}