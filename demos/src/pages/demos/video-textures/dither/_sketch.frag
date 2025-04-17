#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;

out vec4 outColor;

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

vec4 desaturate(vec4 color) {
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);
    float gray = dot(color.rgb, luma);
    return vec4(vec3(gray), color.a);
}

const int dither_matrix_2x2[4] = int[](0, 3, 2, 1);
const int dither_matrix_4x4[16] = int[](0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5);

float dither2x2(vec2 uv, float luma) {
    float dither_amount = 2.0;
    int x = int(mod(uv.x, dither_amount));
    int y = int(mod(uv.y, dither_amount));
    int index = x + y * int(dither_amount);
    float limit = (float(dither_matrix_2x2[index]) + 1.0) / (1.0 + 4.0);
    return luma < limit ? 0. : 1.;
}

float dither4x4(vec2 uv, float luma) {
    float dither_amount = 4.0;
    int x = int(mod(uv.x, dither_amount));
    int y = int(mod(uv.y, dither_amount));
    int index = x + y * int(dither_amount);
    float limit = (float(dither_matrix_4x4[index]) + 1.0) / (1.0 + 16.0);
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
    float dithered = dither4x4(gl_FragCoord.xy, gray.r);

    outColor = vec4(vec3(dithered), 1.0);
}
