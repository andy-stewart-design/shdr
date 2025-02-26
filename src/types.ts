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
  value: string; // URL of the texture
}

interface UniformDynamicTexture {
  type: "video";
  value: string; // URL of the texture
}

interface UniformWebcamTexture {
  type: "webcam";
}

type UpdatableUniformConfig =
  | UniformNumber
  | UniformVec2
  | UniformVec3
  | UniformVec4
  | UniformBoolean
  | UniformStaticTexture
  | UniformDynamicTexture;

type UniformConfig = UpdatableUniformConfig | UniformWebcamTexture;

interface UniformMap {
  [key: string]: UniformConfig;
}

type UniformConfigType = UniformConfig["type"];
type UniformConfigValue = UpdatableUniformConfig["value"];

export type {
  UniformMap,
  UniformConfig,
  UniformConfigType,
  UniformConfigValue,
  Vec2,
  Vec3,
  Vec4,
};
