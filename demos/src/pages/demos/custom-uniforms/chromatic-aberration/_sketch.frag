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
    float d1 = length(halftoneUv);  // Distance from center of cell
    // Apply smoothstep to create a soft-edged circle
    d1 = smoothstep(rad - blur, rad + blur, d1);
    // Apply pattern inversion if selected
    d1 = u_invert_pattern == 1 ? d1 : (1. - d1);

    // Apply halftone pattern to the color
    vec3 color1 = vec3(1., 0., 0.);
    color1 = color1 * d1;

     // Create a circle in each grid cell
    float signX = sign(uv.x - 0.5);
    float signY = sign(uv.y - 0.5);
    vec2 foo = vec2(length(uv - 0.5) * 0.35 * signX, length(uv - 0.5) * 0.35 * signY);
    float d2 = length(halftoneUv - foo);  // Distance from center of cell
    // Apply smoothstep to create a soft-edged circle
    d2 = smoothstep(rad - blur, rad + blur, d2);
    // Apply pattern inversion if selected
    d2 = u_invert_pattern == 1 ? d2 : (1. - d2);

    vec3 color2 = vec3(0., 1., 0.);
    color2 = color2 * d2;

    vec3 color3 = vec3(0., 0., 1.);
    color3 = color3 * d2;

    // Output final color with original alpha
    gl_FragColor = vec4((color1 + color2 + color3), 1.0);
}