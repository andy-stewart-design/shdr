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

void main() {

    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float textureAR = u_webcam_size.x / u_webcam_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 adjustedUV = adjustUV(textureAR, canvasAR, uv);

    // Flip Y coordinate for proper orientation
    adjustedUV.x = 1.0 - adjustedUV.x;

    float blockSize = 32.;
    float blockSizeX = blockSize * textureAR;
    float pixelX = floor(adjustedUV.x * blockSizeX) / blockSizeX;
    float pixelY = floor(adjustedUV.y * blockSize) / blockSize;
    vec2 pixel = vec2(pixelX, pixelY);

    // Sample texture with adjusted coordinates
    vec4 texColor = texture2D(u_webcam, pixel);
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);
    float gray = dot(texColor.rgb, luma);
    float threshold = floor(gray * 100.) / (100. - 1.);

    gl_FragColor = vec4(vec3(threshold), texColor.a);
}