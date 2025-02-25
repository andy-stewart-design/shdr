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
  value: string; // URL of the texture
}

interface UniformDynamicTexture {
  type: "video";
  value: string; // URL of the texture
}

interface UniformWebcamTexture {
  type: "webcam";
}

type UniformValue =
  | UniformNumber
  | UniformVector
  | UniformBoolean
  | UniformStaticTexture
  | UniformDynamicTexture
  | UniformWebcamTexture;

interface UniformConfig {
  [key: string]: UniformValue;
}

export type {
  UniformNumber,
  UniformVector,
  UniformBoolean,
  UniformStaticTexture as UniformTexture,
  UniformValue,
  UniformConfig,
};
