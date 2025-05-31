import {
  getUniformType,
  setTextureParams,
  updateTexture,
  formatUniform,
  setUniformWarning,
  type UniformCase,
} from "./utils";
import type { UniformType, UniformValue, UniformMap } from "./types";
import {
  isBool,
  isNumber,
  isString,
  isVec2,
  isVec3,
  isVec4,
} from "./validators";

interface WebGLUniform {
  type: UniformType;
  location: WebGLUniformLocation;
}

interface StaticTexture {
  asset: WebGLTexture;
  unit: number;
}

interface DynamicTexture extends StaticTexture {
  video: HTMLVideoElement;
}

class GlslAssetManager {
  readonly gl: WebGL2RenderingContext;
  readonly program: WebGLProgram;
  readonly uniforms: Map<string, WebGLUniform> = new Map();
  readonly staticTextures: Map<string, StaticTexture> = new Map();
  readonly dynamicTextures: Map<string, DynamicTexture> = new Map();
  readonly uniformPrefix: string = "u";
  readonly uniformCase: UniformCase = "snake";

  constructor(
    gl: WebGL2RenderingContext,
    program: WebGLProgram,
    initialUniforms: UniformMap,
    uniformPrefix: string,
    uniformCase: UniformCase
  ) {
    this.gl = gl;
    this.program = program;
    this.uniformPrefix = uniformPrefix;
    this.uniformCase = uniformCase;

    this.initializeDefaultUniforms();
    this.initializeCustomUniforms(initialUniforms);
  }

  // UNIFORM METHODS ----------------------------------------------------

  private initializeDefaultUniforms() {
    const timeName = this.formatUniform("time");
    const timeLocation = this.gl.getUniformLocation(this.program, timeName);
    if (timeLocation) {
      this.uniforms.set(timeName, { type: "float", location: timeLocation });
    }

    const resName = this.formatUniform("resolution");
    const resLocation = this.gl.getUniformLocation(this.program, resName);
    if (resLocation) {
      this.uniforms.set(resName, { type: "vec2", location: resLocation });
    }

    const mouseName = this.formatUniform("mouse");
    const mouseLocation = this.gl.getUniformLocation(this.program, mouseName);
    if (mouseLocation) {
      this.uniforms.set(mouseName, { type: "vec2", location: mouseLocation });
    }
  }

  private initializeCustomUniforms(uniforms: UniformMap) {
    for (const [_name, val] of Object.entries(uniforms)) {
      const name = this.formatUniform(_name);
      const location = this.gl.getUniformLocation(this.program, name);
      if (!location) {
        console.warn(
          `[GLSL.TS]: couldn't init uniform (${name}). Most likely, it was not used in shader and was optimized out.`
        );
        continue;
      }

      const inferred = getUniformType(val);

      if (!inferred.valid) {
        console.error(inferred.message);
        continue;
      }

      this.uniforms.set(name, { type: inferred.type, location });
      this.setUniformValue(_name, inferred.value);
    }
  }

  public setUniformValue(_name: string, value: UniformValue) {
    const name = this.formatUniform(_name);
    const uni = this.uniforms.get(name);

    if (!uni) {
      console.warn(`[GLSL.TS]: uniform ${_name} not found`);
      return;
    }

    const { type, location } = uni;

    switch (type) {
      case "float":
        if (isNumber(value)) this.gl.uniform1f(location, value);
        else console.warn(setUniformWarning(name, "number"));
        break;

      case "vec2":
        if (isVec2(value)) this.gl.uniform2fv(location, value);
        else console.warn(setUniformWarning(name, "Vec2"));
        break;

      case "vec3":
        if (isVec3(value)) this.gl.uniform3fv(location, value);
        else console.warn(setUniformWarning(name, "Vec3"));
        break;

      case "vec4":
        if (isVec4(value)) this.gl.uniform4fv(location, value);
        else console.warn(setUniformWarning(name, "Vec4"));
        break;

      case "int":
        if (isNumber(value)) this.gl.uniform1i(location, value);
        else console.warn(setUniformWarning(name, "number"));
        break;

      case "bool":
        if (isBool(value)) this.gl.uniform1i(location, value ? 1 : 0);
        else console.warn(setUniformWarning(name, "boolean"));
        break;

      case "image":
        if (isString(value)) this.loadStaticTexture(name, value);
        else console.warn(setUniformWarning(name, "string"));
        break;

      case "video":
        if (isString(value)) this.loadDynamicTexture(name, value);
        else console.warn(setUniformWarning(name, "string"));
        break;

      case "webcam":
        this.loadDynamicTexture(name);
        break;

      default:
        console.warn(`Unsupported uniform type for ${name}`);
    }
  }

