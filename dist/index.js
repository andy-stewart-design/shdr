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

// src/validators.ts
function isNumber(value) {
  return typeof value === "number";
}
function isString(value) {
  return typeof value === "string";
}
function isBool(value) {
  return typeof value === "boolean";
}
function isVec2(value) {
  return Array.isArray(value) && value.length === 2 && value.every(isNumber);
}
function isVec3(value) {
  return Array.isArray(value) && value.length === 3 && value.every(isNumber);
}
function isVec4(value) {
  return Array.isArray(value) && value.length === 4 && value.every(isNumber);
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
  // UNIFORM METHODS ----------------------------------------------------
  initializeDefaultUniforms() {
    const uTime = this.gl.getUniformLocation(this.program, "u_time");
    if (uTime) {
      this.uniforms.set("u_time", { type: "float", location: uTime });
    }
    const uRes = this.gl.getUniformLocation(this.program, "u_resolution");
    if (uRes) {
      this.uniforms.set("u_resolution", { type: "vec2", location: uRes });
    }
    const uMouse = this.gl.getUniformLocation(this.program, "u_mouse");
    if (uMouse) {
      this.uniforms.set("u_mouse", { type: "vec2", location: uMouse });
    }
  }
  initializeCustomUniforms(uniforms) {
    for (const [name, config] of Object.entries(uniforms)) {
      const location = this.gl.getUniformLocation(this.program, name);
      if (!location) continue;
      this.uniforms.set(name, { type: config.type, location });
      const value = "value" in config ? config.value : void 0;
      this.setUniformValue(name, value);
    }
  }
  setUniformValue(name, value) {
    const uni = this.uniforms.get(name);
    if (!uni) {
      console.warn(`Uniform ${name} not found`);
      return;
    }
    const { type, location } = uni;
    switch (type) {
      case "float":
        if (isNumber(value)) this.gl.uniform1f(location, value);
        else console.warn(`Couldn't update ${name}, value must be a number`);
        break;
      case "vec2":
        if (isVec2(value)) this.gl.uniform2fv(location, value);
        else console.warn(`Couldn't update ${name}, value must be a Vec2`);
        break;
      case "vec3":
        if (isVec3(value)) this.gl.uniform3fv(location, value);
        else console.warn(`Couldn't update ${name}, value must be a Vec3`);
        break;
      case "vec4":
        if (isVec4(value)) this.gl.uniform4fv(location, value);
        else console.warn(`Couldn't update ${name}, value must be a Vec4`);
        break;
      case "int":
        if (isNumber(value)) this.gl.uniform1i(location, value);
        else console.warn(`Couldn't update ${name}, value must be a number`);
        break;
      case "bool":
        if (isBool(value)) this.gl.uniform1i(location, value ? 1 : 0);
        else console.warn(`Couldn't update ${name}, value must be a boolean`);
        break;
      case "image":
        if (isString(value)) this.loadStaticTexture(name, value);
        else console.warn(`Couldn't update ${name}, value must be a string`);
        break;
      case "video":
        if (isString(value)) this.loadDynamicTexture(name, value);
        else console.warn(`Couldn't update ${name}, value must be a string`);
        break;
      case "webcam":
        this.loadDynamicTexture(name);
        break;
      default:
        console.warn(`Unsupported uniform type for ${name}`);
    }
  }
  // TEXTURE METHODS ----------------------------------------------------
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
          this.uniforms.set(sizeName, { type: "vec2", location: sizeLocation });
          this.gl.uniform2f(sizeLocation, image.width, image.height);
          this.gl.activeTexture(this.gl.TEXTURE0 + texture2.unit);
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
    video.onloadeddata = () => {
      const [asset, unit] = this.initializeTexture(name);
      this.dynamicTextures.set(name, { video, asset, unit });
      video.play();
      try {
        const texture = this.dynamicTextures.get(name);
        const sizeName = `${name}_size`;
        const sizeLocation = this.gl.getUniformLocation(this.program, sizeName);
        if (sizeLocation && texture) {
          this.uniforms.set(sizeName, { type: "vec2", location: sizeLocation });
          this.gl.uniform2f(sizeLocation, 640, 480);
          this.gl.activeTexture(this.gl.TEXTURE0 + texture.unit);
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture.asset);
          setTextureParams(this.gl, texture.video);
          updateTexture(this.gl, texture.video);
        }
      } catch (error) {
        console.error(`Error loading texture ${name}:`, error);
      }
    };
    video.onerror = () => {
      console.error(`Failed to load texture: ${url}`);
    };
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
    this.mousePos = [0, 0];
    this.controller = new AbortController();
    this.rafId = null;
    this.assets = new glsl_asset_manager_default(this.gl, this.program, initialUniforms);
    this.handleResize();
    this.addEventListeners();
  }
  render(time) {
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    const uTime = this.assets.uniforms.get("u_time");
    if (uTime) {
      this.gl.uniform1f(uTime.location, time * 1e-3);
    }
    const uMouse = this.assets.uniforms.get("u_mouse");
    if (uMouse) {
      this.gl.uniform2f(uMouse.location, this.mousePos[0], this.mousePos[1]);
    }
    this.assets.renderDynamicTextures();
    this.gl.drawArrays(this.gl.TRIANGLES, 0, DEFAULT_VERTICES.length / 2);
    requestAnimationFrame((t) => this.render(t));
  }
  handleResize() {
    super.resizeCanvas();
    const uRes = this.assets.uniforms.get("u_resolution") ?? null;
    if (!uRes) {
      console.warn(
        "Could not find resolution uniform (u_resolution) location when resizing canvas"
      );
      return;
    }
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.gl.uniform2f(uRes.location, this.canvas.width, this.canvas.height);
  }
  addEventListeners() {
    const { signal } = this.controller;
    this.canvas.addEventListener(
      "mousemove",
      (event) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos[0] = event.clientX - rect.left;
        this.mousePos[1] = rect.height - (event.clientY - rect.top);
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
  updateUniform(name, value) {
    this.assets.setUniformValue(name, value);
  }
  destroy() {
    super.destroy();
    this.assets.destroy();
    this.controller.abort();
  }
};

export { GlslRenderer as default };
//# sourceMappingURL=index.js.map
//# sourceMappingURL=index.js.map