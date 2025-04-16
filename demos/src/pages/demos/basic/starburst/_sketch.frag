#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Effect parameters - feel free to adjust these
float effectIntensity = 9.0;  // Controls the intensity of the wave effect
float timeScale = 0.07;       // Controls the speed of animation
float colorIntensity = 0.01;  // Controls brightness of the color bands

void main() {
    // Output color variable
    vec3 color;

    // Variables for length and time
    float len;
    float animTime = u_time;

    // Create three color channels with slightly different parameters
    for(int i = 0; i < 3; i++) {
        // Set up coordinate space
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = uv;

        // Center the coordinates
        p -= 0.5;

        // Fix aspect ratio
        p.x *= u_resolution.x / u_resolution.y;

        // Calculate the distance from center
        len = length(p);

        // Slightly offset the time for each iteration
        animTime += timeScale;

        // Create wave effect based on time and distance
        // This creates the flowing visual pattern
        uv += p / len * (sin(animTime) + 1.) * abs(sin(len * effectIntensity - animTime * 2.));

        // Create color channel with modulo operation to create repeating pattern
        color[i] = colorIntensity / length(mod(uv, 1.) - 0.5);
    }

    // Final color output with time in alpha channel
    gl_FragColor = vec4(color / len, u_time);
}