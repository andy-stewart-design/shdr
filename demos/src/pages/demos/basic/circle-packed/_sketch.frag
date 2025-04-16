#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Mathematical constants
#define tau 6.28318
#define pi 3.14159
#define ep 1e-2  // epsilon (small number to fix edge cases)

// Configurable parameters
float centralRadius = 0.1;  // Central circle radius
float satelliteRadius = 0.0375;  // Surrounding circles radius
float numLayers = 30.0;        // Number of concentric layers
float rotationSpeed = 0.15;     // Controls linear rotation speed
float spacingFactor = 1.25;

/**
 * Converts HSL color to RGB
 * @param c - vec3 with x=hue, y=saturation, z=lightness
 * @return RGB color
 */
vec3 hue(in vec3 c) {
    return c.z * (1.0 - c.y * smoothstep(2.0, 1.0, abs(mod(c.x * 6.0 + vec3(0, 4, 2), 6.0) - 3.0)));
}

/**
 * Draws a circle
 * @param xy - Current fragment coordinates
 * @param c - Circle center
 * @param r - Circle radius
 * @param fill - Whether to fill the circle or draw outline
 * @return Circle color intensity (0.0-1.0)
 */
float circle(vec2 xy, vec2 c, float r, bool fill) {
    float dist = length(xy - c) - r;
    return 1.0 - smoothstep(-2.0 / u_resolution.y, 3.0 / u_resolution.y, fill ? dist : abs(dist));
}

/**
 * Creates surrounding circles in a ring pattern
 * @param xy - Current fragment coordinates
 * @param C - Center of the entire pattern
 * @param R - Distance from center to satellite circles
 * @param r - Radius of each satellite circle
 * @param ph - Phase/rotation offset
 * @return Color for the satellite circles
 */
vec3 circles(vec2 xy, vec2 C, float R, float r, float ph) {
    // Calculate angle between each surrounding circle
    float t = 2.0 * asin(r / (R + r)) * spacingFactor;

    // Calculate number of circles that will fit
    float div = abs(tau / t) + ep;
    int n = int(div);

    // Calculate padding between circles
    float pad = fract(div) * t / float(n);

    // Apply rotation to the entire pattern
    float rt = -t / 2.0 - pad / 2.0 + ph;
    mat2 rm = mat2(cos(rt), -sin(rt), sin(rt), cos(rt));
    vec2 zw = rm * (xy - C);

    // Determine which circle this fragment belongs to
    float i = floor((atan(zw.y, zw.x)) / (t + pad));

    // Calculate center of the current circle
    vec2 c = vec2(cos(i * (t + pad) + ph), sin(i * (t + pad) + ph)) * (r + R) + C;

    // Color based on the circle's position in the sequence
    vec3 hsl = vec3(i / float(n), 1.0, 0.75);

    return vec3(circle(xy, c, r, true)) * hue(hsl);
}

void main() {
    // Normalize coordinates to center of screen with aspect ratio correction
    vec2 xy = (2.0 * gl_FragCoord.xy - u_resolution.xy) / u_resolution.y;

    // Initialize color
    vec3 col = vec3(0.0);

    // Center of the pattern
    vec2 C = vec2(0.0);
    float layerSpacing = spacingFactor * 2.; // Values > 2.0 increase space between layers

    // Calculate which layer the current fragment belongs to
    float distFromCenter = length(xy - C);
    float i = floor((min(satelliteRadius * layerSpacing * (numLayers - 1.0) + ep, distFromCenter - centralRadius)) / (satelliteRadius * layerSpacing));

    // If fragment is in a valid layer, draw the surrounding circles
    if(i >= 0.0) {
        // Linear rotation - different speeds for each layer
        // Base speed multiplied by layer number for different rotation speeds in each ring
        float phaseOffset = u_time * rotationSpeed * (1.0 + i * 0.1) * -1.;
        // phaseOffset = pi * sin(u_time * rotationSpeed) / numLayers * i;
        // phaseOffset = 0.;

        // Add colored circles for this layer
        col += circles(xy, C, centralRadius + satelliteRadius * i * layerSpacing, satelliteRadius, phaseOffset);
    }

    // Invert the colors for final output
    gl_FragColor = vec4(col * 0.9, 1.0);
}