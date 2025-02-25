'use strict';

// src/utils.ts
function getContext(canvas) {
  const gl = canvas.getContext("webgl");
  if (!gl) throw new Error("WebGL not supported");
  return gl;
}
function updateTexture(gl, texture) {
  const { TEXTURE_2D, RGBA, UNSIGNED_BYTE } = gl;
  const pixel = new Uint8Array([0, 0, 0, 255]);
  if (!texture) {
    gl.texImage2D(TEXTURE_2D, 0, RGBA, 1, 1, 0, RGBA, UNSIGNED_BYTE, pixel);
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, RGBA, RGBA, UNSIGNED_BYTE, texture);
  }
}
function setTextureParams(gl, texture) {
  if (isPowerOf2(texture.width) && isPowerOf2(texture.height)) {
    gl.generateMipmap(gl.TEXTURE_2D);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
}
function isPowerOf2(value) {
  return value > 0 && (value & value - 1) === 0;
}

// src/glsl-asset-manager.ts
var GlslAssetManager = class {
  constructor(gl, program, initialUniforms = {}) {
    this.uniforms = /* @__PURE__ */ new Map();
    this.staticTextures = /* @__PURE__ */ new Map();
    this.dynamicTextures = /* @__PURE__ */ new Map();
    this.gl = gl;
    this.program = program;
    this.initializeDefaultUniforms();
    this.initializeCustomUniforms(initialUniforms);
  }
  initializeDefaultUniforms() {
    const uTime = this.gl.getUniformLocation(this.program, "u_time");
    this.uniforms.set("u_time", uTime);
    const uRes = this.gl.getUniformLocation(this.program, "u_resolution");
    this.uniforms.set("u_resolution", uRes);
    const uMouse = this.gl.getUniformLocation(this.program, "u_mouse");
    this.uniforms.set("u_mouse", uMouse);
  }
  initializeCustomUniforms(uniforms) {
    for (const [name, config] of Object.entries(uniforms)) {
      const location = this.gl.getUniformLocation(this.program, name);
      if (!location) continue;
      this.uniforms.set(name, location);
      this.setUniform(name, config);
    }
  }
  getTextureUnit() {
    return this.staticTextures.size + this.dynamicTextures.size;
  }
  getUniformLocation(name) {
    const location = this.gl.getUniformLocation(this.program, name);
    if (!location) {
      throw new Error(`Failed to retrieve unform loaction for ${name}`);
    }
    return location;
  }
  initializeTexture(name) {
    const location = this.getUniformLocation(name);
    const texture = this.gl.createTexture();
    const textureUnit = this.getTextureUnit();
    this.gl.uniform1i(location, textureUnit);
    this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    updateTexture(this.gl);
    return [texture, textureUnit];
  }
  loadStaticTexture(name, url) {
    const [texture, textureUnit] = this.initializeTexture(name);
    this.staticTextures.set(name, { asset: texture, unit: textureUnit });
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      try {
        const texture2 = this.staticTextures.get(name);
        const sizeName = `${name}_size`;
        const sizeLocation = this.gl.getUniformLocation(this.program, sizeName);
        if (sizeLocation && texture2) {
          this.uniforms.set(sizeName, sizeLocation);
          this.gl.uniform2f(sizeLocation, image.width, image.height);
          this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture2.asset);
          setTextureParams(this.gl, image);
          updateTexture(this.gl, image);
        }
      } catch (error) {
        console.error(`Error loading texture ${name}:`, error);
      }
    };
    image.onerror = () => {
      console.error(`Failed to load texture: ${url}`);
    };
    image.src = url;
  }
  async loadDynamicTexture(name, url) {
    const video = document.createElement("video");
    video.muted = true;
    video.addEventListener("loadeddata", () => {
      const [texture, textureUnit] = this.initializeTexture(name);
      this.dynamicTextures.set(name, {
        video,
        asset: texture,
        unit: textureUnit
      });
      video.play();
      try {
        const texture2 = this.dynamicTextures.get(name);
        const sizeName = `${name}_size`;
        const sizeLocation = this.gl.getUniformLocation(this.program, sizeName);
        if (sizeLocation && texture2) {
          this.uniforms.set(sizeName, sizeLocation);
          this.gl.uniform2f(sizeLocation, 640, 480);
          this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture2.asset);
          setTextureParams(this.gl, video);
          updateTexture(this.gl, video);
        }
      } catch (error) {
        console.error(`Error loading texture ${name}:`, error);
      }
    });
    if (!url) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.autoplay = true;
      video.srcObject = stream;
    } else {
      video.loop = true;
      video.crossOrigin = "anonymous";
      video.src = url;
    }
  }
  renderDynamicTextures() {
    for (const texture of Array.from(this.dynamicTextures.values())) {
      this.gl.activeTexture(this.gl.TEXTURE0 + texture.unit);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture.asset);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        texture.video
      );
    }
  }
  setUniform(name, config) {
    const location = this.uniforms.get(name);
    if (!location) {
      console.warn(`Uniform ${name} not found`);
      return;
    }
    switch (config.type) {
      case "float":
        this.gl.uniform1f(location, config.value);
        break;
      case "vec2":
        this.gl.uniform2fv(location, config.value);
        break;
      case "vec3":
        this.gl.uniform3fv(location, config.value);
        break;
      case "vec4":
        this.gl.uniform4fv(location, config.value);
        break;
      case "int":
        this.gl.uniform1i(location, config.value);
        break;
      case "bool":
        this.gl.uniform1i(location, config.value ? 1 : 0);
        break;
      case "image":
        this.loadStaticTexture(name, config.value);
        break;
      case "video":
        this.loadDynamicTexture(name, config.value);
        break;
      case "webcam":
        this.loadDynamicTexture(name);
        break;
      default:
        console.warn(`Unsupported uniform type for ${name}`);
    }
  }
  destroy() {
    this.staticTextures.forEach((txtr) => this.gl.deleteTexture(txtr.asset));
    this.staticTextures.clear();
    for (const texture of Array.from(this.dynamicTextures.values())) {
      const src = texture.video.srcObject;
      if (src instanceof MediaStream) {
        src.getTracks().forEach((track) => track.stop());
      } else {
        texture.video.srcObject = null;
      }
    }
    this.dynamicTextures.clear();
  }
};
var glsl_asset_manager_default = GlslAssetManager;

