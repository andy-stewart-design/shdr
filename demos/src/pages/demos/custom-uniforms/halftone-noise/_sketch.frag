#version 300 es
precision mediump float;

uniform float u_time;
uniform vec2 u_resolution;
uniform float u_speed;

float dpi = 64.;

out vec4 fragColor;

vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 mod289(const in vec3 x) {
    return x - floor(x * (1. / 289.)) * 289.;
}
vec4 mod289(const in vec4 x) {
    return x - floor(x * (1. / 289.)) * 289.;
}
vec4 permute(const in vec4 v) {
    return mod289(((v * 34.0) + 1.0) * v);
}
vec4 taylorInvSqrt(in vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}
vec3 quintic(const in vec3 v) {
    return v * v * v * (v * (v * 6.0 - 15.0) + 10.0);
}
float noise(in vec3 P) {
    vec3 Pi0 = floor(P); // Integer part for indexing
    vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
    Pi0 = mod289(Pi0);
    Pi1 = mod289(Pi1);
    vec3 Pf0 = fract(P); // Fractional part for interpolation
    vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
    vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
    vec4 iy = vec4(Pi0.yy, Pi1.yy);
    vec4 iz0 = Pi0.zzzz;
    vec4 iz1 = Pi1.zzzz;

    vec4 ixy = permute(permute(ix) + iy);
    vec4 ixy0 = permute(ixy + iz0);
    vec4 ixy1 = permute(ixy + iz1);

    vec4 gx0 = ixy0 * (1.0 / 7.0);
    vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
    gx0 = fract(gx0);
    vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
    vec4 sz0 = step(gz0, vec4(0.0));
    gx0 -= sz0 * (step(0.0, gx0) - 0.5);
    gy0 -= sz0 * (step(0.0, gy0) - 0.5);

    vec4 gx1 = ixy1 * (1.0 / 7.0);
    vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
    gx1 = fract(gx1);
    vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
    vec4 sz1 = step(gz1, vec4(0.0));
    gx1 -= sz1 * (step(0.0, gx1) - 0.5);
    gy1 -= sz1 * (step(0.0, gy1) - 0.5);

    vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
    vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
    vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
    vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
    vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
    vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
    vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
    vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

    vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));
    g000 *= norm0.x;
    g010 *= norm0.y;
    g100 *= norm0.z;
    g110 *= norm0.w;
    vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));
    g001 *= norm1.x;
    g011 *= norm1.y;
    g101 *= norm1.z;
    g111 *= norm1.w;

    float n000 = dot(g000, Pf0);
    float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
    float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
    float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
    float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
    float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
    float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
    float n111 = dot(g111, Pf1);

    vec3 fade_xyz = quintic(Pf0);
    vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
    vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
    float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
    return 2.2 * n_xyz;
}

float sineIn(float t) {
    return sin((t - 1.0) * 1.5707963267948966) + 1.0;
}

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    float canvasAR = u_resolution.x / u_resolution.y;
    bool isCroppedHor = canvasAR < 1.;

    // PIXELATE ------------------------------------------------------
    // Calculate pixelated coordinates based on aspect ratio
    // This creates a blocky/pixelated look by quantizing the UV coordinates
    vec2 pixelatedUv = uv;
    pixelatedUv = pixelatedUv * 2.0 - 1.0;

    float pixelX1 = floor(((pixelatedUv.x + 1.) / 2.) * dpi) / (dpi);
    float pixelY1 = (floor(pixelatedUv.y * dpi / canvasAR / 2.) / (dpi / canvasAR / 2.) + 1.) / 2.;
    float pixelX2 = (floor(pixelatedUv.x * dpi * canvasAR / 2.) / (dpi * canvasAR / 2.) + 1.) / 2.;
    float pixelY2 = floor(((pixelatedUv.y + 1.) / 2.) * dpi) / (dpi);

    // Choose the appropriate pixelation based on the cropping direction
    float pixelX = isCroppedHor ? pixelX2 : pixelX1;
    float pixelY = isCroppedHor ? pixelY2 : pixelY1;
    vec2 pixel = vec2(pixelX, pixelY);
    float pixelHue = abs(noise(vec3(pixel, u_time * u_speed)));
    vec3 pixelCol = hsv2rgb(vec3(pixelHue, 0.9, 1.));
    float pixelBrightness = 0.3 * pixelCol.r + 0.59 * pixelCol.g + 0.11 * pixelCol.b;

    // HALFTONE ------------------------------------------------------  
    // Prepare UV coordinates for halftone pattern
    vec2 halftoneUv = uv;
    halftoneUv = halftoneUv * 2.0 - 1.0;  // Convert to [-1,1] range

    // Scale halftone pattern based on aspect ratio
    halftoneUv.x = isCroppedHor ? halftoneUv.x * u_resolution.x / u_resolution.y : halftoneUv.x;
    halftoneUv.y = isCroppedHor ? halftoneUv.y : halftoneUv.y * u_resolution.y / u_resolution.x;

    // Create a repeating grid for the halftone pattern
    float posOffX = isCroppedHor ? 0. : mod(dpi, 2.) / 2.;  // Offset X for even/odd DPI
    float posOffY = isCroppedHor ? mod(dpi, 2.) / 2. : 0.;  // Offset Y for even/odd DPI

    // Divide space into grid cells
    halftoneUv.x = fract(halftoneUv.x * dpi / 2. + posOffX);
    halftoneUv.y = fract(halftoneUv.y * dpi / 2. + posOffY);

    // Remap each grid cell to [-1,1] range
    halftoneUv = halftoneUv * 2.0 - 1.0;

    // Set parameters for the halftone effect
    float blur = dpi * 0.00125;

    // Calculate circle radius based on brightness and modulation
    // Higher brightness = larger circles when modulation is less than 1
    float rad = (1. - pixelBrightness) * 1.;

     // Create a circle in each grid cell
    float d = length(halftoneUv);  // Distance from center of cell

    // Apply smoothstep to create a soft-edged circle
    d = 1. - smoothstep(rad - blur, rad + blur, d);

    float r = sineIn(1. - pixelBrightness) * 0.9;
    float g = (1. - pixelBrightness) * 0.9 * pixelBrightness;
    float b = (1. - pixelBrightness) * 1.0 * pixelBrightness;
    vec3 finalColor = vec3(r, g, b) * d;

    fragColor = vec4(finalColor, 1.); // Magenta
}