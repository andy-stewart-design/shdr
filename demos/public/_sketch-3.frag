#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;

// Hash function
float hash(float n) {
    return fract(sin(n) * 43758.5453);
}

// 3D noise function
float noise(vec3 x) {
    vec3 p = floor(x);
    vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);

    float n = p.x + p.y * 157.0 + 113.0 * p.z;
    return mix(mix(mix(hash(n), hash(n + 1.0), f.x), mix(hash(n + 157.0), hash(n + 158.0), f.x), f.y), mix(mix(hash(n + 113.0), hash(n + 114.0), f.x), mix(hash(n + 270.0), hash(n + 271.0), f.x), f.y), f.z);
}

// Get distance to a single cube
float sdBox(vec3 p, vec3 b) {
    vec3 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, max(d.y, d.z)), 0.0);
}

// Get distance to the scene
float map(vec3 p) {
    // Liquid cursor effect - create a sphere at mouse position
    vec2 mousePos = u_mouse * 2.0 - 1.0;
    mousePos.x *= u_resolution.x / u_resolution.y;

    float mouseDist = length(p.xy - mousePos * 5.0);
    float waveHeight = sin(u_time * 2.0 + mouseDist * 2.0) * 0.2;
    float cursorEffect = 1.0 - smoothstep(0.0, 3.0, mouseDist);

    // Grid of cubes
    vec3 q = mod(p + 1.0, 2.0) - 1.0;

    // Cube size is affected by mouse and noise
    float noiseVal = noise(p * 0.2 + u_time * 0.1);
    float size = 0.3 + 0.1 * noiseVal + 0.3 * cursorEffect * waveHeight;

    return sdBox(q, vec3(size));
}

// Calculate normal
vec3 calcNormal(vec3 p) {
    const float eps = 0.001;
    const vec2 h = vec2(eps, 0.0);
    return normalize(vec3(map(p + h.xyy) - map(p - h.xyy), map(p + h.yxy) - map(p - h.yxy), map(p + h.yyx) - map(p - h.yyx)));
}

// Green gradient color palette
vec3 greenGradient(float t) {
    return mix(vec3(0.2, 0.7, 0.3), vec3(0.0, 0.4, 0.1), t);
}

void main() {
    // Adjust for aspect ratio
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    uv = uv * 2.0 - 1.0;
    uv.x *= u_resolution.x / u_resolution.y;

    // Ray origin and direction
    vec3 ro = vec3(0.0, 0.0, -5.0);
    vec3 rd = normalize(vec3(uv, 1.0));

    // Apply rotation to make scene more dynamic
    float angle = u_time * 0.3;
    mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
    ro.xz = rot * ro.xz;
    rd.xz = rot * rd.xz;

    // Ray marching
    float t = 0.0;
    float tmax = 20.0;
    float steps = 0.0;

    for(int i = 0; i < 100; i++) {
        vec3 p = ro + rd * t;
        float d = map(p);

        // Break if hit or too far
        if(d < 0.001 || t > tmax)
            break;

        t += d;
        steps += 1.0;
    }

    // Color based on the result
    vec3 col = vec3(0.05, 0.1, 0.15); // Dark background

    if(t < tmax) {
        // Calculate hit point and normal
        vec3 p = ro + rd * t;
        vec3 normal = calcNormal(p);

        // Lighting
        vec3 lightDir = normalize(vec3(1.0, 1.0, -1.0));
        float diff = max(dot(normal, lightDir), 0.0);
        float amb = 0.2;

        // Use position for gradient color
        float posGrad = length(p) * 0.1;
        vec3 baseColor = greenGradient(posGrad + noise(p * 2.0 + u_time * 0.2));

        // Mouse effect - make cubes close to mouse brighter
        vec2 mousePos = u_mouse * 2.0 - 1.0;
        mousePos.x *= u_resolution.x / u_resolution.y;
        float mouseDist = length(p.xy - mousePos * 5.0);
        float mouseGlow = 1.0 - smoothstep(0.0, 3.0, mouseDist);

        // Apply colors
        col = baseColor * (diff + amb) + mouseGlow * vec3(0.2, 0.5, 0.3);

        // Add subtle rim lighting
        float rim = 1.0 - max(dot(normal, -rd), 0.0);
        rim = pow(rim, 3.0);
        col += rim * 0.2 * vec3(0.2, 0.8, 0.3);
    }

    // Add fog based on distance
    col = mix(col, vec3(0.05, 0.1, 0.15), 1.0 - exp(-0.05 * t));

    // Add step visualization for a glowing effect
    col += vec3(0.0, 0.3, 0.1) * (steps / 50.0);

    // Adjust contrast and gamma
    col = pow(col, vec3(0.9));

    gl_FragColor = vec4(col, 1.0);
}