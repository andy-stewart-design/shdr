type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];

type UniformConfigType =
  | "float"
  | "int"
  | "vec2"
  | "vec3"
  | "vec4"
  | "bool"
  | "image"
  | "video"
  | "webcam";

type UniformConfigValue = number | Vec2 | Vec3 | Vec4 | boolean | string;

interface UnstableUniformMap {
  [key: string]: UniformConfigValue;
}

export type {
  UniformConfigType,
  UniformConfigValue,
  Vec2,
  Vec3,
  Vec4,
  UnstableUniformMap,
};
