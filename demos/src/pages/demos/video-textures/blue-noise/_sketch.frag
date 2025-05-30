#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_resolution;
uniform sampler2D u_noise;
uniform vec2 u_noise_resolution;

out vec4 outColor;

vec2 adjustUV(float textureAR, float canvasAR, vec2 uv) {
    bool isLandscape = canvasAR < textureAR;
    float scale = isLandscape ? canvasAR / textureAR : textureAR / canvasAR;
    float x = !isLandscape ? uv.x : (uv.x - 0.5) * scale + 0.5;
    float y = isLandscape ? uv.y : (uv.y - 0.5) * scale + 0.5;
    return vec2(x, y);
}

void main() {
    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float imageAR = u_texture_resolution.x / u_texture_resolution.y;
    float noiseAR = u_noise_resolution.x / u_noise_resolution.y;
    float canvasAR = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 imageUV = adjustUV(imageAR, canvasAR, uv);
    vec2 noiseUV = adjustUV(noiseAR, canvasAR, uv);

    // Flip Y coordinate for proper orientation
    // imageUV.y = 1.0 - imageUV.y;

    // Sample noise texture directly with adjusted UVs
    // Could also use mod(adjustedUV * 4., 1.) in place of fract
    vec4 texel = texture(u_texture, imageUV);

    float lum = dot(vec3(0.2126, 0.7152, 0.0722), texel.rgb);
    float threshold = texture(u_noise, mod((gl_FragCoord.xy / u_noise_resolution) * 3., 1.0)).r;
    float value = lum < (threshold) ? 0. : 1.;

    outColor = vec4(vec3(value), texel.a);
}