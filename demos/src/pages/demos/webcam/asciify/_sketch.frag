#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_webcam;
uniform vec2 u_webcam_size;

vec2 adjustUV(float textureAR, float canvasAR, vec2 uv) {
    bool isLandscape = canvasAR < textureAR;
    float scale = isLandscape ? canvasAR / textureAR : textureAR / canvasAR;
    float x = !isLandscape ? uv.x : (uv.x - 0.5) * scale + 0.5;
    float y = isLandscape ? uv.y : (uv.y - 0.5) * scale + 0.5;
    return vec2(x, y);
}

float dpi = 20.;
float blur = 0.0375;

void main() {
    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float textureAR = u_webcam_size.x / u_webcam_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;
    // uv.x = uv.x * textureAR - 0.125;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 adjustedUV = adjustUV(textureAR, canvasAR, uv);
    // Flip Y coordinate for proper orientation
    adjustedUV.x = 1.0 - adjustedUV.x;

    // Calculate the grid cell center in original coordinates
    vec2 cellIndex = floor(adjustedUV * dpi);
    vec2 cellCenter = (cellIndex + 0.5) / dpi;
    vec4 texel = texture2D(u_webcam, cellCenter);

    // // Calculate aspect ratios
    // float textureAR = u_webcam_size.x / u_webcam_size.y;
    // float canvasAR = u_resolution.x / u_resolution.y;

    // // Adjust UVs to maintain aspect ratio (cover)
    // vec2 adjustedUV = adjustUV(textureAR, canvasAR, uv);

    // // Flip Y coordinate for proper orientation
    // adjustedUV.x = 1.0 - adjustedUV.x;

    // float dpiX = dpi * textureAR;
    // float pixelX = floor(adjustedUV.x * dpiX) / dpiX;
    // float pixelY = floor(adjustedUV.y * dpi) / dpi;
    // vec2 pixel = vec2(pixelX, pixelY);

    // // Sample texture with adjusted coordinates
    // vec4 texColor = texture2D(u_webcam, pixel);
    // vec3 luma = vec3(0.2126, 0.7152, 0.0722);
    // float gray = dot(texColor.rgb, luma);
    // float threshold = floor(gray * 10.) / (10. - 1.);

    // gl_FragColor = vec4(vec3(threshold), texColor.a);

    // Remap the coordinate space from 0,1 to -1,1

    uv = uv * 2.0 - 1.0;

    if(u_resolution.y > u_resolution.x) {
        uv.x *= u_resolution.x / u_resolution.y;
    } else {
        uv.y *= u_resolution.y / u_resolution.x;
    }

    // Save a copy of the original coordinate space
    // Divide the space into a repeating grid
    uv = fract(uv * dpi / 2.);
    // Remap the coordiante space of each cell
    uv = uv * 2.0 - 1.0;

    float rad = 0.5;
    float d = length(uv);
    d = smoothstep(rad - blur, rad + blur, d);
    d = 1. - d;
    vec3 color = vec3(0., 0., 1.0) * d;

    gl_FragColor = texel;
    // gl_FragColor = vec4(color, 1.);
}