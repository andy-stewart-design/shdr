#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size; // Added texture size uniform
uniform float u_gridSize;
uniform float u_radius;
uniform int u_inverted;
uniform int u_monotone;

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
    // adjustedUV.y = 1.0 - adjustedUV.y;

    // Sample original texture for the color
    vec4 texColor = texture2D(u_texture, adjustedUV);

    // Remap the coordinate space from 0,1 to -1,1
    uv = uv * 2.0 - 1.0;
    // Fix aspect ratio of coordinates
    uv.x *= u_resolution.x / u_resolution.y;
    // Divide canvas into grid
    uv = fract(uv * u_gridSize / 2.);
    // Remap the coordinate space of each cell from 0,1 to -1,1
    uv = uv * 2.0 - 1.0;

    // Calculate distance from center of cell
    float d = length(uv);
    // Set blur amount based on grid size
    float blur = 0.0025 * u_gridSize;
    // Create smooth circular mask with subtly soft edges to prevent pixelation
    d = smoothstep(u_radius - blur, u_radius + blur, d);
    // Invert the mask (1 inside circle, 0 outside)
    d = u_inverted == 1 ? 1. - d : d;

    // Multiply texture color by the circular mask
    float b = (texColor.r + texColor.b + texColor.g) / 3.;
    vec3 color = u_monotone == 1 ? vec3(b * d) : texColor.rgb * d;

    // gl_FragColor = vec4(d, d, d, 1.);  // Debug: Show only the mask
    // Output final color with full opacity
    gl_FragColor = vec4(color, 1.0);

}