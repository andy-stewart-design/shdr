#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;

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
    float textureAR = u_texture_size.x / u_texture_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 adjustedUV = adjustUV(textureAR, canvasAR, uv);

    // Flip Y coordinate for proper orientation
    // adjustedUV.y = 1.0 - adjustedUV.y;

    // Sample original texture for the color
    vec4 texColor = texture2D(u_texture, adjustedUV);

    gl_FragColor = texColor;

}