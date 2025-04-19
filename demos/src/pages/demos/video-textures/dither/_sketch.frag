#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;
uniform int u_ditherType;
uniform int u_monotone;

out vec4 outColor;

vec2 adjustUV(float textureAR, float canvasAR, vec2 uv) {
    bool isLandscape = canvasAR < textureAR;
    float scale = isLandscape ? canvasAR / textureAR : textureAR / canvasAR;
    float x = !isLandscape ? uv.x : (uv.x - 0.5) * scale + 0.5;
    float y = isLandscape ? uv.y : (uv.y - 0.5) * scale + 0.5;
    return vec2(x, y);
}

vec4 desaturate(vec4 color) {
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);
    float gray = dot(color.rgb, luma);
    return vec4(vec3(gray), color.a);
}

const int bayer_matrix_2x2[4] = int[](0, 3, 2, 1);
const int bayer_matrix_4x4[16] = int[](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);
const int bayer_matrix_8x8[64] = int[](0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21);
const int cluster_matrix[64] = int[](24, 10, 12, 26, 35, 47, 49, 37, 8, 0, 2, 14, 45, 59, 61, 51, 22, 6, 4, 16, 43, 57, 63, 53, 30, 20, 18, 28, 33, 41, 55, 39, 34, 46, 48, 36, 25, 11, 13, 27, 44, 58, 60, 50, 9, 1, 3, 15, 42, 56, 62, 52, 23, 7, 5, 17, 32, 40, 54, 38, 31, 21, 19, 29);

float dither(vec2 uv, float luma, int amount) {
    float amountFl = float(min(amount, 8));
    int x = int(mod(uv.x, amountFl));
    int y = int(mod(uv.y, amountFl));
    int index = x + y * min(amount, 8);
    int threshold = amount == 8 ? bayer_matrix_8x8[index] : amount == 4 ? bayer_matrix_4x4[index] : amount == 2 ? bayer_matrix_2x2[index] : cluster_matrix[index];
    float limit = (float(threshold) + 1.0) / (1.0 + amountFl * amountFl);
    return luma < limit ? 0.0 : 1.0;
}

void main() {
    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float textureAR = u_texture_size.x / u_texture_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 adjustedUV = adjustUV(textureAR, canvasAR, uv);
    // Flip Y coordinate for proper orientation
    adjustedUV.y = 1.0 - adjustedUV.y;

    // Sample original texture and convert to grayscale
    vec4 texColor = texture(u_texture, adjustedUV);
    vec4 gray = desaturate(texColor);
    // Apply Bayer dithering
    float dithered = dither(gl_FragCoord.xy, gray.r, u_ditherType);
    float r = texColor.r * dither(gl_FragCoord.xy, gray.r + 0.25, int(u_ditherType));
    float g = texColor.g * dither(gl_FragCoord.xy, gray.r + 0.25, int(u_ditherType));
    float b = texColor.b * dither(gl_FragCoord.xy, gray.r + 0.25, int(u_ditherType));
    vec3 rgb = u_monotone == 1 ? vec3(dithered) : vec3(r, g, b);

    outColor = vec4(rgb, 1.0);
}
