#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
uniform sampler2D u_texture;
uniform vec2 u_texture_size;

vec2 cropImage(float imageAR, float containerAR, vec2 uv) {
    bool isLandscape = containerAR < imageAR;
    float scale = isLandscape ? containerAR / imageAR : imageAR / containerAR;
    float x = !isLandscape ? uv.x : (uv.x - 0.5) * scale + 0.5;
    float y = isLandscape ? uv.y : (uv.y - 0.5) * scale + 0.5;
    return vec2(x, y);
}

const float gridSize = 60.;
const float textureCellCount = 10.;
const float speedMultiplier = 8.;

void main() {
    // Get normalized coordinates
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios
    float videoAR = u_texture_size.x / u_texture_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;

    // Adjust UVs to maintain aspect ratio (cover)
    vec2 adjustedUV = cropImage(videoAR, canvasAR, uv);
    // TODO: Figure out what this should be called
    float foo = gridSize / textureCellCount;
    float inc = floor(u_time * speedMultiplier) / textureCellCount;
    float xIndex = mod(floor(adjustedUV.x * gridSize) / textureCellCount, 1.);
    float texX = fract(adjustedUV.x * gridSize) / gridSize * foo + xIndex;
    float yIndex = mod(floor(adjustedUV.y * gridSize) / textureCellCount + inc + xIndex, 1.);
    float texY = fract(adjustedUV.y * gridSize) / gridSize * foo + yIndex;
    vec2 texUV = vec2(texX, texY);

    // float foo = 100. / 10.;
    // vec2 texUV = fract(adjustedUV * 100.) / 100. * foo;

    // Sample original texture for the color
    vec4 texColor = texture2D(u_texture, texUV);

    // gl_FragColor = vec4(fract(adjustedUV * 4.), 0., 1);
    // gl_FragColor = texColor * vec4(fract(adjustedUV * 4.), 0., 1);
    gl_FragColor = texColor;
}