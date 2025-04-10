type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];
type UniformType = "float" | "int" | "vec2" | "vec3" | "vec4" | "bool" | "image" | "video" | "webcam";
type UniformValue = number | Vec2 | Vec3 | Vec4 | boolean | string;
interface UniformMap {
    [key: string]: UniformValue;
}

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
declare class GlslAssetManager {
    readonly gl: WebGLRenderingContext;
    readonly program: WebGLProgram;
    readonly uniforms: Map<string, WebGLUniform>;
    readonly staticTextures: Map<string, StaticTexture>;
    readonly dynamicTextures: Map<string, DynamicTexture>;
    constructor(gl: WebGLRenderingContext, program: WebGLProgram, initialUniforms?: UniformMap);
    private initializeDefaultUniforms;
    private initializeCustomUniforms;
    setUniformValue(_name: string, value: UniformValue): void;
    private getTextureUnit;
    private getUniformLocation;
    private initializeTexture;
    private loadStaticTexture;
    private loadDynamicTexture;
    renderDynamicTextures(): void;
    destroy(): void;
}

declare class GlslCanvas {
    readonly container: HTMLElement;
    readonly canvas: HTMLCanvasElement;
    readonly gl: WebGLRenderingContext;
    readonly program: WebGLProgram;
    constructor(container: HTMLElement, frag?: string);
    private compileShader;
    private createProgram;
    private createBuffer;
    resizeCanvas(): void;
    destroy(): void;
}

declare class GlslRenderer extends GlslCanvas {
    private mousePos;
    private controller;
    private rafId;
    readonly assets: GlslAssetManager;
    constructor(container: HTMLElement, frag?: string, initialUniforms?: UniformMap);
    private render;
    private handleResize;
    private addEventListeners;
    play(): void;
    pause(): void;
    updateUniform(name: string, value: UniformValue): void;
    destroy(): void;
}

export { GlslRenderer as default };
