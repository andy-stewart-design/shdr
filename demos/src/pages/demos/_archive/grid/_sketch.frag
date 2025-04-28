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
    // Remap the coordinate space from 0,1 to -1,1
    uv = uv * 2.0 - 1.0;
    vec2 foo = uv;
    // Fix aspect ratio of coordinates
    bool isLandscape = u_resolution.x >= u_resolution.y;
    uv.x = isLandscape ? uv.x * u_resolution.x / u_resolution.y : uv.x;
    uv.y = isLandscape ? uv.y : uv.y * u_resolution.y / u_resolution.x;
    // // Save a copy of the original coordinate space
    // vec2 uvScreen = uv;
    // Divide the space into a repeating grid
    uv = fract(uv * u_dpi);
    // Remap the coordiante space of each cell
    uv = uv * 2.0 - 1.0;

    // // Calculate the grid cell center in original coordinates
    // vec2 cellIndex = floor(uvScreen * u_dpi);
    // vec2 cellCenter = (cellIndex + 0.5) / u_dpi;

    // Grid parameters
    float blur = 0.05;
    float rad = 0.9;
    // Create a grid of circles
    float d = length(uv);
    d = smoothstep(rad - blur, rad + blur, d);
    d = 1. - d;

    float cavasAR = u_resolution.x / u_resolution.y;
    float bar = floor(((foo.y + 1.) / 2.) * u_dpi * 2.) / (u_dpi * 2.);
    float baz = (floor(foo.x * u_dpi * cavasAR) / (u_dpi * cavasAR) + 1.) / 2. + 0.05;
    // define final frag color
    vec3 color = vec3((baz + bar) / 2.) * d;
    color = vec3(0., 0., 1.) * d;

    gl_FragColor = vec4(color, 1.);
}