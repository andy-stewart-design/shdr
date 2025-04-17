#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;
uniform float u_pixelation;

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

void main() {
    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float textureAR = u_texture_size.x / u_texture_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;
    vec2 adjustedUV = adjustUV(textureAR, canvasAR, uv);

    // Calculate how many pixels we want vertically
    float numPixelsY = floor(u_resolution.y / u_pixelation);
    // Ensure we have a whole number of pixels by adjusting pixel size
    float pixelSize = 1.0 / numPixelsY;
    // Calculate grid coordinates with square pixels
    float dx = pixelSize / textureAR;
    float dy = pixelSize;
    // Find the center of each pixel
    float x = dx * (floor(adjustedUV.x / dx) + 0.5);
    float y = dy * (floor(adjustedUV.y / dy) + 0.5);

    // Sample texture with pixelated coordinates
    vec4 texColor = texture2D(u_texture, vec2(x, y));

    gl_FragColor = texColor;
}