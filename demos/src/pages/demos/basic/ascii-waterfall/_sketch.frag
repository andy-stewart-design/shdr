#ifdef GL_ES
precision mediump float;  // Define precision for float calculations on OpenGL ES platforms
#endif

// Uniform variables provided by the rendering environment
uniform vec2 u_resolution;     // Canvas resolution (width, height) in pixels
uniform vec2 u_mouse;          // Mouse position (x, y) in pixels
uniform float u_time;          // Time in seconds since the shader started running
uniform sampler2D u_texture;   // Ascii sprite sheet
uniform vec2 u_texture_size;   // Ascii sprite sheet size

/**
 * Function to adjust UV coordinates to maintain aspect ratio when displaying an image
 * Uses the "cover" approach (similar to CSS background-size: cover)
 * 
 * @param imageAR      The aspect ratio of the image (width/height)
 * @param containerAR  The aspect ratio of the container (width/height)
 * @param uv           The original UV coordinates (0-1 range)
 * @return             Adjusted UV coordinates that maintain the image's aspect ratio
 */
vec2 cropImage(float imageAR, float containerAR, vec2 uv) {
    // Determine if the image is wider (landscape) than the container
    bool isLandscape = containerAR < imageAR;

    // Calculate the scale factor needed to maintain aspect ratio
    float scale = isLandscape ? containerAR / imageAR : imageAR / containerAR;

    // Adjust the X or Y coordinate based on the orientation
    // We only scale the dimension that needs to be adjusted to maintain ratio
    float x = !isLandscape ? uv.x : (uv.x - 0.5) * scale + 0.5;  // Center and scale X for landscape
    float y = isLandscape ? uv.y : (uv.y - 0.5) * scale + 0.5;   // Center and scale Y for portrait

    return vec2(x, y);
}

// Constants used for the grid effect
const float renderGridSize = 60.;   // Number of cells in the display grid
const float spriteGridSize = 10.;   // Number of cells in the ascii sprite sheet (u_texture)
const float speedMultiplier = 8.;   // Controls the animation speed

void main() {
    // Convert fragment coordinates to normalized [0, 1] space
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;

    // Calculate aspect ratios for the input texture and the canvas
    float videoAR = u_texture_size.x / u_texture_size.y;
    float canvasAR = u_resolution.x / u_resolution.y;

    // Adjust UVs to crop the image while maintaining aspect ratio
    vec2 adjustedUV = cropImage(videoAR, canvasAR, uv);

    // Compute horizontal cell index within the render grid, then normalize to sprite grid
    float xIndex = fract(floor(adjustedUV.x * renderGridSize) / spriteGridSize);
    float texelX = fract(adjustedUV.x * renderGridSize) / spriteGridSize + xIndex;

    // Introduce vertical motion over time (scrolling effect)
    float posYOffset = floor(u_time * speedMultiplier) / spriteGridSize;  

    // Compute vertical cell index (with offset) normalized to sprite the grid
    float yIndex = fract(floor(adjustedUV.y * renderGridSize) / spriteGridSize + posYOffset + xIndex);
    float texelY = fract(adjustedUV.y * renderGridSize) / spriteGridSize + yIndex;

    // Sample the texture at the calculated coordinates to get the color
    vec4 texel = texture2D(u_texture, vec2(texelX, texelY));

    // Output the final color
    gl_FragColor = texel;
}