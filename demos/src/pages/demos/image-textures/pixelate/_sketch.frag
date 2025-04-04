#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;
uniform float u_pixelation;

void main() {
    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float textureAR = u_texture_size.x / u_texture_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 adjustedUV = uv;

    if(canvasAR < textureAR) {
        // Canvas is wider than texture - crop sides
        float scale = canvasAR / textureAR;
        adjustedUV.x = (uv.x - 0.5) * scale + 0.5;
    } else {
        // Canvas is taller than texture - crop top/bottom
        float scale = textureAR / canvasAR;
        adjustedUV.y = (uv.y - 0.5) * scale + 0.5;
    }

    // Flip Y coordinate for proper orientation
    adjustedUV.y = 1.0 - adjustedUV.y;

    // Pixelation effect with square pixels
    float pixelCount = floor(u_texture_size.y / u_pixelation); // Number of pixels along the shorter dimension

    // Calculate pixel size based on resolution to ensure square pixels
    vec2 pixelSize = vec2(1.0, u_texture_size.y / u_texture_size.x) * pixelCount;

    // Calculate pixelated coordinates
    vec2 pixelatedUV = floor(adjustedUV * pixelSize) / pixelSize;

    // Sample texture with pixelated coordinates
    vec4 texColor = texture2D(u_texture, pixelatedUV);

    gl_FragColor = texColor;
}