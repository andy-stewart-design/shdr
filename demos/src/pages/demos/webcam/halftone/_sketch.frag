#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_webcam;
uniform vec2 u_webcam_size; // Added texture size uniform
uniform float u_dpi;
uniform int u_color_theme;
uniform float u_pattern_modulation;
uniform int u_invert_pattern;

vec2 adjustUV(float textureAR, float canvasAR, vec2 uv) {
    bool isLandscape = canvasAR < textureAR;
    float scale = isLandscape ? canvasAR / textureAR : textureAR / canvasAR;
    float x = !isLandscape ? uv.x : (uv.x - 0.5) * scale + 0.5;
    float y = isLandscape ? uv.y : (uv.y - 0.5) * scale + 0.5;
    return vec2(x, y);
}

void main() {
    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float videoAR = u_webcam_size.x / u_webcam_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 adjustedUV = adjustUV(videoAR, canvasAR, uv);
    // Flip Y coordinate for proper orientation
    adjustedUV.x = 1.0 - adjustedUV.x;

    vec2 pixelatedUv = adjustedUV;
    pixelatedUv = pixelatedUv * 2.0 - 1.0;
    bool isCroppedHor = canvasAR < videoAR;
    float pixelX1 = floor(((pixelatedUv.x + 1.) / 2.) * u_dpi) / (u_dpi);
    float pixelY1 = (floor(pixelatedUv.y * u_dpi / videoAR / 2.) / (u_dpi / videoAR / 2.) + 1.) / 2.;
    float pixelX2 = (floor(pixelatedUv.x * u_dpi * videoAR / 2.) / (u_dpi * videoAR / 2.) + 1.) / 2.;
    float pixelY2 = floor(((pixelatedUv.y + 1.) / 2.) * u_dpi) / (u_dpi);
    float pixelX = isCroppedHor ? pixelX2 : pixelX1;
    float pixelY = isCroppedHor ? pixelY2 : pixelY1;

    // Sample texture with adjusted coordinates
    vec4 texel = texture2D(u_webcam, vec2(pixelX, pixelY));
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);
    float brightness = dot(texel.rgb, luma);
    vec3 color = u_color_theme == 1 ? vec3(texel.rgb) : u_color_theme == 2 ? vec3(brightness) : vec3(1.);

    vec2 halftoneUv = uv;
    halftoneUv = halftoneUv * 2.0 - 1.0;
    halftoneUv.x = isCroppedHor ? halftoneUv.x * u_resolution.x / u_resolution.y : halftoneUv.x;
    halftoneUv.y = isCroppedHor ? halftoneUv.y : halftoneUv.y * u_resolution.y / u_resolution.x;

    // Divide the space into a repeating grid
    float posOffX = isCroppedHor ? 0. : mod(u_dpi, 2.) / 2.;
    float posOffY = isCroppedHor ? mod(u_dpi, 2.) / 2. : 0.;
    halftoneUv.x = fract(halftoneUv.x * u_dpi / 2. + posOffX);
    halftoneUv.y = fract(halftoneUv.y * u_dpi / 2. + posOffY);
    // Remap the coordiante space of each cell
    halftoneUv = halftoneUv * 2.0 - 1.0;
    // Grid parameters
    float blur = u_dpi * 0.0025;
    float rad = u_pattern_modulation + (brightness * (1. - u_pattern_modulation));
    // Create a grid of circles
    float d = length(halftoneUv);
    d = smoothstep(rad - blur, rad + blur, d);
    d = u_invert_pattern == 1 ? d : (1. - d);
    color = color * d;
    // color = vec3(0., 0., 1.) * d;

    gl_FragColor = vec4(color, texel.a);
}