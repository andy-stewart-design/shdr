#ifdef GL_ES
precision mediump float;  // Set floating point precision to medium on mobile/WebGL ES
#endif

// Input uniforms provided by the rendering system
uniform vec2 u_resolution;        // Canvas size in pixels
uniform vec2 u_mouse;             // Mouse position in pixels
uniform float u_time;             // Time in seconds since shader started
uniform sampler2D u_webcam;       // Webcam texture sampler
uniform vec2 u_webcam_size;       // Webcam resolution in pixels
uniform float u_dpi;              // Controls the density of the halftone pattern
uniform int u_color_theme;        // Color mode (1=color, 2=grayscale, other=white)
uniform float u_pattern_density;
uniform float u_radius_modulation; // Controls how much the halftone pattern is affected by brightness
uniform int u_invert_pattern;     // Whether to invert the halftone pattern (0=normal, 1=inverted)

/**
 * Adjusts UV coordinates to maintain aspect ratio when mapping a texture to canvas
 * This ensures the image is "covered" properly without distortion
 * 
 * @param textureAR Aspect ratio of the texture (width/height)
 * @param canvasAR Aspect ratio of the canvas (width/height)
 * @param uv The original UV coordinates
 * @return Adjusted UV coordinates that maintain proper aspect ratio
 */
vec2 adjustUV(float textureAR, float canvasAR, vec2 uv) {
    bool isLandscape = canvasAR < textureAR;  // Check if the canvas is wider than it is tall relative to texture
    float scale = isLandscape ? canvasAR / textureAR : textureAR / canvasAR;  // Calculate scaling factor
    float x = !isLandscape ? uv.x : (uv.x - 0.5) * scale + 0.5;  // Center and scale X if needed
    float y = isLandscape ? uv.y : (uv.y - 0.5) * scale + 0.5;   // Center and scale Y if needed
    return vec2(x, y);  // Return adjusted coordinates
}

void main() {
    // Convert fragment coordinate to normalized [0,1] UV space
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Prepare UV coordinates for halftone pattern
    vec2 halftoneUv = uv;
    halftoneUv = halftoneUv * 2.0 - 1.0;  // Convert to [-1,1] range

    // Scale halftone pattern based on aspect ratio
    // halftoneUv.x = isCroppedHor ? halftoneUv.x * u_resolution.x / u_resolution.y : halftoneUv.x;
    // halftoneUv.y = isCroppedHor ? halftoneUv.y : halftoneUv.y * u_resolution.y / u_resolution.x;
    halftoneUv.x = halftoneUv.x * u_resolution.x / u_resolution.y;
    halftoneUv.y = halftoneUv.y;

    // Create a repeating grid for the halftone pattern
    // float posOffX = isCroppedHor ? 0. : mod(u_dpi, 2.) / 2.;  // Offset X for even/odd DPI
    // float posOffY = isCroppedHor ? mod(u_dpi, 2.) / 2. : 0.;  // Offset Y for even/odd DPI
    float posOffX = 0.;  // Offset X for even/odd DPI
    float posOffY = mod(u_dpi, 2.) / 2.;  // Offset Y for even/odd DPI

    // Divide space into grid cells
    halftoneUv.x = fract(halftoneUv.x * u_dpi / 2. + posOffX);
    halftoneUv.y = fract(halftoneUv.y * u_dpi / 2. + posOffY);

    // Remap each grid cell to [-1,1] range
    halftoneUv = halftoneUv * 2.0 - 1.0;

    // Set parameters for the halftone effect
    float blur = u_dpi * 0.00125;  // Edge blur amount for the circles (scales with DPI)

    // Calculate circle radius based on brightness and modulation
    // Higher brightness = larger circles when modulation is less than 1
    float rad = u_pattern_density;

    // Create a circle in each grid cell
    float d = length(halftoneUv);  // Distance from center of cell

    // Apply smoothstep to create a soft-edged circle
    d = smoothstep(rad - blur, rad + blur, d);

    // Apply pattern inversion if selected
    d = u_invert_pattern == 1 ? d : (1. - d);

    // Apply halftone pattern to the color
    vec3 color = vec3(1.);
    color = color * d;

    // Output final color with original alpha
    gl_FragColor = vec4(color, 1.0);
}