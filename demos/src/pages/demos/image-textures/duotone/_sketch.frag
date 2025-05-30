#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_resolution;
uniform vec3 u_highColor;
uniform vec3 u_lowColor;

vec4 desaturate(vec4 color) {
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);
    float gray = dot(color.rgb, luma);
    return vec4(vec3(gray), color.a);
}

vec4 duotone(vec4 fragColor, vec4 lowColor, vec4 highColor) {
    // Mix between low and high colors based on gray value
    return mix(lowColor, highColor, desaturate(fragColor));
}

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
    float textureAR = u_texture_resolution.x / u_texture_resolution.y;
    float canvasAR = u_resolution.x / u_resolution.y;
    vec2 adjustedUV = adjustUV(textureAR, canvasAR, uv);

    vec4 texColor = texture2D(u_texture, adjustedUV);
    vec4 low = vec4(u_lowColor, 1.0);
    vec4 high = vec4(u_highColor, 1.0);
    vec4 duo = duotone(texColor, low, high);  // You can use either texColor or desat as input

    gl_FragColor = duo;  // Use the duotone result
}