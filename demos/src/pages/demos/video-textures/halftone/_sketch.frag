#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size; // Added texture size uniform

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

    // Sample original texture for the color
    vec4 texColor = texture2D(u_texture, adjustedUV);

    // Convert to grayscale - using luminance coefficients
    // float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));

    // Halftone parameters
    float dotSize = 40.0; // Size of the halftone grid
    vec2 center = floor(gl_FragCoord.xy / dotSize) * dotSize + (dotSize / 2.0);

    // Calculate distance from pixel to center of current cell
    float dist = distance(gl_FragCoord.xy, center);

    // Calculate dot radius based on original color intensity
    // Darker areas get larger dots
    // float radius = (1.0 - gray) * (dotSize / 2.0);
    float radius = 10.0;

    // Determine if this pixel is inside or outside the dot
    float inDot = step(dist, radius);

    // Option 1: Black and white halftone
    // gl_FragColor = vec4(vec3(inDot), 1.0);

    // Option 2 (commented out): Colored halftone - uncomment to use
    gl_FragColor = vec4(texColor.rgb * inDot, 1.0);
}