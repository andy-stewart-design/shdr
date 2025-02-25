interface UniformNumber {
    type: "float" | "int";
    value: number;
}
interface UniformVector {
    type: "vec2" | "vec3" | "vec4";
    value: number[];
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
type UniformValue = UniformNumber | UniformVector | UniformBoolean | UniformStaticTexture | UniformDynamicTexture | UniformWebcamTexture;
interface UniformConfig {
    [key: string]: UniformValue;
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
    readonly uniforms: Map<string, WebGLUniformLocation | null>;
    readonly staticTextures: Map<string, StaticTexture>;
    readonly dynamicTextures: Map<string, DynamicTexture>;
    constructor(gl: WebGLRenderingContext, program: WebGLProgram, initialUniforms?: UniformConfig);
    private initializeDefaultUniforms;
    private initializeCustomUniforms;
    private getTextureUnit;
    private getUniformLocation;
    private initializeTexture;
    private loadStaticTexture;
    loadDynamicTexture(name: string, url?: string): Promise<void>;
    renderDynamicTextures(): void;
    setUniform(name: string, config: UniformValue): void;
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
    private mousePosition;
    readonly assets: GlslAssetManager;
    private controller;
    private rafId;
    constructor(container: HTMLElement, frag?: string, initialUniforms?: UniformConfig);
    private render;
    private handleResize;
    private addEventListeners;
    play(): void;
    pause(): void;
    updateUniform(name: string, config: UniformValue): void;
    destroy(): void;
}

export { GlslRenderer as default };
