#version 300 es
precision mediump float;

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;
uniform sampler2D u_noise;
uniform vec2 u_noise_size;

out vec4 outColor;

vec2 adjustUV(float textureAR, float canvasAR, vec2 uv) {
    bool isLandscape = canvasAR < textureAR;
    float scale = isLandscape ? canvasAR / textureAR : textureAR / canvasAR;
    float x = !isLandscape ? uv.x : (uv.x - 0.5) * scale + 0.5;
    float y = isLandscape ? uv.y : (uv.y - 0.5) * scale + 0.5;
    return vec2(x, y);
}

float pseudoblue(int x, int y) {
    // Constants for better randomness in x and y axes
    // 1/307 == 0.003257328990228013
    // 1/499 == 0.002004008016032064
    const float XMIX_FACTOR = 0.003257328990228013;
    const float YMIX_FACTOR = 0.002004008016032064;

    // Number of iterations
    const int s = 6;

    float v = 0.0;
    int a, b;

    for(int i = 0; i < s; ++i) {
        b = y;

        // xmix calculation: ((x * 212281 + y * 384817) & 0x5555555) * XMIX_FACTOR
        int xmix_hash = (x * 212281 + y * 384817) & 0x5555555;

        // ymix calculation: ((x * 484829 + y * 112279) & 0x5555555) * YMIX_FACTOR
        int ymix_hash = (x * 484829 + y * 112279) & 0x5555555;

        // a = 1 & (x ^ xmix(x>>1, y>>1))
        a = 1 & (x ^ int(float(xmix_hash) * XMIX_FACTOR));

        // b = 1 & (b ^ ymix(x, y))
        b = 1 & (b ^ int(float(ymix_hash) * YMIX_FACTOR));

        // v = (v << 2) | (a + (b << 1) + 1) % 4
        v = 4.0 * v + float((a + (b << 1) + 1) % 4);

        // Right shift x and y
        x = x >> 1;
        y = y >> 1;
    }

    // Return v / (1 << (s << 1))
    // Which is v / (1 << (s * 2))
    // Which is v / 2^(2s)
    // For s=6, this is v / 4096
    return v / float(1 << (s << 1));
}

void main() {
    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float imageAR = u_texture_size.x / u_texture_size.y;
    float noiseAR = u_noise_size.x / u_noise_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 imageUV = adjustUV(imageAR, canvasAR, uv);
    vec2 noiseUV = adjustUV(noiseAR, canvasAR, uv);

    // Flip Y coordinate for proper orientation
    imageUV.y = 1.0 - imageUV.y;

    // Sample noise texture directly with adjusted UVs
    // Could also use mod(adjustedUV * 4., 1.) in place of fract
    vec4 texel = texture(u_texture, imageUV);

    float lum = dot(vec3(0.2126, 0.7152, 0.0722), texel.rgb);
    float threshold = texture(u_noise, mod((gl_FragCoord.xy / u_noise_size) * 4., 1.0)).r;
    // threshold = pseudoblue(int(gl_FragCoord.x), int(gl_FragCoord.y));
    float value = lum < (threshold) ? 0. : 1.;

    outColor = vec4(vec3(value), texel.a);
}