// Ben Day Spotlight

#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform float u_dpi;

// float gridSize = 8.;
float spreadFactor = 0.625;
float spreadAmount = 0.5 + 2.5 * (1. - spreadFactor);
float blurAmount = 0.;
int modulateSize = 1;

void main() {
    // Normalize the coordinate space
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 mouse = u_mouse / u_resolution;
    // Remap the coordinate space from 0,1 to -1,1
    uv = uv * 2.0 - 1.0;
    mouse = mouse * 2.0 - 1.0;
    // Fix aspect ratio of coordinates
    uv.x *= u_resolution.x / u_resolution.y;
    mouse.x *= u_resolution.x / u_resolution.y;
    // Save a copy of the original coordinate space
    vec2 uvScreen = uv;
    // Divide the space into a repeating grid
    uv = fract(uv * u_dpi);
    // Remap the coordiante space of each cell
    uv = uv * 2.0 - 1.0;

    // Calculate the grid cell center in original coordinates
    vec2 cellIndex = floor(uvScreen * u_dpi);
    vec2 cellCenter = (cellIndex + 0.5) / u_dpi;
    // Calculate distance of this cell from center of screen
    float distFromMouse = distance(cellCenter, mouse);
    // Normalize this distance for darkening
    float darkFactor = min(distFromMouse * spreadAmount, 1.0);

    // Grid parameters
    float blur = max(0.025, distFromMouse * blurAmount);
    float rad = modulateSize == 0 ? 0.9 : 1. - distFromMouse;
    // Create a grid of circles
    float d = length(uv);
    d = smoothstep(rad - blur, rad + blur, d);
    d = 1. - d;

    // define final frag color
    float rg = 0.75 - distFromMouse * 0.75;
    vec3 color = vec3(rg, rg, 1.0) * d - darkFactor;

    gl_FragColor = vec4(color, 1.);
}