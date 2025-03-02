type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];
interface UniformNumber {
    type: "float" | "int";
    value: number;
}
interface UniformVec2 {
    type: "vec2";
    value: Vec2;
}
interface UniformVec3 {
    type: "vec3";
    value: Vec3;
}
interface UniformVec4 {
    type: "vec4";
    value: Vec4;
}
interface UniformBoolean {
    type: "bool";
    value: boolean;
}
interface UniformStaticTexture {
    type: "image";
    value: string;
}
interface UniformDynamicTexture {
    type: "video";
    value: string;
}
interface UniformWebcamTexture {
    type: "webcam";
}
type UpdatableUniformConfig = UniformNumber | UniformVec2 | UniformVec3 | UniformVec4 | UniformBoolean | UniformStaticTexture | UniformDynamicTexture;
type UniformConfig = UpdatableUniformConfig | UniformWebcamTexture;
interface UniformMap {
    [key: string]: UniformConfig;
}
type UniformConfigType = UniformConfig["type"];
type UniformConfigValue = UpdatableUniformConfig["value"];

interface WebGLUniform {
    type: UniformConfigType;
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
    setUniformValue(name: string, value?: UniformConfigValue): void;
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
    updateUniform(name: string, value: UniformConfigValue): void;
    destroy(): void;
}

export { GlslRenderer as default };
