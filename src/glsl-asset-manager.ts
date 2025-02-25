import { setTextureParams, updateTexture } from "./utils";
import type { UniformConfig, UniformValue } from "./types";

interface StaticTexture {
  asset: WebGLTexture;
  unit: number;
}

interface DynamicTexture extends StaticTexture {
  video: HTMLVideoElement;
}

class GlslAssetManager {
  readonly gl: WebGLRenderingContext;
  readonly program: WebGLProgram;
  readonly uniforms: Map<string, WebGLUniformLocation | null> = new Map();
  readonly staticTextures: Map<string, StaticTexture> = new Map();
  readonly dynamicTextures: Map<string, DynamicTexture> = new Map();

  constructor(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    initialUniforms: UniformConfig = {}
  ) {
    this.gl = gl;
    this.program = program;

    this.initializeDefaultUniforms();
    this.initializeCustomUniforms(initialUniforms);
  }

  private initializeDefaultUniforms() {
    const uTime = this.gl.getUniformLocation(this.program, "u_time");
    this.uniforms.set("u_time", uTime);
    const uRes = this.gl.getUniformLocation(this.program, "u_resolution");
    this.uniforms.set("u_resolution", uRes);
    const uMouse = this.gl.getUniformLocation(this.program, "u_mouse");
    this.uniforms.set("u_mouse", uMouse);
  }

  private initializeCustomUniforms(uniforms: UniformConfig) {
    for (const [name, config] of Object.entries(uniforms)) {
      const location = this.gl.getUniformLocation(this.program, name);
      if (!location) continue;

      this.uniforms.set(name, location);
      this.setUniform(name, config);
    }
  }

  private getTextureUnit() {
    return this.staticTextures.size + this.dynamicTextures.size;
  }

  private getUniformLocation(name: string) {
    const location = this.gl.getUniformLocation(this.program, name);
    if (!location) {
      throw new Error(`Failed to retrieve unform loaction for ${name}`);
    }
    return location;
  }

  private initializeTexture(name: string) {
    // Create a new texture
    const location = this.getUniformLocation(name);
    const texture = this.gl.createTexture();
    const textureUnit = this.getTextureUnit();

    // Set the sampler uniform to use the correct texture unit
    this.gl.uniform1i(location, textureUnit);

    // Use a placeholder pixel while the image loads
    this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
    updateTexture(this.gl);

    return [texture, textureUnit] as const;
  }

  private loadStaticTexture(name: string, url: string) {
    const [texture, textureUnit] = this.initializeTexture(name);

    // Track the texture
    this.staticTextures.set(name, { asset: texture, unit: textureUnit });

    // Load the image
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const texture = this.staticTextures.get(name);
        const sizeName = `${name}_size`;
        const sizeLocation = this.gl.getUniformLocation(this.program, sizeName);

        if (sizeLocation && texture) {
          this.uniforms.set(sizeName, sizeLocation);
          this.gl.uniform2f(sizeLocation, image.width, image.height);
          this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture.asset);
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

  public async loadDynamicTexture(name: string, url?: string) {
    const video = document.createElement("video");
    video.muted = true;

    video.addEventListener("loadeddata", () => {
      const [texture, textureUnit] = this.initializeTexture(name);

      // Track the texture
      this.dynamicTextures.set(name, {
        video,
        asset: texture,
        unit: textureUnit,
      });

      video.play();

      try {
        const texture = this.dynamicTextures.get(name);
        const sizeName = `${name}_size`;
        const sizeLocation = this.gl.getUniformLocation(this.program, sizeName);

        if (sizeLocation && texture) {
          this.uniforms.set(sizeName, sizeLocation);
          this.gl.uniform2f(sizeLocation, 640, 480);
          this.gl.activeTexture(this.gl.TEXTURE0 + textureUnit);
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture.asset);
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

  public renderDynamicTextures() {
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

  public setUniform(name: string, config: UniformValue) {
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

  public destroy() {
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
}

export default GlslAssetManager;