// src/shaders.ts
var vertexShaderSource = `
    attribute vec2 a_position;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;
var fragmentShaderSource = `
    #ifdef GL_ES
    precision mediump float;
    #endif

    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 st = gl_FragCoord.xy / u_resolution;
      vec2 mouse = u_mouse / u_resolution;

      // Distance from the mouse
      float dist = distance(st, mouse);
      
      // Color based on time and distance
      vec3 color = vec3(0.5 + 0.5 * cos(u_time + dist * 10.0), dist, st.x);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

// src/glsl-canvas.ts
var DEFAULT_VERTICES = new Float32Array([
  -1,
  -1,
  1,
  -1,
  -1,
  1,
  -1,
  1,
  1,
  -1,
  1,
  1
]);
var GlslCanvas = class {
  constructor(container, frag) {
    this.container = container;
    this.canvas = document.createElement("canvas");
    this.canvas.style.display = "block";
    this.container.appendChild(this.canvas);
    this.gl = getContext(this.canvas);
    const vertexShader = this.compileShader(
      this.gl.VERTEX_SHADER,
      vertexShaderSource
    );
    const fragmentShader = this.compileShader(
      this.gl.FRAGMENT_SHADER,
      frag ?? fragmentShaderSource
    );
    this.program = this.createProgram(vertexShader, fragmentShader);
    this.gl.useProgram(this.program);
    this.createBuffer(DEFAULT_VERTICES);
    const a_Position = this.gl.getAttribLocation(this.program, "a_position");
    this.gl.enableVertexAttribArray(a_Position);
    this.gl.vertexAttribPointer(a_Position, 2, this.gl.FLOAT, false, 0, 0);
  }
  compileShader(type, source) {
    const shader = this.gl.createShader(type);
    if (!shader) throw new Error("Shader creation failed");
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      this.gl.deleteShader(shader);
      throw new Error(
        `Shader compilation error: ${this.gl.getShaderInfoLog(shader)}`
      );
    }
    return shader;
  }
  createProgram(vertexShader, fragmentShader) {
    const program = this.gl.createProgram();
    if (!program) {
      throw new Error(`Error creating WebGL Program`);
    }
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      throw new Error(
        `Program linking error: ${this.gl.getProgramInfoLog(program)}`
      );
    }
    return program;
  }
  createBuffer(data) {
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, data, this.gl.STATIC_DRAW);
    return buffer;
  }
  resizeCanvas() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
  }
  destroy() {
    this.container.innerHTML = "";
  }
};
var glsl_canvas_default = GlslCanvas;

// src/index.ts
var GlslRenderer = class extends glsl_canvas_default {
  constructor(container, frag, initialUniforms = {}) {
    super(container, frag);
    this.mousePosition = [0, 0];
    this.controller = new AbortController();
    this.rafId = null;
    this.assets = new glsl_asset_manager_default(this.gl, this.program, initialUniforms);
    this.handleResize();
    this.addEventListeners();
  }
  render(time) {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    const uTime = this.assets.uniforms.get("u_time") ?? null;
    this.gl.uniform1f(uTime, time * 1e-3);
    const uMouse = this.assets.uniforms.get("u_mouse") ?? null;
    this.gl.uniform2f(uMouse, this.mousePosition[0], this.mousePosition[1]);
    this.assets.renderDynamicTextures();
    this.gl.drawArrays(this.gl.TRIANGLES, 0, DEFAULT_VERTICES.length / 2);
    requestAnimationFrame((t) => this.render(t));
  }
  handleResize() {
    super.resizeCanvas();
    const uRes = this.assets.uniforms.get("u_resolution") ?? null;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(uRes, this.canvas.width, this.canvas.height);
  }
  addEventListeners() {
    const { signal } = this.controller;
    this.canvas.addEventListener(
      "mousemove",
      (event) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePosition[0] = event.clientX - rect.left;
        this.mousePosition[1] = rect.height - (event.clientY - rect.top);
      },
      { signal }
    );
    window.addEventListener("resize", () => this.handleResize(), { signal });
  }
  play() {
    this.rafId = requestAnimationFrame((t) => this.render(t));
  }
  pause() {
    if (typeof this.rafId === "number") {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  updateUniform(name, config) {
    this.assets.setUniform(name, config);
  }
  destroy() {
    super.destroy();
    this.assets.destroy();
    this.controller.abort();
  }
};

module.exports = GlslRenderer;
//# sourceMappingURL=index.cjs.map
//# sourceMappingURL=index.cjs.map