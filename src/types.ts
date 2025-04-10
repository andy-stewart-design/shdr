type Vec2 = [number, number];
type Vec3 = [number, number, number];
type Vec4 = [number, number, number, number];

type UniformType =
  | "float"
  | "int"
  | "vec2"
  | "vec3"
  | "vec4"
  | "bool"
  | "image"
  | "video"
  | "webcam";

type UniformValue = number | number[] | boolean | string;

interface UniformMap {
  [key: string]: UniformValue;
}

export type { UniformType, UniformValue, Vec2, Vec3, Vec4, UniformMap };
