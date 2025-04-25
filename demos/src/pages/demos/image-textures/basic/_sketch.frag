#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;

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

    gl_FragColor = texture2D(u_texture, uv);
}