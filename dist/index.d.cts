declare class GlslCanvas {
    readonly container: HTMLElement;
    readonly canvas: HTMLCanvasElement;
    readonly gl: WebGL2RenderingContext;
    readonly program: WebGLProgram;
    constructor(container: HTMLElement, version: 1 | 3, frag?: string);
    private compileShader;
    private createProgram;
    private createBuffer;
    resizeCanvas(): void;
    destroy(): void;
}

type UniformValue = number | number[] | boolean | string;
interface UniformMap {
    [key: string]: UniformValue;
}

type UniformCase = "snake" | "camel";

interface ShdrConstructorProps {
    container: HTMLElement;
    frag?: string;
    uniforms?: UniformMap;
    uniformPrefix?: string;
    uniformCase?: UniformCase;
    glVersion?: 1 | 3;
}
declare class Shdr extends GlslCanvas {
    private mousePos;
    private controller;
    private resizeObserver;
    private rafId;
    private startTime;
    private pauseStartTime;
    private lastRenderTime;
    private totalPausedTime;
    private assets;
    constructor({ container, frag, uniforms, uniformPrefix, uniformCase, glVersion, }: ShdrConstructorProps);
    private render;
    private handleResize;
    private addEventListeners;
    play(loop?: boolean): void;
    pause(): void;
    updateUniform(name: string, value: UniformValue): void;
    destroy(): void;
    get paused(): boolean;
    get uniforms(): any;
    set onLoad(cb: () => void);
}

export { Shdr as default };
