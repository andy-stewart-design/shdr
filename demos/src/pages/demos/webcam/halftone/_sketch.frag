#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_webcam;
uniform vec2 u_webcam_size; // Added texture size uniform
uniform float u_dpi;

vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

vec4 posterize(in vec4 inputColor) {
    float gamma = 0.3;
    float numColors = 10.0;

    vec3 c = inputColor.rgb;
    c = pow(c, vec3(gamma, gamma, gamma));
    c = floor(c * numColors) / numColors;
    c = pow(c, vec3(1.0 / gamma));

    return vec4(c, inputColor.a);
}

void main() {

    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 halftoneUv = uv;
    halftoneUv = halftoneUv * 2.0 - 1.0;

    // Calculate aspect ratios
    float texAR = u_webcam_size.x / u_webcam_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 adjustedUV = uv;

    if(canvasAR < texAR) {
        // Canvas is wider than texture - crop sides
        float scale = canvasAR / texAR;
        adjustedUV.x = (uv.x - 0.5) * scale + 0.5;
    } else {
        // Canvas is taller than texture - crop top/bottom
        float scale = texAR / canvasAR;
        adjustedUV.y = (uv.y - 0.5) * scale + 0.5;
    }

    // Flip Y coordinate for proper orientation
    adjustedUV.x = 1.0 - adjustedUV.x;

    vec2 foo = adjustedUV;
    foo = foo * 2.0 - 1.0;
    bool isCroppedHor = canvasAR < texAR;
    float pixelX1 = floor(((foo.x + 1.) / 2.) * u_dpi) / (u_dpi);
    float pixelY1 = (floor(foo.y * u_dpi / texAR / 2.) / (u_dpi / texAR / 2.) + 1.) / 2.;
    float pixelX2 = (floor(foo.x * u_dpi * texAR / 2.) / (u_dpi * texAR / 2.) + 1.) / 2.;
    float pixelY2 = floor(((foo.y + 1.) / 2.) * u_dpi) / (u_dpi);
    float pixelX = isCroppedHor ? pixelX2 : pixelX1;
    float pixelY = isCroppedHor ? pixelY2 : pixelY1;
    // // define final frag color
    // vec3 color = vec3((pixelY1 + pixelX1) / 2.);
    // color = vec3(pixelX1, 0., pixelY1);

    // gl_FragColor = vec4(color, 1.);

    // Sample texture with adjusted coordinates
    vec4 texColor = texture2D(u_webcam, vec2(pixelX, pixelY));

    halftoneUv.x = isCroppedHor ? halftoneUv.x * u_resolution.x / u_resolution.y : halftoneUv.x;
    halftoneUv.y = isCroppedHor ? halftoneUv.y : halftoneUv.y * u_resolution.y / u_resolution.x;
    // // Save a copy of the original coordinate space
    // vec2 uvScreen = uv;
    // Divide the space into a repeating grid
    float posOffX = isCroppedHor ? 0. : mod(u_dpi, 2.) / 2.;
    float posOffY = isCroppedHor ? mod(u_dpi, 2.) / 2. : 0.;
    halftoneUv.x = fract(halftoneUv.x * u_dpi / 2. + posOffX);
    halftoneUv.y = fract(halftoneUv.y * u_dpi / 2. + posOffY);
    // Remap the coordiante space of each cell
    halftoneUv = halftoneUv * 2.0 - 1.0;
    // Grid parameters
    float blur = 0.05;
    float rad = 0.9;
    // Create a grid of circles
    float d = length(halftoneUv);
    d = smoothstep(rad - blur, rad + blur, d);
    d = (1. - d);
    vec3 color = texColor.rgb;
    color = color * d;
    // color = vec3(0., 0., 1.) * d;

    // gl_FragColor = posterize(texColor);
    // gl_FragColor = texColor;
    gl_FragColor = vec4(color, texColor.a);
}