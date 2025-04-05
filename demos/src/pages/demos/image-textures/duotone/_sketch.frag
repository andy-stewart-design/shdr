#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;
uniform vec3 u_highColor;
uniform vec3 u_lowColor;

vec4 desaturate(vec4 color) {
    vec3 luma = vec3(0.2126, 0.7152, 0.0722);
    float gray = dot(color.rgb, luma);
    vec3 rgb = vec3(gray);
    return vec4(rgb, color.a);
}

vec4 duotone(vec4 fragColor, vec4 lowColor, vec4 highColor) {
    // Mix between low and high colors based on gray value
    return mix(lowColor, highColor, desaturate(fragColor));
}

void main() {
    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float textureAR = u_texture_size.x / u_texture_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 adjustedUV = uv;

    if(canvasAR < textureAR) {
        // Canvas is wider than texture - crop sides
        float scale = canvasAR / textureAR;
        adjustedUV.x = (uv.x - 0.5) * scale + 0.5;
    } else {
        // Canvas is taller than texture - crop top/bottom
        float scale = textureAR / canvasAR;
        adjustedUV.y = (uv.y - 0.5) * scale + 0.5;
    }

    // Sample texture with pixelated coordinates
    vec4 texColor = texture2D(u_texture, adjustedUV);
    vec4 low = vec4(u_lowColor, 1.0);
    vec4 high = vec4(u_highColor, 1.0);
    vec4 duo = duotone(texColor, low, high);  // You can use either texColor or desat as input

    gl_FragColor = duo;  // Use the duotone result
}