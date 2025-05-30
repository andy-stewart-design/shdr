#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture_1;
uniform vec2 u_texture_1_resolution;
uniform sampler2D u_texture_2;
uniform vec2 u_texture_2_resolution;
uniform sampler2D u_texture_3;
uniform vec2 u_texture_3_resolution;
uniform float u_threshold;
uniform float u_range;

vec2 adjustUV(float textureAR, float canvasAR, vec2 uv) {
    if(canvasAR < textureAR) {
        // Canvas is wider than texture - crop sides
        float scale = canvasAR / textureAR;
        return vec2((uv.x - 0.5) * scale + 0.5, uv.y);
    } else {
        // Canvas is taller than texture - crop top/bottom
        float scale = textureAR / canvasAR;
        return vec2(uv.x, (uv.y - 0.5) * scale + 0.5);
    }
}

void main() {
    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float textureAR_1 = u_texture_1_resolution.x / u_texture_1_resolution.y;
    float textureAR_2 = u_texture_2_resolution.x / u_texture_2_resolution.y;
    float textureAR_3 = u_texture_3_resolution.x / u_texture_3_resolution.y;
    float canvasAR = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 adjustedUV_1 = adjustUV(textureAR_1, canvasAR, uv);
    vec2 adjustedUV_2 = adjustUV(textureAR_2, canvasAR, uv);
    vec2 adjustedUV_3 = adjustUV(textureAR_3, canvasAR, uv);

    // Sample texture with pixelated coordinates
    vec4 texColor_1 = texture2D(u_texture_1, adjustedUV_1);
    vec4 texColor_2 = texture2D(u_texture_2, adjustedUV_2);
    vec4 texColor_3 = texture2D(u_texture_3, adjustedUV_3);

    float t = smoothstep(u_threshold - u_range, u_threshold + u_range, texColor_3.r);

    gl_FragColor = mix(texColor_1, texColor_2, t);
}