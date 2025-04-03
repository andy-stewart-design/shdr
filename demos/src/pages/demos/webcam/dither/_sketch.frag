#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_webcam;
uniform vec2 u_webcam_size; // Added texture size uniform

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

    // Calculate aspect ratios
    float texAspect = u_webcam_size.x / u_webcam_size.y;
    float canvasAspect = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 adjustedUV = uv;

    if(canvasAspect < texAspect) {
        // Canvas is wider than texture - crop sides
        float scale = canvasAspect / texAspect;
        adjustedUV.x = (uv.x - 0.5) * scale + 0.5;
    } else {
        // Canvas is taller than texture - crop top/bottom
        float scale = texAspect / canvasAspect;
        adjustedUV.y = (uv.y - 0.5) * scale + 0.5;
    }

    // Flip Y coordinate for proper orientation
    adjustedUV.y = 1.0 - adjustedUV.y;

    // Clamp to [0,1] to avoid sampling outside the texture
    adjustedUV = clamp(adjustedUV, 0.0, 1.0);

    // vec3 HSV = rgb2hsv(u_texture);

    // Sample texture with adjusted coordinates
    vec4 texColor = texture2D(u_webcam, adjustedUV);

    float numColors = 5.;
    vec3 HSV = rgb2hsv(texColor.rgb);
    float H = (floor(HSV.r * numColors) / numColors) + 0.1 * random(uv);
    float foo = random(uv) > 0.5 ? 0.05 : -0.05;
    float V = floor(HSV.b * numColors) / numColors + foo;
    // V = HSV.b + random(uv) - 0.5 > 0.5 ? 1. : 0.;
    vec3 RGB = hsv2rgb(vec3(H, HSV.g, V));

    // gl_FragColor = posterize(texColor);
    gl_FragColor = vec4(RGB, 1.0);
}