  public formatUniform(name: string) {
    return formatUniform(name, this.uniformPrefix, this.uniformCase);
  }

  // TEXTURE METHODS ----------------------------------------------------

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
    const sizeName =
      this.uniformCase === "snake" ? `${name}_resolution` : `${name}Resolution`;
    const sizeLocation = this.gl.getUniformLocation(this.program, sizeName);

    // Track the texture
    this.staticTextures.set(name, { asset: texture, unit: textureUnit });
    if (sizeLocation) {
      this.uniforms.set(sizeName, {
        type: "vec2",
        location: sizeLocation,
      });
    }

    // Load the image
    const image = new Image();
    image.crossOrigin = "anonymous";

    image.onload = () => {
      try {
        const texture = this.staticTextures.get(name);

        if (texture) {
          if (sizeLocation) {
            this.uniforms.set(sizeName, {
              type: "vec2",
              location: sizeLocation,
            });
            this.gl.uniform2f(sizeLocation, image.width, image.height);
          } else {
            console.info(
              `[GLSL.TS]: Could not set "${sizeName}" Uniform. Most likely, it was not used in shader and was optimized out.`
            );
          }

          this.gl.activeTexture(this.gl.TEXTURE0 + texture.unit);
          this.gl.bindTexture(this.gl.TEXTURE_2D, texture.asset);
          this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
          setTextureParams(this.gl, image);
          updateTexture(this.gl, image);

          const location = this.getUniformLocation(name);
          this.gl.uniform1i(location, texture.unit);
        } else {
          console.warn(`[GLSL.TS]: no texture found for name: ${name}`);
        }
      } catch (error) {
        console.error(`[GLSL.TS]: error loading texture ${name}:`, error);
      }
    };

    image.onerror = (error) => {
      console.error(`[GLSL.TS]: error loading texture ${name}:`, error);
    };

    image.src = url;
  }

  private async loadDynamicTexture(name: string, url?: string) {
    const video = document.createElement("video");
    video.muted = true;
    video.autoplay = true;
    video.playsInline = true;

    video.onloadeddata = () => {
      const [asset, unit] = this.initializeTexture(name);
      const sizeName =
        this.uniformCase === "snake"
          ? `${name}_resolution`
          : `${name}Resolution`;
      const sizeLocation = this.gl.getUniformLocation(this.program, sizeName);

      if (sizeLocation) {
        this.uniforms.set(sizeName, {
          type: "vec2",
          location: sizeLocation,
        });
      }

      // Track the texture
      this.dynamicTextures.set(name, { video, asset, unit });

      video.play();

      try {
        const texture = this.dynamicTextures.get(name);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

        if (texture) {
          if (sizeLocation) {
            this.uniforms.set(sizeName, {
              type: "vec2",
              location: sizeLocation,
            });
            this.gl.uniform2f(
              sizeLocation,
              video.videoWidth,
              video.videoHeight
            );
          } else {
            console.info(
              `[GLSL.TS]: Could not set "${sizeName}" Uniform. Most likely, it was not used in shader and was optimized out.`
            );
          }

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

  // LIFECYCLE METHODS ----------------------------------------------------

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
