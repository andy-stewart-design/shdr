#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;

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

// 2x2 Bayer threshold matrix normalized to 0.0–1.0
float bayer2x2(vec2 pos) {
    int x = int(mod(pos.x, 2.0));
    int y = int(mod(pos.y, 2.0));

    if(x == 0 && y == 0)
        return 0.0 / 4.0;
    if(x == 1 && y == 0)
        return 2.0 / 4.0;
    if(x == 0 && y == 1)
        return 3.0 / 4.0;
    return 1.0 / 4.0; // (x == 1 && y == 1)
}

float bayer4x4(vec2 pos) {
    int x = int(mod(pos.x, 4.0));
    int y = int(mod(pos.y, 4.0));

    if(x == 0 && y == 0)
        return 0.0 / 16.0;
    if(x == 1 && y == 0)
        return 8.0 / 16.0;
    if(x == 2 && y == 0)
        return 2.0 / 16.0;
    if(x == 3 && y == 0)
        return 10.0 / 16.0;

    if(x == 0 && y == 1)
        return 12.0 / 16.0;
    if(x == 1 && y == 1)
        return 4.0 / 16.0;
    if(x == 2 && y == 1)
        return 14.0 / 16.0;
    if(x == 3 && y == 1)
        return 6.0 / 16.0;

    if(x == 0 && y == 2)
        return 3.0 / 16.0;
    if(x == 1 && y == 2)
        return 11.0 / 16.0;
    if(x == 2 && y == 2)
        return 1.0 / 16.0;
    if(x == 3 && y == 2)
        return 9.0 / 16.0;

    if(x == 0 && y == 3)
        return 15.0 / 16.0;
    if(x == 1 && y == 3)
        return 7.0 / 16.0;
    if(x == 2 && y == 3)
        return 13.0 / 16.0;
    return 5.0 / 16.0; // (x == 3 && y == 3)
}

float dither(vec2 pos, float brightness) {
    float threshold = bayer4x4(pos);
    return brightness < threshold ? 0.0 : 1.0;
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
    vec4 texColor = texture2D(u_texture, adjustedUV);
    vec4 gray = desaturate(texColor);
    // Apply Bayer dithering
    float dithered = dither(gl_FragCoord.xy, gray.r);

    gl_FragColor = vec4(vec3(dithered), 1.0);
}
